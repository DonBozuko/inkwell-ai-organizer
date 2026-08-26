# Melhores Funções — painel, atalhos e página dedicada

Adiciona um conjunto único de "melhores funções" reaproveitado em três lugares: cards de ação rápida na Captura, atalhos de filtro na Agenda e uma página `/funcoes` com a lista completa. Nada de backend novo — tudo usa os dados locais que o app já tem.

## 1. Fonte única das funções

Um módulo novo define a lista de funções (id, ícone Lucide, título, descrição curta e detalhada, e o que a ação faz). Os três pontos do app leem dessa mesma lista, então o texto e os ícones ficam consistentes.

Funções previstas (todas ligadas ao que o app já faz):
- Nova nota / Ideia rápida / Tarefa urgente — preenchem e focam o campo de captura com um começo de texto e a pasta sugerida
- Colar da área de transferência
- Enviar arquivo, PDF ou imagem
- Ver exemplo formatado
- Abrir a Agenda / criar nova pasta
- Exportar notas em Markdown
- Alternar tema claro/escuro

## 2. Captura (`/`)

Grid responsivo de cards pequenos logo acima do campo de texto (2 colunas no celular, 3–4 no desktop), com ícone, título e hover/transição suave. Clicar pré-preenche o campo de captura (texto inicial + foco) ou dispara a ação correspondente (colar, upload, exemplo). Sem sobrepor o cabeçalho nem o UploadZone.

## 3. Agenda (`/agenda`)

Bloco de atalhos acima da lista de notas, na mesma linha visual dos chips de categoria já existentes. Como filtros rápidos usarei o que os dados realmente suportam hoje:
- **Hoje** — notas criadas nas últimas 24h
- **Com anexo** — notas com imagem ou arquivo
- **Tarefas** — notas na categoria Tarefas
- **Capturar agora** — leva para `/`

Os atalhos são alternáveis (toggle) e mostram estado ativo imediatamente; combinam com o filtro de categoria já existente.

## 4. Página `/funcoes`

Nova rota com a lista expandida: cada função em um card maior com ícone, título, descrição detalhada e botão de ação. Ações que só fazem sentido na Captura navegam para `/` já com a ação aplicada; ações ainda sem destino exibem um toast informativo. Metadados de `head()` próprios (título, descrição, og:title, og:description).

## 5. Navegação

`/funcoes` entra no menu do topo (desktop) e na barra inferior (mobile) do AppShell, com o mesmo destaque de rota ativa dos links atuais.

## Detalhes técnicos

- Roteamento é TanStack Router (não react-router-dom): novo arquivo `src/routes/funcoes.tsx` com `createFileRoute("/funcoes")`; a árvore de rotas é gerada automaticamente.
- Novo `src/lib/features.ts` (lista de funções) e `src/components/FeatureGrid.tsx` (card reutilizável, variantes compacta e expandida).
- Alterações pontuais em `src/routes/index.tsx`, `src/routes/agenda.tsx` e `src/components/AppShell.tsx` (item de nav a mais).
- Só Tailwind + Lucide + componentes shadcn já presentes; nenhuma dependência nova.
- Estado dos atalhos/filtros fica em memória do componente; nenhuma persistência nova.
