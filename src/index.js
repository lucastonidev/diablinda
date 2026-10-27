/**
 * @fileoverview Ponto de entrada principal do pacote npm `diablinda`.
 */

export { DiablindaEngine } from './core/engine.js';
export { checkEmail, listModules, listCategories } from './facade.js';
export { startServer } from './server/index.js';
export { getAllModules, getModuleById, getModulesByCategory, registerModule } from './modules/index.js';
export { isValidEmail, normalizeEmail, getEmailDomain, getEmailUsername, getUsernameVariations, isDisposableEmail } from './core/validator.js';
export { getBrowserHeaders, getRandomUserAgent } from './core/headers.js';
export { getModuleIcon, getModuleColor, MODULE_ICONS, MODULE_COLORS, decorateModule } from './core/icons.js';
export { buildTargetDossier, formatDossierMarkdown } from './core/dossier.js';

