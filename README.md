# Simulador de Imóvel na Planta

Simulador completo para compra de imóvel na planta com suporte a financiamento e consórcio.

## Funcionalidades

- **Entrada flexível**: Dinheiro à vista, consórcio ou composição de ambos
- **Parcelas intermediárias**: Configure valor e quantidade de parcelas intermediárias
- **Consórcio**: Suporte completo com correção INCC, taxa de administração e fundo de reserva
- **Financiamento**: 
  - Sistema SAC ou PRICE
  - Taxa pré-fixada ou pós-fixada
  - Correção monetária (IPCA, TR, SELIC)
  - Seguros MIP e DFI (percentual ou fixo)
  - Taxa administrativa
  - Cálculo de CET (Custo Efetivo Total)
- **Validação de renda**: Verifica se parcela está dentro do limite de 30% da renda
- **Relatório completo**: Cronograma mês a mês com todos os detalhes

## Tecnologias

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- React Hook Form

## Instalação

```bash
npm install
```

## Executar em desenvolvimento

```bash
npm run dev
```

O servidor iniciará na **porta 3000** por padrão.

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

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
│   ├── SimulatorForm.tsx   # Formulário de entrada
│   ├── ResultsTable.tsx    # Tabela de resultados
│   └── SummaryCard.tsx     # Card de resumo
├── lib/
│   ├── calculations.ts     # Funções principais de cálculo
│   ├── financing.ts        # Lógica de financiamento
│   └── consortium.ts       # Lógica de consórcio
└── types/
    └── simulator.ts        # Tipos TypeScript

```

