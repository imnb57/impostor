import * as Updates from 'expo-updates';
import { useCallback, useState } from 'react';

export type UpdateState = 'idle' | 'checking' | 'downloading' | 'ready' | 'current' | 'error';

/**
 * Over-the-air updates. Expo checks on launch automatically; this exposes a
 * manual path so players can pull a fix without waiting for a relaunch —
 * and so the app can say plainly when it is already current.
 *
 * Only JavaScript and assets travel this way. Anything touching native code
 * still needs a fresh APK.
 */
export function useAppUpdates() {
  const [state, setState] = useState<UpdateState>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const check = useCallback(async () => {
    // In Expo Go / dev the updates module is inert; saying so beats failing.
    if (__DEV__ || !Updates.isEnabled) {
      setState('current');
      setMessage('Updates are only active in installed builds.');
      return;
    }
    try {
      setState('checking');
      setMessage(null);
      const result = await Updates.checkForUpdateAsync();
      if (!result.isAvailable) {
        setState('current');
        setMessage("You're on the latest version.");
        return;
      }
      setState('downloading');
      await Updates.fetchUpdateAsync();
      setState('ready');
      setMessage('Update ready — restart to apply.');
    } catch (error) {
      setState('error');
      setMessage(error instanceof Error ? error.message : 'Could not check for updates.');
    }
  }, []);

  const apply = useCallback(async () => {
    try {
      await Updates.reloadAsync();
    } catch {
      setState('error');
      setMessage('Could not restart — close and reopen the app.');
    }
  }, []);

  return { state, message, check, apply, runtimeVersion: Updates.runtimeVersion };
}
