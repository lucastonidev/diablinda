import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildTargetDossier, formatDossierMarkdown } from '../src/core/dossier.js';

describe('Construtor de Dossiê Unificado (dossier.js)', () => {
  it('deve consolidar nomes, avatares, bios e separar confiança de e-mail vs handle', () => {
    const mockResults = [
      {
        id: 'chesscom',
        service: 'Chess.com',
        category: 'education',
        exists: true,
        durationMs: 840,
        metadata: {
          username: 'cmazini',
          name: 'Carlos Mazini',
          avatarUrl: 'https://images.chesscomfiles.com/avatar.jpg',
          location: 'Brazil',
          profileUrl: 'https://www.chess.com/member/cmazini'
        }
      },
      {
        id: 'office365',
        service: 'Microsoft / Office 365',
        category: 'productivity',
        exists: true,
        durationMs: 310,
        metadata: {
          profileUrl: 'https://account.microsoft.com',
          extra: { microsoftAccountType: 'Pessoal' }
        }
      },
      {
        id: 'github',
        service: 'GitHub',
        category: 'tech',
        exists: false,
        durationMs: 120
      }
    ];

    const dossier = buildTargetDossier('cmazini@gmail.com', mockResults);

    assert.equal(dossier.targetEmail, 'cmazini@gmail.com');
    assert.deepEqual(dossier.names, ['Carlos Mazini']);
    assert.deepEqual(dossier.usernames, ['cmazini']);
    assert.deepEqual(dossier.avatars, ['https://images.chesscomfiles.com/avatar.jpg']);
    assert.deepEqual(dossier.locations, ['Brazil']);

    assert.equal(dossier.verifiedByEmail.length, 1, 'Office365 deve estar em verifiedByEmail');
    assert.equal(dossier.verifiedByEmail[0].id, 'office365');

    assert.equal(dossier.verifiedByHandle.length, 1, 'Chesscom deve estar em verifiedByHandle');
    assert.equal(dossier.verifiedByHandle[0].id, 'chesscom');

    const markdown = formatDossierMarkdown(dossier);
    assert.ok(markdown.includes('Carlos Mazini'));
    assert.ok(markdown.includes('cmazini@gmail.com'));
    assert.ok(markdown.includes('Contas Confirmadas Diretamente por E-mail'));
  });
});

