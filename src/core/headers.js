/**
 * @fileoverview Gerador de headers HTTP realistas para requisições OSINT.
 * Simula navegadores modernos reais (Chrome 128+, Edge, Firefox) de forma consistente
 * (garantindo que o User-Agent coincida perfeitamente com o Sec-CH-UA e a Plataforma).
 */

const USER_AGENT_PROFILES = [
  {
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    platform: '"Windows"',
    brands: '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
    mobile: '?0'
  },
  {
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36 Edg/127.0.0.0',
    platform: '"Windows"',
    brands: '"Chromium";v="127", "Not;A=Brand";v="24", "Microsoft Edge";v="127"',
    mobile: '?0'
  },
  {
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    platform: '"macOS"',
    brands: '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
    mobile: '?0'
  },
  {
    ua: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
    platform: '"Linux"',
    brands: '"Chromium";v="128", "Not;A=Brand";v="24", "Google Chrome";v="128"',
    mobile: '?0'
  }
];

/**
 * Retorna um perfil de navegador consistente (UA + Sec-CH-UA coincidente).
 * @returns {typeof USER_AGENT_PROFILES[0]}
 */
export function getRandomProfile() {
  return USER_AGENT_PROFILES[Math.floor(Math.random() * USER_AGENT_PROFILES.length)];
}

/**
 * Gera headers HTTP completos de navegador moderno.
 * @param {Object} [overrides={}]
 * @returns {Record<string, string>}
 */
export function getBrowserHeaders(overrides = {}) {
  const profile = getRandomProfile();

  const headers = {
    'User-Agent': profile.ua,
    'Accept': 'application/json, text/plain, text/html, */*',
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
    'sec-ch-ua': profile.brands,
    'sec-ch-ua-mobile': profile.mobile,
    'sec-ch-ua-platform': profile.platform,
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache'
  };

  return {
    ...headers,
    ...overrides
  };
}

/**
 * Gera headers HTTP simulando uma requisição interna de frontend do próprio serviço.
 * Inclui Origin e Referer coerentes com o domínio de destino para contornar verificações de CSRF.
 * @param {string} targetUrl
 * @param {Object} [overrides={}]
 * @returns {Record<string, string>}
 */
export function getServiceHeaders(targetUrl, overrides = {}) {
  let origin = '';
  let referer = '';

  try {
    const parsed = new URL(targetUrl);
    origin = `${parsed.protocol}//${parsed.host}`;
    referer = `${origin}/`;
  } catch {
    // se falhar URL parse, prossegue sem origin
  }

  const base = getBrowserHeaders({
    ...(origin ? { 'Origin': origin, 'Referer': referer } : {}),
    ...overrides
  });

  return base;
}
