import * as Sharing from 'expo-sharing';
import type { RefObject } from 'react';
import { Platform, Share, View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import type { RoundOutcome } from '../types';

export const APP_URL = 'https://imnb57.github.io/impostor/';

export function shareText(outcome: RoundOutcome, word: string): string {
  return `${outcome.headline} The word was "${word}". ${outcome.detail}\n\nPlay Impostor: ${APP_URL}`;
}

/**
 * Captures the recap card and hands it to the OS share sheet. Falls back to a
 * text share when image sharing is unavailable (web, or no share target), so
 * the button never dead-ends.
 */
export async function shareRecap(
  cardRef: RefObject<View | null>,
  outcome: RoundOutcome,
  word: string,
): Promise<void> {
  const fallback = () =>
    Share.share(
      Platform.OS === 'ios'
        ? { message: shareText(outcome, word), url: APP_URL }
        : { message: shareText(outcome, word) },
    );

  try {
    if (!cardRef.current || !(await Sharing.isAvailableAsync())) {
      await fallback();
      return;
    }
    const uri = await captureRef(cardRef, { format: 'png', quality: 1, result: 'tmpfile' });
    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      dialogTitle: 'Share your round',
      UTI: 'public.png',
    });
  } catch {
    // Capture can fail on odd devices — never let that swallow the action.
    await fallback().catch(() => {});
  }
}
