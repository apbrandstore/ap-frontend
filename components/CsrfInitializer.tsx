'use client';

import { useEffect } from 'react';

export function CsrfInitializer() {
  useEffect(() => {
    // Fetch CSRF token on app initialization
    const initCsrf = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        await fetch(`${apiUrl}/api/csrf/`, {
          credentials: 'include',
        });
      } catch (error) {
        console.error('Failed to initialize CSRF token:', error);
      }
    };

    initCsrf();
  }, []);

  return null;
}

