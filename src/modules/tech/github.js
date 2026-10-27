/**
 * @fileoverview Módulo GitHub.
 * Investiga usuários públicos e commits vinculados ao e-mail através da API pública do GitHub.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

export default {
  id: 'github',
  name: 'GitHub',
  category: 'tech',
  url: 'https://github.com',
  description: 'Verifica contas públicas, commits e perfil de desenvolvedor no GitHub.',

  async check(email, { signal, headers } = {}) {
    const customHeaders = {
      ...headers,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'Diablinda-OSINT-Scanner/1.0'
    };

    try {
      // 1. Busca por usuário com e-mail público
      const userSearchUrl = `https://api.github.com/search/users?q=${encodeURIComponent(email)}+in:email`;
      const res = await fetch(userSearchUrl, { headers: customHeaders, signal });

      if (res.status === 403 || res.status === 429) {
        return { exists: false, rateLimited: true, error: 'GitHub API rate limit atingido' };
      }

      if (res.status === 200) {
        const data = await res.json();
        if (data.total_count > 0 && data.items?.[0]) {
          const user = data.items[0];
          return {
            exists: true,
            metadata: {
              username: user.login,
              avatarUrl: user.avatar_url,
              profileUrl: user.html_url,
              extra: {
                githubId: user.id,
                type: user.type,
                siteAdmin: user.site_admin
              }
            }
          };
        }
      }

      // 2. Busca por commits públicos assinados com o e-mail (caso o e-mail não esteja público no perfil)
      const commitSearchUrl = `https://api.github.com/search/commits?q=author-email:${encodeURIComponent(email)}&sort=author-date&order=desc`;
      const commitRes = await fetch(commitSearchUrl, {
        headers: {
          ...customHeaders,
          'Accept': 'application/vnd.github.cloak-preview+json'
        },
        signal
      });

      if (commitRes.status === 200) {
        const commitData = await commitRes.json();
        if (commitData.total_count > 0 && commitData.items?.[0]) {
          const item = commitData.items[0];
          const author = item.author;
          const commitAuthor = item.commit?.author;

          return {
            exists: true,
            metadata: {
              name: commitAuthor?.name,
              username: author?.login,
              avatarUrl: author?.avatar_url,
              profileUrl: author?.html_url || (author?.login ? `https://github.com/${author.login}` : undefined),
              extra: {
                lastCommitDate: commitAuthor?.date,
                repository: item.repository?.full_name,
                commitMessage: item.commit?.message?.slice(0, 100)
              }
            }
          };
        }
      }

      return { exists: false };
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      return { exists: false, error: err.message };
    }
  }
};

