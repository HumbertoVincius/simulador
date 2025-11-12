# Simulador de Imóvel na Planta

Simulador completo para compra de imóvel na planta com suporte a financiamento e consórcio. Interface moderna em modo dark com cálculos precisos de amortização, juros e taxas.

## Funcionalidades

- **Entrada flexível**: Dinheiro à vista, consórcio ou composição de ambos
- **Parcelas intermediárias**: Distribuídas uniformemente ao longo do período antes do financiamento
- **Parcelas da construtora**: Configure valor e quantidade de parcelas da construtora
- **Consórcio**: Suporte completo com correção INCC, taxa de administração e fundo de reserva
- **Financiamento**: 
  - Sistema SAC ou PRICE
  - Taxa pré-fixada ou pós-fixada
  - Correção monetária (IPCA, TR, SELIC)
  - Seguros MIP e DFI (percentual ou fixo)
  - Taxa administrativa
  - Cálculo de CET (Custo Efetivo Total)
- **Validação de renda**: Verifica se parcela está dentro do limite de 30% da renda
- **Tamanho do imóvel**: Cálculo automático do valor por m²
- **Relatório completo**: Cronograma mês a mês com todos os detalhes
- **Exportação PDF**: Gere relatório completo em PDF

## Tecnologias

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- React Hook Form
- jsPDF (exportação de PDF)

## Instalação

```bash
npm install
```

## Executar em desenvolvimento

```bash
npm run dev
```

O servidor iniciará na **porta 4000** por padrão (configurado no package.json).

Acesse [http://localhost:4000](http://localhost:4000) no navegador.

### Alterar a porta

Se quiser usar uma porta diferente, você pode:

1. **Modificar o script no package.json:**
   ```json
   "dev": "next dev -p 8080"
   ```

2. **Ou usar variável de ambiente:**
   ```bash
   PORT=8080 npm run dev
   ```

3. **Ou passar diretamente na linha de comando:**
   ```bash
   npm run dev -- -p 8080
   ```

## Build para produção

```bash
npm run build
npm start
```

## Estrutura do Projeto

```
├── app/
│   ├── layout.tsx          # Layout principal
│   ├── page.tsx            # Página principal
│   └── globals.css         # Estilos globais
├── components/
│   ├── CurrencyInput.tsx   # Input formatado para valores monetários
│   ├── SimulatorForm.tsx   # Formulário de entrada
│   ├── ResultsTable.tsx    # Tabela de resultados
│   └── SummaryCard.tsx     # Card de resumo
├── lib/
│   ├── calculations.ts     # Funções principais de cálculo
│   ├── financing.ts        # Lógica de financiamento
│   ├── consortium.ts       # Lógica de consórcio
│   └── exportPDF.ts        # Exportação para PDF
└── types/
    └── simulator.ts        # Tipos TypeScript

```

## Uso

1. Preencha os dados do imóvel (valor total, tamanho em m², entrada)
2. Configure as parcelas intermediárias e da construtora
3. Selecione o tipo de entrada (dinheiro, consórcio ou composição)
4. Configure o financiamento (percentual ou valor fixo, sistema de amortização, taxas)
5. Clique em "Calcular Simulação" para gerar o cronograma
6. Use o botão "Exportar PDF" para gerar um relatório completo

## Licença

Este projeto é de código aberto e está disponível sob a licença MIT.

