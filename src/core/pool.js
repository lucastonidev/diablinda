/**
 * @fileoverview Pool de concorrência controlada para execução de tarefas assíncronas.
 * Permite disparar dezenas de checagens sem esgotar sockets do sistema operacional,
 * com suporte nativo a timeout individual e AbortSignal global.
 */

/**
 * Executa uma lista de tarefas assíncronas com concorrência máxima limitada.
 * @template T
 * @param {Array<() => Promise<T>>} tasks - Funções que retornam promises
 * @param {Object} options
 * @param {number} [options.concurrency=15] - Limite máximo de execuções simultâneas
 * @param {AbortSignal} [options.signal] - Sinal de cancelamento geral
 * @param {function(T, number): void} [options.onTaskComplete] - Callback chamado assim que cada tarefa conclui
 * @returns {Promise<T[]>}
 */
export async function runWithConcurrency(tasks, options = {}) {
  const { concurrency = 15, signal, onTaskComplete } = options;
  const limit = Math.max(1, Math.min(concurrency, 50));
  const results = new Array(tasks.length);
  let currentIndex = 0;

  if (signal?.aborted) {
    throw new Error('Operação cancelada antes do início.');
  }

  async function worker() {
    while (currentIndex < tasks.length) {
      if (signal?.aborted) {
        break;
      }
      const index = currentIndex++;
      const task = tasks[index];
      try {
        const result = await task();
        results[index] = result;
        if (typeof onTaskComplete === 'function') {
          onTaskComplete(result, index);
        }
      } catch (err) {
        results[index] = err;
      }
    }
  }

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, () => worker());
  await Promise.all(workers);

  return results;
}

/**
 * Cria um timer de timeout acoplado a um AbortController.
 * @param {number} ms
 * @param {AbortSignal} [parentSignal]
 * @returns {{ signal: AbortSignal, clear: () => void }}
 */
export function createTimeoutSignal(ms = 8000, parentSignal) {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort(new Error(`Timeout de ${ms}ms excedido.`));
  }, ms);

  let onParentAbort = null;
  if (parentSignal) {
    if (parentSignal.aborted) {
      clearTimeout(timer);
      controller.abort(parentSignal.reason);
    } else {
      onParentAbort = () => {
        clearTimeout(timer);
        controller.abort(parentSignal.reason);
      };
      parentSignal.addEventListener('abort', onParentAbort, { once: true });
    }
  }

  return {
    signal: controller.signal,
    clear: () => {
      clearTimeout(timer);
      if (parentSignal && onParentAbort) {
        parentSignal.removeEventListener('abort', onParentAbort);
      }
    }
  };
}

