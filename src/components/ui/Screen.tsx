import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { space } from '../../design/tokens';
import { useTheme } from '../../design/useTheme';
import { Aurora } from './Aurora';

interface Props {
  children: ReactNode;
  scroll?: boolean;
  /** Drop the ambient background (used by the splash, which draws its own). */
  plain?: boolean;
  /** Remove default horizontal padding for edge-to-edge layouts. */
  bleed?: boolean;
  contentStyle?: ViewStyle;
}

export function Screen({ children, scroll, plain, bleed, contentStyle }: Props) {
  const t = useTheme();
  const padding = bleed ? undefined : space.xl;

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      {plain ? null : <Aurora />}
      <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
        {scroll ? (
          <ScrollView
            contentContainerStyle={[
              { padding, paddingBottom: space.huge },
              contentStyle,
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.content, { padding }, contentStyle]}>{children}</View>
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  content: { flex: 1 },
});
