/**
 * @fileoverview Utilitários de estilização ANSI e tema visual neon para a CLI Diablinda.
 * 100% nativo em Node.js (zero dependências externas), ultra-rápido.
 */

// Códigos ANSI de estilo e cor
const ESC = '\x1b[';
export const c = {
  reset: `${ESC}0m`,
  bold: `${ESC}1m`,
  dim: `${ESC}2m`,
  italic: `${ESC}3m`,
  underline: `${ESC}4m`,

  // Cores de texto
  black: `${ESC}30m`,
  red: `${ESC}31m`,
  green: `${ESC}32m`,
  yellow: `${ESC}33m`,
  blue: `${ESC}34m`,
  magenta: `${ESC}35m`,
  cyan: `${ESC}36m`,
  white: `${ESC}37m`,

  // Cores brilhantes / neon
  brightRed: `${ESC}91m`,
  brightGreen: `${ESC}92m`,
  brightYellow: `${ESC}93m`,
  brightBlue: `${ESC}94m`,
  brightMagenta: `${ESC}95m`,
  brightCyan: `${ESC}96m`,
  brightWhite: `${ESC}97m`,

  // Cores de fundo
  bgRed: `${ESC}41m`,
  bgGreen: `${ESC}42m`,
  bgYellow: `${ESC}43m`,
  bgBlue: `${ESC}44m`,
  bgMagenta: `${ESC}45m`,
  bgCyan: `${ESC}46m`,
  bgDarkGray: `${ESC}100m`
};

/**
 * Retorna o banner ASCII neon da Diablinda.
 * @returns {string}
 */
export function getBanner() {
  return `
${c.brightMagenta}${c.bold}  ██████╗ ██╗ █████╗ ██████╗ ██╗     ██╗███╗   ██╗██████╗  █████╗ 
  ██╔══██╗██║██╔══██╗██╔══██╗██║     ██║████╗  ██║██╔══██╗██╔══██╗
  ██║  ██║██║███████║██████╔╝██║     ██║██╔██╗ ██║██║  ██║███████║
  ██║  ██║██║██╔══██║██╔══██╗██║     ██║██║╚██╗██║██║  ██║██╔══██║
  ██████╔╝██║██║  ██║██████╔╝███████╗██║██║ ╚████║██████╔╝██║  ██║
  ╚═════╝ ╚═╝╚═╝  ╚═╝╚═════╝ ╚══════╝╚═╝╚═╝  ╚═══╝╚═════╝ ╚═╝  ╚═╝${c.reset}
${c.cyan}  ⚡ O Sucessor OSINT Turbinado do Holehe em JavaScript Puro (Node.js ESM) ⚡${c.reset}
${c.dim}  ──────────────────────────────────────────────────────────────────────${c.reset}`;
}

/**
 * Formata um badge de status com cores.
 * @param {'HIT'|'MISS'|'RATE_LIMIT'|'ERROR'} status
 * @returns {string}
 */
export function formatBadge(status) {
  switch (status) {
    case 'HIT':
      return `${c.bgGreen}${c.black}${c.bold} FOUND ${c.reset}`;
    case 'MISS':
      return `${c.dim} NOT FOUND ${c.reset}`;
    case 'RATE_LIMIT':
      return `${c.bgYellow}${c.black}${c.bold} RATE LIMIT ${c.reset}`;
    case 'ERROR':
      return `${c.bgRed}${c.brightWhite}${c.bold} ERROR ${c.reset}`;
    default:
      return `${c.dim}[${status}]${c.reset}`;
  }
}

