import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import facebook from '../src/modules/social/facebook.js';
import tiktok from '../src/modules/social/tiktok.js';
import telegram from '../src/modules/social/telegram.js';
import gitlab from '../src/modules/tech/gitlab.js';
import steam from '../src/modules/entertainment/steam.js';
import linkedin from '../src/modules/productivity/linkedin.js';

describe('Novos Módulos Sociais, Carreira e Gaming', () => {
  it('Facebook deve identificar perfil público válido via OpenGraph', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({
      status: 200,
      text: async () => `
        <html>
          <head>
            <title>Lucas Silva | Facebook</title>
            <meta property="og:title" content="Lucas Silva" />
            <meta property="og:image" content="https://scontent.xx.fbcdn.net/avatar.jpg" />
            <meta property="og:description" content="Engenheiro de Software" />
          </head>
          <body><div>Perfil</div></body>
        </html>
      `
    });

    try {
      const res = await facebook.check('lucas@example.com');
      assert.equal(res.exists, true);
      assert.equal(res.metadata?.name, 'Lucas Silva');
      assert.equal(res.metadata?.avatarUrl, 'https://scontent.xx.fbcdn.net/avatar.jpg');
      assert.equal(res.metadata?.bio, 'Engenheiro de Software');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('Facebook não deve marcar perfil inexistente ("Este conteúdo não está disponível")', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({
      status: 200,
      text: async () => '<html><head><title>Facebook</title></head><body>Este conteúdo não está disponível no momento</body></html>'
    });

    try {
      const res = await facebook.check('inexistente999@example.com');
      assert.equal(res.exists, false);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('TikTok deve extrair dados de hidratação (JSON universal)', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({
      status: 200,
      text: async () => `
        <html>
          <head><title>Dev Lucas (@devlucas) | TikTok</title></head>
          <body>
            <script id="__UNIVERSAL_DATA_FOR_REHYDRATION__">
              {
                "__DEFAULT_SCOPE__": {
                  "webapp.user-detail": {
                    "userInfo": {
                      "user": {
                        "uniqueId": "devlucas",
                        "nickname": "Lucas Dev",
                        "avatarLarger": "https://p16-sign-va.tiktokcdn.com/hd.jpg",
                        "signature": "Criando códigos e inteligência artificial",
                        "verified": true
                      },
                      "stats": {
                        "followerCount": 12500,
                        "followingCount": 150,
                        "heartCount": 89000
                      }
                    }
                  }
                }
              }
            </script>
          </body>
        </html>
      `
    });

    try {
      const res = await tiktok.check('devlucas@gmail.com');
      assert.equal(res.exists, true);
      assert.equal(res.metadata?.name, 'Lucas Dev');
      assert.equal(res.metadata?.avatarUrl, 'https://p16-sign-va.tiktokcdn.com/hd.jpg');
      assert.equal(res.metadata?.extra?.followers, 12500);
      assert.equal(res.metadata?.extra?.verified, true);
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('Telegram deve identificar canal/perfil público ativo', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({
      status: 200,
      text: async () => `
        <html>
          <head><title>Telegram: Contact @devlucas</title></head>
          <body>
            <div class="tgme_page_title"><span dir="auto">Lucas Dev Channel</span></div>
            <div class="tgme_page_extra">@devlucas</div>
            <img class="tgme_page_photo_image" src="https://cdn4.telesco.pe/file/avatar.jpg">
            <div class="tgme_page_description">Canal oficial sobre automações e IA</div>
            <a class="tgme_action_button_new" href="#">Send Message</a>
          </body>
        </html>
      `
    });

    try {
      const res = await telegram.check('devlucas@gmail.com');
      assert.equal(res.exists, true);
      assert.equal(res.metadata?.name, 'Lucas Dev Channel');
      assert.equal(res.metadata?.avatarUrl, 'https://cdn4.telesco.pe/file/avatar.jpg');
      assert.equal(res.metadata?.bio, 'Canal oficial sobre automações e IA');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('Steam deve extrair persona, nome real, avatar e país', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({
      status: 200,
      text: async () => `
        <html>
          <body>
            <span class="actual_persona_name">GamerPro99</span>
            <div class="header_real_name ellipsis"><bdi>Carlos Mazini</bdi></div>
            <div class="playerAvatarAutoSizeInner"><img src="https://avatars.steamstatic.com/avatar_medium.jpg"></div>
            <div class="profile_summary">Gamer aficionado por FPS e RPGs</div>
            <div class="profile_flag">Brazil</div>
          </body>
        </html>
      `
    });

    try {
      const res = await steam.check('gamerpro99@gmail.com');
      assert.equal(res.exists, true);
      assert.ok(res.metadata?.name?.includes('GamerPro99'));
      assert.equal(res.metadata?.avatarUrl, 'https://avatars.steamstatic.com/avatar_full.jpg');
      assert.equal(res.metadata?.location, 'Brazil');
      assert.equal(res.metadata?.bio, 'Gamer aficionado por FPS e RPGs');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('Telegram não deve marcar página genérica de contato inexistente como encontrado', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async () => ({
      status: 200,
      text: async () => `
        <html>
          <head><title>Telegram: Contact @inexistente999</title></head>
          <body>
            <div class="tgme_page_extra">@inexistente999</div>
            <div class="tgme_page_description">If you have <strong>Telegram</strong>, you can contact <a class="tgme_username_link" href="tg://resolve?domain=inexistente999">@inexistente999</a> right away.</div>
            <a class="tgme_action_button_new" href="#">Send Message</a>
          </body>
        </html>
      `
    });

    try {
      const res = await telegram.check('inexistente999@gmail.com');
      assert.equal(res.exists, false, 'Página genérica de contato do Telegram deve ser marcada como exists: false');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('GitLab não deve marcar como encontrado buscas com resultados fuzzy que não batem com o username exato', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url) => {
      const urlStr = String(url);
      if (urlStr.includes('/users/sign_up/exists')) {
        return { status: 403, text: async () => 'Forbidden' };
      }
      if (urlStr.includes('/api/v4/users?username=cmazini')) {
        // Usuário cmazini não existe no GitLab
        return { status: 200, json: async () => [] };
      }
      if (urlStr.includes('/gitlab.com/cmazini')) {
        return { status: 404, text: async () => '404 Not Found' };
      }
      return { status: 404, text: async () => 'Not Found' };
    };

    try {
      const res = await gitlab.check('cmazini@gmail.com');
      assert.equal(res.exists, false, 'GitLab não deve marcar cmazini como encontrado se username não bater exatamente');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it('Facebook deve testar variações de username e encontrar perfil sem pontos', async () => {
    const originalFetch = globalThis.fetch;
    globalThis.fetch = async (url) => {
      const urlStr = String(url);
      if (urlStr.includes('carlos.mazini')) {
        // carlos.mazini não existe no Facebook
        return { status: 404, text: async () => 'Page not found' };
      }
      if (urlStr.includes('carlosmazini')) {
        // Variação sem ponto existe
        return {
          status: 200,
          text: async () => `
            <html>
              <head>
                <title>Carlos Mazini | Facebook</title>
                <meta property="og:title" content="Carlos Mazini" />
                <meta property="og:image" content="https://scontent.xx.fbcdn.net/carlosmazini.jpg" />
                <meta property="og:description" content="Engenheiro" />
              </head>
            </html>
          `
        };
      }
      return { status: 404, text: async () => 'Not found' };
    };

    try {
      const res = await facebook.check('carlos.mazini@gmail.com');
      assert.equal(res.exists, true);
      assert.equal(res.metadata?.username, 'carlosmazini');
      assert.equal(res.metadata?.extra?.heuristicHandle, true);
      assert.equal(res.metadata?.extra?.matchedVariation, 'carlosmazini');
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});

