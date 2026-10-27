import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isHtmlProfileNotFound, hasPositiveProfileProof } from '../src/core/profile-validator.js';

describe('Validador de Soft-404 para Perfis HTML', () => {
  it('deve identificar a tela de Profile Not Found do Codecademy', () => {
    const codecademyHtml = `
      <!doctype html>
      <html>
        <head>
          <title>Profile Not Found | Codecademy</title>
          <link rel="canonical" href="https://www.codecademy.com/profiles/cmazini" />
        </head>
        <body>
          <div class="gamut-123">
            <h1>This profile could not be found</h1>
          </div>
        </body>
      </html>
    `;

    assert.equal(isHtmlProfileNotFound(codecademyHtml, 'cmazini'), true);
    assert.equal(hasPositiveProfileProof(codecademyHtml, 'cmazini'), false);
  });

  it('deve identificar páginas 404 genéricas e mensagens de usuário inexistente', () => {
    assert.equal(isHtmlProfileNotFound('<html><head><title>404 Not Found</title></head></html>'), true);
    assert.equal(isHtmlProfileNotFound('<html><body>Sorry, this page isn\'t available.</body></html>'), true);
    assert.equal(isHtmlProfileNotFound('<html><body>This user could not be found</body></html>'), true);
    assert.equal(isHtmlProfileNotFound('<html><head><title>User Not Found</title></head></html>'), true);
  });

  it('não deve marcar como 404 páginas reais com dados de perfil legítimos', () => {
    const realProfileHtml = `
      <!doctype html>
      <html>
        <head>
          <title>cmazini on CodePen</title>
          <meta property="og:type" content="profile" />
        </head>
        <body>
          <div class="profile-header">
            <h1 itemprop="name">Carlos Mazini</h1>
          </div>
        </body>
      </html>
    `;

    assert.equal(isHtmlProfileNotFound(realProfileHtml, 'cmazini'), false);
    assert.equal(hasPositiveProfileProof(realProfileHtml, 'cmazini'), true);
  });
});

