import { ConsortiumData } from '@/types/simulator';

/**
 * Calcula parcela base do consórcio
 */
export function calculateConsortiumBaseInstallment(consortium: ConsortiumData): number {
  let valorTotal = consortium.valorCredito;
  
  if (consortium.taxaAdminTipo === 'percentual') {
    valorTotal += consortium.valorCredito * (consortium.taxaAdministracao / 100);
  }
  
  // Adiciona fundo de reserva
  valorTotal += consortium.valorCredito * (consortium.fundoReserva / 100);
  
  return valorTotal / consortium.prazoPagamento;
}

/**
 * Calcula parcela do consórcio com correção INCC
 */
export function calculateConsortiumInstallment(
  consortium: ConsortiumData,
  month: number
): number {
  const parcelaBase = calculateConsortiumBaseInstallment(consortium);
  
  // Se taxa admin é distribuída, adiciona nas parcelas
  let parcelaComAdmin = parcelaBase;
  if (consortium.taxaAdminTipo === 'distribuida') {
    const adminPorParcela = (consortium.valorCredito * (consortium.taxaAdministracao / 100)) / 
      consortium.prazoPagamento;
    parcelaComAdmin += adminPorParcela;
  }
  
  // Aplica correção INCC mensal (composta)
  const taxaINCC = consortium.taxaINCC / 100;
  return parcelaComAdmin * Math.pow(1 + taxaINCC, month);
}

/**
 * Gera cronograma de parcelas do consórcio
 */
export function generateConsortiumSchedule(
  consortium: ConsortiumData,
  startMonth: number = 0,
  endMonth?: number
): Array<{
  mes: number;
  parcela: number;
}> {
  const prazo = endMonth ?? consortium.prazoPagamento;
  const schedule: Array<{ mes: number; parcela: number }> = [];
  
  for (let i = 0; i < prazo; i++) {
    const mes = startMonth + i;
    schedule.push({
      mes,
      parcela: calculateConsortiumInstallment(consortium, i),
    });
  }
  
  return schedule;
}

