# Melhores Funções — painel, atalhos e página dedicada

Um conjunto único de "melhores funções" reaproveitado em três lugares: cards de ação rápida na Captura, atalhos de filtro na Agenda e uma página `/funcoes` com a lista completa. Sem backend novo — tudo usa dados e estado locais que o app já tem.

## 1. Fonte única das funções

Novo módulo com a lista de funções: `id`, ícone Lucide, título, descrição curta, descrição detalhada e o tipo de ação. Os três pontos do app leem dessa mesma lista, mantendo texto e ícones consistentes.

Funções:
- **Nova nota / Ideia rápida / Tarefa urgente** — pré-preenchem o campo de captura com um template e focam o campo
- **Colar da área de transferência** — lê o clipboard e insere no campo
- **Enviar arquivo, PDF ou imagem** — aciona o fluxo de upload existente
- **Ver exemplo formatado** — insere o texto de exemplo
- **Abrir a Agenda** e **Nova pasta** — navegação/ação rápida
- **Exportar notas em Markdown** — baixa um `.md` com as notas atuais
- **Alternar tema** — claro/escuro

## 2. Captura (`/`)

Grid responsivo de cards compactos (2 colunas <640px, até 4 em telas largas) logo acima do campo de texto, abaixo do cabeçalho e sem sobrepor o UploadZone. Ícone + título curto + hover e transição suaves. Clique dispara a ação no campo de texto ou no fluxo de arquivos.

## 3. Agenda (`/agenda`)

Barra de atalhos horizontal acima da lista de notas, alinhada visualmente com os chips de categoria existentes. Filtros em modo toggle, cumulativos com o filtro de categoria atual:
- **Hoje** — notas criadas nas últimas 24h
- **Com anexo** — notas com imagem ou arquivo
- **Tarefas** — notas da categoria Tarefas
- **Capturar agora** — navega para `/`

Estado dos toggles fica em memória do componente; a filtragem acontece sobre as notas já carregadas.

## 4. Página `/funcoes`

Nova rota com a lista expandida: card maior com ícone, título, descrição detalhada e botão de ação. Ações que precisam do contexto da Captura navegam para `/` passando a ação por search param (ex.: `?action=nova-nota`), executada assim que a home carrega. Ações sem destino definido exibem toast informativo. `head()` próprio com título, descrição, og:title e og:description.

## 5. Navegação global

`/funcoes` entra no menu do topo (desktop) e na barra inferior (mobile) do AppShell, com o mesmo destaque de rota ativa dos links atuais.

## Detalhes técnicos

- Roteamento é TanStack Router (não react-router-dom): `src/routes/funcoes.tsx` com `createFileRoute("/funcoes")`; a árvore de rotas é gerada automaticamente.
- `src/lib/features.ts` (lista + tipos de ação) e `src/components/FeatureGrid.tsx` com variantes `compact` e `expanded`.
- `src/routes/index.tsx` valida o search param `action` e executa a ação correspondente na montagem.
- Clipboard bloqueado: try/catch com toast orientando a colar manualmente, sem quebrar a tela.
- Alterações pontuais em `src/routes/index.tsx`, `src/routes/agenda.tsx` e `src/components/AppShell.tsx`.
- Só Tailwind + Lucide + shadcn já presentes; nenhuma dependência nova, nenhuma persistência nova.
