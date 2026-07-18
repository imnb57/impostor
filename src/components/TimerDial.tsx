import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { space } from '../design/tokens';
import { useTheme } from '../design/useTheme';
import { formatSeconds } from '../hooks/useCountdown';
import { haptics } from '../services/haptics';
import { ProgressRing } from './ui/ProgressRing';
import { Text } from './ui/Text';

interface Props {
  secondsLeft: number;
  totalSeconds: number;
  caption?: string;
}

const WARN_AT = 30;
const URGENT_AT = 10;

/** Countdown ring shared by local and online discussion phases. */
export function TimerDial({ secondsLeft, totalSeconds, caption }: Props) {
  const t = useTheme();
  const pulse = useSharedValue(1);
  const lastTick = useRef<number>(secondsLeft);

  const urgent = secondsLeft <= URGENT_AT && secondsLeft > 0;
  const warning = secondsLeft <= WARN_AT && secondsLeft > URGENT_AT;

  // One haptic as each threshold is crossed, plus a tick per second at the end.
  useEffect(() => {
    const prev = lastTick.current;
    lastTick.current = secondsLeft;
    if (prev === secondsLeft) return;
    if (secondsLeft === WARN_AT) haptics.warning();
    else if (secondsLeft <= URGENT_AT && secondsLeft > 0) haptics.tap();
    else if (secondsLeft === 0) haptics.error();
  }, [secondsLeft]);

  useEffect(() => {
    if (!urgent) {
      pulse.value = withTiming(1, { duration: 200 });
      return;
    }
    pulse.value = withRepeat(
      withSequence(withTiming(1.045, { duration: 420 }), withTiming(1, { duration: 420 })),
      -1,
      false,
    );
  }, [urgent, pulse]);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));
  const progress = totalSeconds > 0 ? secondsLeft / totalSeconds : 0;
  const ringColor = urgent ? t.danger : warning ? t.warning : undefined;

  return (
    <Animated.View style={style}>
      <ProgressRing progress={progress} color={ringColor} size={250} thickness={14}>
        <View style={styles.center}>
          <Text
            variant="display"
            style={styles.time}
            color={urgent ? t.danger : warning ? t.warning : t.text}
          >
            {formatSeconds(secondsLeft)}
          </Text>
          {caption ? (
            <Text variant="caption" faint center>
              {caption}
            </Text>
          ) : null}
        </View>
      </ProgressRing>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', gap: space.xs },
  time: { fontSize: 52, lineHeight: 58, fontVariant: ['tabular-nums'] },
});
