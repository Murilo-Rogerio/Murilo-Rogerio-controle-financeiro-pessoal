# 💰 Cofre — Controle Financeiro Pessoal

Aplicação full-stack para gestão de finanças pessoais: entradas, gastos, parcelamentos, patrimônio e investimentos — com taxa CDI em tempo real, monitoramento de FIIs e ações, e arquitetura preparada para Open Finance.

---

## 📸 Screenshots

*(Adicione suas capturas de tela aqui)*

---

## ✨ Funcionalidades

### 🔐 Autenticação (Supabase Auth)
- Cadastro e login com e-mail/senha, com mensagens de erro traduzidas e específicas.
- Fluxo completo de recuperação de senha ("esqueci minha senha" → e-mail → redefinição).
- Página de confirmação de e-mail própria (substitui a tela genérica do navegador).
- Botão de olho para conferir a senha digitada.
- Rotas protegidas por middleware + verificação dupla no layout.

### 📊 Dashboard
- Cards de métricas com contador animado: total recebido, total gasto, saldo, patrimônio.
- Gráfico Entradas × Saídas × CDI dos últimos 6 meses (Recharts).
- Donut de gastos por categoria (padrão + personalizadas).
- Painéis de Contas do mês, Parcelamentos ativos (com barra de progresso) e Próximas entradas previstas.
- Navegação por mês — meses futuros mostram projeções a partir de parcelamentos e entradas fixas (badge **"Projeção"**).

### 💸 Gastos
- CRUD completo com categorias personalizadas (16 ícones, 10 cores, gerenciador modal).
- Lançamentos únicos, mensais ou parcelados (2–48x, ex.: 3/10).
- Badges de parcela, recorrência e valores "previstos" vs. realizados.

### 💵 Entradas
- Salário/fixo e freelas/extras.
- Entrada fixa mensal com dia do mês (ex.: salário todo dia 05) — projetada nos meses futuros automaticamente.

### 🐷 Patrimônio & CDI
- Taxa CDI em tempo real via BrasilAPI (cache de 1h, com fallback).
- Percentual do CDI configurável (90%, 100%, 110%...).
- Rendimento bruto e líquido (IR simulado de 22,5%) mensal e anual.
- Projeção de juros compostos em 12 meses iniciando no mês atual e no valor real guardado.
- Botão de retirar dinheiro com registro de histórico de resgates.

### 📈 Investimentos
- Watchlist de FIIs e Ações com cotações via brapi.dev (cache de 5 min).
- Gráfico de dispersão Risco × Retorno + métricas (DY, P/VP, amplitude 52 semanas).
- Fallback para dados de demonstração quando a API está indisponível.
- Sugestões de ativos com adição em 1 clique.

### 🏦 Integrações bancárias (Open Finance)
- Arquitetura com adapter para agregadores (Pluggy/Belvo) — o caminho regulatório correto para o Open Finance Brasil.
- Modo demonstração: sincronização de lançamentos simulados com idempotência (re-sincronizar nunca duplica dados).

### 🎨 UX
- Dark theme "black premium" com glassmorphism sutil (backdrop-blur, bordas semi-transparentes, halos de fundo).
- Animações Framer Motion: transição entre páginas, modais com spring, listas com entrada/saída animada, moedas subindo/descendo ao registrar transações.
- Mobile-first: sidebar no desktop, header + navbar inferior no celular.
- Favicon SVG + meta tags Open Graph (preview ao compartilhar o link).

---

## 🧱 Stack

| Camada | Tecnologia |
| :--- | :--- |
| **Framework** | Next.js 15 (App Router) + React 19 |
| **Linguagem** | TypeScript (strict) |
| **Estilo** | Tailwind CSS + classes utilitárias próprias |
| **Banco / Auth** | Supabase — PostgreSQL + Auth + Row Level Security |
| **Animações** | Framer Motion |
| **Gráficos** | Recharts |
| **Ícones** | Lucide |
| **APIs Externas** | BrasilAPI (CDI) · brapi.dev (cotações) |
| **Deploy** | Vercel |

---

## 🏛️ Arquitetura e Decisões

### Segurança em Camadas
Nenhuma camada depende sozinha da outra — se uma falhar, as outras seguram:
1. **Middleware:** Renova a sessão e redireciona não-autenticados para `/login`.
2. **Layout Protegido:** O layout do grupo de rotas revalida o usuário no servidor.
3. **RLS no PostgreSQL:** Garante no banco que cada query só toca linhas do próprio usuário — mesmo que um bug no app esqueça um filtro, o banco devolve só o que pertence ao usuário.

### Server-first
Leitura de dados em **Server Components** e mutações via **Server Actions + revalidatePath** — sem API routes, sem estado de cliente desnecessário e com menos JS no navegador. Os componentes interativos (formulários, modais, gráficos) são isolados como Client Components.

### Motor de Recorrência (Projeções)
Em vez de duplicar linhas a cada mês, cada parcelamento/entrada fixa é um registro "mestre" — um motor puro (`lib/recurrence.ts`) materializa o lançamento em qualquer mês consultado (passado ou futuro). Consultar março de 2027 projeta a parcela 27/48 sem escrever nada no banco. Dias são "clampados" para o último dia válido do mês (31 → 28 em fevereiro).

