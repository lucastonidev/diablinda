/**
 * @fileoverview Módulo Duolingo.
 * Consulta o endpoint público da API do Duolingo e extrai metadados riquíssimos:
 * foto original em alta resolução, nome completo, @username, idiomas estudados, XP e ofensiva (streak).
 * @type {import('../../core/types.js').EmailServiceModule}
 */

export default {
  id: 'duolingo',
  name: 'Duolingo',
  category: 'education',
  url: 'https://www.duolingo.com',
  description: 'Verifica contas no Duolingo, extraindo idiomas, streak, XP e avatar HD.',

  async check(email, { signal, headers } = {}) {
    const url = `https://www.duolingo.com/2017-06-30/users?email=${encodeURIComponent(email)}`;

    try {
      const res = await fetch(url, {
        headers: {
          ...headers,
          'Accept': 'application/json'
        },
        signal
      });

      if (res.status === 429) {
        return { exists: false, rateLimited: true, error: 'Rate limit no Duolingo' };
      }

      if (res.status === 200) {
        const data = await res.json();
        const users = data?.users;

        if (Array.isArray(users) && users.length > 0) {
          const user = users[0];
          const courses = Array.isArray(user.courses)
            ? user.courses.map((c) => ({
                title: c.title,
                learningLanguage: c.learningLanguage,
                xp: c.xp
              }))
            : [];

          let avatarUrl = user.picture;
          if (avatarUrl && avatarUrl.startsWith('//')) {
            avatarUrl = `https:${avatarUrl}`;
          }
          if (avatarUrl && !avatarUrl.includes('/medium') && !avatarUrl.includes('/large')) {
            avatarUrl = `${avatarUrl}/large`;
          }

          let createdAt = undefined;
          if (user.creationDate) {
            createdAt = new Date(user.creationDate * 1000).toISOString();
          }

          return {
            exists: true,
            metadata: {
              name: user.name,
              username: user.username,
              avatarUrl,
              profileUrl: user.username ? `https://www.duolingo.com/profile/${user.username}` : undefined,
              accountCreatedAt: createdAt,
              extra: {
                duolingoId: user.id,
                streak: user.streak,
                totalXp: user.totalXp,
                learningLanguage: user.learningLanguage,
                courses
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

