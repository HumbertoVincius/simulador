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

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-4">Cronograma de Pagamento</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Mês
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Entrada
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Interm.
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Constr.
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Consórcio
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Financ.
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Juros
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Seguros
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Taxas
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Correção
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-yellow-400 uppercase tracking-wider bg-yellow-900/20">
                Total do Mês
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Total Acum.
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Saldo Devedor
              </th>
            </tr>
          </thead>
          <tbody className="bg-gray-800 divide-y divide-gray-700">
            {schedule.map((payment) => {
              const seguros = (payment.seguroMIP ?? 0) + (payment.seguroDFI ?? 0);
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
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-white">
                    {payment.mes === 0 ? 'Entrada' : payment.mes}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-300">
                    {payment.entrada ? formatCurrency(payment.entrada) : '-'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-300">
                    {payment.parcelaIntermediaria ? formatCurrency(payment.parcelaIntermediaria) : '-'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-300">
                    {payment.parcelaConstrutora ? formatCurrency(payment.parcelaConstrutora) : '-'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-300">
                    {payment.parcelaConsorcio ? formatCurrency(payment.parcelaConsorcio) : '-'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-300">
                    {payment.parcelaFinanciamento ? formatCurrency(payment.parcelaFinanciamento) : '-'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-300">
                    {payment.juros ? formatCurrency(payment.juros) : '-'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-300">
                    {seguros > 0 ? formatCurrency(seguros) : '-'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-300">
                    {payment.taxaAdministrativa ? formatCurrency(payment.taxaAdministrativa) : '-'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-300">
                    {payment.correcaoMonetaria ? formatCurrency(payment.correcaoMonetaria) : '-'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-bold text-yellow-400 bg-yellow-900/20">
                    {formatCurrency(totalMesCompleto)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right font-semibold text-white">
                    {formatCurrency(payment.totalAcumulado)}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-300">
                    {payment.saldoDevedor !== undefined ? formatCurrency(payment.saldoDevedor) : '-'}
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
      </div>
    </div>
  );
}
