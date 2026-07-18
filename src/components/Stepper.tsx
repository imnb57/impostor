import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, font, radius, spacing } from '../constants/theme';

interface Props {
  label: string;
  valueLabel: string;
  onDecrement: () => void;
  onIncrement: () => void;
  decrementDisabled?: boolean;
  incrementDisabled?: boolean;
}

export function Stepper({
  label,
  valueLabel,
  onDecrement,
  onIncrement,
  decrementDisabled,
  incrementDisabled,
}: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.controls}>
        <StepButton symbol="−" onPress={onDecrement} disabled={decrementDisabled} />
        <Text style={styles.value}>{valueLabel}</Text>
        <StepButton symbol="+" onPress={onIncrement} disabled={incrementDisabled} />
      </View>
    </View>
  );
}

function StepButton({
  symbol,
  onPress,
  disabled,
}: {
  symbol: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.stepButton,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <Text style={styles.stepSymbol}>{symbol}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  label: {
    color: colors.text,
    fontSize: font.body,
    flexShrink: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepButton: {
    width: 40,
    height: 40,
    borderRadius: radius.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: colors.cardPressed,
  },
  disabled: {
    opacity: 0.35,
  },
  stepSymbol: {
    color: colors.text,
    fontSize: font.heading,
    lineHeight: font.heading + 2,
  },
  value: {
    color: colors.text,
    fontSize: font.body,
    fontWeight: '700',
    minWidth: 56,
    textAlign: 'center',
  },
});
