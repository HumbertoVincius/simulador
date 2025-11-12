import { FinancingData, InsuranceData, AmortizationSystem, AdminFeeType } from '@/types/simulator';

/**
 * Converte taxa anual para taxa mensal
 */
export function annualToMonthlyRate(annualRate: number): number {
  return Math.pow(1 + annualRate / 100, 1 / 12) - 1;
}

/**
 * Calcula parcela usando Tabela Price (PMT)
 */
export function calculatePriceInstallment(
  principal: number,
  monthlyRate: number,
  periods: number
): number {
  if (monthlyRate === 0) {
    return principal / periods;
  }
  const factor = Math.pow(1 + monthlyRate, periods);
  return principal * (monthlyRate * factor) / (factor - 1);
}

/**
 * Calcula seguro MIP
 */
export function calculateMIP(
  balance: number,
  insurance: InsuranceData
): number {
  if (insurance.mipTipo === 'fixo') {
    return insurance.mip;
  }
  return balance * (insurance.mip / 100);
}

/**
 * Calcula seguro DFI
 */
export function calculateDFI(
  propertyValue: number,
  insurance: InsuranceData
): number {
  if (insurance.dfiTipo === 'fixo') {
    return insurance.dfi;
  }
  return propertyValue * (insurance.dfi / 100);
}

/**
 * Calcula taxa administrativa
 */
export function calculateAdminFee(
  balance: number,
  adminFee: number,
  adminFeeType: AdminFeeType
): number {
  if (adminFeeType === 'fixo') {
    return adminFee;
  }
  return balance * (adminFee / 100);
}

/**
 * Calcula uma parcela SAC
 */
export function calculateSACInstallment(
  principal: number,
  totalPeriods: number,
  currentPeriod: number,
  monthlyRate: number,
  propertyValue: number,
  insurance: InsuranceData,
  adminFee: number,
  adminFeeType: AdminFeeType,
  correction?: number
): {
  amortization: number;
  interest: number;
  seguroMIP: number;
  seguroDFI: number;
  taxaAdmin: number;
  correcao: number;
  total: number;
} {
  const amortization = principal / totalPeriods;
  const balance = principal - (amortization * (currentPeriod - 1));
  const correctedBalance = correction ? balance * (1 + correction) : balance;
  
  const interest = correctedBalance * monthlyRate;
  const seguroMIP = calculateMIP(correctedBalance, insurance);
  const seguroDFI = calculateDFI(propertyValue, insurance);
  const taxaAdmin = calculateAdminFee(correctedBalance, adminFee, adminFeeType);
  const correcao = correction ? balance * correction : 0;
  
  const total = amortization + interest + seguroMIP + seguroDFI + taxaAdmin + correcao;
  
  return {
    amortization,
    interest,
    seguroMIP,
    seguroDFI,
    taxaAdmin,
    correcao,
    total,
  };
}

/**
 * Calcula uma parcela PRICE
 */
export function calculatePriceInstallmentDetail(
  principal: number,
  totalPeriods: number,
  currentPeriod: number,
  monthlyRate: number,
  propertyValue: number,
  insurance: InsuranceData,
  adminFee: number,
  adminFeeType: AdminFeeType,
  correction?: number
): {
  amortization: number;
  interest: number;
  seguroMIP: number;
  seguroDFI: number;
  taxaAdmin: number;
  correcao: number;
  total: number;
} {
  const baseInstallment = calculatePriceInstallment(principal, monthlyRate, totalPeriods);
  const balance = calculateBalanceAtPeriod(principal, monthlyRate, currentPeriod - 1, totalPeriods);
  const correctedBalance = correction ? balance * (1 + correction) : balance;
  
  const interest = correctedBalance * monthlyRate;
  const amortization = baseInstallment - interest;
  const seguroMIP = calculateMIP(correctedBalance, insurance);
  const seguroDFI = calculateDFI(propertyValue, insurance);
  const taxaAdmin = calculateAdminFee(correctedBalance, adminFee, adminFeeType);
  const correcao = correction ? balance * correction : 0;
  
  const total = baseInstallment + seguroMIP + seguroDFI + taxaAdmin + correcao;
  
  return {
    amortization,
    interest,
    seguroMIP,
    seguroDFI,
    taxaAdmin,
    correcao,
    total,
  };
}