### Sincronização Idempotente
Índices únicos em `(user_id, external_id)` + `upsert` garantem que sincronizações bancárias repetidas nunca dupliquem lançamentos — o mesmo evento externo sempre resolve na mesma linha.

### Open Finance: O Caminho Correto
Integração direta com Nubank/Inter/Mercado Pago exige registro regulatório (participantes do Open Finance Brasil) — indisponível para apps independentes. A solução arquitetural é o padrão de mercado: agregadores (Pluggy/Belvo). O código usa um adapter com dois modos: `demo` (dados simulados, ativo por padrão) e `pluggy` (fluxo real, com o mapeamento documentado). Quando há credenciais, o modo real assume sem reescrita.

### APIs Externas Resilientes
`fetch` nativo do Next com cache incremental (`revalidate`): 1h para a taxa CDI, 5 min para cotações. Toda API tem fallback — se a BrasilAPI cair, usa-se a última taxa salva; se a brapi cair, dados de demonstração. A UI sinaliza a origem de cada dado.

### Fronteira Server → Client Serializável
Componentes de ícone e categorias viajam como strings entre servidor e cliente (`resolveCategory` resolve no render), mantendo as props serializáveis e evitando passar componentes React pela fronteira.

---

## 🗄️ Modelo de Dados

| Tabela | Função |
| :--- | :--- |
| `auth.users` | Contas (gerenciado pelo Supabase Auth) |
| `incomes` | Entradas — fixas mensais (dia do mês) ou pontuais |
| `expenses` | Gastos — únicos, mensais ou parcelados + `external_id` (sync bancário) |
| `categories` | Categorias personalizadas (nome, cor hex, ícone) |
| `savings` | Patrimônio guardado + parâmetros do CDI (1 linha por usuário) |
| `savings_movements` | Histórico de resgates |
| `watchlist` | FIIs/ações monitorados |
| `bank_connections` | Conexões Open Finance (modo demo/agregador) |

> **Nota:** Todas as tabelas contam com **RLS (políticas por usuário)** e chaves estrangeiras configuradas com `ON DELETE CASCADE`.

---

## 📁 Estrutura do Projeto

```text
app/
├── (protected)/            # Grupo de rotas autenticadas
│   ├── dashboard/          # Visão geral (cards, gráficos, painéis)
│   ├── entradas/           # Gestão de receitas
│   ├── gastos/             # CRUD + formulários animados
│   ├── investimentos/      # Watchlist + risco × retorno
│   ├── patrimonio/         # CDI em tempo real + resgates
│   └── integracoes/        # Conexões bancárias (Open Finance)
├── auth/callback/          # Troca o código do e-mail por sessão
├── verificar-email/        # Confirmação de e-mail amigável
├── redefinir-senha/        # Definição de nova senha
└── login/                  # Login / cadastro / recuperar acesso
components/                 # UI base + features (ui, layout, dashboard, ...)
lib/
├── actions/                # Server Actions (auth, expenses, incomes, ...)
├── api/                    # Clientes de API externa (BrasilAPI, brapi)
├── supabase/               # Clients SSR (cookies) e browser
├── recurrence.ts           # Motor de projeção de recorrências
├── finance.ts              # Cálculo CDI/juros compostos
└── data.ts                 # Queries server-side
middleware.ts               # Sessão + proteção de rotas
supabase/                   # Scripts SQL (schema + RLS)
```
## 🚀 Rodando Localmente

### Pré-requisitos
- Node.js 18+
- Conta ativa no Supabase
  
### Passo a Passo:
1. clone o repositório:
```text
git clone [https://github.com/Murilo-Rogerio/Murilo-Rogerio-controle-financeiro-pessoal.git](https://github.com/Murilo-Rogerio/Murilo-Rogerio-controle-financeiro-pessoal.git)
cd Murilo-Rogerio-controle-financeiro-pessoal
```

2. Instale as dependências:
```text
npm install
```

3. Configure as Variáveis de Ambiente:
Crie um arquivo .env.local na raiz do projeto com as chaves indicadas abaixo.

4.Execute o Schema no Supabase:
Vá no console do Supabase → SQL Editor → execute os scripts localizados em supabase/ na ordem indicada.

5.Suba o servidor de desenvolvimento:
```text
npm run dev
```

## 🔑 Configuração do Supabase (Authentication)

### URL Configuration → Site URL: Defina como a URL pública da sua aplicação.

### URL Configuration → Redirect URLs: Adicione /auth/callback e /redefinir-senha.

### Login sem confirmação de e-mail (Opcional):

### - Vá em Sign In / Providers → desative a opção "Confirm email" para poder logar diretamente após o cadastro.

## 🗺️ Roadmap
- [ ] Sincronização real via agregador (widget Pluggy)
- [ ] Metas mensais por categoria
- [ ] Exportação CSV / relatórios detalhados
- [ ] PWA (instalação no celular + suporte offline)
- [ ] Testes unitários (Vitest) para finance.ts e recurrence.ts
- [ ] Documentação README em inglês

## ⚠️ Avisos Legais

### Dados de cotações e métricas de investimento são puramente informativos e não constituem recomendação de investimento.

### O cálculo de Imposto de Renda (IR) é uma simulação simplificada baseada na alíquota de 22,5% (faixa até 180 dias da tabela regressiva).

## 📄 Licença
### Distribuído sob a licença MIT. Veja LICENSE para mais detalhes.

###Feito por Murilo Rogério.
