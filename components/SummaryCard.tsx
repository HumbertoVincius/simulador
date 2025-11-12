'use client';

import { SimulationResult } from '@/types/simulator';

interface SummaryCardProps {
  result: SimulationResult;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatPercent(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}

export default function SummaryCard({ result }: SummaryCardProps) {
  const { resumo } = result;
  const diferenca = resumo.valorTotalPago - resumo.valorTotalImovel;

  const handleExportPDF = async () => {
    const { exportSimulationToPDF } = await import('@/lib/exportPDF');
    exportSimulationToPDF(result);
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Resumo da Simulação</h2>
        <button
          onClick={handleExportPDF}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Exportar PDF
        </button>
      </div>
      
      {/* Informações do Imóvel */}
      {(resumo.nomeImovel || resumo.endereco) && (
        <div className="bg-gray-700/50 p-4 rounded-lg mb-6 border border-gray-600">
          {resumo.nomeImovel && (
            <h3 className="text-lg font-bold text-white mb-1">{resumo.nomeImovel}</h3>
          )}
          {resumo.endereco && (
            <p className="text-sm text-gray-300">{resumo.endereco}</p>
          )}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-700/50">
          <h3 className="text-sm font-medium text-gray-300 mb-1">Valor Total do Imóvel</h3>
          <p className="text-2xl font-bold text-blue-400">{formatCurrency(resumo.valorTotalImovel)}</p>
        </div>
        
        <div className="bg-green-900/30 p-4 rounded-lg border border-green-700/50">
          <h3 className="text-sm font-medium text-gray-300 mb-1">Valor Total Pago</h3>
          <p className="text-2xl font-bold text-green-400">{formatCurrency(resumo.valorTotalPago)}</p>
        </div>
        
        {resumo.tamanhoImovel > 0 && (
          <div className="bg-teal-900/30 p-4 rounded-lg border border-teal-700/50">
            <h3 className="text-sm font-medium text-gray-300 mb-1">Tamanho do Imóvel</h3>
            <p className="text-xl font-bold text-teal-400">{resumo.tamanhoImovel.toFixed(2)} m²</p>
          </div>
        )}
        {resumo.valorPorM2 > 0 && (
          <div className="bg-emerald-900/30 p-4 rounded-lg border border-emerald-700/50">
            <h3 className="text-sm font-medium text-gray-300 mb-1">Valor por m²</h3>
            <p className="text-xl font-bold text-emerald-400">{formatCurrency(resumo.valorPorM2)}</p>
          </div>
        )}
        <div className="bg-cyan-900/30 p-4 rounded-lg border border-cyan-700/50">
          <h3 className="text-sm font-medium text-gray-300 mb-1">Valor Financiado</h3>
          <p className="text-xl font-bold text-cyan-400">{formatCurrency(resumo.valorFinanciado)}</p>
        </div>
        
        {resumo.parcelaDuranteFinanciamento > 0 && (
          <div className="bg-orange-900/30 p-4 rounded-lg border border-orange-700/50">
            <h3 className="text-sm font-medium text-gray-300 mb-1">Parcela Durante Financiamento</h3>
            <p className="text-xl font-bold text-orange-400">{formatCurrency(resumo.parcelaDuranteFinanciamento)}</p>
            <p className="text-xs text-gray-400 mt-1">Financiamento + Consórcio (se houver)</p>
          </div>
        )}
        
        <div className="bg-red-900/30 p-4 rounded-lg border border-red-700/50">
          <h3 className="text-sm font-medium text-gray-300 mb-1">Total de Juros</h3>
          <p className="text-xl font-bold text-red-400">{formatCurrency(resumo.totalJuros)}</p>
        </div>
        
        <div className="bg-yellow-900/30 p-4 rounded-lg border border-yellow-700/50">
          <h3 className="text-sm font-medium text-gray-300 mb-1">Total de Seguros</h3>
          <p className="text-xl font-bold text-yellow-400">{formatCurrency(resumo.totalSeguros)}</p>
        </div>
        
        <div className="bg-purple-900/30 p-4 rounded-lg border border-purple-700/50">
          <h3 className="text-sm font-medium text-gray-300 mb-1">Total de Taxas</h3>
          <p className="text-xl font-bold text-purple-400">{formatCurrency(resumo.totalTaxas)}</p>
        </div>
        
        <div className="bg-indigo-900/30 p-4 rounded-lg border border-indigo-700/50">
          <h3 className="text-sm font-medium text-gray-300 mb-1">CET (Custo Efetivo Total)</h3>
          <p className="text-xl font-bold text-indigo-400">{formatPercent(resumo.cet)}</p>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-medium text-gray-300">Diferença (Juros + Taxas)</span>
          <span className={`text-lg font-bold ${diferenca > 0 ? 'text-red-400' : 'text-green-400'}`}>
            {formatCurrency(diferenca)}
          </span>
        </div>
        <div className="text-sm text-gray-400">
          {diferenca > 0 ? (
            <p>Você pagará {formatCurrency(diferenca)} a mais que o valor do imóvel devido a juros, seguros e taxas.</p>
          ) : (
            <p>Valor total pago é menor que o valor do imóvel.</p>
          )}
        </div>
      </div>

      {resumo.validacaoRenda && (
        <div className={`mt-4 p-4 rounded-lg border ${
          resumo.validacaoRenda.aprovado 
            ? 'bg-green-900/30 border-green-700/50' 
            : 'bg-red-900/30 border-red-700/50'
        }`}>
          <h3 className={`text-lg font-semibold mb-2 ${
            resumo.validacaoRenda.aprovado ? 'text-green-400' : 'text-red-400'
          }`}>
            {resumo.validacaoRenda.aprovado ? '✓ Aprovado' : '✗ Não Aprovado'}
          </h3>
          <div className="space-y-1 text-sm text-gray-300">
            <p>
              <span className="font-medium">Parcela Máxima (30% da renda):</span>{' '}
              {formatCurrency(resumo.validacaoRenda.parcelaMaxima)}
            </p>
            <p>
              <span className="font-medium">Maior Parcela da Simulação:</span>{' '}
              {formatCurrency(resumo.validacaoRenda.parcelaAtual)}
            </p>
            {!resumo.validacaoRenda.aprovado && (
              <p className="text-red-400 font-medium mt-2">
                A maior parcela excede 30% da renda informada. Aprovação pode ser negada.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
