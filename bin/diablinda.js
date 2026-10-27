#!/usr/bin/env node

/**
 * @fileoverview Ponto de entrada binário para a CLI diablinda.
 */

import { runCli } from '../src/cli/index.js';

runCli().catch((err) => {
  console.error('Erro fatal:', err);
  process.exit(1);
});

