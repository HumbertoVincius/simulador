'use client';

import { useMemo, useState } from 'react';
import SimulatorForm from '@/components/SimulatorForm';
import ResultsTable from '@/components/ResultsTable';
import SummaryCard from '@/components/SummaryCard';
import SaleSimulationCard from '@/components/SaleSimulationCard';
import { SimulatorInput, SimulationResult } from '@/types/simulator';
import { generateMonthlySchedule } from '@/lib/calculations';

interface SaleMetricDetails {
  mes: number;
  totalPago: number;
  saldoFinanciamento: number;
  saldoConsorcio: number;
  saldoTotal: number;
  resultado: number;
  roi: number;
}

interface SaleAnalysis {
  valorCompra: number;
  valorVenda: number;
  valorizacao: number;
  inicio: SaleMetricDetails;
  breakEven?: SaleMetricDetails;
}

function computeMetric(payment: ReturnType<typeof generateMonthlySchedule>['schedule'][number], saleValue: number, valorCompra: number): SaleMetricDetails {
  const totalPago = payment.totalAcumulado ?? 0;
  const saldoFinanciamento = payment.saldoDevedorFinanciamento ?? 0;
  const saldoConsorcio = payment.saldoDevedorConsorcio ?? 0;
  const saldoTotal =
    payment.saldoDevedorTotal ?? saldoFinanciamento + saldoConsorcio;
  const resultado = saleValue - totalPago - saldoTotal;
  const roi = valorCompra > 0 ? resultado / valorCompra : 0;
  return {
    mes: payment.mes,
    totalPago,
    saldoFinanciamento,
    saldoConsorcio,
    saldoTotal,
    resultado,
    roi,
  };
}

function computeSaleAnalysis(simulation: SimulationResult, startMonth: number, saleValue: number): SaleAnalysis {
  const schedule = simulation.schedule;
  const valorCompra = simulation.resumo.valorTotalImovel ?? 0;
  if (schedule.length === 0) {
    return {
      valorCompra,
      valorVenda: saleValue,
      valorizacao: saleValue - valorCompra,
      inicio: {
        mes: startMonth,
        totalPago: 0,
        saldoFinanciamento: 0,
        saldoConsorcio: 0,
        saldoTotal: 0,
        resultado: saleValue,
        roi: valorCompra > 0 ? saleValue / valorCompra : 0,
      },
    };
  }

  const startEntry =
    schedule.find((payment) => payment.mes >= startMonth) ?? schedule[schedule.length - 1];
  const inicio = computeMetric(startEntry, saleValue, valorCompra);

  const breakEvenEntry = schedule
    .filter((payment) => payment.mes >= inicio.mes)
    .find((payment) => computeMetric(payment, saleValue, valorCompra).resultado >= 0);

  const breakEven = breakEvenEntry
    ? computeMetric(breakEvenEntry, saleValue, valorCompra)
    : undefined;

  return {
    valorCompra,
    valorVenda: saleValue,
    valorizacao: saleValue - valorCompra,
    inicio,
    breakEven,
  };
}

export default function Home() {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [saleStartMonth, setSaleStartMonth] = useState<number>(0);
  const [saleTargetPrice, setSaleTargetPrice] = useState<number>(0);
  const [saleAnalysis, setSaleAnalysis] = useState<SaleAnalysis | null>(null);

  const handleSubmit = (data: SimulatorInput) => {
    try {
      const simulation = generateMonthlySchedule(data);
      setResult(simulation);

      if (simulation.schedule.length > 0) {
        const months = simulation.schedule.map((payment) => payment.mes);
        const defaultStart =
          months.find((month) => month > 0) ?? months[0] ?? 0;
        setSaleStartMonth(defaultStart);
        const defaultPrice = data.property.valorTotal || saleTargetPrice || 0;
        setSaleTargetPrice(defaultPrice);
        setSaleAnalysis(computeSaleAnalysis(simulation, defaultStart, defaultPrice));
      } else {
        setSaleAnalysis(null);
      }
    } catch (error) {
      console.error('Erro ao calcular simulação:', error);
      alert('Erro ao calcular simulação. Verifique os dados informados.');
    }
  };

  const availableMonths = useMemo(() => {
    if (!result) return [];
    const unique = new Set(result.schedule.map((payment) => payment.mes));
    return Array.from(unique).sort((a, b) => a - b);
  }, [result]);

  const handleAnalyze = () => {
    if (!result) return;
    setSaleAnalysis(computeSaleAnalysis(result, saleStartMonth, saleTargetPrice));
  };

  return (
    <main className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Simulador de Imóvel na Planta
          </h1>
          <p className="text-gray-400">
            Simule a compra do seu imóvel com financiamento e consórcio
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="lg:sticky lg:top-6 lg:self-start">
            <SimulatorForm onSubmit={handleSubmit} />
          </div>
          
          {result && (
            <div className="space-y-6">
              <SummaryCard result={result} />
              <SaleSimulationCard
                schedule={result.schedule}
                availableMonths={availableMonths}
                startMonth={saleStartMonth}
                targetPrice={saleTargetPrice}
                onStartMonthChange={setSaleStartMonth}
                onTargetPriceChange={setSaleTargetPrice}
                onFindBreakEven={handleAnalyze}
                analysis={saleAnalysis}
              />
            </div>
          )}
        </div>

        {result && (
          <div className="mt-6">
            <ResultsTable schedule={result.schedule} />
          </div>
        )}
      </div>
    </main>
  );
}

