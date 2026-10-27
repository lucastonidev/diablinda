# ⚡ Diablinda

<p align="center">
  <a href="README.md">🇧🇷 Português</a> •
  <a href="README.en.md">🇺🇸 English</a> •
  <a href="README.es.md"><b>🇪🇸 Español</b></a>
</p>

<p align="center">
  <img src="assets/banner.png" alt="Diablinda Banner" width="100%">
</p>

<p align="center">
  <strong>El Sucesor OSINT Potenciado de Holehe en JavaScript Puro (Node.js ESM)</strong><br>
  Escaneo inteligente de correos electrónicos en más de 50 plataformas con extracción de metadatos ricos, logotipos vectoriales SVG oficiales, consolidación de dosier y <strong>Zero Build Step</strong>.
</p>

<p align="center">
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933?logo=node.js&logoColor=white" alt="Versión de Node.js"></a>
  <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript"><img src="https://img.shields.io/badge/ECMAScript-2024%20(ESM)-f7df1e?logo=javascript&logoColor=black" alt="JavaScript"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="Licencia: MIT"></a>
  <a href="#"><img src="https://img.shields.io/badge/Dependencias-0%20(Node.js%20Puro)-brightgreen.svg" alt="Cero Dependencias"></a>
  <a href="#"><img src="https://img.shields.io/badge/Plataformas-55%20Servicios-blueviolet.svg" alt="55 Servicios"></a>
  <a href="#"><img src="https://img.shields.io/badge/Tests-48%20Completados-success.svg" alt="Pruebas Exitosas"></a>
</p>

---

## 📑 Tabla de Contenidos

