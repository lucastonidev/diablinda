/**
 * @fileoverview Ponto de entrada CLI da ferramenta Diablinda.
 * Suporta modo terminal interativo, modo silencioso/JSON, exportação CSV e servidor SSE.
 */

import { parseArgs } from 'node:util';
import fs from 'node:fs';
import { DiablindaEngine } from '../core/engine.js';
import { getAllModules, getCategoriesCount } from '../modules/index.js';
import { c, getBanner } from './theme.js';
import { formatProgressItem, formatSummary, formatCSV } from './formatter.js';
import { buildTargetDossier, formatDossierMarkdown } from '../core/dossier.js';
import { startServer } from '../server/index.js';

const HELP_TEXT = `
${c.bold}USO:${c.reset}
  diablinda <email> [opções]
  npx diablinda alvo@email.com
  diablinda --server [--port 3000]

${c.bold}ARGUMENTOS:${c.reset}
  <email>                 Endereço de e-mail alvo a ser investigado

${c.bold}OPÇÕES:${c.reset}
  -c, --category <nome>   Filtra serviços por categoria (ex: tech, brasil, social, education, productivity)
  -m, --modules <ids>     Lista de IDs específicos separados por vírgula (ex: github,office365,gravatar)
      --only-hits         Exibe apenas os serviços onde o usuário foi encontrado
      --report <arquivo>  Exporta um Dossiê Investigativo completo consolidado em Markdown
      --concurrency <n>   Máximo de checagens simultâneas (padrão: 10)
      --timeout <ms>      Timeout por serviço em milissegundos (padrão: 8000)
      --json              Gera saída em JSON puro (ideal para scripts e pipes)
      --csv               Exporta os resultados no formato CSV
      --list              Lista todos os serviços suportados e categorias
      --server            Inicia o servidor de API HTTP com Streaming SSE
      --port <porta>      Porta do servidor HTTP (padrão: 3000)
  -h, --help              Exibe esta mensagem de ajuda
  -v, --version           Exibe a versão atual da Diablinda

${c.bold}EXEMPLOS:${c.reset}
  $ diablinda alvo@gmail.com
  $ diablinda alvo@empresa.com.br --category brasil,productivity
  $ diablinda investigado@proton.me --only-hits
  $ diablinda investigado@proton.me --json > resultado.json
  $ diablinda --server --port 8080
`;

export async function runCli(argv = process.argv.slice(2)) {
  const options = {
    help: { type: 'boolean', short: 'h' },
    version: { type: 'boolean', short: 'v' },
    json: { type: 'boolean' },
    csv: { type: 'boolean' },
    list: { type: 'boolean' },
    server: { type: 'boolean' },
    'only-hits': { type: 'boolean' },
    report: { type: 'string' },
    port: { type: 'string', default: '3000' },
    category: { type: 'string', short: 'c' },
    modules: { type: 'string', short: 'm' },
    concurrency: { type: 'string', default: '10' },
    timeout: { type: 'string', default: '8000' }
  };

  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      options,
      allowPositionals: true
    });
  } catch (err) {
    console.error(`${c.brightRed}Erro de sintaxe:${c.reset} ${err.message}`);
    console.log(HELP_TEXT);
    process.exit(1);
  }

  const { values, positionals } = parsed;

  if (values.version) {
    console.log('diablinda v1.0.0 (Node.js ESM)');
    return;
  }

  if (values.help) {
    console.log(getBanner());
    console.log(HELP_TEXT);
    return;
  }

  if (values.list) {
    console.log(getBanner());
    console.log(`\n${c.bold}CATÁLOGO DE SERVIÇOS DISPONÍVEIS:${c.reset}\n`);
    const all = getAllModules();
    const categories = getCategoriesCount();

    for (const [cat, count] of Object.entries(categories)) {
      console.log(`${c.brightCyan}${c.bold}• Categoria [${cat.toUpperCase()}] (${count} serviços):${c.reset}`);
      const catModules = all.filter((m) => m.category === cat);
      for (const mod of catModules) {
        console.log(`  └─ ${c.bold}${mod.id.padEnd(14)}${c.reset} ${mod.name.padEnd(26)} ${c.dim}${mod.description || ''}${c.reset}`);
      }
      console.log('');
    }
    return;
  }

  if (values.server) {
    const port = parseInt(values.port, 10) || 3000;
    await startServer({ port });
    return;
  }

  const targetEmail = positionals[0];
  if (!targetEmail) {
    console.log(getBanner());
    console.error(`\n${c.brightRed}Erro:${c.reset} Informe o endereço de e-mail a ser investigado.`);
    console.log(HELP_TEXT);
    process.exit(1);
  }

  const isJson = Boolean(values.json);
  const isCsv = Boolean(values.csv);
  const onlyHits = Boolean(values['only-hits']);
  const isSilent = isJson || isCsv;

  if (!isSilent) {
    console.log(getBanner());
    console.log(`\n${c.bold}[*] Iniciando investigação OSINT para:${c.reset} ${c.brightCyan}${targetEmail}${c.reset}`);
    console.log(`${c.dim}[*] Concorrência: ${values.concurrency} conexões simultâneas | Timeout: ${values.timeout}ms${c.reset}\n`);
  }

  const engine = new DiablindaEngine({
    concurrency: parseInt(values.concurrency, 10) || 10,
    timeout: parseInt(values.timeout, 10) || 8000
  });

  if (!isSilent) {
    engine.on('warning', (w) => {
      console.log(`  ${c.brightYellow}⚠️  AVISO:${c.reset} ${w.message}\n`);
    });

    engine.on('progress', ({ current, total, result }) => {
      if (onlyHits) {
        if (result.exists) {
          console.log(formatProgressItem(result, current, total));
        }
      } else {
        console.log(formatProgressItem(result, current, total));
      }
    });
  }

  try {
    const summary = await engine.scan(targetEmail, {
      category: values.category,
      modules: values.modules
    });

    const dossier = buildTargetDossier(targetEmail, summary.results);

    if (values.report) {
      const reportMd = formatDossierMarkdown(dossier);
      fs.writeFileSync(values.report, reportMd, 'utf-8');
      if (!isSilent) {
        console.log(`\n  ${c.brightGreen}${c.bold}📄 Dossiê Investigativo exportado com sucesso para:${c.reset} ${values.report}`);
      }
    }

    if (isJson) {
      console.log(JSON.stringify({ ...summary, dossier }, null, 2));
    } else if (isCsv) {
      console.log(formatCSV(summary));
    } else {
      console.log(formatSummary(summary, dossier));
    }
  } catch (err) {
    if (isJson) {
      console.error(JSON.stringify({ error: err.message }));
    } else {
      console.error(`\n${c.brightRed}Erro durante a varredura:${c.reset} ${err.message}`);
    }
    process.exit(1);
  }
}
