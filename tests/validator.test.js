import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidEmail,
  normalizeEmail,
  getEmailDomain,
  getEmailUsername,
  getUsernameVariations,
  isDisposableEmail
} from '../src/core/validator.js';

describe('Validador de E-mails', () => {
  it('deve validar e-mails com formatos válidos', () => {
    assert.equal(isValidEmail('usuario@dominio.com'), true);
    assert.equal(isValidEmail('nome.sobrenome@empresa.com.br'), true);
    assert.equal(isValidEmail('user+tag@gmail.com'), true);
  });

  it('deve rejeitar e-mails com formatos inválidos', () => {
    assert.equal(isValidEmail(''), false);
    assert.equal(isValidEmail('invalido'), false);
    assert.equal(isValidEmail('@dominio.com'), false);
    assert.equal(isValidEmail('usuario@'), false);
    assert.equal(isValidEmail('usuario@dominio'), false);
  });

  it('deve normalizar removendo espaços e convertendo para minúsculas', () => {
    assert.equal(normalizeEmail('  Usuario.Teste@GMAIL.COM  '), 'usuario.teste@gmail.com');
  });

  it('deve extrair username e domínio corretamente', () => {
    assert.equal(getEmailUsername('lucas@exemplo.com.br'), 'lucas');
    assert.equal(getEmailDomain('lucas@exemplo.com.br'), 'exemplo.com.br');
  });

  it('deve gerar variações heurísticas inteligentes de username (sem pontos, sem números finais)', () => {
    const vars = getUsernameVariations('carlos.mazini99');
    assert.ok(vars.includes('carlos.mazini99'));
    assert.ok(vars.includes('carlosmazini99'));
    assert.ok(vars.includes('carlos.mazini'));
    assert.ok(vars.includes('carlosmazini'));

    const varsUnderscore = getUsernameVariations('carlos_silva');
    assert.ok(varsUnderscore.includes('carlos_silva'));
    assert.ok(varsUnderscore.includes('carlossilva'));
    assert.ok(varsUnderscore.includes('carlos.silva'));
  });

  it('deve detectar provedores de e-mail temporários / descartáveis', () => {
    assert.equal(isDisposableEmail('alvo@10minutemail.com'), true);
    assert.equal(isDisposableEmail('alvo@tempmail.com'), true);
    assert.equal(isDisposableEmail('alvo@guerrillamail.com'), true);
    assert.equal(isDisposableEmail('alvo@gmail.com'), false);
    assert.equal(isDisposableEmail('alvo@outlook.com'), false);
  });
});

