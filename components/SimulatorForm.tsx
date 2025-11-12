'use client';

import { useState } from 'react';
import { SimulatorInput, EntryType, AmortizationSystem, RateType, CorrectionSystem, InsuranceType, AdminFeeType } from '@/types/simulator';
import CurrencyInput from './CurrencyInput';

interface SimulatorFormProps {
  onSubmit: (data: SimulatorInput) => void;
}

export default function SimulatorForm({ onSubmit }: SimulatorFormProps) {
  const [formData, setFormData] = useState<SimulatorInput>({
    property: {
      nomeImovel: '',
      endereco: '',
      valorTotal: 0,
      tamanhoImovel: 0,
      valorEntrada: 0,
      valorIntermediaria: 0,
      quantidadeIntermediaria: 0,
      valorConstrutora: 0,
      quantidadeConstrutora: 0,
    },
    tipoEntrada: 'dinheiro',
    financiamento: {
      valorImovel: 0,
      prazoAnos: 20,
      sistemaAmortizacao: 'PRICE',
      taxaJurosAnual: 10,
      tipoTaxa: 'pre-fixada',
      sistemaCorrecao: 'nenhum',
      seguro: {
        mip: 0,
        mipTipo: 'percentual',
        dfi: 0,
        dfiTipo: 'percentual',
      },
      taxaAdministrativa: 0,
      taxaAdminTipo: 'fixo',
    },
  });

  const [usePercentualFinanciamento, setUsePercentualFinanciamento] = useState(true);

  const handleChange = (field: string, value: any) => {
    const keys = field.split('.');
    setFormData((prev) => {
      const newData = { ...prev };
      let current: any = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]] = { ...current[keys[i]] };
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const showConsortium = formData.tipoEntrada === 'consorcio' || formData.tipoEntrada === 'composicao';
  const showPostFixed = formData.financiamento.tipoTaxa === 'pos-fixada';

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 p-6 rounded-lg shadow-lg">

      {/* Dados do Imóvel */}
      <section className="border-b border-gray-700 pb-6">
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Dados do Imóvel</h3>
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Nome do Imóvel
            </label>
            <input
              type="text"
              value={formData.property.nomeImovel || ''}
              onChange={(e) => handleChange('property.nomeImovel', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ex: Apartamento 2 quartos, Torre A"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Endereço
            </label>
            <input
              type="text"
              value={formData.property.endereco || ''}
              onChange={(e) => handleChange('property.endereco', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Ex: Rua Exemplo, 123 - Bairro - Cidade/UF"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CurrencyInput
            value={formData.property.valorTotal}
            onChange={(value) => {
              handleChange('property.valorTotal', value);
              handleChange('financiamento.valorImovel', value);
            }}
            label="Valor Total do Imóvel"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Tamanho do Imóvel (m²)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.property.tamanhoImovel || ''}
              onChange={(e) => handleChange('property.tamanhoImovel', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="0.00"
            />
          </div>
          {formData.property.tamanhoImovel > 0 && formData.property.valorTotal > 0 && (
            <div className="md:col-span-2">
              <div className="bg-gray-700/50 p-3 rounded-md border border-gray-600">
                <p className="text-sm text-gray-300">
                  <span className="font-medium">Valor por m²:</span>{' '}
                  <span className="text-primary-400 font-semibold">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(formData.property.valorTotal / formData.property.tamanhoImovel)}
                  </span>
                </p>
              </div>
            </div>
          )}
          <CurrencyInput
            value={formData.property.valorIntermediaria}
            onChange={(value) => handleChange('property.valorIntermediaria', value)}
            label="Valor Parcela Intermediária"
          />
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Quantidade Parcelas Intermediárias
            </label>
            <input
              type="number"
              min="0"
              value={formData.property.quantidadeIntermediaria || ''}
              onChange={(e) => handleChange('property.quantidadeIntermediaria', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="0"
            />
          </div>
        </div>
      </section>

      {/* Parcelas da Construtora */}
      <section className="border-b border-gray-700 pb-6">
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Parcelas da Construtora</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CurrencyInput
            value={formData.property.valorConstrutora}
            onChange={(value) => handleChange('property.valorConstrutora', value)}
            label="Valor Parcela da Construtora"
          />
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Quantidade Parcelas da Construtora
            </label>
            <input
              type="number"
              min="0"
              value={formData.property.quantidadeConstrutora || ''}
              onChange={(e) => handleChange('property.quantidadeConstrutora', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="0"
            />
          </div>
        </div>
      </section>

      {/* Tipo de Entrada */}
      <section className="border-b border-gray-700 pb-4">
        <h3 className="text-lg font-semibold text-gray-300 mb-3">Tipo de Entrada</h3>
        <div className="flex flex-wrap gap-4 mb-4">
          {(['dinheiro', 'consorcio', 'composicao'] as EntryType[]).map((tipo) => (
            <label key={tipo} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="tipoEntrada"
                value={tipo}
                checked={formData.tipoEntrada === tipo}
                onChange={(e) => handleChange('tipoEntrada', e.target.value as EntryType)}
                className="mr-2 w-4 h-4 text-primary-500 focus:ring-primary-500 focus:ring-2"
              />
              <span className="text-sm text-gray-300 capitalize">
                {tipo === 'dinheiro' ? 'Dinheiro à Vista' : tipo === 'consorcio' ? 'Consórcio' : 'Composição'}
              </span>
            </label>
          ))}
        </div>
        
        {/* Campos de entrada específicos baseados no tipo */}
        {formData.tipoEntrada === 'dinheiro' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CurrencyInput
              value={formData.property.valorEntrada}
              onChange={(value) => handleChange('property.valorEntrada', value)}
              label="Valor Entrada em Dinheiro"
              required
            />
          </div>
        )}
        
        {formData.tipoEntrada === 'consorcio' && (
          <div className="bg-gray-700/30 p-3 rounded-md">
            <p className="text-sm text-gray-300">
              O valor de entrada será o valor de crédito do consórcio informado abaixo.
            </p>
          </div>
        )}
        
        {formData.tipoEntrada === 'composicao' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CurrencyInput
              value={formData.property.valorEntrada}
              onChange={(value) => handleChange('property.valorEntrada', value)}
              label="Valor Entrada em Dinheiro"
              required
            />
            <CurrencyInput
              value={formData.consorcio?.valorCredito || 0}
              onChange={(value) => {
                if (!formData.consorcio) {
                  handleChange('consorcio', {
                    valorCredito: 0,
                    prazoPagamento: 120,
                    taxaAdministracao: 0,
                    taxaAdminTipo: 'distribuida',
                    taxaINCC: 0,
                    fundoReserva: 0,
                  });
                }
                handleChange('consorcio.valorCredito', value);
              }}
              label="Valor Entrada em Consórcio"
              required
            />
            <div className="md:col-span-2 bg-gray-700/30 p-3 rounded-md">
              <p className="text-sm text-gray-300">
                <span className="font-medium">Total da Entrada:</span>{' '}
                <span className="text-primary-400 font-semibold">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format((formData.property.valorEntrada || 0) + (formData.consorcio?.valorCredito || 0))}
                </span>
              </p>
            </div>
          </div>
        )}
      </section>

      {/* Consórcio */}
      {showConsortium && (
        <section className="border-b border-gray-700 pb-6">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">Dados do Consórcio</h3>
          {formData.tipoEntrada === 'composicao' && (
            <div className="bg-blue-900/30 border border-blue-700/50 p-3 rounded-md mb-4">
              <p className="text-sm text-blue-300">
                <span className="font-medium">ℹ️ Nota:</span> O valor de crédito do consórcio já foi informado acima na seção "Tipo de Entrada".
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {formData.tipoEntrada !== 'composicao' && (
              <CurrencyInput
                value={formData.consorcio?.valorCredito || 0}
                onChange={(value) => {
                  if (!formData.consorcio) {
                    handleChange('consorcio', {
                      valorCredito: 0,
                      prazoPagamento: 120,
                      taxaAdministracao: 0,
                      taxaAdminTipo: 'distribuida',
                      taxaINCC: 0,
                      fundoReserva: 0,
                    });
                  }
                  handleChange('consorcio.valorCredito', value);
                }}
                label="Valor de Crédito"
              />
            )}
            {formData.tipoEntrada === 'composicao' && (
              <div className="bg-gray-700/30 p-3 rounded-md">
                <p className="text-sm text-gray-300 mb-1 font-medium">Valor de Crédito</p>
                <p className="text-lg font-bold text-primary-400">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(formData.consorcio?.valorCredito || 0)}
                </p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Prazo de Pagamento (meses)
              </label>
              <select
                value={formData.consorcio?.prazoPagamento || 120}
                onChange={(e) => handleChange('consorcio.prazoPagamento', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value={120}>120 meses</option>
                <option value={150}>150 meses</option>
                <option value={180}>180 meses</option>
                <option value={240}>240 meses</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Taxa de Administração
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={formData.consorcio?.taxaAdministracao || ''}
                  onChange={(e) => handleChange('consorcio.taxaAdministracao', parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <select
                  value={formData.consorcio?.taxaAdminTipo || 'distribuida'}
                  onChange={(e) => handleChange('consorcio.taxaAdminTipo', e.target.value)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="distribuida">Distribuída</option>
                  <option value="percentual">% do Crédito</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Taxa INCC Mensal (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.consorcio?.taxaINCC || ''}
                onChange={(e) => handleChange('consorcio.taxaINCC', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Fundo de Reserva (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.consorcio?.fundoReserva || ''}
                onChange={(e) => handleChange('consorcio.fundoReserva', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </section>
      )}

      {/* Financiamento */}
      <section className="pb-4">
        <h3 className="text-lg font-semibold text-gray-300 mb-4">Financiamento</h3>
        <div className="space-y-4">
          <div className="bg-blue-900/20 border border-blue-700/50 p-3 rounded-md mb-4">
            <p className="text-sm text-blue-300">
              <span className="font-medium">ℹ️ Valor Financiado:</span> Será calculado automaticamente como o restante do valor do imóvel não pago à construtora (após entrada, intermediárias e parcelas da construtora).
            </p>
          </div>
          <div className="flex items-center gap-6 mb-4 p-3 bg-gray-700/50 rounded-md">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                checked={usePercentualFinanciamento}
                onChange={() => setUsePercentualFinanciamento(true)}
                className="mr-2 w-4 h-4 text-primary-500 focus:ring-primary-500 focus:ring-2"
              />
              <span className="text-sm font-medium text-gray-300">Percentual</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                checked={!usePercentualFinanciamento}
                onChange={() => setUsePercentualFinanciamento(false)}
                className="mr-2 w-4 h-4 text-primary-500 focus:ring-primary-500 focus:ring-2"
              />
              <span className="text-sm font-medium text-gray-300">Valor Fixo</span>
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {usePercentualFinanciamento ? (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Percentual de Financiamento (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="70"
                  max="90"
                  value={formData.financiamento.percentualFinanciamento || ''}
                  onChange={(e) => {
                    const percent = parseFloat(e.target.value) || 0;
                    handleChange('financiamento.percentualFinanciamento', percent);
                    handleChange('financiamento.valorFinanciado', undefined);
                  }}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="70-90"
                />
              </div>
            ) : (
              <CurrencyInput
                value={formData.financiamento.valorFinanciado || 0}
                onChange={(value) => {
                  handleChange('financiamento.valorFinanciado', value);
                  handleChange('financiamento.percentualFinanciamento', undefined);
                }}
                label="Valor Financiado (deixe vazio para calcular automaticamente)"
              />
            )}
            {/* Mostrar valor restante calculado */}
            {(() => {
              const valorPagoConstrutora = formData.property.valorEntrada + 
                (formData.property.valorIntermediaria * formData.property.quantidadeIntermediaria) +
                (formData.property.valorConstrutora * formData.property.quantidadeConstrutora);
              const valorRestante = formData.property.valorTotal - valorPagoConstrutora;
              return (
                <div className="bg-gray-700/30 p-3 rounded-md border border-gray-600">
                  <p className="text-sm text-gray-300 mb-1 font-medium">Valor Restante (Calculado)</p>
                  <p className="text-lg font-bold text-primary-400">
                    {new Intl.NumberFormat('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                    }).format(Math.max(0, valorRestante))}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Valor do imóvel - (Entrada + Intermediárias + Construtora)
                  </p>
                </div>
              );
            })()}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Prazo (anos)
              </label>
              <input
                type="number"
                min="5"
                max="35"
                value={formData.financiamento.prazoAnos || ''}
                onChange={(e) => handleChange('financiamento.prazoAnos', parseInt(e.target.value) || 20)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
                placeholder="20"
              />
              {formData.financiamento.prazoAnos > 0 && (
                <p className="text-xs text-gray-400 mt-1">
                  Equivale a {formData.financiamento.prazoAnos * 12} meses
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sistema de Amortização
              </label>
              <div className="flex gap-6">
                {(['SAC', 'PRICE'] as AmortizationSystem[]).map((sistema) => (
                  <label key={sistema} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="sistemaAmortizacao"
                      value={sistema}
                      checked={formData.financiamento.sistemaAmortizacao === sistema}
                      onChange={(e) => handleChange('financiamento.sistemaAmortizacao', e.target.value as AmortizationSystem)}
                      className="mr-2 w-4 h-4 text-primary-500 focus:ring-primary-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-300">{sistema}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Taxa de Juros Anual (%)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.financiamento.taxaJurosAnual || ''}
                onChange={(e) => handleChange('financiamento.taxaJurosAnual', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
                placeholder="10.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tipo de Taxa
              </label>
              <div className="flex gap-6">
                {(['pre-fixada', 'pos-fixada'] as RateType[]).map((tipo) => (
                  <label key={tipo} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="tipoTaxa"
                      value={tipo}
                      checked={formData.financiamento.tipoTaxa === tipo}
                      onChange={(e) => handleChange('financiamento.tipoTaxa', e.target.value as RateType)}
                      className="mr-2 w-4 h-4 text-primary-500 focus:ring-primary-500 focus:ring-2"
                    />
                    <span className="text-sm font-medium text-gray-300 capitalize">
                      {tipo === 'pre-fixada' ? 'Pré-fixada' : 'Pós-fixada'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            {showPostFixed && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Sistema de Correção
                  </label>
                  <select
                    value={formData.financiamento.sistemaCorrecao || 'nenhum'}
                    onChange={(e) => handleChange('financiamento.sistemaCorrecao', e.target.value as CorrectionSystem)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="nenhum">Nenhum</option>
                    <option value="IPCA">IPCA</option>
                    <option value="TR">TR</option>
                    <option value="SELIC">SELIC</option>
                  </select>
                </div>
                {formData.financiamento.sistemaCorrecao !== 'nenhum' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Taxa de Correção Mensal (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.financiamento.taxaCorrecaoMensal || ''}
                      onChange={(e) => handleChange('financiamento.taxaCorrecaoMensal', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                )}
              </>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Seguro MIP
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={formData.financiamento.seguro.mip || ''}
                  onChange={(e) => handleChange('financiamento.seguro.mip', parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <select
                  value={formData.financiamento.seguro.mipTipo}
                  onChange={(e) => handleChange('financiamento.seguro.mipTipo', e.target.value as InsuranceType)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="percentual">%</option>
                  <option value="fixo">Fixo (R$)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Seguro DFI
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={formData.financiamento.seguro.dfi || ''}
                  onChange={(e) => handleChange('financiamento.seguro.dfi', parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <select
                  value={formData.financiamento.seguro.dfiTipo}
                  onChange={(e) => handleChange('financiamento.seguro.dfiTipo', e.target.value as InsuranceType)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="percentual">%</option>
                  <option value="fixo">Fixo (R$)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Taxa Administrativa
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  value={formData.financiamento.taxaAdministrativa || ''}
                  onChange={(e) => handleChange('financiamento.taxaAdministrativa', parseFloat(e.target.value) || 0)}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <select
                  value={formData.financiamento.taxaAdminTipo}
                  onChange={(e) => handleChange('financiamento.taxaAdminTipo', e.target.value as AdminFeeType)}
                  className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="percentual">%</option>
                  <option value="fixo">Fixo (R$)</option>
                </select>
              </div>
            </div>
            <CurrencyInput
              value={formData.financiamento.rendaMinima || 0}
              onChange={(value) => handleChange('financiamento.rendaMinima', value || undefined)}
              label="Renda Mínima (Opcional - para validação de 30%)"
            />
          </div>
        </div>
      </section>

      <button
        type="submit"
        className="w-full bg-primary-600 text-white py-3 px-6 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 font-medium transition-colors shadow-lg hover:shadow-xl mt-6"
      >
        Calcular Simulação
      </button>
    </form>
  );
}
