'use client';

import CurrencyInput from './CurrencyInput';

interface SaleSimulationCardProps {
  availableMonths: number[];
  startMonth: number;
  targetPrice: number;
  onStartMonthChange: (month: number) => void;
  onTargetPriceChange: (price: number) => void;
  onFindBreakEven: () => void;
  analysis: {
    valorCompra: number;
    valorVenda: number;
    valorizacao: number;
    inicio: {
      mes: number;
      totalPago: number;
      saldoFinanciamento: number;
      saldoConsorcio: number;
      saldoTotal: number;
      resultado: number;
      roi: number;
    };
    breakEven?: {
      mes: number;
      totalPago: number;
      saldoFinanciamento: number;
      saldoConsorcio: number;
      saldoTotal: number;
      resultado: number;
      roi: number;
    };
  } | null;
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const formatPercent = (value: number): string =>
  new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export default function SaleSimulationCard({
  availableMonths,
  startMonth,
  targetPrice,
  onStartMonthChange,
  onTargetPriceChange,
  onFindBreakEven,
  analysis,
}: SaleSimulationCardProps) {
  const resultClass =
    analysis && analysis.inicio.resultado >= 0
      ? 'text-green-400'
      : analysis && analysis.inicio.resultado < 0
      ? 'text-red-400'
      : 'text-gray-300';

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-5">
      <div>
        <h3 className="text-xl font-semibold text-white mb-1">Simulação de Venda com Break-even</h3>
        <p className="text-sm text-gray-400">
          Defina a partir de qual mês acredita que o imóvel pode ser vendido e o valor mínimo desejado.
          Buscaremos o primeiro mês com lucro considerando esses parâmetros.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Mês inicial para venda
          </label>
          <select
            value={startMonth}
            onChange={(event) => onStartMonthChange(parseInt(event.target.value, 10) || 0)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {availableMonths.map((month) => (
              <option key={month} value={month}>
                {month === 0 ? 'Entrada (mês 0)' : `Mês ${month}`}
              </option>
            ))}
          </select>
        </div>

        <CurrencyInput
          value={targetPrice}
          onChange={onTargetPriceChange}
          label="Valor alvo de venda"
        />
      </div>

      <div>
        <button
          type="button"
          onClick={onFindBreakEven}
          className="w-full md:w-auto px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
        >
          Buscar primeiro mês lucrativo
        </button>
      </div>

      {analysis ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-700/30 border border-gray-600 rounded-md p-4">
              <p className="text-xs uppercase text-gray-400 mb-1">Valor de Compra</p>
              <p className="text-lg font-semibold text-white">{formatCurrency(analysis.valorCompra)}</p>
            </div>
            <div className="bg-gray-700/30 border border-gray-600 rounded-md p-4">
              <p className="text-xs uppercase text-gray-400 mb-1">Valor Alvo de Venda</p>
              <p className="text-lg font-semibold text-white">{formatCurrency(analysis.valorVenda)}</p>
            </div>
            <div className="bg-gray-700/30 border border-gray-600 rounded-md p-4">
              <p className="text-xs uppercase text-gray-400 mb-1">Valorização</p>
              <p className="text-lg font-semibold text-white">
                {formatCurrency(analysis.valorizacao)}
              </p>
            </div>
          </div>

          <div className="bg-gray-900/30 border border-gray-700 rounded-md p-4 space-y-3">
            <p className="text-xs uppercase text-gray-400 mb-1">Mês inicial avaliado</p>
            <div className="flex flex-wrap gap-6 text-sm text-gray-300">
              <span>Mês {analysis.inicio.mes}</span>
              <span>Total pago: {formatCurrency(analysis.inicio.totalPago)}</span>
              <span>Saldo devido: {formatCurrency(analysis.inicio.saldoTotal)}</span>
              <span>
                Resultado:{' '}
                <span className={`font-semibold ${resultClass}`}>
                  {formatCurrency(analysis.inicio.resultado)}
                </span>
              </span>
              <span>ROI: {formatPercent(analysis.inicio.roi)}</span>
            </div>
          </div>

          <div className="bg-gray-900/30 border border-gray-700 rounded-md p-4">
            <p className="text-xs uppercase text-gray-400 mb-2">Primeiro mês lucrativo</p>
            {analysis.breakEven ? (
              <div className="flex flex-wrap gap-6 text-sm text-gray-300">
                <span>Mês {analysis.breakEven.mes}</span>
                <span>Total pago: {formatCurrency(analysis.breakEven.totalPago)}</span>
                <span>Saldo devido: {formatCurrency(analysis.breakEven.saldoTotal)}</span>
                <span className="font-semibold text-green-400">
                  Resultado: {formatCurrency(analysis.breakEven.resultado)}
                </span>
                <span>ROI: {formatPercent(analysis.breakEven.roi)}</span>
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                Não há nenhum mês com resultado positivo considerando o mês inicial e o valor alvo
                informados. Ajuste os parâmetros e tente novamente.
              </p>
            )}
          </div>
        </>
      ) : (
        <div className="bg-gray-900/30 border border-gray-700 rounded-md p-4 text-sm text-gray-400">
          Informe os parâmetros e clique em &quot;Buscar&quot; para ver os resultados.
        </div>
      )}
    </div>
  );
}

