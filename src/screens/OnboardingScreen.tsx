import { useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Button } from '../components/ui/Button';
import { Screen } from '../components/ui/Screen';
import { Text } from '../components/ui/Text';
import { TextField } from '../components/ui/TextField';
import { radius, space } from '../design/tokens';
import { useTheme } from '../design/useTheme';
import { haptics } from '../services/haptics';
import { useSettingsStore } from '../store/settingsStore';

interface Slide {
  emoji: string;
  title: string;
  body: string;
}

const SLIDES: Slide[] = [
  {
    emoji: '🕵️',
    title: 'One of you\nis lying',
    body: 'Everyone gets the same secret word — except the impostor, who only learns the category.',
  },
  {
    emoji: '🤫',
    title: 'Hold to see\nyour role',
    body: 'Press and hold your card so nobody can peek. Let go and it hides again instantly.',
  },
  {
    emoji: '💬',
    title: 'Describe it,\nnever say it',
    body: 'Take turns giving one-word clues. Too vague looks guilty. Too precise hands it to the impostor.',
  },
  {
    emoji: '🗳️',
    title: 'Vote out\nthe liar',
    body: 'Argue, accuse, then vote in secret. Catch the impostor to win the round.',
  },
];

export function OnboardingScreen() {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  const playerName = useSettingsStore((s) => s.playerName);
  const setPlayerName = useSettingsStore((s) => s.setPlayerName);
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);

  const isLast = index === SLIDES.length - 1;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const next = Math.round(e.nativeEvent.contentOffset.x / width);
    if (next !== index) {
      setIndex(next);
      haptics.select();
    }
  };

  const advance = () => {
    if (isLast) {
      haptics.success();
      completeOnboarding();
    } else {
      scrollRef.current?.scrollTo({ x: width * (index + 1), animated: true });
    }
  };

  return (
    <Screen bleed>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        style={styles.pager}
      >
        {SLIDES.map((slide, i) => (
          <View key={slide.title} style={[styles.slide, { width }]}>
            <Animated.View entering={FadeIn.delay(120)} style={styles.slideInner}>
              <Text style={styles.emoji}>{slide.emoji}</Text>
              <Text variant="display" center>
                {slide.title}
              </Text>
              <Text variant="body" dim center style={styles.body}>
                {slide.body}
              </Text>

              {i === SLIDES.length - 1 ? (
                <Animated.View entering={FadeInDown.delay(200)} style={styles.nameBlock}>
                  <TextField
                    label="Your name"
                    value={playerName}
                    onChangeText={setPlayerName}
                    placeholder="Used in online games"
                    maxLength={16}
                    autoCapitalize="words"
                    returnKeyType="done"
                  />
                </Animated.View>
              ) : null}
            </Animated.View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {SLIDES.map((slide, i) => (
            <View
              key={slide.title}
              style={[
                styles.dot,
                {
                  backgroundColor: i === index ? t.accent : t.stroke,
                  width: i === index ? 22 : 7,
                },
              ]}
            />
          ))}
        </View>

        <Button label={isLast ? "Let's play" : 'Next'} onPress={advance} />
        {!isLast ? (
          <Button
            label="Skip"
            variant="ghost"
            size="md"
            onPress={() => {
              haptics.tap();
              completeOnboarding();
            }}
          />
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  pager: { flex: 1 },
  slide: { flex: 1, justifyContent: 'center' },
  slideInner: { paddingHorizontal: space.xl, gap: space.base, alignItems: 'center' },
  emoji: { fontSize: 72, lineHeight: 82, marginBottom: space.sm },
  body: { maxWidth: 320 },
  nameBlock: { width: '100%', marginTop: space.lg },
  footer: { paddingHorizontal: space.xl, paddingBottom: space.base, gap: space.sm },
  dots: {
    flexDirection: 'row',
    gap: space.sm,
    justifyContent: 'center',
    marginBottom: space.lg,
    alignItems: 'center',
  },
  dot: { height: 7, borderRadius: radius.pill },
});
