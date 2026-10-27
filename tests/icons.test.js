import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getModuleIcon, getModuleColor, MODULE_ICONS, MODULE_COLORS } from '../src/core/icons.js';
import { getAllModules } from '../src/modules/index.js';

describe('Catálogo de Ícones SVG e Cores de Marca (icons.js)', () => {
  it('deve possuir ícones SVG e cores mapeados para as principais plataformas', () => {
    const googleSvg = getModuleIcon('google');
    assert.ok(googleSvg.startsWith('<svg'), 'Google deve retornar tag SVG');
    assert.equal(getModuleColor('google'), '#4285F4');

    const githubSvg = getModuleIcon('github');
    assert.ok(githubSvg.startsWith('<svg'));
    assert.equal(getModuleColor('github'), '#181717');

    const facebookSvg = getModuleIcon('facebook');
    assert.ok(facebookSvg.startsWith('<svg'));
    assert.equal(getModuleColor('facebook'), '#1877F2');
  });

  it('todos os módulos registrados via getAllModules() devem possuir iconSvg e color', () => {
    const modules = getAllModules();
    assert.ok(modules.length >= 50);

    for (const mod of modules) {
      assert.ok(mod.iconSvg, `Módulo ${mod.id} deve conter iconSvg`);
      assert.ok(mod.iconSvg.includes('<svg'), `Módulo ${mod.id} deve conter marcação SVG válida`);
      assert.ok(mod.color, `Módulo ${mod.id} deve conter propriedade color`);
      assert.ok(mod.color.startsWith('#'), `Módulo ${mod.id} deve possuir cor hexadecimal válida`);
    }
  });

  it('deve retornar fallback seguro para módulo desconhecido', () => {
    const fallbackSvg = getModuleIcon('desconhecido_xyz');
    assert.ok(fallbackSvg.startsWith('<svg'));
    assert.equal(getModuleColor('desconhecido_xyz'), '#6c757d');
  });
});

