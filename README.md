# ⚡ Diablinda

<p align="center">
  <a href="README.md"><b>🇧🇷 Português</b></a> •
  <a href="README.en.md">🇺🇸 English</a> •
  <a href="README.es.md">🇪🇸 Español</a>
</p>

<p align="center">
  <img src="assets/banner.png" alt="Diablinda Banner" width="100%">
</p>

<p align="center">
  <strong>O Sucessor OSINT Turbinado do Holehe em JavaScript Puro (Node.js ESM)</strong><br>
  Varredura inteligente de e-mails em mais de 50 plataformas com extração de metadados ricos, ícones SVG vetoriais oficiais, consolidação de dossiê e <strong>Zero Build Step</strong>.
</p>

<p align="center">
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933?logo=node.js&logoColor=white" alt="Node.js Version"></a>
  <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript"><img src="https://img.shields.io/badge/ECMAScript-2024%20(ESM)-f7df1e?logo=javascript&logoColor=black" alt="JavaScript"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT"></a>
  <a href="#"><img src="https://img.shields.io/badge/Dependencies-0%20(Pure%20Node.js)-brightgreen.svg" alt="Zero Dependencies"></a>
  <a href="#"><img src="https://img.shields.io/badge/Platforms-55%20Services-blueviolet.svg" alt="55 Services"></a>
  <a href="#"><img src="https://img.shields.io/badge/Tests-48%20Passing-success.svg" alt="Tests Passing"></a>
</p>

---

## 📑 Sumário

