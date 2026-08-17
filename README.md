# SounAD

**Sound + AD** — plataforma web de gestão de playlists com busca musical, feita pela equipe **Data Reapers**.

## Estrutura

```
sounad/
├── index.html                 # landing page (fiel ao mockup da marca)
├── app/
│   ├── html/
│   │   ├── dashboard.html     # gestão de playlists (CRUD via localStorage)
│   │   └── search.html        # busca de músicas (IA / Spotify)
│   ├── css/style.css          # design system: cores, tipografia, animações
│   ├── js/app.js              # playlists, integração Groq e Spotify
│   └── assets/                # ondas decorativas (wave-blue.png, wave-purple.png)
├── LICENSE
└── .gitignore
```

## Como rodar

Não tem build nem dependências — é só abrir `index.html` no navegador.
Recomendado usar um servidor local simples (evita bloqueios de CORS/fetch em `file://`):

```bash
cd sounad
python3 -m http.server 8080
# abra http://localhost:8080
```

## Funcionalidades

- **Playlists**: criar, abrir, remover faixas e excluir playlists — tudo salvo no `localStorage` do navegador (sem backend).
- **Busca com IA (Groq)**: descreva um clima/ocasião e um modelo de linguagem (Llama 3.3 via Groq) sugere 6 músicas reais.
- **Busca real (Spotify Web API)**: pesquisa faixas de verdade no catálogo do Spotify — capa do álbum, prévia de 30s tocável e link para o Spotify.
- Resultados de qualquer um dos dois modos podem ser adicionados direto a uma playlist.

## Configurando as chaves de API

Nenhuma chave fica no código-fonte. Cada usuário cola a própria chave no ícone de
engrenagem (⚙) da página de busca — fica salva só no `localStorage` do navegador dele.

**Groq (gratuito)**
1. Crie uma conta em [console.groq.com](https://console.groq.com)
2. Gere uma API key e cole no campo "Groq" do popover de configurações.

**Spotify (gratuito)**
1. Crie um app em [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Copie o **Client ID** e o **Client Secret** e cole nos campos correspondentes.
3. O site usa o fluxo *Client Credentials* do Spotify (`accounts.spotify.com/api/token`) para gerar um token de acesso e consultar `api.spotify.com/v1/search`.

> ⚠️ **Nota de segurança**: o fluxo Client Credentials expõe o Client Secret no navegador do próprio usuário — aceitável para uma demo/projeto escolar onde cada pessoa usa a própria chave, mas **não deve ser usado em produção real**. Num cenário de produção, o token deveria ser gerado por um backend, nunca pelo cliente.

## Design

- Paleta roxo + azul-marinho, com `#0745FC` fixo como cor de destaque (usada no "AD" da marca).
- Tipografia: **Baloo 2** (logo/display, cantos arredondados) + **Space Grotesk** (títulos/botões) + **Inter** (texto).
- Sem cabeçalho fixo em nenhuma página — navegação fica concentrada no rodapé.
- Animações: entrada em sequência dos elementos, flutuação independente das ondas decorativas (com parallax suave no cursor), brilho pulsante, hover com "shine" nos botões e cards, grão sutil no fundo.

## Créditos

Projeto feito por **Data Reapers**, 2026.
