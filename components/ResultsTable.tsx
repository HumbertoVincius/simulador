'use client';

import { MonthlyPayment } from '@/types/simulator';

interface ResultsTableProps {
  schedule: MonthlyPayment[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export default function ResultsTable({ schedule }: ResultsTableProps) {
  if (schedule.length === 0) {
    return (
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <p className="text-gray-400 text-center">Preencha o formulário e calcule a simulação para ver os resultados.</p>
      </div>
    );
  }

  const cleanedSchedule = schedule.filter((payment, index) => {
    if (index === 0) return true;
    const prev = schedule[index - 1];
    if (payment.mes === 0 && prev.mes === 0) return false;
    return true;
  });

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-4">Cronograma de Pagamento</h2>
      <div className="overflow-x-visible">
        <table className="w-full divide-y divide-gray-700 text-xs lg:text-sm">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-2 lg:px-3 py-2 text-left font-medium text-gray-300 uppercase tracking-wider">
                Mês
              </th>
              <th className="px-2 lg:px-3 py-2 text-right font-medium text-gray-300 uppercase tracking-wider">
                Entrada
              </th>
              <th className="px-2 lg:px-3 py-2 text-right font-medium text-gray-300 uppercase tracking-wider">
                Interm.
              </th>
              <th className="px-2 lg:px-3 py-2 text-right font-medium text-gray-300 uppercase tracking-wider">
                Constr.
              </th>
              <th className="px-2 lg:px-3 py-2 text-right font-medium text-gray-300 uppercase tracking-wider">
                Consórcio
              </th>
              <th className="px-2 lg:px-3 py-2 text-right font-medium text-gray-300 uppercase tracking-wider">
                Financ.
              </th>
              <th className="px-2 lg:px-3 py-2 text-right font-medium text-yellow-400 uppercase tracking-wider bg-yellow-900/20">
                Total do Mês
              </th>
              <th className="px-2 lg:px-3 py-2 text-right font-medium text-gray-300 uppercase tracking-wider">
                Total Acum.
              </th>
              <th className="px-2 lg:px-3 py-2 text-right font-medium text-gray-300 uppercase tracking-wider">
                Saldo Financiamento
              </th>
              <th className="px-2 lg:px-3 py-2 text-right font-medium text-gray-300 uppercase tracking-wider">
                Saldo Consórcio
              </th>
              <th className="px-2 lg:px-3 py-2 text-right font-medium text-gray-300 uppercase tracking-wider">
                Saldo Total
              </th>
              <th className="px-2 lg:px-3 py-2 text-right font-medium text-gray-300 uppercase tracking-wider">
                Pago + Saldo
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {cleanedSchedule.map((payment) => {
              const temDados = payment.entrada || payment.parcelaIntermediaria || 
                payment.parcelaConstrutora || payment.parcelaConsorcio || payment.parcelaFinanciamento;

              if (!temDados && payment.mes > 0) return null;

              // Calcular total a ser pago no mês (soma de tudo)
              const totalMesCompleto = 
                (payment.entrada ?? 0) +
                (payment.parcelaIntermediaria ?? 0) +
                (payment.parcelaConstrutora ?? 0) +
                (payment.parcelaConsorcio ?? 0) +
                (payment.parcelaFinanciamento ?? 0);

              return (
                <tr key={payment.mes} className={payment.mes === 0 ? 'bg-blue-900/30' : 'hover:bg-gray-700/50'}>
                  <td className="px-2 lg:px-3 py-2 whitespace-nowrap text-[0.75rem] lg:text-sm font-medium text-white">
                    {payment.mes === 0 ? 'Entrada' : payment.mes}
                  </td>
                  <td className="px-2 lg:px-3 py-2 whitespace-nowrap text-[0.75rem] lg:text-sm text-right text-gray-300">
                    {payment.entrada ? formatCurrency(payment.entrada) : '-'}
                  </td>
                  <td className="px-2 lg:px-3 py-2 whitespace-nowrap text-[0.75rem] lg:text-sm text-right text-gray-300">
                    {payment.parcelaIntermediaria ? formatCurrency(payment.parcelaIntermediaria) : '-'}
                  </td>
                  <td className="px-2 lg:px-3 py-2 whitespace-nowrap text-[0.75rem] lg:text-sm text-right text-gray-300">
                    {payment.parcelaConstrutora ? formatCurrency(payment.parcelaConstrutora) : '-'}
                  </td>
                  <td className="px-2 lg:px-3 py-2 whitespace-nowrap text-[0.75rem] lg:text-sm text-right text-gray-300">
                    {payment.parcelaConsorcio ? formatCurrency(payment.parcelaConsorcio) : '-'}
                  </td>
                  <td className="px-2 lg:px-3 py-2 whitespace-nowrap text-[0.75rem] lg:text-sm text-right text-gray-300">
                    {payment.parcelaFinanciamento ? formatCurrency(payment.parcelaFinanciamento) : '-'}
                  </td>
                  <td className="px-2 lg:px-3 py-2 whitespace-nowrap text-[0.75rem] lg:text-sm text-right font-bold text-yellow-400 bg-yellow-900/20">
                    {formatCurrency(totalMesCompleto)}
                  </td>
                  <td className="px-2 lg:px-3 py-2 whitespace-nowrap text-[0.75rem] lg:text-sm text-right font-semibold text-white">
                    {formatCurrency(payment.totalAcumulado)}
                  </td>
                  <td className="px-2 lg:px-3 py-2 whitespace-nowrap text-[0.75rem] lg:text-sm text-right text-gray-300">
                    {payment.saldoDevedorFinanciamento !== undefined ? formatCurrency(payment.saldoDevedorFinanciamento) : '-'}
                  </td>
                  <td className="px-2 lg:px-3 py-2 whitespace-nowrap text-[0.75rem] lg:text-sm text-right text-gray-300">
                    {payment.saldoDevedorConsorcio !== undefined ? formatCurrency(payment.saldoDevedorConsorcio) : '-'}
                  </td>
                  <td className="px-2 lg:px-3 py-2 whitespace-nowrap text-[0.75rem] lg:text-sm text-right text-gray-300">
                    {payment.saldoDevedorTotal !== undefined ? formatCurrency(payment.saldoDevedorTotal) : '-'}
                  </td>
                  <td className="px-2 lg:px-3 py-2 whitespace-nowrap text-[0.75rem] lg:text-sm text-right text-gray-300">
                    {payment.pagoMaisSaldo !== undefined
                      ? formatCurrency(payment.pagoMaisSaldo)
                      : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-sm text-gray-400">
        <p>* Valores em Reais (R$)</p>
        <p>* Mês 0 representa a entrada</p>
        <p>* <span className="text-yellow-400 font-semibold">Total do Mês</span> = Entrada + Intermediária + Construtora + Consórcio + Financiamento</p>
        <p>* Saldo Total = Saldo Financiamento + Saldo Consórcio</p>
        <p>* Pago + Saldo = Total Acumulado + Saldo Total</p>
      </div>
    </div>
  );
}
