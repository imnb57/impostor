import * as Haptics from 'expo-haptics';
import { useSettingsStore } from '../store/settingsStore';

/**
 * Every haptic in the app goes through here so the settings toggle is
 * honoured in one place. Failures are swallowed — a device without a
 * motor should never break an interaction.
 */
function enabled(): boolean {
  return useSettingsStore.getState().hapticsEnabled;
}

const run = (fn: () => Promise<void>) => {
  if (!enabled()) return;
  fn().catch(() => {});
};

export const haptics = {
  /** Light tick — list selection, stepper, segmented control. */
  select: () => run(() => Haptics.selectionAsync()),
  /** Standard button press. */
  tap: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  /** Weightier press — primary actions, starting a game. */
  press: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  /** The role card turning over. */
  reveal: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)),
  success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  warning: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  error: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};
