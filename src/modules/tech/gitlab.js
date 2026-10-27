/**
 * @fileoverview Módulo GitLab.
 * Verificação DIRETA de existência de e-mail no GitLab via endpoint oficial de signup
 * e verificação estrita por correspondência EXATA de username (evita falsos positivos de busca fuzzy).
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { getEmailUsername } from '../../core/validator.js';
import { isWafOrBlocked } from '../../core/waf.js';
import { isHtmlProfileNotFound } from '../../core/profile-validator.js';

export default {
  id: 'gitlab',
  name: 'GitLab',
  category: 'tech',
  url: 'https://gitlab.com',
  description: 'Verifica existência direta de e-mail e perfis de desenvolvedores no GitLab.',

  async check(email, { signal, headers } = {}) {
    const username = getEmailUsername(email);

    // 1. Verificação DIRETA por e-mail no endpoint de disponibilidade de cadastro do GitLab
    try {
      const existsUrl = `https://gitlab.com/users/sign_up/exists?email=${encodeURIComponent(email)}`;
      const existsRes = await fetch(existsUrl, {
        headers: {
          ...headers,
          'Accept': 'application/json',
          'Referer': 'https://gitlab.com/users/sign_up'
        },
        signal
      });

      if (existsRes.status === 200) {
        const data = await existsRes.json();
        // data.exists: true = e-mail já cadastrado no GitLab
        if (typeof data?.exists === 'boolean' && data.exists === true) {
          let metadata = {
            profileUrl: 'https://gitlab.com',
            extra: { verifiedByEmail: true, gitlabAccount: true }
          };

          // Tenta enriquecer buscando o usuário exato pelo handle
          if (username) {
            try {
              const exactUrl = `https://gitlab.com/api/v4/users?username=${encodeURIComponent(username)}`;
              const userRes = await fetch(exactUrl, { headers, signal });
              if (userRes.status === 200) {
                const users = await userRes.json();
                const exact = Array.isArray(users) ? users.find((u) => u.username?.toLowerCase() === username.toLowerCase()) : null;
                if (exact) {
                  metadata = {
                    name: exact.name,
                    username: exact.username,
                    avatarUrl: exact.avatar_url,
                    profileUrl: exact.web_url,
                    location: exact.location,
                    bio: exact.bio,
                    extra: {
                      verifiedByEmail: true,
                      gitlabId: exact.id
                    }
                  };
                }
              }
            } catch {
              // mantém metadados básicos
            }
          }

          return {
            exists: true,
            metadata
          };
        }

        if (typeof data?.exists === 'boolean' && data.exists === false) {
          return { exists: false };
        }
      }
    } catch {
      // segue para fallback
    }

    // 2. Fallback de API pública com checagem estrita de username EXATO (evita falsos positivos de search fuzzy)
    if (!username) return { exists: false };

    try {
      const exactUrl = `https://gitlab.com/api/v4/users?username=${encodeURIComponent(username)}`;
      const res = await fetch(exactUrl, {
        headers: {
          ...headers,
          'Accept': 'application/json'
        },
        signal
      });

      if (isWafOrBlocked(res)) {
        return { exists: false, rateLimited: true, error: 'Rate limit no GitLab' };
      }

      if (res.status === 200) {
        const users = await res.json();
        if (Array.isArray(users)) {
          const exactUser = users.find((u) => u.username?.toLowerCase() === username.toLowerCase());
          if (exactUser) {
            return {
              exists: true,
              metadata: {
                name: exactUser.name,
                username: exactUser.username,
                avatarUrl: exactUser.avatar_url,
                profileUrl: exactUser.web_url,
                location: exactUser.location,
                bio: exactUser.bio,
                extra: {
                  platform: 'GitLab',
                  gitlabId: exactUser.id,
                  state: exactUser.state
                }
              }
            };
          }
        }
      }

      // 3. Fallback de página pública do perfil
      const profileUrl = `https://gitlab.com/${encodeURIComponent(username)}`;
      const profRes = await fetch(profileUrl, {
        headers: {
          ...headers,
          'Accept': 'text/html,application/xhtml+xml',
          'Referer': 'https://gitlab.com/'
        },
        signal
      });

      if (profRes.status === 200) {
        const bodyText = await profRes.text();
        if (!isHtmlProfileNotFound(bodyText, username) && (bodyText.includes(`@${username}`) || bodyText.includes('data-user='))) {
          const titleMatch = bodyText.match(/<title[^>]*>([^<]+)<\/title>/i);
          const title = titleMatch ? titleMatch[1] : '';
          if (title.toLowerCase().includes(username.toLowerCase()) && !title.includes('404')) {
            return {
              exists: true,
              metadata: {
                username,
                profileUrl,
                extra: { platform: 'GitLab' }
              }
            };
          }
        }
      }

      return { exists: false };
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      return { exists: false, error: err.message };
    }
  }
};
