# Capture Flow

Crie um Web App Responsivo (Mobile-First e Desktop) de uma "Agenda Inteligente por Captura". O design deve ser ultra moderno, minimalista, estilo Tailwind UI, com suporte a Dark Mode e focado em produtividade móvel.

O fluxo de funcionamento do app deve ser baseado em duas telas principais:

1. TELA DE CAPTURA E LEITURA (O "Feed Inteligente"):

- No topo, deve haver um campo para o usuário colar um Link (URL) ou um Bloco de Texto Copiado (como uma resposta do ChatGPT).

- Ao processar, o app exibe o texto formatado na tela. 

- COMPORTAMENTO VISUAL: Ao passar o mouse (no PC) ou tocar (no celular) em qualquer parágrafo/estrofe desse texto, deve aparecer um marcador azul (uma bolinha ou quadradinho sutil).

- Ao clicar/tocar nessa bolinha azul, abre um menu flutuante contextual (Popup/Bottom Sheet no mobile) com:

  * Um título sugerido automaticamente pela IA para aquele trecho.

  * Botão "Organização Automática" (o app categoriza sozinho).

  * Botão "Personalizar" (para o usuário escolher a pasta/tags).

2. DASHBOARD DA AGENDA (Organização):

- Um feed limpo e organizado com todas as notas capturadas.

- Cada card de nota deve exibir: O título sugerido, o trecho capturado, a data/hora e o link de origem.

- Na frente ou rodapé de cada nota, insira obrigatoriamente dois botões de ação rápida:

  * Botão "Download": Baixa o trecho como arquivo .txt ou .md.

  * Botão "Compartilhar": Ativa a API nativa de compartilhamento do celular (Navigator.share) ou copia o texto formatado para a área de transferência.

3. RECURSOS INTELIGENTES DE UI:

- Crie um sistema de pastas automáticas na barra lateral (ou menu inferior no mobile) chamado "Categorias da IA" (ex: Insights, Estudos, Trabalho, Tarefas).

- Use animações suaves ao capturar e salvar as notas, mostrando Toasts de sucesso ("Nota salva na pasta Trabalho!").

- Certifique-se de que toda a interface seja amigável para telas de toque (touch-friendly), usando espaçamentos generosos nos botões.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://inkwell-ai-organizer.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/54415dc6-5316-4c32-a6ea-df6515760211).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
