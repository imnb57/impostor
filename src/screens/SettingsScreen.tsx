import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Screen } from '../components/ui/Screen';
import { Stepper } from '../components/ui/Stepper';
import { Text } from '../components/ui/Text';
import { Toggle } from '../components/ui/Toggle';
import { CATEGORY_OPTIONS } from '../constants/categories';
import { gradientStops, PALETTES } from '../design/palettes';
import { radius, space } from '../design/tokens';
import { useTheme } from '../design/useTheme';
import { haptics } from '../services/haptics';
import { useAppUpdates } from '../hooks/useAppUpdates';
import { useSettingsStore } from '../store/settingsStore';
import type { ScreenProps } from '../types/navigation';

export function SettingsScreen({ navigation }: ScreenProps<'Settings'>) {
  const t = useTheme();
  const s = useSettingsStore();
  const updates = useAppUpdates();

  return (
    <Screen scroll>
      <Animated.View entering={FadeInDown.springify().damping(18)} style={styles.header}>
        <Text variant="title">Settings</Text>
        <Text variant="caption" faint>
          Make it yours.
        </Text>
      </Animated.View>

      <Section title="Theme" hint="Changes the whole app">
        <View style={styles.themes}>
          {PALETTES.map((palette) => {
            const selected = palette.id === s.paletteId;
            return (
              <Pressable
                key={palette.id}
                onPress={() => {
                  haptics.select();
                  s.setPaletteId(palette.id);
                }}
                style={styles.themeCell}
              >
                <LinearGradient
                  colors={gradientStops(palette)}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[
                    styles.swatch,
                    { borderColor: selected ? t.text : 'transparent', borderWidth: selected ? 3 : 0 },
                  ]}
                />
                <Text variant="caption" color={selected ? t.text : t.textFaint} center>
                  {palette.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Section>

      <Section title="Feel">
        <Card>
          <Toggle
            label="Haptics"
            hint="Vibration on reveals, votes and taps"
            value={s.hapticsEnabled}
            onChange={s.setHapticsEnabled}
          />
          <View style={[styles.divider, { backgroundColor: t.stroke }]} />
          <Toggle
            label="Ambient motion"
            hint="Drifting background and flourishes"
            value={s.motionEnabled}
            onChange={s.setMotionEnabled}
          />
        </Card>
      </Section>

      <Section title="Game defaults" hint="Pre-filled when you start a new game">
        <Card>
          <Stepper
            label="Impostors"
            value={String(s.defaultImpostorCount)}
            onDecrement={() => s.setDefaults({ defaultImpostorCount: Math.max(1, s.defaultImpostorCount - 1) })}
            onIncrement={() => s.setDefaults({ defaultImpostorCount: Math.min(5, s.defaultImpostorCount + 1) })}
            minusDisabled={s.defaultImpostorCount <= 1}
            plusDisabled={s.defaultImpostorCount >= 5}
          />
          <View style={[styles.divider, { backgroundColor: t.stroke }]} />
          <Stepper
            label="Discussion timer"
            value={`${Math.round(s.defaultTimerSeconds / 60)} min`}
            onDecrement={() => s.setDefaults({ defaultTimerSeconds: Math.max(60, s.defaultTimerSeconds - 60) })}
            onIncrement={() => s.setDefaults({ defaultTimerSeconds: Math.min(600, s.defaultTimerSeconds + 60) })}
            minusDisabled={s.defaultTimerSeconds <= 60}
            plusDisabled={s.defaultTimerSeconds >= 600}
          />
          <View style={[styles.divider, { backgroundColor: t.stroke }]} />
          {/* Label above rather than beside: a fixed-width chip per category
              overflowed the row on narrow screens with nowhere to scroll. */}
          <View style={styles.categoryBlock}>
            <Text variant="bodyStrong">Category</Text>
            <View style={styles.categoryChips}>
              {CATEGORY_OPTIONS.map((c) => {
                const on = c.id === s.defaultCategoryId;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => {
                      haptics.select();
                      s.setDefaults({ defaultCategoryId: c.id });
                    }}
                    style={[
                      styles.miniChip,
                      {
                        backgroundColor: on ? t.accent : t.surface,
                        borderColor: on ? t.accent : t.stroke,
                      },
                    ]}
                  >
                    <Text variant="caption" color={on ? t.onAccent : t.textDim}>
                      {c.emoji}  {c.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Card>
      </Section>

      <Section title="About">
        <Card>
          <View style={styles.aboutRow}>
            <Text variant="caption" dim>
              Version
            </Text>
            <Text variant="caption">{Constants.expoConfig?.version ?? '—'}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: t.stroke }]} />
          <Button
            label={
              updates.state === 'checking'
                ? 'Checking…'
                : updates.state === 'downloading'
                  ? 'Downloading…'
                  : updates.state === 'ready'
                    ? 'Restart to update'
                    : 'Check for updates'
            }
            variant="ghost"
            size="md"
            onPress={updates.state === 'ready' ? updates.apply : updates.check}
          />
          {updates.message ? (
            <Text variant="caption" faint center>
              {updates.message}
            </Text>
          ) : null}
          <View style={[styles.divider, { backgroundColor: t.stroke }]} />
          <Button
            label="Replay the intro"
            variant="ghost"
            size="md"
            onPress={() => {
              s.resetOnboarding();
              navigation.popToTop();
            }}
          />
        </Card>
      </Section>

      <Button label="Done" variant="glass" onPress={() => navigation.goBack()} style={styles.done} />
    </Screen>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(80).springify().damping(18)} style={styles.section}>
      <Text variant="label" dim uppercase>
        {title}
      </Text>
      {hint ? (
        <Text variant="caption" faint style={styles.sectionHint}>
          {hint}
        </Text>
      ) : null}
      <View style={styles.sectionBody}>{children}</View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: space.xl, gap: space.xs },
  section: { marginBottom: space.xl },
  sectionHint: { marginTop: 2 },
  sectionBody: { marginTop: space.md },
  themes: { flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  themeCell: { alignItems: 'center', gap: space.sm, width: 64 },
  swatch: { width: 56, height: 56, borderRadius: radius.lg },
  divider: { height: 1, marginVertical: space.sm },
  categoryBlock: { paddingVertical: space.sm, gap: space.md },
  categoryChips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm },
  miniChip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    paddingVertical: space.sm + 2,
    paddingHorizontal: space.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: space.sm },
  done: { marginTop: space.sm },
});
