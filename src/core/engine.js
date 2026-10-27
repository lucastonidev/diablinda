/**
 * @fileoverview Motor de Execução (Engine) da Diablinda.
 * Orquestra módulos, validações, concorrência, eventos e agrega resultados.
 */

import { EventEmitter } from 'node:events';
import { isValidEmail, normalizeEmail, isDisposableEmail } from './validator.js';
import { runWithConcurrency, createTimeoutSignal } from './pool.js';
import { getBrowserHeaders } from './headers.js';
import { getAllModules } from '../modules/index.js';
import { getModuleIcon, getModuleColor } from './icons.js';

export class DiablindaEngine extends EventEmitter {
  /**
   * @param {Object} [config={}]
   * @param {number} [config.concurrency=15]
   * @param {number} [config.timeout=8000]
   */
  constructor(config = {}) {
    super();
    this.concurrency = config.concurrency || 15;
    this.timeout = config.timeout || 8000;
  }

  /**
   * Executa a varredura do e-mail em todos os módulos selecionados.
   * @param {string} rawEmail - O e-mail a ser investigado
   * @param {import('./types.js').ScanOptions} [options={}]
   * @returns {Promise<import('./types.js').ScanSummary>}
   */
  async scan(rawEmail, options = {}) {
    const startTime = Date.now();
    const email = normalizeEmail(rawEmail);

    if (!isValidEmail(email)) {
      throw new Error(`Endereço de e-mail inválido: "${rawEmail}"`);
    }

    const isDisposable = isDisposableEmail(email);
    if (isDisposable) {
      this.emit('warning', {
        type: 'disposable_email',
        message: 'O domínio deste e-mail é de um serviço temporário/descartável conhecido.'
      });
    }

    // Seleção de módulos
    const allModules = getAllModules();
    let selectedModules = allModules;

    if (options.category) {
      const categories = Array.isArray(options.category)
        ? options.category
        : options.category.split(',').map((c) => c.trim().toLowerCase());
      selectedModules = selectedModules.filter((m) => categories.includes(m.category.toLowerCase()));
    }

    if (options.modules) {
      const modIds = Array.isArray(options.modules)
        ? options.modules
        : options.modules.split(',').map((m) => m.trim().toLowerCase());
      selectedModules = selectedModules.filter((m) => modIds.includes(m.id.toLowerCase()));
    }

    if (selectedModules.length === 0) {
      throw new Error('Nenhum módulo selecionado para a execução.');
    }

    const concurrency = options.concurrency || this.concurrency;
    const timeout = options.timeout || this.timeout;
    const parentSignal = options.signal;

    const results = [];
    let hitsCount = 0;
    let missesCount = 0;
    let errorsCount = 0;

    this.emit('start', {
      email,
      totalModules: selectedModules.length,
      isDisposable
    });

    // Cria as tarefas de execução para cada módulo
    const tasks = selectedModules.map((module) => {
      return async () => {
        const timeoutHelper = createTimeoutSignal(timeout, parentSignal);
        const headers = getBrowserHeaders();
        const checkStart = Date.now();

        try {
          const res = await module.check(email, {
            signal: timeoutHelper.signal,
            headers,
            timeoutMs: timeout
          });

          const durationMs = res.durationMs || (Date.now() - checkStart);
          const fullResult = {
            id: module.id,
            service: module.name,
            category: module.category,
            url: module.url,
            iconSvg: getModuleIcon(module.id),
            color: getModuleColor(module.id),
            exists: Boolean(res.exists),
            rateLimited: Boolean(res.rateLimited),
            metadata: res.metadata || {},
            durationMs,
            error: res.error || null
          };

          return fullResult;
        } catch (err) {
          const durationMs = Date.now() - checkStart;
          const isAborted = timeoutHelper.signal.aborted;
          const errorMessage = isAborted
            ? `Timeout excedido (${timeout}ms)`
            : (err.message || 'Erro desconhecido');

          return {
            id: module.id,
            service: module.name,
            category: module.category,
            url: module.url,
            iconSvg: getModuleIcon(module.id),
            color: getModuleColor(module.id),
            exists: false,
            rateLimited: false,
            metadata: {},
            durationMs,
            error: errorMessage
          };
        } finally {
          timeoutHelper.clear();
        }
      };
    });

    // Executa no pool concorrente emitindo eventos a cada progresso
    await runWithConcurrency(tasks, {
      concurrency,
      signal: parentSignal,
      onTaskComplete: (result) => {
        results.push(result);

        if (result.error && !result.exists) {
          errorsCount++;
          this.emit('service_error', result);
        } else if (result.exists) {
          hitsCount++;
          this.emit('hit', result);
          if (typeof options.onHit === 'function') {
            options.onHit(result);
          }
        } else {
          missesCount++;
          this.emit('miss', result);
        }

        this.emit('progress', {
          current: results.length,
          total: selectedModules.length,
          result
        });

        if (typeof options.onProgress === 'function') {
          options.onProgress(result);
        }
      }
    });

    const totalDurationMs = Date.now() - startTime;
    const summary = {
      email,
      isDisposable,
      totalModules: selectedModules.length,
      hits: hitsCount,
      misses: missesCount,
      errors: errorsCount,
      totalDurationMs,
      results
    };

    this.emit('done', summary);
    return summary;
  }
}

