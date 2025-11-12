export type EntryType = 'dinheiro' | 'consorcio' | 'composicao';

export type AmortizationSystem = 'SAC' | 'PRICE';

export type RateType = 'pre-fixada' | 'pos-fixada';

export type CorrectionSystem = 'IPCA' | 'TR' | 'SELIC' | 'nenhum';

export type InsuranceType = 'percentual' | 'fixo';

export type AdminFeeType = 'percentual' | 'fixo';

export interface ConsortiumData {
  valorCredito: number;
  prazoPagamento: number;
  taxaAdministracao: number;
  taxaAdminTipo: 'distribuida' | 'percentual';
  taxaINCC: number;
  fundoReserva: number;
}

export interface InsuranceData {
  mip: number;
  mipTipo: InsuranceType;
  dfi: number;
  dfiTipo: InsuranceType;
}

export interface FinancingData {
  valorImovel: number;
  valorFinanciado?: number;
  percentualFinanciamento?: number;
  prazoAnos: number;
  sistemaAmortizacao: AmortizationSystem;
  taxaJurosAnual: number;
  tipoTaxa: RateType;
  sistemaCorrecao: CorrectionSystem;
  taxaCorrecaoMensal?: number;
  seguro: InsuranceData;
  taxaAdministrativa: number;
  taxaAdminTipo: AdminFeeType;
  rendaMinima?: number;
}

export interface PropertyData {
  nomeImovel: string;
  endereco: string;
  valorTotal: number;
  tamanhoImovel: number; // em m²
  valorEntrada: number;
  valorIntermediaria: number;
  quantidadeIntermediaria: number;
  valorConstrutora: number;
  quantidadeConstrutora: number;
}

export interface SimulatorInput {
  property: PropertyData;
  tipoEntrada: EntryType;
  consorcio?: ConsortiumData;
  financiamento: FinancingData;
}

export interface MonthlyPayment {
  mes: number;
  entrada?: number;
  parcelaIntermediaria?: number;
  parcelaConstrutora?: number;
  parcelaConsorcio?: number;
  parcelaFinanciamento?: number;
  amortizacao?: number;
  juros?: number;
  seguroMIP?: number;
  seguroDFI?: number;
  taxaAdministrativa?: number;
  correcaoMonetaria?: number;
  totalMes: number;
  totalAcumulado: number;
  saldoDevedor?: number;
}

export interface SimulationResult {
  schedule: MonthlyPayment[];
  resumo: {
    nomeImovel: string;
    endereco: string;
    valorTotalPago: number;
    valorTotalImovel: number;
    tamanhoImovel: number;
    valorPorM2: number;
    valorFinanciado: number;
    parcelaDuranteFinanciamento: number;
    totalJuros: number;
    totalSeguros: number;
    totalTaxas: number;
    cet: number;
    validacaoRenda?: {
      parcelaMaxima: number;
      parcelaAtual: number;
      aprovado: boolean;
    };
  };
}

