/**
 * @fileoverview Definições de Tipos e Contratos JSDoc para a Diablinda.
 * Permite autocompletion e checagem de tipos estáticos sem requerer compilador TypeScript.
 */

/**
 * @typedef {'social' | 'tech' | 'education' | 'brasil' | 'finance' | 'gaming' | 'entertainment' | 'productivity'} ModuleCategory
 */

/**
 * @typedef {Object} ServiceMetadata
 * @property {string} [name] - Nome real ou de exibição público
 * @property {string} [username] - Nome de usuário / handle público
 * @property {string} [avatarUrl] - URL direta da foto de perfil / avatar
 * @property {string} [bio] - Biografia ou descrição do perfil
 * @property {string} [location] - Localização geográfica pública
 * @property {string} [profileUrl] - Link direto para o perfil público
 * @property {string} [accountCreatedAt] - Data estimada de criação da conta
 * @property {Record<string, any>} [extra] - Dados específicos da plataforma (ex: repos, xp, streak, seguidores)
 */

/**
 * @typedef {Object} ServiceResult
 * @property {string} id - Identificador único do módulo (ex: "gravatar", "duolingo")
 * @property {string} service - Nome legível do serviço (ex: "Gravatar", "Duolingo")
 * @property {ModuleCategory} category - Categoria investigativa
 * @property {string} [url] - URL principal do serviço
 * @property {string} [iconSvg] - Representação vetorial SVG inline do logotipo oficial do serviço
 * @property {string} [color] - Cor primária oficial da marca (hexadecimal)
 * @property {boolean} exists - Indica se o e-mail ou perfil público foi encontrado
 * @property {boolean} [rateLimited] - Indica se a requisição sofreu rate limit ou bloqueio
 * @property {ServiceMetadata} [metadata] - Metadados públicos extraídos
 * @property {number} durationMs - Tempo que a checagem levou em milissegundos
 * @property {string} [error] - Mensagem de erro em caso de falha de conexão/execução
 */

/**
 * @typedef {Object} CheckContext
 * @property {AbortSignal} [signal] - Sinal de cancelamento ou timeout
 * @property {Record<string, string>} [headers] - Headers customizados
 * @property {number} [timeoutMs] - Timeout individual da requisição
 */

/**
 * @typedef {Object} EmailServiceModule
 * @property {string} id - Identificador único do módulo
 * @property {string} name - Nome de exibição
 * @property {ModuleCategory} category - Categoria do serviço
 * @property {string} [url] - URL principal do serviço
 * @property {string} [iconSvg] - Representação vetorial SVG inline do logotipo
 * @property {string} [color] - Cor primária oficial da marca
 * @property {string} [description] - Breve descrição dos dados verificados
 * @property {function(string, CheckContext=): Promise<ServiceResult>} check - Função de checagem do e-mail
 */

/**
 * @typedef {Object} ScanOptions
 * @property {string|string[]} [category] - Categoria ou lista de categorias a filtrar
 * @property {string|string[]} [modules] - Módulos específicos a executar
 * @property {number} [concurrency=15] - Máximo de checagens simultâneas
 * @property {number} [timeout=8000] - Timeout por serviço em ms
 * @property {function(ServiceResult): void} [onProgress] - Callback invocado a cada serviço finalizado
 * @property {function(ServiceResult): void} [onHit] - Callback invocado apenas quando encontrado
 * @property {AbortSignal} [signal] - Sinal para abortar todo o scan
 */

/**
 * @typedef {Object} ScanSummary
 * @property {string} email - E-mail alvo analisado
 * @property {number} totalModules - Total de módulos executados
 * @property {number} hits - Quantidade de serviços com conta encontrada
 * @property {number} misses - Quantidade de serviços sem conta encontrada
 * @property {number} errors - Quantidade de erros de rede ou rate limit
 * @property {number} totalDurationMs - Tempo total da varredura
 * @property {ServiceResult[]} results - Lista com todos os resultados individuais
 */

export const CATEGORIES = Object.freeze([
  'tech',
  'social',
  'education',
  'brasil',
  'finance',
  'gaming',
  'entertainment',
  'productivity'
]);

