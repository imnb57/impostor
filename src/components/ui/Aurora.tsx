import { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useMotion, useTheme } from '../../design/useTheme';

interface OrbProps {
  color: string;
  size: number;
  left: number;
  top: number;
  drift: [number, number];
  duration: number;
  opacity: number;
  id: string;
  animate: boolean;
}

/** A soft radial-gradient blob. SVG gives us the blur for free. */
function Orb({ color, size, left, top, drift, duration, opacity, id, animate }: OrbProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!animate) {
      progress.value = 0;
      return;
    }
    progress.value = withRepeat(
      withTiming(1, { duration, easing: Easing.inOut(Easing.quad) }),
      -1,
      true,
    );
  }, [animate, duration, progress]);

  const style = useAnimatedStyle(() => ({
    transform: [
      { translateX: progress.value * drift[0] },
      { translateY: progress.value * drift[1] },
      { scale: 1 + progress.value * 0.14 },
    ],
  }));

  return (
    <Animated.View style={[{ position: 'absolute', left, top, width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id={id} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor={color} stopOpacity={opacity} />
            <Stop offset="65%" stopColor={color} stopOpacity={opacity * 0.35} />
            <Stop offset="100%" stopColor={color} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill={`url(#${id})`} />
      </Svg>
    </Animated.View>
  );
}

/**
 * Ambient background used on every screen. Three slow-drifting orbs in the
 * active palette — the app's signature atmosphere.
 */
export function Aurora() {
  const t = useTheme();
  const motion = useMotion();
  const { width, height } = useWindowDimensions();
  const base = Math.max(width, height);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Orb
        id="auroraA"
        color={t.accent}
        size={base * 0.95}
        left={-base * 0.3}
        top={-base * 0.28}
        drift={[base * 0.1, base * 0.08]}
        duration={17000}
        opacity={0.5}
        animate={motion}
      />
      <Orb
        id="auroraB"
        color={t.accentEnd}
        size={base * 0.85}
        left={width - base * 0.5}
        top={height * 0.1}
        drift={[-base * 0.09, base * 0.1]}
        duration={21000}
        opacity={0.38}
        animate={motion}
      />
      <Orb
        id="auroraC"
        color={t.accentMid}
        size={base * 0.8}
        left={width * 0.1}
        top={height - base * 0.45}
        drift={[base * 0.08, -base * 0.09]}
        duration={19000}
        opacity={0.34}
        animate={motion}
      />
    </View>
  );
}
