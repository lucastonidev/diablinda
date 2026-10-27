# ⚡ Diablinda

<p align="center">
  <a href="README.md">🇧🇷 Português</a> •
  <a href="README.en.md"><b>🇺🇸 English</b></a> •
  <a href="README.es.md">🇪🇸 Español</a>
</p>

<p align="center">
  <img src="assets/banner.png" alt="Diablinda Banner" width="100%">
</p>

<p align="center">
  <strong>The Turbocharged OSINT Successor to Holehe in Pure JavaScript (Node.js ESM)</strong><br>
  Intelligent email reconnaissance across 50+ platforms with rich metadata extraction, official vector SVG logos, unified dossier consolidation, and <strong>Zero Build Step</strong>.
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

## 📑 Table of Contents

- [Why Diablinda?](#-why-diablinda)
- [Key Features](#-key-features)
- [Installation & Quick Start](#-installation--quick-start)
- [CLI Usage](#-cli-usage)
- [NPM Library Usage](#-npm-library-usage)
- [Visual Branding & SVG Icons for Front-Ends (RimuBusca)](#-visual-branding--svg-icons-for-front-ends-rimubusca)
- [HTTP Server with Server-Sent Events (SSE)](#-http-server-with-server-sent-events-sse)
- [Unified Intelligence Dossier](#-unified-intelligence-dossier)
- [Anti-False Positive & WAF Engine](#-anti-false-positive--waf-engine)
- [Supported Services Catalog (55 Platforms)](#-supported-services-catalog-55-platforms)
- [Creating a New Module in 5 Minutes](#-creating-a-new-module-in-5-minutes)
- [Automated Testing](#-automated-testing)
- [License & Legal Disclaimer](#-license--legal-disclaimer)

---

## 🚀 Why Diablinda?

[Holehe](https://github.com/megadose/holehe) is a classic Python tool, but it frequently suffers from virtualenv dependency drift, slow startups, deprecated runtime requirements, and a lack of real structured metadata extraction (avatars, biographies, full names).

**Diablinda** was built from the ground up in modern, native **Pure JavaScript (Node.js ESM)**:

- ⚡ **Zero Build Step:** No `tsc`, no Babel, no Webpack. Runs directly on Node.js using `"type": "module"`.
- ⚡ **Extreme Performance:** Cold starts in under **20ms** with non-blocking asynchronous concurrency controlled via native `fetch`.
- 🎨 **Official SVG Logos & Brand Colors:** Built-in crisp vector SVGs and authentic brand colors for every single platform, allowing immediate plug-and-play rendering in search UIs such as **RimuBusca**.
- 🔍 **Rich Metadata:** Far beyond a basic `"exists / not found"` boolean, Diablinda extracts @usernames, high-resolution avatars, bios, Duolingo streaks/XP, chess rankings, and direct public profile links.
- 🧠 **Unified Dossier:** An intelligent aggregation algorithm that organizes all identities discovered, separating 100% verified email confirmations from username-based heuristic matches.
- 🇧🇷 **Integrated Brazilian & Global Ecosystem:** Native modules for international giants alongside major Brazilian platforms like Vakinha, Apoia.se, and Jusbrasil.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **Multi-Channel Engine** | Run via **CLI**, import as a standard **NPM Library**, or start as a standalone **HTTP Server**. |
| **Real-Time Streaming (SSE)** | Trigger scans in the backend and receive live progressive events (`hit`, `miss`, `progress`, `done`) on your frontend. |
| **Anti-Soft-404 Heuristics** | Detects deceptive HTTP 200 OK responses masking "Profile Not Found" pages (Codecademy, Telegram, Facebook, etc.). |
| **Dual-Stage Microsoft Detection** | Accurately identifies personal third-party accounts (e.g. Gmail linked to Microsoft/Xbox) vs enterprise/school Office 365 tenants. |
| **Rate-Limit & WAF Awareness** | Seamlessly catches Cloudflare, Datadome bot challenges, and HTTP 429/403 errors without polluting scan results with false positives. |

---

## 🛠️ Installation & Quick Start

### 1. Via NPX (Zero Install)
```bash
npx diablinda target@gmail.com
```

### 2. Global Installation
```bash
npm install -g diablinda
diablinda target@domain.com
```

### 3. As a Project Dependency
```bash
npm install diablinda
```

---

## 💻 CLI Usage

```bash
diablinda <email> [options]
```

### Available Options:

| Flag | Description |
|---|---|
| `-c, --concurrency <n>` | Maximum simultaneous asynchronous connections (default: `15`) |
| `-t, --timeout <ms>` | Maximum per-module timeout in milliseconds (default: `8000ms`) |
| `--category <cats>` | Filter modules by comma-separated categories (`tech`, `social`, `education`, `finance`, `productivity`, `entertainment`, `brasil`) |
| `-m, --modules <mods>` | Execute only specific modules by id (e.g., `-m github,google,duolingo`) |
| `--json` | Output structured JSON for scripts and pipelines |
| `--csv` | Export findings as a CSV spreadsheet |
| `-l, --list` | List all 55 supported services with categories and descriptions |
| `-s, --server` | Start the HTTP Server with Server-Sent Events (SSE) streaming |
| `-p, --port <port>` | HTTP Server port (default: `3000`) |

### Practical Examples:

```bash
# Standard OSINT investigation with interactive neon terminal output
diablinda target@gmail.com

# Target only technology and Brazilian platforms
diablinda target@gmail.com --category tech,brasil

# Test specific high-priority services with custom concurrency
diablinda target@gmail.com -m google,apple,github,office365 -c 20

# Export unified intelligence dossier to a JSON file
diablinda target@gmail.com --json > dossier.json

# Export findings to CSV for spreadsheet analysis
diablinda target@gmail.com --csv > report.csv

# Start the SSE-enabled HTTP server on port 8080 for web integration
diablinda --server --port 8080
```

---

## 📦 NPM Library Usage

Diablinda integrates natively into modern Node.js applications:

```javascript
import { checkEmail, listModules, getModuleIcon, getModuleColor } from 'diablinda';

// 1. Run scan with real-time reactive event callbacks
const summary = await checkEmail('target@gmail.com', {
  concurrency: 15,
  timeout: 8000,
  onHit: (hit) => {
    console.log(`[+] Found on ${hit.service}!`);
    console.log(`Brand Color: ${hit.color}`);
    console.log(`Vector SVG: ${hit.iconSvg}`);
    console.log('Metadata:', hit.metadata);
  },
  onProgress: ({ current, total, percentage }) => {
    console.log(`Progress: ${current}/${total} (${percentage}%)`);
  }
});

console.log(`Scan completed! Total accounts discovered: ${summary.hits}`);
console.log('Unified Dossier:', summary.dossier);
```

---

## 🎨 Visual Branding & SVG Icons for Front-Ends (RimuBusca)

Web dashboards and OSINT interfaces (such as **RimuBusca**) no longer need external icon font packages (FontAwesome, Lucide) or remote CDN requests. Diablinda **ships official vector SVGs and exact brand colors for all 55 platforms directly in the core**:

### Programmatic Icon & Color Access:

```javascript
import { getModuleIcon, getModuleColor, MODULE_ICONS, MODULE_COLORS } from 'diablinda';

// Retrieve standard 24x24 vector SVG string (viewBox="0 0 24 24")
const githubSvg = getModuleIcon('github');
const steamColor = getModuleColor('steam'); // '#171a21'
```

### Hit Result Structure:
Every result object emitted or returned by the engine is already decorated with these properties:
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

Rendering in HTML / React / Vue:
```html
<div class="service-card" style="border-left: 4px solid ${hit.color}">
  <div class="icon" style="color: ${hit.color}">
    ${hit.iconSvg}
  </div>
  <h3>${hit.service}</h3>
</div>
```

---

## 🌐 HTTP Server with Server-Sent Events (SSE)

Start the built-in HTTP server:
```bash
diablinda --server --port 3000
```

### Available Endpoints:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Interactive API documentation and system status |
| `GET` | `/modules` | Full list of all 55 modules with metadata, brand colors, and vector SVGs |
| `GET` | `/scan?email=...&category=...` | **Real-time Server-Sent Events streaming** (`text/event-stream`) |
| `POST` | `/scan` | Traditional synchronous scan returning full JSON payload |

### Consuming SSE in the Browser / Frontend:

```javascript
const email = 'target@gmail.com';
const eventSource = new EventSource(`http://localhost:3000/scan?email=${encodeURIComponent(email)}`);

eventSource.addEventListener('hit', (event) => {
  const hit = JSON.parse(event.data);
  console.log('[+] New account found:', hit.service);
  // Instantly render hit.iconSvg and hit.color into the DOM
});

eventSource.addEventListener('progress', (event) => {
  const { current, total, percentage } = JSON.parse(event.data);
  updateProgressBar(percentage);
});

eventSource.addEventListener('done', (event) => {
  const summary = JSON.parse(event.data);
  console.log('Scan finished. Consolidated dossier:', summary.dossier);
  eventSource.close();
});
```

---

## 🧠 Unified Intelligence Dossier

Unlike legacy scripts that simply dump terminal lines, Diablinda's consolidation engine synthesizes an actionable **Unified Dossier**:

- **Primary Identity Resolution:** Automatically selects the most complete display name and richest bio across all verified hits.
- **Avatar Gallery:** Aggregates high-resolution profile pictures from Gravatar, GitHub, TikTok, Steam, Duolingo, etc.
- **Confidence Layering:**
  - `emailVerified`: Accounts guaranteed 100% by the target's email address itself (e.g. Google, Microsoft, Gravatar, Apple, ProtonMail).
  - `handleMatches`: Public accounts located via handle variation heuristics and verified against soft-404 signatures.
- **Aggregated Social Presence:** Clean, structured list of all active public profile URLs.

---

## 🛡️ Anti-False Positive & WAF Engine

Legacy reconnaissance tools often falsely report hits when encountering **Cloudflare**, **Datadome**, or HTTP **429/403** blocks.

Diablinda enforces strict safeguards in `src/core/waf.js` and module-level checks:
1. **WAF & Challenge Detection:** Scans responses for human verification signatures (`cf-mitigated`, `Just a moment...`, `datadome`, `hCaptcha`, `Attention Required`) and rejects false positives.
2. **Advanced Anti-Soft-404:** Handles websites that return HTTP 200 OK for non-existent users (e.g. "Profile Not Found" wrappers) by validating page contents.
3. **Cryptographic Validation:** Checks genuine public PGP key blocks on ProtonMail and authentic MD5/SHA-256 hashes on Gravatar.
4. **Microsoft Dual-Stage Verification:** Validates third-party personal accounts (`IsMSAccount`) and corporate Office 365 tenants (`IfExistsResult`).

---

## 🧩 Supported Services Catalog (55 Platforms)

| Category | ID | Service | Verification Method & Anti-False Positive | Extracted Metadata |
|---|---|---|---|---|
| **Tech** | `google` | Google (Gmail / Workspace) | Native domain check & official Mail GXLU discovery | Google Account, Corporate Workspace, YouTube channel |
| **Tech** | `apple` | Apple ID (iCloud) | Native domain check & Apple IDMSA Auth endpoint | Apple ID, iCloud storage, federation status |
| **Tech** | `gravatar` | Gravatar / WordPress | Cryptographic MD5 & SHA-256 hash lookup | HD Avatar, Full Name, Bio, Verified links, Hashes |
| **Tech** | `github` | GitHub | Public User & Commits API | @username, HD Avatar, Bio, Repositories, Commits |
| **Tech** | `gitlab` | GitLab | Direct email validation & strict handle matching API | Full Name, @username, HD Avatar, Bio, Location |
| **Tech** | `protonmail` | ProtonMail | Proton Public PGP Key API lookup | Proton Account confirmation, Public PGP Key |
| **Tech** | `firefox` | Firefox / Mozilla | Sync Account status check (`exists: true`) | Mozilla Sync Account |
| **Tech** | `docker` | Docker Hub | Password reset check & User API v2 | @username, Full Name, Avatar, Repositories |
| **Tech** | `replit` | Replit | Internal Referer GraphQL query + fallback | Developer account |
| **Tech** | `codepen` | CodePen | Password recovery check & author profile markup | @username, Avatar, Profile URL |
| **Tech** | `codecademy` | Codecademy | Strict anti-soft-404 profile validation | @username, Verified Profile |
| **Tech** | `archive` | Internet Archive | Signup email verification & User API | @username, Full Name, Bio, Avatar |
| **Tech** | `atlassian` | Atlassian (Jira/Trello) | Auth Discovery (`accountType`) | Enterprise vs Personal account type |
| **Tech** | `devrant` | devRant | Email password reset endpoint & Official API | @username, Bio, Dev score |
| **Tech** | `samsung` | Samsung Account | Account recovery & identity registration check | Samsung Galaxy / SmartThings Account |
| **Education** | `duolingo` | Duolingo | Public User API | HD Avatar, Full Name, Streak/Days, XP, Languages |
| **Education** | `chesscom` | Chess.com | Email lookup & official Chess API | Title, Elo Rating, Avatar, Status |
| **Social** | `facebook` | Facebook (Meta) | Meta registration check + OpenGraph content filter | Real Name, HD Avatar, Bio, Profile URL |
| **Social** | `tiktok` | TikTok | Universal JSON hydration state & OpenGraph | Display Name, @username, HD Avatar, Bio, Followers |
| **Social** | `telegram` | Telegram | t.me profile markup & OpenGraph tags (anti-soft-404) | Channel/Profile Name, HD Avatar, Bio |
| **Social** | `twitter` | Twitter / X | Official validation API (`taken: true, valid: false`) | Registered account |
| **Social** | `snapchat` | Snapchat | Email reset lookup & Bitmoji avatar endpoint | @username, Bitmoji 3D Avatar |
| **Social** | `instagram` | Instagram | Meta Ajax signup email verification | @username, Real Name, Avatar |
| **Social** | `discord` | Discord | `EMAIL_ALREADY_REGISTERED` error check | Registered account |
| **Social** | `imgur` | Imgur | Direct Auth v1 validation endpoint | @username, Bio, Avatar, Reputation points |
| **Social** | `lastfm` | Last.fm | Signup verification endpoint & profile check | @username, Avatar, Music scrobble history |
| **Social** | `soundcloud` | SoundCloud | Auth API (`status: existing_user`) | Listener / Creator account |
| **Social** | `strava` | Strava | `email_unique` validation + fallback | Athlete profile |
| **Social** | `bitmoji` | Bitmoji | Auth API (`exists: true`) | Configured 3D avatar |
| **Social** | `aboutme` | About.me | Email verification & unified digital bio | Full Name, @username, Bio, Avatar |
| **Social** | `quora` | Quora | Mobile headers password reset endpoint | @username, Avatar |
| **Social** | `vsco` | VSCO | Direct email verification via API v2 | @username, Avatar, Photography portfolio |
| **Social** | `wattpad` | Wattpad | Registration check (`already taken`) | Reader / Author account |
| **Social** | `flickr` | Flickr | Identity verification & public photostream | @username, Avatar, Portfolio |
| **Social** | `pinterest` | Pinterest | Resource API (`exists: true`) | Registered account |
| **Social** | `tumblr` | Tumblr | Registration validation endpoint | Registered account and blog |
| **Social** | `yahoo` | Yahoo | Account discovery & recovery flow | Yahoo / AOL Account |
| **Finance** | `buymeacoffee` | Buy Me a Coffee | API email lookup & creator profile | Full Name, @username, Bio, Avatar |
| **Finance** | `patreon` | Patreon | Credentials-lookup endpoint & creator page | Full Name, @username, Avatar |
| **Finance** | `venmo` | Venmo | Direct API email check | Full Name, @username, Avatar |
| **Finance** | `freelancer` | Freelancer.com | API check (`result.available: false`) | Freelancer / Employer account |
| **Productivity** | `linkedin` | LinkedIn | Public profile scraping & OpenGraph metadata | Full Name, Headline, Company, Avatar, Bio |
| **Productivity** | `office365` | Microsoft / Office 365 | Dual-stage: GetCredentialType MSOL & Live ID | Personal (Gmail/Xbox), Hotmail, Office 365 |
| **Productivity** | `adobe` | Adobe Creative Cloud | Discovery API (`accounts[]`) | Full Name, Account type, Country |
| **Productivity** | `evernote` | Evernote | Validation endpoint (`available: false`) | Registered account |
| **Productivity** | `envato` | Envato Market | Account recovery & ThemeForest profile | @username, Avatar, Author badges |
| **Productivity** | `xing` | XING | Password recovery & corporate career profile | Full Name, @username, Avatar |
| **Entertainment** | `spotify` | Spotify | Public registration status check | Registered account status |
| **Entertainment** | `amazon` | Amazon | Customer login & password assistance flow | Consumer / Prime account |
| **Entertainment** | `steam` | Steam (Valve) | Steam Community player profile parsing | Persona nickname, Real Name, HD Avatar, Country |
| **Entertainment** | `vivino` | Vivino | API email lookup & sommelier profile | Full Name, @username, Avatar |
| **Entertainment** | `deliveroo` | Deliveroo | API check (`registered: true`) | Delivery account |
| **Brasil** | `vakinha` | Vakinha Brasil | User lookup API | Fundraiser / Donor account |
| **Brasil** | `apoiase` | Apoia.se | Crowdfunding API check | Supporter / Creator profile |
| **Brasil** | `jusbrasil` | Jusbrasil | Public legal citation search | Legal citations and jurist profile |

---

## 🔌 Creating a New Module in 5 Minutes

All modules reside in `src/modules/<category>/<name>.js` and follow a standard contract:

```javascript
// src/modules/tech/example.js

export default {
  id: 'example',
  name: 'Example Service',
  category: 'tech',
  url: 'https://example.com',
  description: 'Checks accounts on Example Service.',

  async check(email, { signal, headers } = {}) {
    const res = await fetch(`https://api.example.com/check?email=${encodeURIComponent(email)}`, {
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

Simply register the new module in [src/modules/index.js](src/modules/index.js) and add its brand icon and color in [src/core/icons.js](src/core/icons.js).

---

## 🧪 Automated Testing

The project uses Node.js native test runner (`node:test`), ensuring instant test execution with zero external testing dependencies:

```bash
npm test
```

To run with verbose output:
```bash
node --test tests/*.test.js
```

---

## ⚖️ License & Legal Disclaimer

This software was developed exclusively for educational purposes, defensive security auditing, ethical OSINT, and identifying credential exposure authorized by the account holder. The authors assume no liability for misuse.

Distributed under the **MIT** License. See [LICENSE](LICENSE) for more details.

