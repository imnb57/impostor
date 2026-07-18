import { useState } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { radius, space, type } from '../../design/tokens';
import { useTheme } from '../../design/useTheme';
import { Text } from './Text';

interface Props extends TextInputProps {
  label?: string;
  /** Centres and widens the text — used for the room code entry. */
  code?: boolean;
}

export function TextField({ label, code, style, ...rest }: Props) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      {label ? (
        <Text variant="label" dim uppercase style={styles.label}>
          {label}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={t.textFaint}
        selectionColor={t.accent}
        {...rest}
        onFocus={(e) => {
          setFocused(true);
          rest.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          rest.onBlur?.(e);
        }}
        style={[
          styles.input,
          code ? styles.code : type.body,
          {
            backgroundColor: t.surface,
            borderColor: focused ? t.accent : t.stroke,
            color: t.text,
          },
          style,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: space.sm },
  label: { marginLeft: space.xs },
  input: {
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: space.base,
    paddingVertical: space.base,
    minHeight: 56,
  },
  code: {
    fontFamily: 'Sora_800ExtraBold',
    fontSize: 30,
    letterSpacing: 12,
    textAlign: 'center',
    paddingLeft: space.base + 12,
  },
});