- [¿Por qué Diablinda?](#-por-qué-diablinda)
- [Características Principales](#-características-principales)
- [Instalación y Ejecución Rápida](#-instalación-y-ejecución-rápida)
- [Uso de la CLI](#-uso-de-la-cli)
- [Como Biblioteca NPM](#-como-biblioteca-npm)
- [Identidad Visual y Logotipos SVG para Front-Ends (RimuBusca)](#-identidad-visual-y-logotipos-svg-para-front-ends-rimubusca)
- [Servidor HTTP con Server-Sent Events (SSE)](#-servidor-http-con-server-sent-events-sse)
- [Dosier Unificado de Inteligencia](#-dosier-unificado-de-inteligencia)
- [Sistema Anti-Falsos Positivos y WAF](#-sistema-anti-falsos-positivos-y-waf)
- [Catálogo de Servicios Compatibles (55 Plataformas)](#-catálogo-de-servicios-compatibles-55-plataformas)
- [Cómo Crear un Nuevo Módulo](#-cómo-crear-un-nuevo-módulo)
- [Pruebas Automatizadas](#-pruebas-automatizadas)
- [Licencia y Descargo de Responsabilidad](#-licencia-y-descargo-de-responsabilidad)

---

## 🚀 ¿Por qué Diablinda?

[Holehe](https://github.com/megadose/holehe) es una herramienta clásica en Python, pero frecuentemente presenta problemas de incompatibilidad de entornos virtuales, tiempos de carga lentos, dependencias obsoletas y falta de extracción estructurada de metadados reales (avatares, biografías, nombres completos).

**Diablinda** fue diseñada desde cero en **JavaScript nativo moderno (Node.js ESM puro)**:

- ⚡ **Zero Build Step:** Sin `tsc`, sin Babel ni Webpack. Se ejecuta directamente en Node.js usando `"type": "module"`.
- ⚡ **Rendimiento Extremo:** Inicio en menos de **20ms** y ejecución ultrarrápida mediante concurrencia asíncrona no bloqueante con `fetch` nativo.
- 🎨 **Logos SVG y Colores Oficiales:** Cada plataforma incluye su vector SVG limpio y el color corporativo oficial integrados en el núcleo, facilitando la renderización inmediata en interfaces web como **RimuBusca**.
- 🔍 **Metadados Ricos:** Más allá de un simple booleano `"existe / no existe"`, extrae @nombres-de-usuario, fotos de perfil en alta definición, biografías, rachas/XP de Duolingo, puntuación de ajedrez y enlaces públicos.
- 🧠 **Dosier Unificado:** Algoritmo que agrupa y consolida las identidades detectadas, diferenciando confirmaciones 100% verificadas por correo electrónico de coincidencias heurísticas de alias.
- 🇧🇷 **Ecosistema Global y Latinoamericano:** Módulos para los gigantes tecnológicos globales junto a plataformas destacadas como Vakinha, Apoia.se y Jusbrasil.

---

## ✨ Características Principales

| Recurso | Descripción |
|---|---|
| **Motor Multi-Canal** | Ejecutable vía **Línea de Comandos (CLI)**, como **Biblioteca NPM** o como **Servidor HTTP**. |
| **Streaming en Tiempo Real (SSE)** | Inicia escaneos en el backend y recibe eventos progresivos en vivo (`hit`, `miss`, `progress`, `done`) en tu frontend. |
| **Heurística Anti-Soft-404** | Detección inteligente de páginas de error camufladas con código 200 OK (Codecademy, Telegram, Facebook, etc.). |
| **Detección Dual de Microsoft** | Distingue cuentas personales de terceros (ej: Gmail asociado a Microsoft/Xbox) frente a cuentas corporativas o educativas de Office 365. |
| **Protección contra Rate Limits y WAF** | Identifica en tiempo real retos de Cloudflare, Datadome y códigos HTTP 429/403 sin generar falsos positivos. |

---

## 🛠️ Instalación y Ejecución Rápida

### 1. Vía NPX (Sin Instalación Previa)
```bash
npx diablinda objetivo@gmail.com
```

### 2. Instalación Global
```bash
npm install -g diablinda
diablinda objetivo@empresa.com
```

### 3. Como Dependencia de Proyecto
```bash
npm install diablinda
```

---

## 💻 Uso de la CLI

```bash
diablinda <email> [opciones]
```

### Opciones Disponibles:

| Parámetro | Descripción |
|---|---|
| `-c, --concurrency <n>` | Límite de conexiones asíncronas simultáneas (por defecto: `15`) |
| `-t, --timeout <ms>` | Tiempo de espera máximo por módulo en milisegundos (por defecto: `8000ms`) |
| `--category <cats>` | Filtra por categorías separadas por coma (`tech`, `social`, `education`, `finance`, `productivity`, `entertainment`, `brasil`) |
| `-m, --modules <mods>` | Ejecuta únicamente los módulos especificados (ej: `-m github,google,duolingo`) |
| `--json` | Salida en formato JSON estructurado para scripts y automatizaciones |
| `--csv` | Exporta los resultados en formato CSV para hojas de cálculo |
| `-l, --list` | Muestra el catálogo completo de los 55 módulos disponibles |
| `-s, --server` | Inicia el servidor HTTP con streaming Server-Sent Events |
| `-p, --port <puerto>` | Puerto del servidor HTTP (por defecto: `3000`) |

### Ejemplos Prácticos:

```bash
# Investigación OSINT estándar con interfaz de terminal neon interactiva
diablinda objetivo@gmail.com

# Filtrar solo servicios tecnológicos y plataformas de Brasil
diablinda objetivo@gmail.com --category tech,brasil

# Probar módulos específicos con mayor concurrencia
diablinda objetivo@gmail.com -m google,apple,github,office365 -c 20

# Exportar dosier consolidado en JSON
diablinda objetivo@gmail.com --json > dosier.json

# Exportar tabla de hallazgos en formato CSV
diablinda objetivo@gmail.com --csv > informe.csv

# Iniciar el servidor HTTP en el puerto 8080 para integración web
diablinda --server --port 8080
```

---

## 📦 Como Biblioteca NPM

Diablinda se integra de forma transparente en proyectos Node.js modernos:

```javascript
import { checkEmail, listModules, getModuleIcon, getModuleColor } from 'diablinda';

// 1. Ejecución con callbacks reactivos en tiempo real
const summary = await checkEmail('objetivo@gmail.com', {
  concurrency: 15,
  timeout: 8000,
  onHit: (hit) => {
    console.log(`[+] ¡Encontrado en ${hit.service}!`);
    console.log(`Color de Marca: ${hit.color}`);
    console.log(`Vector SVG: ${hit.iconSvg}`);
    console.log('Metadatos:', hit.metadata);
  },
  onProgress: ({ current, total, percentage }) => {
    console.log(`Progreso: ${current}/${total} (${percentage}%)`);
  }
});

console.log(`Escaneo finalizado. Total de cuentas descubiertas: ${summary.hits}`);
console.log('Dosier unificado:', summary.dossier);
```

---

## 🎨 Identidad Visual y Logotipos SVG para Front-Ends (RimuBusca)

Para que paneles de control e interfaces de búsqueda (como **RimuBusca**) no requieran cargar pesadas librerías de fuentes (FontAwesome, Lucide) o realizar peticiones a CDNs externas, Diablinda **incluye los vectores SVG oficiales y colores corporativos de las 55 plataformas**:

### Acceso a Íconos y Colores:

```javascript
import { getModuleIcon, getModuleColor, MODULE_ICONS, MODULE_COLORS } from 'diablinda';

// Obtener el string SVG vectorial (viewBox="0 0 24 24")
const githubSvg = getModuleIcon('github');
const steamColor = getModuleColor('steam'); // '#171a21'
```

### En el Objeto de Resultados:
Cada resultado emitido o devuelto por el motor viene decorado con sus propiedades visuales:
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

Renderizado en HTML / React / Vue:
```html
<div class="service-card" style="border-left: 4px solid ${hit.color}">
  <div class="icon" style="color: ${hit.color}">
    ${hit.iconSvg}
  </div>
  <h3>${hit.service}</h3>
</div>
```

---

## 🌐 Servidor HTTP con Server-Sent Events (SSE)

Inicia el servidor con:
```bash
diablinda --server --port 3000
```

### Rutas Disponibles:

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/` | Documentación interactiva y estado de salud de la API |
| `GET` | `/modules` | Listado de los 55 módulos con categorías, descripciones, colores e íconos SVG |
| `GET` | `/scan?email=...&category=...` | **Streaming SSE en tiempo real** (`text/event-stream`) |
| `POST` | `/scan` | Escaneo síncrono tradicional que devuelve el JSON completo |

### Consumo de Streaming SSE en el Front-End:

```javascript
const email = 'objetivo@gmail.com';
const eventSource = new EventSource(`http://localhost:3000/scan?email=${encodeURIComponent(email)}`);

eventSource.addEventListener('hit', (event) => {
  const hit = JSON.parse(event.data);
  console.log('[+] Nueva cuenta detectada:', hit.service);
  // Renderizar hit.iconSvg y hit.color inmediatamente en el DOM
});

eventSource.addEventListener('progress', (event) => {
  const { current, total, percentage } = JSON.parse(event.data);
  actualizarBarraDeProgreso(percentage);
});

eventSource.addEventListener('done', (event) => {
  const summary = JSON.parse(event.data);
  console.log('Escaneo completado. Dosier:', summary.dossier);
  eventSource.close();
});
```

---

## 🧠 Dosier Unificado de Inteligencia

A diferencia de herramientas tradicionales que devuelven salidas dispersas, Diablinda consolida los datos en un **Dosier Unificado**:

- **Resolución de Identidad Principal:** Determina el nombre más representativo y la biografía más completa entre todas las cuentas encontradas.
- **Galería de Avatares:** Reúne fotos de perfil en alta resolución procedentes de Gravatar, GitHub, TikTok, Steam, Duolingo, etc.
- **Estratificación de Confianza:**
  - `emailVerified`: Cuentas validadas al 100% por el correo electrónico en sí (ej: Google, Microsoft, Gravatar, Apple, ProtonMail).
  - `handleMatches`: Cuentas públicas localizadas mediante heurísticas de alias y validadas contra firmas soft-404.
- **Presencia Digital Centralizada:** Listado ordenado con enlaces directos a todos los perfiles sociales activos.

---

## 🛡️ Sistema Anti-Falsos Positivos y WAF

Las herramientas tradicionales de OSINT fallan con frecuencia al reportar falsos positivos ante bloqueos de **Cloudflare**, **Datadome** o respuestas **429/403**.

Diablinda aplica protecciones activas en `src/core/waf.js` y validaciones a nivel de módulo:
1. **Detección de Retos WAF y Captcha:** Descarta y categoriza automáticamente respuestas con firmas de verificación humana (`cf-mitigated`, `Just a moment...`, `datadome`, `hCaptcha`, `Attention Required`).
2. **Anti-Soft-404 Avanzado:** Identifica sitios web que responden con código HTTP 200 OK para cuentas inexistentes (pantallas de "Profile Not Found"), marcándolos correctamente como `exists: false`.
3. **Validación Criptográfica:** Comprueba bloques reales de claves públicas PGP en ProtonMail y hashes MD5/SHA-256 auténticos en Gravatar.
4. **Verificación Microsoft en Dos Etapas:** Distingue cuentas personales de terceros vinculadas a Microsoft (`IsMSAccount`) y organizaciones de Office 365 (`IfExistsResult`).

---

## 🧩 Catálogo de Servicios Compatibles (55 Plataformas)

| Categoría | ID | Servicio | Método de Verificación y Anti-Falsos Positivos | Metadatos Extraídos |
|---|---|---|---|---|
| **Tech** | `google` | Google (Gmail / Workspace) | Detección de dominios nativos y discovery oficial Mail GXLU | Cuenta Google, Workspace corporativo, canal de YouTube |
| **Tech** | `apple` | Apple ID (iCloud) | Detección de dominios nativos y endpoint IDMSA Apple Auth | Cuenta Apple ID, almacenamiento iCloud, estado de federación |
| **Tech** | `gravatar` | Gravatar / WordPress | Consulta criptográfica por hash MD5 y SHA-256 | Avatar HD, Nombre, Biografía, Enlaces verificados, Hashes |
| **Tech** | `github` | GitHub | API pública de usuarios y commits | @username, Avatar HD, Biografía, Repositorios, Commits |
| **Tech** | `gitlab` | GitLab | Verificación directa de correo y API pública con coincidencia exacta | Nombre, @username, Avatar HD, Biografía, Ubicación |
| **Tech** | `protonmail` | ProtonMail | Consulta de clave pública PGP en la API de Proton | Confirmación de cuenta Proton, Clave pública PGP |
| **Tech** | `firefox` | Firefox / Mozilla | Verificación de cuenta de sincronización (`exists: true`) | Cuenta Mozilla Sync |
| **Tech** | `docker` | Docker Hub | Recuperación de contraseña y API v2 de usuarios | @username, Nombre, Avatar, Repositorios |
| **Tech** | `replit` | Replit | Consulta GraphQL con cabecera Referer interna + alternativa | Cuenta de desarrollador |
| **Tech** | `codepen` | CodePen | Recuperación de contraseña y marcado HTML de perfil de autor | @username, Avatar, Perfil |
| **Tech** | `codecademy` | Codecademy | Validación estricta anti-soft-404 en el perfil | @username, Perfil verificado |
| **Tech** | `archive` | Internet Archive | Verificación en el registro y API de usuario | @username, Nombre, Biografía, Avatar |
| **Tech** | `atlassian` | Atlassian (Jira/Trello) | Auth Discovery (`accountType`) | Tipo de cuenta corporativa o personal |
| **Tech** | `devrant` | devRant | Endpoint de restablecimiento por correo y API oficial | @username, Biografía, Puntuación dev (score) |
| **Tech** | `samsung` | Samsung Account | Endpoint de recuperación y registro de identidad | Cuenta Samsung Galaxy / SmartThings |
| **Education** | `duolingo` | Duolingo | API pública de usuarios | Avatar HD, Nombre, Racha/Días, XP, Idiomas |
| **Education** | `chesscom` | Chess.com | Verificación de correo y API oficial de ajedrez | Título, Elo Rating, Avatar, Estado |
| **Social** | `facebook` | Facebook (Meta) | Verificación de registro Meta + OpenGraph con filtro de contenido no disponible | Nombre real, Avatar HD, Biografía, Perfil |
| **Social** | `tiktok` | TikTok | Estado universal de hidratación JSON y OpenGraph | Nombre, @username, Avatar HD, Biografía, Seguidores |
| **Social** | `telegram` | Telegram | Estructura de perfil t.me y etiquetas OpenGraph (anti-soft-404) | Nombre del canal o perfil, Avatar HD, Biografía |
| **Social** | `twitter` | Twitter / X | API oficial de validación (`taken: true, valid: false`) | Cuenta registrada |
| **Social** | `snapchat` | Snapchat | Restablecimiento por correo y endpoint de avatar Bitmoji | @username, Avatar 3D Bitmoji |
| **Social** | `instagram` | Instagram | Verificación de correo vía registro AJAX de Meta | @username, Nombre real, Avatar |
| **Social** | `discord` | Discord | Error `EMAIL_ALREADY_REGISTERED` | Cuenta registrada |
| **Social** | `imgur` | Imgur | Verificación directa mediante endpoint v1 auth | @username, Biografía, Avatar, Puntos de reputación |
| **Social** | `lastfm` | Last.fm | Endpoint de verificación de registro y perfil | @username, Avatar, Historial musical |
| **Social** | `soundcloud` | SoundCloud | API auth (`status: existing_user`) | Cuenta de oyente o creador |
| **Social** | `strava` | Strava | Validación `email_unique` + alternativa | Perfil de atleta |
| **Social** | `bitmoji` | Bitmoji | API auth (`exists: true`) | Avatar 3D configurado |
| **Social** | `aboutme` | About.me | Verificación de correo y biografía digital unificada | Nombre, @username, Biografía, Avatar |
| **Social** | `quora` | Quora | Restablecimiento de contraseña con cabeceras móviles | @username, Avatar |
| **Social** | `vsco` | VSCO | Verificación directa de correo mediante API v2 | @username, Avatar, Portafolio de fotografía |
| **Social** | `wattpad` | Wattpad | Validación de registro (`already taken`) | Cuenta de lector o autor |
| **Social** | `flickr` | Flickr | Verificación de identidad y photostream público | @username, Avatar, Portafolio |
| **Social** | `pinterest` | Pinterest | API de recursos (`exists: true`) | Cuenta registrada |
| **Social** | `tumblr` | Tumblr | Validación de registro | Cuenta registrada y blog |
| **Social** | `yahoo` | Yahoo | Flujo de descubrimiento y recuperación de cuentas | Cuenta Yahoo / AOL |
| **Finance** | `buymeacoffee` | Buy Me a Coffee | Verificación de correo por API y página de creador | Nombre, @username, Biografía, Avatar |
| **Finance** | `patreon` | Patreon | Consulta de credenciales y página de creador | Nombre, @username, Avatar |
| **Finance** | `venmo` | Venmo | Verificación directa de correo por API | Nombre, @username, Avatar |
| **Finance** | `freelancer` | Freelancer.com | Comprobación por API (`result.available: false`) | Cuenta de profesional o contratante |
| **Productivity** | `linkedin` | LinkedIn | Análisis de perfil público y metadatos OpenGraph | Nombre, Cargo, Empresa, Avatar, Biografía |
| **Productivity** | `office365` | Microsoft / Office 365 | Verificación dual: GetCredentialType MSOL y Live ID | Cuentas personales (Gmail/Xbox), Hotmail, Office 365 |
| **Productivity** | `adobe` | Adobe Creative Cloud | Discovery API (`accounts[]`) | Nombre, Tipo de cuenta, País |
| **Productivity** | `evernote` | Evernote | Endpoint de validación (`available: false`) | Cuenta registrada |
| **Productivity** | `envato` | Envato Market | Recuperación de cuenta y perfil de ThemeForest | @username, Avatar, Medallas de autor |
| **Productivity** | `xing` | XING | Recuperación de contraseña y perfil corporativo | Nombre, @username, Avatar |
| **Entertainment** | `spotify` | Spotify | Comprobación pública de registro | Estado de cuenta registrada |
| **Entertainment** | `amazon` | Amazon | Flujo de inicio de sesión y recuperación de contraseña | Cuenta de cliente / Prime |
| **Entertainment** | `steam` | Steam (Valve) | Análisis de perfil de jugador en Steam Community | Nickname persona, Nombre real, Avatar HD, País |
| **Entertainment** | `vivino` | Vivino | Verificación de correo por API y perfil de sommelier | Nombre, @username, Avatar |
| **Entertainment** | `deliveroo` | Deliveroo | Comprobación por API (`registered: true`) | Cuenta de delivery |
| **Brasil** | `vakinha` | Vakinha Brasil | API de búsqueda de usuarios | Cuenta de recaudador o donante |
| **Brasil** | `apoiase` | Apoia.se | Comprobación mediante API de crowdfunding | Perfil de patrocinador o creador |
| **Brasil** | `jusbrasil` | Jusbrasil | Búsqueda pública de citaciones jurídicas | Citaciones legales y perfil jurídico |

---

## 🔌 Cómo Crear un Nuevo Módulo

Todos los módulos se alojan en `src/modules/<categoría>/<nombre>.js` y siguen una interfaz estándar:

```javascript
// src/modules/tech/ejemplo.js

export default {
  id: 'ejemplo',
  name: 'Servicio Ejemplo',
  category: 'tech',
  url: 'https://ejemplo.com',
  description: 'Comprueba cuentas en el Servicio Ejemplo.',

  async check(email, { signal, headers } = {}) {
    const res = await fetch(`https://api.ejemplo.com/check?email=${encodeURIComponent(email)}`, {
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

Solo necesitas registrar el módulo en [src/modules/index.js](src/modules/index.js) y agregar su ícono SVG y color corporativo en [src/core/icons.js](src/core/icons.js).

---

## 🧪 Pruebas Automatizadas

El proyecto utiliza el ejecutor de pruebas nativo de Node.js (`node:test`), garantizando máxima velocidad sin dependencias externas:

```bash
npm test
```

Para ejecutar con salida detallada:
```bash
node --test tests/*.test.js
```

---

## ⚖️ Licencia y Descargo de Responsabilidad

Este software ha sido desarrollado exclusivamente con fines educativos, de investigación en seguridad de la información, auditoría defensiva y OSINT ético sobre credenciales expuestas autorizadas por su titular. Los autores no asumen responsabilidad alguna por el mal uso de esta herramienta.

Distribuido bajo licencia **MIT**. Para más detalles, consulta el archivo [LICENSE](LICENSE).