- [Por que Diablinda?](#-por-que-diablinda)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Instalação & Execução Rápida](#-instalação--execução-rápida)
- [Uso da CLI](#-uso-da-cli)
- [Como Biblioteca NPM](#-como-biblioteca-npm)
- [Identidade Visual & Ícones SVG para Front-Ends (RimuBusca)](#-identidade-visual--ícones-svg-para-front-ends-rimubusca)
- [Servidor HTTP com Server-Sent Events (SSE)](#-servidor-http-com-server-sent-events-sse)
- [Dossiê Unificado de Inteligência](#-dossiê-unificado-de-inteligência)
- [Sistema Anti-Falso Positivo & WAF](#-sistema-anti-falso-positivo--waf)
- [Catálogo de Serviços Suportados (55 Plataformas)](#-catálogo-de-serviços-suportados-55-plataformas)
- [Como Criar um Novo Módulo](#-como-criar-um-novo-módulo)
- [Testes Automatizados](#-testes-automatizados)
- [Licença & Aviso Legal](#-licença--aviso-legal)

---

## 🚀 Por que Diablinda?

O [Holehe](https://github.com/megadose/holehe) é uma ferramenta clássica em Python, mas frequentemente sofre com quebras de ambiente virtual, compilações lentas, dependências desatualizadas e falta de extração de metadados reais (avatares, biografias, nomes).

**Diablinda** foi totalmente reimaginada do zero em **JavaScript nativo moderno (Node.js ESM puro)**:

- ⚡ **Zero Build Step:** Sem `tsc`, sem Babel, sem Webpack. Funciona instantaneamente no Node.js com `"type": "module"`.
- ⚡ **Desempenho Extremo:** Inicialização em menos de **20ms** com concorrência assíncrona controlada via `fetch` nativo.
- 🎨 **Logos SVG & Cores Oficiais:** Cada plataforma traz seu vetor SVG limpo e cor de marca original embutidos, facilitando renderização imediata em UIs como o **RimuBusca**.
- 🔍 **Metadados Ricos:** Além do booleano `"existe/não existe"`, extrai @usernames, fotos de perfil em alta definição, bios, ofensiva/streak no Duolingo, títulos de xadrez e links públicos.
- 🧠 **Dossiê Unificado:** Algoritmo que agrupa e consolida as identidades encontradas, separando confirmações 100% atreladas ao e-mail de heurísticas baseadas em handle.
- 🇧🇷 **Ecossistema Brasileiro Integrado:** Suporte nativo a Vakinha, Apoia.se, Jusbrasil e serviços populares no Brasil.

---

## ✨ Funcionalidades Principais

| Recurso | Descrição |
|---|---|
| **Motor Multi-Canal** | Pode ser executado via **CLI**, importado como **Biblioteca NPM** ou iniciado como **Servidor HTTP**. |
| **Streaming em Tempo Real (SSE)** | Dispare investigações no backend e receba eventos progressivos (`hit`, `miss`, `progress`, `done`) no frontend. |
| **Heurística Anti-Soft-404** | Detecção inteligente de telas de erro disfarçadas de 200 OK (Codecademy, Telegram, Facebook, etc.). |
| **Detecção Avançada Microsoft** | Diferenciação em dois estágios entre contas corporativas/escolares e contas pessoais de terceiros (ex: Gmail cadastrado na Microsoft). |
| **Respeito a Rate Limits & WAF** | Identificação em tempo real de desafios Cloudflare, Datadome e códigos HTTP 429/403 sem poluir seus relatórios com falsos positivos. |

---

## 🛠️ Instalação & Execução Rápida

### 1. Via NPX (Sem Instalar Nada)
```bash
npx diablinda alvo@gmail.com
```

### 2. Instalação Global
```bash
npm install -g diablinda
diablinda investigado@empresa.com.br
```

### 3. Como Dependência em seu Projeto
```bash
npm install diablinda
```

---

## 💻 Uso da CLI

```bash
diablinda <email> [opções]
```

### Opções Disponíveis:

| Flag | Descrição |
|---|---|
| `-c, --concurrency <n>` | Limite de conexões concorrentes simultâneas (padrão: `15`) |
| `-t, --timeout <ms>` | Timeout máximo por módulo em milissegundos (padrão: `8000ms`) |
| `--category <cats>` | Filtra por categorias separadas por vírgula (`tech`, `social`, `education`, `finance`, `productivity`, `entertainment`, `brasil`) |
| `-m, --modules <mods>` | Executa apenas os módulos indicados (ex: `-m github,google,duolingo`) |
| `--json` | Gera saída limpa em JSON estruturado para automações |
| `--csv` | Exporta relatório consolidado em formato CSV |
| `-l, --list` | Exibe o catálogo completo dos 55 módulos disponíveis |
| `-s, --server` | Inicia o servidor HTTP com streaming Server-Sent Events |
| `-p, --port <porta>` | Porta do servidor HTTP (padrão: `3000`) |

### Exemplos Práticos:

```bash
# Investigação completa padrão com saída interativa em neon
diablinda alvo@gmail.com

# Investigar apenas tecnologia e plataformas brasileiras
diablinda alvo@gmail.com --category tech,brasil

# Testar módulos específicos com maior concorrência
diablinda alvo@gmail.com -m google,apple,github,office365 -c 20

# Exportar dossiê estruturado em JSON para piping
diablinda alvo@gmail.com --json > dossie.json

# Exportar tabela de resultados em CSV
diablinda alvo@gmail.com --csv > resultado.csv

# Iniciar o servidor HTTP na porta 8080 para integração com front-end
diablinda --server --port 8080
```

---

## 📦 Como Biblioteca NPM

O Diablinda pode ser consumido diretamente no seu projeto Node.js moderno:

```javascript
import { checkEmail, listModules, getModuleIcon, getModuleColor } from 'diablinda';

// 1. Executar varredura com eventos em tempo real
const summary = await checkEmail('alvo@gmail.com', {
  concurrency: 15,
  timeout: 8000,
  onHit: (hit) => {
    console.log(`[+] Encontrado no ${hit.service}!`);
    console.log(`Cor da Marca: ${hit.color}`);
    console.log(`Ícone SVG: ${hit.iconSvg}`);
    console.log('Metadados:', hit.metadata);
  },
  onProgress: ({ current, total, percentage }) => {
    console.log(`Progresso: ${current}/${total} (${percentage}%)`);
  }
});

console.log(`Varredura concluída! Total de contas encontradas: ${summary.hits}`);
console.log('Dossiê consolidado:', summary.dossier);
```

---

## 🎨 Identidade Visual & Ícones SVG para Front-Ends (RimuBusca)

Para que painéis e dashboards (como o **RimuBusca**) não precisem carregar bibliotecas externas de ícones pesadas (FontAwesome, Lucide) ou fazer requisições a CDNs externas, o Diablinda **embutiu os vetores SVG oficiais e cores de marca de todas as 55 plataformas** no núcleo:

### Acesso aos Ícones e Cores:

```javascript
import { getModuleIcon, getModuleColor, MODULE_ICONS, MODULE_COLORS } from 'diablinda';

// Obter SVG puro (viewBox 0 0 24 24)
const githubSvg = getModuleIcon('github');
const steamColor = getModuleColor('steam'); // '#171a21'
```

### Na Resposta dos Resultados:
Cada resultado retornado pelo motor já vem decorado com suas propriedades visuais:
```json
{
  "service": "GitHub",
  "category": "tech",
  "exists": true,
  "color": "#24292e",
  "iconSvg": "<svg viewBox=\"0 0 24 24\" fill=\"currentColor\">...</svg>",
  "metadata": {
    "username": "octocat",
    "avatarUrl": "https://avatars.githubusercontent.com/u/583231",
    "name": "The Octocat"
  }
}
```

No HTML/React/Vue do seu front-end:
```html
<div class="service-card" style="border-left: 4px solid ${hit.color}">
  <div class="icon" style="color: ${hit.color}">
    ${hit.iconSvg}
  </div>
  <h3>${hit.service}</h3>
</div>
```

---

## 🌐 Servidor HTTP com Server-Sent Events (SSE)

Inicie o servidor com:
```bash
diablinda --server --port 3000
```

### Endpoints Disponíveis:

| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/` | Documentação interativa e status de integridade da API |
| `GET` | `/modules` | Lista completa dos 55 módulos com suas categorias, descrições, cores e ícones SVG |
| `GET` | `/scan?email=...&category=...` | **Streaming SSE em tempo real** (`text/event-stream`) |
| `POST` | `/scan` | Varredura síncrona retornando JSON completo |

### Consumindo o Streaming SSE no Front-End:

```javascript
const email = 'alvo@gmail.com';
const eventSource = new EventSource(`http://localhost:3000/scan?email=${encodeURIComponent(email)}`);

eventSource.addEventListener('hit', (event) => {
  const hit = JSON.parse(event.data);
  console.log('[+] Nova conta detectada:', hit.service);
  // Renderizar hit.iconSvg e hit.color instantaneamente no DOM
});

eventSource.addEventListener('progress', (event) => {
  const { current, total, percentage } = JSON.parse(event.data);
  atualizarBarraDeProgresso(percentage);
});

eventSource.addEventListener('done', (event) => {
  const summary = JSON.parse(event.data);
  console.log('Varredura finalizada. Dossiê:', summary.dossier);
  eventSource.close();
});
```

---

## 🧠 Dossiê Unificado de Inteligência

Diferente de scanners convencionais que apenas cospem linhas soltas de texto, o Diablinda sintetiza um **Dossiê Unificado**:

- **Identidade Principal:** Resolve o nome de exibição mais comum e a biografia mais completa entre as contas encontradas.
- **Galeria de Avatares:** Reúne fotos de perfil em alta definição do Gravatar, GitHub, TikTok, Steam, Duolingo, etc.
- **Separação de Confiança:**
  - `emailVerified`: Contas confirmadas com 100% de certeza pelo próprio endereço de e-mail (ex: Google, Microsoft, Gravatar, Apple, ProtonMail).
  - `handleMatches`: Contas identificadas publicamente pelo username com confirmação por OpenGraph e validação de existência.
- **Presença Digital Agrupada:** Lista organizada de todos os perfis sociais acessíveis com URLs diretas.

---

## 🛡️ Sistema Anti-Falso Positivo & WAF

Ferramentas legadas frequentemente sofrem com falsos positivos quando recebem páginas de bloqueio de **Cloudflare**, **Datadome** ou respostas HTTP **429/403**.

O Diablinda utiliza proteções ativas em `src/core/waf.js` e validações por módulo:
1. **Detecção de WAF & Captcha:** Descarte automático e categorização de respostas que contenham assinaturas de desafio humano (`cf-mitigated`, `Just a moment...`, `datadome`, `hCaptcha`, `Attention Required`).
2. **Anti-Soft-404 Avançado:** Módulos que retornam código HTTP 200 para usuários inexistentes (ex: telas "Profile Not Found" ou respostas vazias) são identificados e marcados como `exists: false`.
3. **Validação Criptográfica:** Verificação de chaves PGP públicas genuínas no ProtonMail e hashes MD5/SHA-256 no Gravatar.
4. **Verificação Microsoft Dual-Stage:** Validação de contas pessoais de terceiros (`IsMSAccount`) e contas corporativas/nativas (`IfExistsResult`).

---

## 🧩 Catálogo de Serviços Suportados (55 Plataformas)

| Categoria | ID | Serviço | Método & Anti-Falso Positivo | Metadados Extraídos |
|---|---|---|---|---|
| **Tech** | `google` | Google (Gmail / Workspace) | Domínios nativos e discovery oficial Google Mail GXLU | Conta Google, Workspace corporativo, YouTube |
| **Tech** | `apple` | Apple ID (iCloud) | Domínios Apple e endpoint IDMSA Apple Auth | Conta Apple ID, iCloud, status de federação |
| **Tech** | `gravatar` | Gravatar / WordPress | Hash criptográfico MD5 & SHA-256 | Avatar HD, Nome, Bio, Links verificados, Hashes |
| **Tech** | `github` | GitHub | API pública de usuários e commits | @username, Avatar, Bio, Repositórios, Commits |
| **Tech** | `gitlab` | GitLab | Verificação de e-mail e API pública com correspondência estrita | Nome, @username, Avatar, Bio, Localização |
| **Tech** | `protonmail` | ProtonMail | Verificação de chave PGP pública na API Proton | Confirmação de conta Proton, Chave PGP |
| **Tech** | `firefox` | Firefox / Mozilla | Status da conta de sincronização (`exists: true`) | Conta Mozilla Sync |
| **Tech** | `docker` | Docker Hub | Reset de senha e API v2 de usuários | @username, Nome, Avatar, Repositórios |
| **Tech** | `replit` | Replit | GraphQL com Referer interno + fallback | Conta de desenvolvedor |
| **Tech** | `codepen` | CodePen | Recuperação direta de senha e markup de autor | @username, Avatar, Perfil |
| **Tech** | `codecademy` | Codecademy | Verificação estrita anti-soft-404 no perfil | @username, Perfil verificado |
| **Tech** | `archive` | Internet Archive | Checagem de e-mail no signup e API de usuário | @username, Nome, Bio, Avatar |
| **Tech** | `atlassian` | Atlassian (Jira/Trello) | Auth Discovery (`accountType`) | Tipo de conta corporativa/pessoal |
| **Tech** | `devrant` | devRant | Reset de senha por e-mail e API oficial | @username, Bio, Pontuação de dev (score) |
| **Tech** | `samsung` | Samsung Account | Endpoint de recuperação e registro de identidade | Conta Samsung Galaxy / SmartThings |
| **Education** | `duolingo` | Duolingo | API pública de usuários | Avatar HD, Nome, Streak/Ofensiva, XP, Idiomas |
| **Education** | `chesscom` | Chess.com | Verificação de e-mail e API oficial de enxadristas | Título, Rating, Avatar, Status |
| **Social** | `facebook` | Facebook (Meta) | Checagem de registro Meta + OpenGraph com rejeição de conteúdo indisponível | Nome real, Avatar HD, Bio, Perfil |
| **Social** | `tiktok` | TikTok | Estado de hidratação JSON universal e OpenGraph | Nome, @username, Avatar HD, Bio, Seguidores |
| **Social** | `telegram` | Telegram | Estrutura de perfil t.me e tags OpenGraph (anti-soft-404) | Nome do canal/perfil, Avatar HD, Bio |
| **Social** | `twitter` | Twitter / X | API oficial de validação (`taken: true, valid: false`) | Conta registrada |
| **Social** | `snapchat` | Snapchat | Reset de senha por e-mail e Avatar Bitmoji | @username, Avatar Bitmoji |
| **Social** | `instagram` | Instagram | Verificação de e-mail via signup ajax Meta | @username, Nome real, Avatar |
| **Social** | `discord` | Discord | Erro `EMAIL_ALREADY_REGISTERED` | Conta registrada |
| **Social** | `imgur` | Imgur | Verificação direta via endpoint v1 auth | @username, Bio, Avatar, Reputação |
| **Social** | `lastfm` | Last.fm | Verificação de e-mail no join e perfil | @username, Avatar, Histórico musical |
| **Social** | `soundcloud` | SoundCloud | API auth (`status: existing_user`) | Conta de ouvinte/artista |
| **Social** | `strava` | Strava | Validação `email_unique` + fallback | Perfil de atleta |
| **Social** | `bitmoji` | Bitmoji | API auth (`exists: true`) | Avatar 3D configurado |
| **Social** | `aboutme` | About.me | Checagem de e-mail e biografia unificada | Nome, @username, Bio, Avatar |
| **Social** | `quora` | Quora | Reset de senha e headers mobile | @username, Avatar |
| **Social** | `vsco` | VSCO | Verificação direta de e-mail via API v2 | @username, Avatar, Portfólio |
| **Social** | `wattpad` | Wattpad | Validação de cadastro (`already taken`) | Conta de leitor/autor |
| **Social** | `flickr` | Flickr | Verificação de identidade e photostream | @username, Avatar |
| **Social** | `pinterest` | Pinterest | API de recurso (`exists: true`) | Conta registrada |
| **Social** | `tumblr` | Tumblr | Validação de registro | Conta e blog |
| **Social** | `yahoo` | Yahoo | Descoberta e recuperação de contas | Conta Yahoo / AOL |
| **Finance** | `buymeacoffee` | Buy Me a Coffee | Verificação de e-mail via API e página de criador | Nome, @username, Bio, Avatar |
| **Finance** | `patreon` | Patreon | Credentials-lookup e página de criador | Nome, @username, Avatar |
| **Finance** | `venmo` | Venmo | Checagem direta de e-mail via API | Nome, @username, Avatar |
| **Finance** | `freelancer` | Freelancer.com | API (`result.available: false`) | Conta de freelancer/contratante |
| **Productivity** | `linkedin` | LinkedIn | Perfil profissional público e OpenGraph | Nome, Cargo, Empresa, Avatar, Bio |
| **Productivity** | `office365` | Microsoft / Office 365 | Dual-stage: GetCredentialType MSOL e Live ID | Contas Pessoais (Gmail/Xbox), Hotmail, Office 365 |
| **Productivity** | `adobe` | Adobe Creative Cloud | Discovery API (`accounts[]`) | Nome, Tipo de conta, País |
| **Productivity** | `evernote` | Evernote | Validação (`available: false`) | Conta registrada |
| **Productivity** | `envato` | Envato Market | Recuperação de conta e ThemeForest | @username, Avatar, Selos de autor |
| **Productivity** | `xing` | XING | Recuperação de senha e perfil corporativo | Nome, @username, Avatar |
| **Entertainment** | `spotify` | Spotify | Validação pública de conta cadastrada | Status de registro |
| **Entertainment** | `amazon` | Amazon | Detecção em fluxo de login/recuperação | Conta de consumidor / Prime |
| **Entertainment** | `steam` | Steam (Valve) | Perfil de jogador Steam Community | Nickname persona, Nome real, Avatar HD, País |
| **Entertainment** | `vivino` | Vivino | Checagem de e-mail via API e perfil | Nome, @username, Avatar |
| **Entertainment** | `deliveroo` | Deliveroo | API (`registered: true`) | Conta de delivery |
| **Brasil** | `vakinha` | Vakinha Brasil | API de usuários | Conta de arrecadador/doador |
| **Brasil** | `apoiase` | Apoia.se | API de crowdfunding | Perfil e financiamento coletivo |
| **Brasil** | `jusbrasil` | Jusbrasil | Busca pública de citações | Citações e perfil jurídico |

---

## 🔌 Como Criar um Novo Módulo

Todos os módulos residem em `src/modules/<categoria>/<nome>.js` e seguem a especificação padrão:

```javascript
// src/modules/tech/exemplo.js

export default {
  id: 'exemplo',
  name: 'Exemplo Service',
  category: 'tech',
  url: 'https://exemplo.com',
  description: 'Verifica contas no serviço Exemplo.',

  async check(email, { signal, headers } = {}) {
    const res = await fetch(`https://api.exemplo.com/check?email=${encodeURIComponent(email)}`, {
      headers,
      signal
    });

    if (res.status === 200) {
      const data = await res.json();
      return {
        exists: true,
        metadata: {
          username: data.username,
          avatarUrl: data.avatar,
          bio: data.bio
        }
      };
    }

    return { exists: false };
  }
};
```

Basta registrar o novo arquivo em [src/modules/index.js](src/modules/index.js) e adicionar o ícone e cor correspondentes em [src/core/icons.js](src/core/icons.js).

---

## 🧪 Testes Automatizados

O projeto utiliza o executor de testes nativo do Node.js (`node:test`), garantindo rapidez extrema e zero dependências de teste:

```bash
npm test
```

Para rodar com relatório detalhado:
```bash
node --test tests/*.test.js
```

---

## ⚖️ Licença & Aviso Legal

Este software foi desenvolvido exclusivamente para fins de pesquisa em segurança da informação, auditoria defensiva, OSINT ético e identificação de credenciais expostas pelo próprio titular ou mediante autorização prévia. Os autores não se responsabilizam pelo uso indevido da ferramenta.

Distribuído sob licença **MIT**. Consulte o arquivo [LICENSE](LICENSE) para obter mais informações.
