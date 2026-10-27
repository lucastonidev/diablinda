import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { runWithConcurrency, createTimeoutSignal } from '../src/core/pool.js';

describe('Pool de Concorrência e Timeouts', () => {
  it('deve executar todas as tarefas respeitando o limite de concorrência', async () => {
    let currentlyRunning = 0;
    let maxObserved = 0;

    const tasks = Array.from({ length: 10 }, (_, i) => async () => {
      currentlyRunning++;
      maxObserved = Math.max(maxObserved, currentlyRunning);
      await new Promise((r) => setTimeout(r, 20));
      currentlyRunning--;
      return i * 2;
    });

    const results = await runWithConcurrency(tasks, { concurrency: 3 });

    assert.equal(results.length, 10);
    assert.deepEqual(results, [0, 2, 4, 6, 8, 10, 12, 14, 16, 18]);
    assert.ok(maxObserved <= 3, `Máximo observado (${maxObserved}) não deveria ultrapassar 3`);
  });

  it('deve disparar onTaskComplete assim que cada tarefa finaliza', async () => {
    const completed = [];
    const tasks = [
      async () => 'a',
      async () => 'b',
      async () => 'c'
    ];

    await runWithConcurrency(tasks, {
      concurrency: 2,
      onTaskComplete: (res) => completed.push(res)
    });

    assert.equal(completed.length, 3);
    assert.ok(completed.includes('a'));
    assert.ok(completed.includes('b'));
    assert.ok(completed.includes('c'));
  });

  it('createTimeoutSignal deve abortar após o tempo especificado', async () => {
    const { signal, clear } = createTimeoutSignal(50);
    assert.equal(signal.aborted, false);

    await new Promise((r) => setTimeout(r, 70));
    assert.equal(signal.aborted, true);
    clear();
  });
});