/**
 * Calcula saldo devedor em um período específico (PRICE)
 */
function calculateBalanceAtPeriod(
  principal: number,
  monthlyRate: number,
  period: number,
  totalPeriods: number
): number {
  if (period === 0) return principal;
  if (monthlyRate === 0) {
    return principal - (principal / totalPeriods) * period;
  }
  const factor = Math.pow(1 + monthlyRate, period);
  return principal * (Math.pow(1 + monthlyRate, totalPeriods) - factor) / 
    (Math.pow(1 + monthlyRate, totalPeriods) - 1);
}

/**
 * Calcula saldo devedor em um período específico (SAC)
 */
export function calculateSACBalance(
  principal: number,
  period: number,
  totalPeriods: number
): number {
  const amortization = principal / totalPeriods;
  return Math.max(0, principal - (amortization * period));
}

/**
 * Gera cronograma completo de financiamento
 */
export function generateFinancingSchedule(
  financing: FinancingData
): Array<{
  mes: number;
  saldoInicial: number;
  amortizacao: number;
  juros: number;
  seguroMIP: number;
  seguroDFI: number;
  taxaAdmin: number;
  correcao: number;
  total: number;
  saldoFinal: number;
}> {
  const valorFinanciado = financing.valorFinanciado ?? 
    (financing.valorImovel * (financing.percentualFinanciamento ?? 0) / 100);
  const prazoMeses = financing.prazoAnos * 12;
  const taxaMensal = annualToMonthlyRate(financing.taxaJurosAnual);
  const correcaoMensal = financing.tipoTaxa === 'pos-fixada' && financing.taxaCorrecaoMensal 
    ? financing.taxaCorrecaoMensal / 100 
    : undefined;

  const schedule: Array<{
    mes: number;
    saldoInicial: number;
    amortizacao: number;
    juros: number;
    seguroMIP: number;
    seguroDFI: number;
    taxaAdmin: number;
    correcao: number;
    total: number;
    saldoFinal: number;
  }> = [];

  let saldoAtual = valorFinanciado;

  for (let mes = 1; mes <= prazoMeses; mes++) {
    // Aplica correção monetária no saldo inicial (se pós-fixada)
    if (correcaoMensal && mes > 1) {
      saldoAtual *= (1 + correcaoMensal);
    }
    
    const saldoInicial = saldoAtual;
    
    let detalhes;
    if (financing.sistemaAmortizacao === 'SAC') {
      detalhes = calculateSACInstallment(
        valorFinanciado,
        prazoMeses,
        mes,
        taxaMensal,
        financing.valorImovel,
        financing.seguro,
        financing.taxaAdministrativa,
        financing.taxaAdminTipo,
        correcaoMensal
      );
      
      // Atualiza saldo após pagamento (amortização é constante no SAC)
      saldoAtual = saldoInicial - detalhes.amortization;
    } else {
      detalhes = calculatePriceInstallmentDetail(
        valorFinanciado,
        prazoMeses,
        mes,
        taxaMensal,
        financing.valorImovel,
        financing.seguro,
        financing.taxaAdministrativa,
        financing.taxaAdminTipo,
        correcaoMensal
      );
      
      // Para PRICE, atualiza saldo após pagamento
      // O saldo corrigido já foi usado no cálculo dos juros dentro da função
      // Agora subtrai a amortização do saldo inicial corrigido
      saldoAtual = saldoInicial - detalhes.amortization;
    }

    schedule.push({
      mes,
      saldoInicial,
      amortizacao: detalhes.amortization,
      juros: detalhes.interest,
      seguroMIP: detalhes.seguroMIP,
      seguroDFI: detalhes.seguroDFI,
      taxaAdmin: detalhes.taxaAdmin,
      correcao: detalhes.correcao,
      total: detalhes.total,
      saldoFinal: saldoAtual,
    });
  }

  return schedule;
}

