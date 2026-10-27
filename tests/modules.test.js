import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { getAllModules, getModuleById, getModulesByCategory, registerModule } from '../src/modules/index.js';

describe('Catálogo de Módulos da Diablinda', () => {
  it('deve listar todos os módulos padrão', () => {
    const modules = getAllModules();
    assert.ok(modules.length >= 10, 'Deve conter ao menos 10 módulos registrados');

    for (const mod of modules) {
      assert.ok(typeof mod.id === 'string' && mod.id.length > 0, 'Módulo deve possuir id');
      assert.ok(typeof mod.name === 'string', 'Módulo deve possuir name');
      assert.ok(typeof mod.category === 'string', 'Módulo deve possuir category');
      assert.ok(typeof mod.check === 'function', 'Módulo deve possuir função check()');
    }
  });

  it('deve buscar módulos por id', () => {
    const gravatar = getModuleById('gravatar');
    assert.ok(gravatar);
    assert.equal(gravatar.id, 'gravatar');
    assert.equal(gravatar.category, 'tech');

    const duolingo = getModuleById('duolingo');
    assert.ok(duolingo);
    assert.equal(duolingo.id, 'duolingo');
    assert.equal(duolingo.category, 'education');
  });

  it('deve filtrar módulos por categoria', () => {
    const brasilMods = getModulesByCategory('brasil');
    assert.ok(brasilMods.length >= 3, 'Deve conter os módulos do ecossistema brasileiro');
    assert.ok(brasilMods.some((m) => m.id === 'vakinha'));
    assert.ok(brasilMods.some((m) => m.id === 'apoiase'));
    assert.ok(brasilMods.some((m) => m.id === 'jusbrasil'));
  });

  it('deve permitir registrar um módulo customizado dinamicamente', () => {
    registerModule({
      id: 'custom_mock',
      name: 'Custom Mock Service',
      category: 'social',
      check: async () => ({ exists: true })
    });

    const registered = getModuleById('custom_mock');
    assert.ok(registered);
    assert.equal(registered.name, 'Custom Mock Service');
  });
});

