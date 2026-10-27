/**
 * @fileoverview API simplificada (Facade) para consumo da Diablinda como biblioteca NPM.
 */

import { DiablindaEngine } from './core/engine.js';
import { getAllModules, getCategoriesCount, getModulesByCategory } from './modules/index.js';

/**
 * Função rápida para investigar um e-mail com callbacks opcionais.
 * @param {string} email - O e-mail a ser pesquisado
 * @param {import('./core/types.js').ScanOptions} [options={}] - Opções de varredura
 * @returns {Promise<import('./core/types.js').ScanSummary>}
 *
 * @example
 * import { checkEmail } from 'diablinda';
 *
 * const summary = await checkEmail('alvo@gmail.com', {
 *   category: 'tech',
 *   onHit: (hit) => console.log('Encontrado em:', hit.service, hit.metadata)
 * });
 */
export async function checkEmail(email, options = {}) {
  const engine = new DiablindaEngine({
    concurrency: options.concurrency,
    timeout: options.timeout
  });

  return engine.scan(email, options);
}

/**
 * Lista todos os serviços suportados e seus metadados.
 * @returns {Array<{ id: string, name: string, category: string, url?: string, description?: string }>}
 */
export function listModules() {
  return getAllModules().map((m) => ({
    id: m.id,
    name: m.name,
    category: m.category,
    url: m.url,
    description: m.description
  }));
}

/**
 * Retorna as estatísticas de categorias disponíveis.
 * @returns {Record<string, number>}
 */
export function listCategories() {
  return getCategoriesCount();
}

