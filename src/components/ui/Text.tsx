import { Text as RNText, TextProps as RNTextProps, StyleSheet } from 'react-native';
import { type } from '../../design/tokens';
import { useTheme } from '../../design/useTheme';

type Variant = keyof typeof type;

interface Props extends RNTextProps {
  variant?: Variant;
  /** Muted foreground for supporting copy. */
  dim?: boolean;
  faint?: boolean;
  color?: string;
  center?: boolean;
  uppercase?: boolean;
}

export function Text({
  variant = 'body',
  dim,
  faint,
  color,
  center,
  uppercase,
  style,
  ...rest
}: Props) {
  const t = useTheme();
  const resolved = color ?? (faint ? t.textFaint : dim ? t.textDim : t.text);
  return (
    <RNText
      {...rest}
      style={[
        type[variant],
        { color: resolved },
        center && styles.center,
        uppercase && styles.uppercase,
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  uppercase: { textTransform: 'uppercase' },
});
