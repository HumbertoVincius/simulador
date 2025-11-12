import { SimulatorInput, SimulationResult, MonthlyPayment } from '@/types/simulator';
import { generateFinancingSchedule } from './financing';
import { generateConsortiumSchedule } from './consortium';

/**
 * Valida se parcela está dentro do limite de 30% da renda
 */
export function validateIncome(
  maxInstallment: number,
  minIncome?: number
): { parcelaMaxima: number; parcelaAtual: number; aprovado: boolean } | undefined {
  if (!minIncome) return undefined;
  
  const parcelaMaxima = minIncome * 0.3;
  return {
    parcelaMaxima,
    parcelaAtual: maxInstallment,
    aprovado: maxInstallment <= parcelaMaxima,
  };
}

/**
 * Calcula CET (Custo Efetivo Total) usando método de tentativa e erro
 */
export function calculateCET(
  principal: number,
  schedule: MonthlyPayment[]
): number {
  // Remove entrada e parcelas intermediárias para cálculo do CET
  const financingPayments = schedule
    .filter(p => p.parcelaFinanciamento !== undefined && p.parcelaFinanciamento > 0)
    .map(p => ({
      month: p.mes,
      value: p.parcelaFinanciamento! + (p.seguroMIP ?? 0) + (p.seguroDFI ?? 0) + 
        (p.taxaAdministrativa ?? 0) + (p.correcaoMonetaria ?? 0),
    }));

  if (financingPayments.length === 0) return 0;

  // Método de Newton-Raphson simplificado para encontrar taxa
  let rate = 0.01; // Começa com 1% ao mês
  const tolerance = 0.0001;
  const maxIterations = 100;

  for (let i = 0; i < maxIterations; i++) {
    let npv = -principal;
    let npvDerivative = 0;

    financingPayments.forEach((payment) => {
      const factor = Math.pow(1 + rate, payment.month);
      npv += payment.value / factor;
      npvDerivative -= (payment.month * payment.value) / (factor * (1 + rate));
    });

    if (Math.abs(npv) < tolerance) {
      break;
    }

    const newRate = rate - npv / npvDerivative;
    if (Math.abs(newRate - rate) < tolerance) {
      break;
    }
    rate = Math.max(0.0001, Math.min(0.1, newRate)); // Limita entre 0.01% e 10% ao mês
  }

  // Converte taxa mensal para anual
  return (Math.pow(1 + rate, 12) - 1) * 100;
}

/**
 * Gera simulação completa mês a mês
 */
