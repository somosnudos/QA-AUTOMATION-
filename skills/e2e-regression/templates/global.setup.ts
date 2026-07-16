// Plantilla de global.setup.ts — login UNA vez vía Firebase → storageState.
// Calcada de mono-crm. Requiere PW_EMAIL, PW_PASSWORD, VITE_FIREBASE_KEY.
import fs from 'fs';

import { type FullConfig } from '@playwright/test';

interface IAuthResponse {
  email: string;
  emailVerified: boolean;
  localId: string;
  idToken: string;
  refreshToken: string;
  expiresIn: string;
}

async function globalSetup(config: FullConfig) {
  const use = config?.projects?.[0]?.use;
  if (!use) {
    console.warn('[global-setup] config sin projects[0].use');
    return;
  }
  const { baseURL } = use;
  const email = process.env.PW_EMAIL;
  const password = process.env.PW_PASSWORD;
  const firebaseKey = process.env.VITE_FIREBASE_KEY;

  fs.mkdirSync('e2e/.auth', { recursive: true });

  // Sin credenciales: sesión vacía (los tests de módulo se saltean solos).
  if (!email || !password) {
    console.warn('[global-setup] PW_EMAIL / PW_PASSWORD no seteados — auth omitida');
    fs.writeFileSync('e2e/.auth/user.json', JSON.stringify({ cookies: [], origins: [] }));
    return;
  }

  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true }),
      }
    );
    if (!res.ok) throw new Error(`[global-setup] Firebase auth falló: ${res.status} ${await res.text()}`);

    const data = (await res.json()) as IAuthResponse;
    const sessionLogin = {
      uid: data.localId,
      email: data.email,
      emailVerified: data.emailVerified ?? false,
      isAnonymous: false,
      stsTokenManager: {
        refreshToken: data.refreshToken,
        accessToken: data.idToken,
        expirationTime: Date.now() + parseInt(data.expiresIn) * 1000,
      },
    };

    const storageState = {
      cookies: [],
      origins: [
        {
          origin: baseURL,
          localStorage: [
            { name: 'sessionLogin', value: JSON.stringify(sessionLogin) },
            { name: `firebase:authUser:${firebaseKey}:[DEFAULT]`, value: JSON.stringify(sessionLogin) },
          ],
        },
      ],
    };

    fs.writeFileSync('e2e/.auth/user.json', JSON.stringify(storageState));
    console.log('[global-setup] Sesión guardada para', email);
  } catch (error) {
    console.error('[global-setup] Error de autenticación', error);
    throw error;
  }
}

export default globalSetup;
