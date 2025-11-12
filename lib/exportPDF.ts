import jsPDF from 'jspdf';
import { SimulationResult } from '@/types/simulator';

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

export function exportSimulationToPDF(result: SimulationResult) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  let yPos = margin;

  // Título
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Simulação de Compra de Imóvel na Planta', pageWidth / 2, yPos, { align: 'center' });
  yPos += 10;

  // Data
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, yPos, { align: 'center' });
  yPos += 15;

  // Resumo
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo da Simulação', margin, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const resumo = result.resumo;
  const resumoData = [
    ['Valor Total do Imóvel', formatCurrency(resumo.valorTotalImovel)],
    ['Tamanho do Imóvel', `${resumo.tamanhoImovel.toFixed(2)} m²`],
    ['Valor por m²', formatCurrency(resumo.valorPorM2)],
    ['Valor Financiado', formatCurrency(resumo.valorFinanciado)],
    ['Valor Total Pago', formatCurrency(resumo.valorTotalPago)],
    ['Total de Juros', formatCurrency(resumo.totalJuros)],
    ['Total de Seguros', formatCurrency(resumo.totalSeguros)],
    ['Total de Taxas', formatCurrency(resumo.totalTaxas)],
    ['CET (Custo Efetivo Total)', formatPercent(resumo.cet)],
  ];

  resumoData.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label + ':', margin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(value, margin + 80, yPos);
    yPos += 6;
  });

  yPos += 5;
  const diferenca = resumo.valorTotalPago - resumo.valorTotalImovel;
  doc.setFont('helvetica', 'bold');
  doc.text('Diferença (Juros + Taxas):', margin, yPos);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(diferenca > 0 ? 255 : 0, diferenca > 0 ? 0 : 200, 0);
  doc.text(formatCurrency(diferenca), margin + 80, yPos);
  doc.setTextColor(0, 0, 0);
  yPos += 10;

  // Validação de renda
  if (resumo.validacaoRenda) {
    doc.setFont('helvetica', 'bold');
    doc.text(
      resumo.validacaoRenda.aprovado ? '✓ Aprovado' : '✗ Não Aprovado',
      margin,
      yPos
    );
    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.text(
      `Parcela Máxima (30% da renda): ${formatCurrency(resumo.validacaoRenda.parcelaMaxima)}`,
      margin,
      yPos
    );
    yPos += 6;
    doc.text(
      `Maior Parcela da Simulação: ${formatCurrency(resumo.validacaoRenda.parcelaAtual)}`,
      margin,
      yPos
    );
    yPos += 10;
  }

  // Cronograma (primeiras 30 linhas)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Cronograma de Pagamento (Primeiros Meses)', margin, yPos);
  yPos += 8;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  const headers = ['Mês', 'Entrada', 'Interm.', 'Constr.', 'Consórcio', 'Financ.', 'Total Mês', 'Total Acum.'];
  const colWidths = [15, 25, 25, 25, 25, 25, 30, 30];
  let xPos = margin;

  headers.forEach((header, i) => {
    doc.text(header, xPos, yPos);
    xPos += colWidths[i];
  });
  yPos += 5;

  doc.setFont('helvetica', 'normal');
  const maxRows = Math.min(30, result.schedule.length);
  
  for (let i = 0; i < maxRows; i++) {
    const payment = result.schedule[i];
    
    if (yPos > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      yPos = margin;
    }

    xPos = margin;
    const row = [
      payment.mes === 0 ? 'Entrada' : payment.mes.toString(),
      payment.entrada ? formatCurrency(payment.entrada) : '-',
      payment.parcelaIntermediaria ? formatCurrency(payment.parcelaIntermediaria) : '-',
      payment.parcelaConstrutora ? formatCurrency(payment.parcelaConstrutora) : '-',
      payment.parcelaConsorcio ? formatCurrency(payment.parcelaConsorcio) : '-',
      payment.parcelaFinanciamento ? formatCurrency(payment.parcelaFinanciamento) : '-',
      formatCurrency(payment.totalMes),
      formatCurrency(payment.totalAcumulado),
    ];

    row.forEach((cell, j) => {
      doc.text(cell, xPos, yPos);
      xPos += colWidths[j];
    });

    yPos += 5;
  }

  if (result.schedule.length > 30) {
    yPos += 5;
    doc.setFont('helvetica', 'italic');
    doc.text(`... e mais ${result.schedule.length - 30} meses`, margin, yPos);
  }

  // Salvar PDF
  doc.save(`simulacao-imovel-${new Date().toISOString().split('T')[0]}.pdf`);
}

