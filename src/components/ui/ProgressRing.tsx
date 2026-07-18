import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedProps, useDerivedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useGradient, useTheme } from '../../design/useTheme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface Props {
  /** 0 → 1, where 1 is a full ring. */
  progress: number;
  size?: number;
  thickness?: number;
  /** Overrides the gradient with a flat colour (e.g. danger near zero). */
  color?: string;
  children?: React.ReactNode;
}

/** Circular countdown indicator drawn with a stroke-dash offset. */
export function ProgressRing({ progress, size = 240, thickness = 12, color, children }: Props) {
  const t = useTheme();
  const gradient = useGradient();
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;

  const animatedProgress = useDerivedValue(() =>
    withTiming(Math.min(Math.max(progress, 0), 1), { duration: 380 }),
  );

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={styles.svg}>
        <Defs>
          <LinearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0%" stopColor={gradient[0]} />
            <Stop offset="50%" stopColor={gradient[1]} />
            <Stop offset="100%" stopColor={gradient[2]} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={t.stroke}
          strokeWidth={thickness}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color ?? 'url(#ringGradient)'}
          strokeWidth={thickness}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          // start the sweep at 12 o'clock
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  svg: { position: 'absolute' },
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
});
