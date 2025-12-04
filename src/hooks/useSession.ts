import { useState, useEffect } from 'react';
import { getSession, isAuthenticated, validateToken } from '../utils/auth';

export const useSession = () => {
  const [session, setSession] = useState<{
    token: string | null;
    refreshToken: string | null;
    isValid: boolean;
  }>({
    token: null,
    refreshToken: null,
    isValid: false,
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkSession = () => {
      try {
        const { token, refreshToken } = getSession();
        let isValid = false;

        if (token) {
          try {
            validateToken(token);
            isValid = true;
          } catch (error) {
            isValid = false;
          }
        }

        setSession({
          token,
          refreshToken,
          isValid,
        });
      } catch (error) {
        setSession({
          token: null,
          refreshToken: null,
          isValid: false,
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Set up interval to check session validity
    const interval = setInterval(checkSession, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(interval);
  }, []);

  const refreshSession = () => {
    const { token, refreshToken } = getSession();
    let isValid = false;

    if (token) {
      try {
        validateToken(token);
        isValid = true;
      } catch (error) {
        isValid = false;
      }
    }

    setSession({
      token,
      refreshToken,
      isValid,
    });
  };

  return {
    session,
    isLoading,
    isAuthenticated: session.isValid,
    refreshSession,
  };
};