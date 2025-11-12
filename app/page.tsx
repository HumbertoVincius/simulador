'use client';

import { useState } from 'react';
import SimulatorForm from '@/components/SimulatorForm';
import ResultsTable from '@/components/ResultsTable';
import SummaryCard from '@/components/SummaryCard';
import { SimulatorInput, SimulationResult } from '@/types/simulator';
import { generateMonthlySchedule } from '@/lib/calculations';

export default function Home() {
  const [result, setResult] = useState<SimulationResult | null>(null);

  const handleSubmit = (data: SimulatorInput) => {
    try {
      const simulation = generateMonthlySchedule(data);
      setResult(simulation);
    } catch (error) {
      console.error('Erro ao calcular simulação:', error);
      alert('Erro ao calcular simulação. Verifique os dados informados.');
    }
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
            <div>
              <SummaryCard result={result} />
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