export function generateMonthlySchedule(input: SimulatorInput): SimulationResult {
  const schedule: MonthlyPayment[] = [];
  let totalAcumulado = 0;

  // Mês 0: Entrada
  let valorEntrada = 0;
  if (input.tipoEntrada === 'dinheiro' || input.tipoEntrada === 'composicao') {
    valorEntrada += input.property.valorEntrada;
  }
  if (input.tipoEntrada === 'consorcio' || input.tipoEntrada === 'composicao') {
    if (input.consorcio) {
      valorEntrada += input.consorcio.valorCredito;
    }
  }

  if (valorEntrada > 0) {
    totalAcumulado += valorEntrada;
    schedule.push({
      mes: 0,
      entrada: valorEntrada,
      totalMes: valorEntrada,
      totalAcumulado,
    });
  }

  // Calcular valor já pago à construtora (entrada + intermediárias + construtora)
  const valorPagoConstrutora = valorEntrada + 
    (input.property.valorIntermediaria * input.property.quantidadeIntermediaria) +
    (input.property.valorConstrutora * input.property.quantidadeConstrutora);
  
  // Calcular valor restante do imóvel não pago à construtora
  const valorRestante = input.financiamento.valorImovel - valorPagoConstrutora;
  
  // Calcular valor financiado: restante do valor do imóvel não pago à construtora
  // Se foi informado valor fixo ou percentual, usar esse valor
  // Caso contrário, calcular como restante automaticamente
  let valorFinanciado: number;
  if (input.financiamento.valorFinanciado !== undefined && input.financiamento.valorFinanciado > 0) {
    // Se foi informado valor fixo, usar esse valor
    valorFinanciado = input.financiamento.valorFinanciado;
  } else if (input.financiamento.percentualFinanciamento !== undefined && input.financiamento.percentualFinanciamento > 0) {
    // Se foi informado percentual, calcular sobre o valor do imóvel
    valorFinanciado = input.financiamento.valorImovel * (input.financiamento.percentualFinanciamento / 100);
  } else {
    // Se não foi informado, calcular como restante do valor do imóvel não pago à construtora
    valorFinanciado = Math.max(0, valorRestante);
  }
  
  // Garantir que o valor financiado não seja negativo
  valorFinanciado = Math.max(0, valorFinanciado);

  // Criar objeto de financiamento com valor financiado calculado
  const financiamentoComValor = {
    ...input.financiamento,
    valorFinanciado: valorFinanciado,
    percentualFinanciamento: undefined, // Limpar percentual já que temos valor fixo
  };
  
  // Gerar cronograma de financiamento
  const financingSchedule = generateFinancingSchedule(financiamentoComValor);
  
  // Gerar cronograma de consórcio (se aplicável)
  // Nota: Consórcio já contemplado, mas parcelas continuam sendo pagas
  let consortiumSchedule: Array<{ mes: number; parcela: number }> = [];
  if ((input.tipoEntrada === 'consorcio' || input.tipoEntrada === 'composicao') && input.consorcio) {
    // Parcelas do consórcio começam após a entrada (mês 1)
    const startMonth = 1;
    consortiumSchedule = generateConsortiumSchedule(input.consorcio, startMonth);
  }

  // Meses de parcelas da construtora
  const construtoraStartMonth = valorEntrada > 0 ? 1 : 0;
  const construtoraEndMonth = construtoraStartMonth + input.property.quantidadeConstrutora;

  // Meses de financiamento (após parcelas da construtora)
  const financingStartMonth = construtoraEndMonth;
  const financingEndMonth = financingStartMonth + (input.financiamento.prazoAnos * 12);

  // Calcular distribuição das parcelas intermediárias ao longo do período antes do financiamento
  // Período disponível: da entrada até o início do financiamento
  const inicioPeriodo = valorEntrada > 0 ? 1 : 0;
  const periodoDisponivel = financingStartMonth - inicioPeriodo;
  const quantidadeIntermediarias = input.property.quantidadeIntermediaria;
  
  // Criar array com os meses onde as parcelas intermediárias serão pagas
  const mesesIntermediarias: Set<number> = new Set();
  if (quantidadeIntermediarias > 0 && periodoDisponivel > 0) {
    // Distribuir uniformemente ao longo do período
    if (quantidadeIntermediarias >= periodoDisponivel) {
      // Se há mais parcelas que meses disponíveis, distribuir mensalmente
      for (let mes = inicioPeriodo; mes < financingStartMonth; mes++) {
        mesesIntermediarias.add(mes);
      }
    } else {
      // Distribuir uniformemente
      const intervalo = periodoDisponivel / (quantidadeIntermediarias + 1);
      for (let i = 0; i < quantidadeIntermediarias; i++) {
        const mes = Math.round(inicioPeriodo + (i + 1) * intervalo);
        if (mes < financingStartMonth) {
          mesesIntermediarias.add(mes);
        }
      }
    }
  }

  // Meses de consórcio (continuam após contemplação)
  const consortiumEndMonth = consortiumSchedule.length > 0 
    ? Math.max(...consortiumSchedule.map(s => s.mes)) + 1 
    : 0;

  // Determinar último mês da simulação
  const maxMesIntermediarias = mesesIntermediarias.size > 0 ? Math.max(...Array.from(mesesIntermediarias)) : 0;
  const lastMonth = Math.max(
    construtoraEndMonth,
    financingEndMonth,
    consortiumEndMonth,
    maxMesIntermediarias
  );

  // Construir cronograma mês a mês
  for (let mes = 1; mes <= lastMonth; mes++) {
    const payment: MonthlyPayment = {
      mes,
      totalMes: 0,
      totalAcumulado: 0,
    };

    // Parcela intermediária (distribuída ao longo do período antes do financiamento)
    if (mesesIntermediarias.has(mes)) {
      payment.parcelaIntermediaria = input.property.valorIntermediaria;
      payment.totalMes += input.property.valorIntermediaria;
    }

    // Parcela da construtora
    if (mes >= construtoraStartMonth && mes < construtoraEndMonth) {
      payment.parcelaConstrutora = input.property.valorConstrutora;
      payment.totalMes += input.property.valorConstrutora;
    }

    // Parcela consórcio
    const consortiumPayment = consortiumSchedule.find(s => s.mes === mes);
    if (consortiumPayment) {
      payment.parcelaConsorcio = consortiumPayment.parcela;
      payment.totalMes += consortiumPayment.parcela;
    }

    // Parcela financiamento
    const financingPayment = financingSchedule.find(s => s.mes === (mes - financingStartMonth + 1));
    if (financingPayment && mes >= financingStartMonth && mes < financingEndMonth) {
      payment.parcelaFinanciamento = financingPayment.total;
      payment.amortizacao = financingPayment.amortizacao;
      payment.juros = financingPayment.juros;
      payment.seguroMIP = financingPayment.seguroMIP;
      payment.seguroDFI = financingPayment.seguroDFI;
      payment.taxaAdministrativa = financingPayment.taxaAdmin;
      payment.correcaoMonetaria = financingPayment.correcao;
      payment.saldoDevedor = financingPayment.saldoFinal;
      payment.totalMes += financingPayment.total;
    }

    totalAcumulado += payment.totalMes;
    payment.totalAcumulado = totalAcumulado;
    schedule.push(payment);
  }

  // Calcular resumo
  const totalJuros = schedule.reduce((sum, p) => sum + (p.juros ?? 0), 0);
  const totalSeguros = schedule.reduce((sum, p) => sum + (p.seguroMIP ?? 0) + (p.seguroDFI ?? 0), 0);
  const totalTaxas = schedule.reduce((sum, p) => sum + (p.taxaAdministrativa ?? 0), 0);
  
  // Encontrar maior parcela para validação de renda
  const maxInstallment = Math.max(...schedule.map(p => p.totalMes));
  
  // Calcular parcela durante financiamento (parcela financiamento + consórcio se houver)
  const mesesFinanciamento = schedule.filter(p => p.parcelaFinanciamento !== undefined && p.parcelaFinanciamento > 0);
  let parcelaDuranteFinanciamento = 0;
  if (mesesFinanciamento.length > 0) {
    // Calcular média das parcelas durante o financiamento
    const somaParcelas = mesesFinanciamento.reduce((sum, p) => {
      const parcelaFinanc = p.parcelaFinanciamento ?? 0;
      const parcelaConsorcio = p.parcelaConsorcio ?? 0;
      return sum + parcelaFinanc + parcelaConsorcio;
    }, 0);
    parcelaDuranteFinanciamento = somaParcelas / mesesFinanciamento.length;
  }
  
  const cet = calculateCET(valorFinanciado, schedule);

  // Calcular valor por m²
  const tamanhoImovel = input.property.tamanhoImovel || 0;
  const valorPorM2 = tamanhoImovel > 0 ? input.property.valorTotal / tamanhoImovel : 0;

  return {
    schedule,
    resumo: {
      nomeImovel: input.property.nomeImovel || '',
      endereco: input.property.endereco || '',
      valorTotalPago: totalAcumulado,
      valorTotalImovel: input.property.valorTotal,
      tamanhoImovel,
      valorPorM2,
      valorFinanciado,
      parcelaDuranteFinanciamento,
      totalJuros,
      totalSeguros,
      totalTaxas,
      cet,
      validacaoRenda: validateIncome(maxInstallment, input.financiamento.rendaMinima),
    },
  };
}

