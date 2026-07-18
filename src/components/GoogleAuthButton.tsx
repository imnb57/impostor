import { Pressable, StyleSheet } from 'react-native';
import { radius, space } from '../design/tokens';
import { useTheme } from '../design/useTheme';
import { useGoogleSignIn } from '../hooks/useGoogleSignIn';
import { haptics } from '../services/haptics';
import type { GoogleProfile } from '../services/googleAuth';
import { Text } from './ui/Text';

interface Props {
  onSignedIn?: (profile: GoogleProfile | null) => void;
}

/**
 * Isolated because expo-auth-session's Google hook throws outright when the
 * client ID for the current platform is missing — mounting it only when the
 * IDs exist keeps an unconfigured build from crashing the screen.
 * Callers must check canUseGoogleSignIn() before rendering this.
 */
export function GoogleAuthButton({ onSignedIn }: Props) {
  const t = useTheme();
  const google = useGoogleSignIn(onSignedIn);

  if (!google.available) return null;

  return (
    <>
      <Pressable
        onPress={() => {
          haptics.tap();
          google.signIn();
        }}
        style={[styles.btn, { borderColor: t.stroke, backgroundColor: t.surface }]}
      >
        <Text variant="caption" dim>
          {google.busy ? 'Signing in…' : 'Continue with Google'}
        </Text>
      </Pressable>
      {google.error ? (
        <Text variant="caption" color={t.danger} center>
          {google.error}
        </Text>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: space.md,
    alignItems: 'center',
  },
});
