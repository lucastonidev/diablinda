import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isWafOrBlocked } from '../src/core/waf.js';

describe('Detector Anti-Falso Positivo e WAF', () => {
  it('deve identificar rate limit HTTP 429', () => {
    assert.equal(isWafOrBlocked({ status: 429 }, ''), true);
  });

  it('deve identificar bloqueio HTTP 403 Forbidden', () => {
    assert.equal(isWafOrBlocked({ status: 403 }, 'Forbidden'), true);
  });

  it('deve identificar desafios Cloudflare, Datadome e captchas no HTML', () => {
    assert.equal(isWafOrBlocked({ status: 200 }, '<title>Just a moment...</title>'), true);
    assert.equal(isWafOrBlocked({ status: 200 }, 'Attention Required! | Cloudflare'), true);
    assert.equal(isWafOrBlocked({ status: 200 }, 'cf-mitigated challenge-platform'), true);
    assert.equal(isWafOrBlocked({ status: 200 }, 'protected by datadome'), true);
  });

  it('não deve marcar como WAF respostas normais e legítimas', () => {
    assert.equal(isWafOrBlocked({ status: 200 }, '{"exists": true}'), false);
    assert.equal(isWafOrBlocked({ status: 200 }, '<html><head><title>User Profile</title></head></html>'), false);
  });
});

