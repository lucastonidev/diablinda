/**
 * @fileoverview Registro Central de Módulos da Diablinda.
 * Permite carregar, listar, categorizar e adicionar módulos dinamicamente.
 */

// Tech & Dev
import gravatar from './tech/gravatar.js';
import github from './tech/github.js';
import gitlab from './tech/gitlab.js';
import google from './tech/google.js';
import apple from './tech/apple.js';
import protonmail from './tech/protonmail.js';
import firefox from './tech/firefox.js';
import docker from './tech/docker.js';
import replit from './tech/replit.js';
import codepen from './tech/codepen.js';
import codecademy from './tech/codecademy.js';
import archive from './tech/archive.js';
import atlassian from './tech/atlassian.js';
import devrant from './tech/devrant.js';
import samsung from './tech/samsung.js';

// Education
import duolingo from './education/duolingo.js';
import chesscom from './education/chesscom.js';

// Social & Media
import facebook from './social/facebook.js';
import tiktok from './social/tiktok.js';
import telegram from './social/telegram.js';
import pinterest from './social/pinterest.js';
import tumblr from './social/tumblr.js';
import twitter from './social/twitter.js';
import snapchat from './social/snapchat.js';
import instagram from './social/instagram.js';
import discord from './social/discord.js';
import imgur from './social/imgur.js';
import lastfm from './social/lastfm.js';
import soundcloud from './social/soundcloud.js';
import strava from './social/strava.js';
import bitmoji from './social/bitmoji.js';
import aboutme from './social/aboutme.js';
import quora from './social/quora.js';
import vsco from './social/vsco.js';
import wattpad from './social/wattpad.js';
import flickr from './social/flickr.js';
import yahoo from './social/yahoo.js';

// Finance & Crowdfunding
import buymeacoffee from './finance/buymeacoffee.js';
import patreon from './finance/patreon.js';
import venmo from './finance/venmo.js';
import freelancer from './finance/freelancer.js';

// Productivity & Creative
import linkedin from './productivity/linkedin.js';
import adobe from './productivity/adobe.js';
import evernote from './productivity/evernote.js';
import envato from './productivity/envato.js';
import xing from './productivity/xing.js';
import office365 from './productivity/office365.js';

// Entertainment
import spotify from './social/spotify.js';
import amazon from './entertainment/amazon.js';
import steam from './entertainment/steam.js';
import vivino from './entertainment/vivino.js';
import deliveroo from './entertainment/deliveroo.js';

// Ecossistema Brasil
import vakinha from './brasil/vakinha.js';
import apoiase from './brasil/apoiase.js';
import jusbrasil from './brasil/jusbrasil.js';

/** @type {import('../core/types.js').EmailServiceModule[]} */
const MODULES = [
  // Tech & Dev
  google,
  apple,
  gravatar,
  github,
  gitlab,
  protonmail,
  firefox,
  docker,
  replit,
  codepen,
  codecademy,
  archive,
  atlassian,
  devrant,
  samsung,

  // Education
  duolingo,
  chesscom,

  // Social & Media
  facebook,
  tiktok,
  telegram,
  pinterest,
  tumblr,
  twitter,
  snapchat,
  instagram,
  discord,
  imgur,
  lastfm,
  soundcloud,
  strava,
  bitmoji,
  aboutme,
  quora,
  vsco,
  wattpad,
  flickr,
  yahoo,

  // Finance & Crowdfunding
  buymeacoffee,
  patreon,
  venmo,
  freelancer,

  // Productivity
  linkedin,
  adobe,
  evernote,
  envato,
  xing,
  office365,

  // Entertainment
  spotify,
  amazon,
  steam,
  vivino,
  deliveroo,

  // Brasil
  vakinha,
  apoiase,
  jusbrasil
];

import { decorateModule } from '../core/icons.js';

/**
 * Retorna todos os módulos registrados.
 * @returns {import('../core/types.js').EmailServiceModule[]}
 */
export function getAllModules() {
  return MODULES.map(decorateModule);
}

/**
 * Obtém um módulo específico pelo ID.
 * @param {string} id
 * @returns {import('../core/types.js').EmailServiceModule | undefined}
 */
export function getModuleById(id) {
  const found = MODULES.find((m) => m.id.toLowerCase() === id.toLowerCase());
  return found ? decorateModule(found) : undefined;
}

/**
 * Retorna os módulos filtrados por categoria.
 * @param {string} category
 * @returns {import('../core/types.js').EmailServiceModule[]}
 */
export function getModulesByCategory(category) {
  return MODULES.filter((m) => m.category.toLowerCase() === category.toLowerCase()).map(decorateModule);
}

/**
 * Retorna todas as categorias disponíveis e a quantidade de módulos em cada uma.
 * @returns {Record<string, number>}
 */
export function getCategoriesCount() {
  const counts = {};
  for (const mod of MODULES) {
    counts[mod.category] = (counts[mod.category] || 0) + 1;
  }
  return counts;
}

/**
 * Permite registrar um novo módulo dinamicamente em tempo de execução.
 * @param {import('../core/types.js').EmailServiceModule} customModule
 */
export function registerModule(customModule) {
  if (!customModule?.id || typeof customModule.check !== 'function') {
    throw new Error('Módulo inválido: deve conter ao menos "id" e método "check".');
  }
  const existingIndex = MODULES.findIndex((m) => m.id === customModule.id);
  if (existingIndex >= 0) {
    MODULES[existingIndex] = customModule;
  } else {
    MODULES.push(customModule);
  }
}
