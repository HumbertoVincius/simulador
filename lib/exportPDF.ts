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

  // Informações do Imóvel
  const resumo = result.resumo;
  if (resumo.nomeImovel || resumo.endereco) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    if (resumo.nomeImovel) {
      doc.text(resumo.nomeImovel, pageWidth / 2, yPos, { align: 'center' });
      yPos += 6;
    }
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (resumo.endereco) {
      doc.text(resumo.endereco, pageWidth / 2, yPos, { align: 'center' });
      yPos += 6;
    }
  }

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
  
  const resumoData = [
    ['Valor Total do Imóvel', formatCurrency(resumo.valorTotalImovel)],
    ['Tamanho do Imóvel', `${resumo.tamanhoImovel.toFixed(2)} m²`],
    ['Valor por m²', formatCurrency(resumo.valorPorM2)],
    ['Valor Financiado', formatCurrency(resumo.valorFinanciado)],
  ];
  
  if (resumo.parcelaDuranteFinanciamento > 0) {
    resumoData.push(['Parcela Durante Financiamento', formatCurrency(resumo.parcelaDuranteFinanciamento)]);
  }
  
  resumoData.push(
    ['Valor Total Pago', formatCurrency(resumo.valorTotalPago)],
    ['Total de Juros', formatCurrency(resumo.totalJuros)],
    ['Total de Seguros', formatCurrency(resumo.totalSeguros)],
    ['Total de Taxas', formatCurrency(resumo.totalTaxas)],
    ['CET (Custo Efetivo Total)', formatPercent(resumo.cet)]
  );

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

  // Cronograma completo - todas as páginas
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Cronograma de Pagamento Completo', margin, yPos);
  yPos += 8;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  const headers = ['Mês', 'Entrada', 'Interm.', 'Constr.', 'Consórcio', 'Financ.', 'Total Mês', 'Total Acum.'];
  const colWidths = [15, 25, 25, 25, 25, 25, 30, 30];
  const rowHeight = 5;
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxYPerPage = pageHeight - margin - 10; // Margem inferior
  
  // Função para adicionar cabeçalhos da tabela
  const addTableHeaders = () => {
    let xPos = margin;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    headers.forEach((header, i) => {
      doc.text(header, xPos, yPos);
      xPos += colWidths[i];
    });
    yPos += rowHeight;
  };

  // Adicionar cabeçalhos na primeira página
  addTableHeaders();

  doc.setFont('helvetica', 'normal');
  
  // Processar todas as linhas do cronograma
  for (let i = 0; i < result.schedule.length; i++) {
    const payment = result.schedule[i];
    
    // Verificar se precisa de nova página
    if (yPos + rowHeight > maxYPerPage) {
      doc.addPage();
      yPos = margin;
      // Adicionar cabeçalhos na nova página
      addTableHeaders();
    }

    let xPos = margin;
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

    yPos += rowHeight;
  }

  // Adicionar rodapé com total de meses
  if (yPos + 10 > maxYPerPage) {
    doc.addPage();
    yPos = margin;
  }
  yPos += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`Total de meses simulados: ${result.schedule.length}`, margin, yPos);

  // Salvar PDF
  doc.save(`simulacao-imovel-${new Date().toISOString().split('T')[0]}.pdf`);
}

