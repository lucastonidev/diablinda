/**
 * @fileoverview Módulo Microsoft / Office 365 / Outlook / Xbox / Live ID.
 * Implementa verificação em duas etapas:
 * 1. Microsoft Online (Entra ID, Office 365, detecção de IsMSAccount).
 * 2. Microsoft Live (Contas pessoais criadas com Gmail, Yahoo, etc., para Windows, Xbox e OneDrive).
 * 3. Enriquecimento de Avatar via Skype Directory.
 * @type {import('../../core/types.js').EmailServiceModule}
 */

import { randomUUID } from 'node:crypto';
import { isWafOrBlocked } from '../../core/waf.js';

export default {
  id: 'office365',
  name: 'Microsoft / Office 365',
  category: 'productivity',
  url: 'https://office365.com',
  description: 'Verifica contas Microsoft pessoais (Xbox, Windows, OneDrive) e corporativas (Office 365, Teams).',

  async check(email, { signal, headers } = {}) {
    const urlMsol = 'https://login.microsoftonline.com/common/GetCredentialType';

    try {
      // 1. Etapa 1: Endpoint de Descoberta Microsoft Online
      const resMsol = await fetch(urlMsol, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'https://login.microsoftonline.com',
          'Referer': 'https://login.microsoftonline.com/'
        },
        body: JSON.stringify({
          username: email,
          isFirstLaunch: true,
          checkPhones: false
        }),
        signal
      });

      const textMsol = await resMsol.text();

      if (isWafOrBlocked(resMsol, textMsol)) {
        return { exists: false, rateLimited: true, error: 'Rate limit na Microsoft Online' };
      }

      let exists = false;
      let accountType = 'Conta Microsoft';
      let ifExistsResult = null;
      let isPersonalMSA = false;

      if (resMsol.status === 200) {
        try {
          const data = JSON.parse(textMsol);
          ifExistsResult = data?.IfExistsResult;

          // Se for conta corporativa / tenant / educacional ou Outlook nativo:
          // IfExistsResult 0 = Existe
          // IfExistsResult 5 = Existe em tenant institucional
          if (ifExistsResult === 0 || ifExistsResult === 5) {
            exists = true;
            accountType = data?.IsFederated ? 'Corporativa / Federada (Office 365)' : (ifExistsResult === 5 ? 'Institucional / Educacional' : 'Microsoft (Outlook / Hotmail)');
          }

          // Se for e-mail de terceiro (ex: @gmail.com) registrado como Conta Pessoal Microsoft:
          // A Microsoft retorna IfExistsResult: 1, mas IsMSAccount: true ou HasPassword: true!
          if (data?.IsMSAccount === true || data?.Credentials?.HasPassword === true) {
            exists = true;
            isPersonalMSA = true;
            accountType = 'Conta Pessoal Microsoft (Windows, Xbox, Skype, OneDrive)';
          }
        } catch {
          // prossegue para etapa 2
        }
      }

      // 2. Etapa 2: Fallback para o endpoint Live ID pessoal se ainda não confirmou
      if (!exists) {
        const urlLive = 'https://login.live.com/GetCredentialType.srf';
        const resLive = await fetch(urlLive, {
          method: 'POST',
          headers: {
            ...headers,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Origin': 'https://login.live.com',
            'Referer': 'https://login.live.com/'
          },
          body: JSON.stringify({
            username: email,
            uaid: randomUUID(),
            isFirstLaunch: true,
            checkPhones: false
          }),
          signal
        });

        if (resLive.status === 200) {
          const textLive = await resLive.text();
          if (!isWafOrBlocked(resLive, textLive)) {
            try {
              const liveData = JSON.parse(textLive);
              // No login.live.com, IfExistsResult 0 significa conta pessoal existente
              if (liveData?.IfExistsResult === 0 || liveData?.isExist === true) {
                exists = true;
                isPersonalMSA = true;
                accountType = 'Conta Pessoal Microsoft (MSA / Live ID)';
                ifExistsResult = 0;
              }
            } catch {
              // ignora falha de parse
            }
          }
        }
      }

      if (exists) {
        // 3. Etapa 3: Checa se há avatar público no Skype / Microsoft
        let avatarUrl = undefined;
        try {
          const skypeAvatarUrl = `https://avatar.skype.com/v1/avatar/${encodeURIComponent(email)}/profile`;
          const avatarRes = await fetch(skypeAvatarUrl, {
            method: 'HEAD',
            headers,
            signal
          });
          if (avatarRes.status === 200) {
            avatarUrl = skypeAvatarUrl;
          }
        } catch {
          // avatar opcional
        }

        return {
          exists: true,
          metadata: {
            profileUrl: isPersonalMSA ? 'https://account.microsoft.com' : 'https://www.office.com',
            avatarUrl,
            extra: {
              microsoftAccountType: accountType,
              isPersonalMSA,
              ifExistsResult,
              platform: 'Microsoft Identity Platform'
            }
          }
        };
      }

      return { exists: false };
    } catch (err) {
      if (err.name === 'AbortError') throw err;
      return { exists: false, error: err.message };
    }
  }
};
