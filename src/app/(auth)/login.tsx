import { AppButton, AppInput, AppText, Divider, FadeSlideIn } from '@/components/ui';
import { PressableScale } from '@/components/ui/motion';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { BackendService } from '@/services/backend';
import { SafeStorage } from '@/services/safeStorage';
import { useRouter } from 'expo-router';
import { Fingerprint, Lock, Mail, ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const animatedFormStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  const switchMode = (next: 'signin' | 'signup') => {
    opacity.value = withTiming(0, { duration: 150 });
    translateX.value = withTiming(40, { duration: 150 }, () => {
      runOnJS(setMode)(next);
      translateX.value = -40;
      opacity.value = 0;
      translateX.value = withTiming(0, { duration: 220 });
      opacity.value = withTiming(1, { duration: 220 });
    });
  };

  const handleAuth = async () => {
    if (!email.trim() || password.length < 6) {
      Alert.alert('Details Required', 'Enter a valid email and a password with at least 6 characters.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (mode === 'signup') {
        const result = await BackendService.signUp(email.trim(), password);
        if (!result.session) {
          Alert.alert('Check Your Email', 'Your account was created. Confirm your email, then sign in.');
          switchMode('signin');
          return;
        }
      } else {
        await BackendService.signIn(email.trim(), password);
      }
      await SafeStorage.removeItem('@ledger_guest_session');
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert(
        mode === 'signup' ? 'Sign Up Failed' : 'Sign In Failed',
        error instanceof Error ? error.message : 'Unable to authenticate.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuest = async () => {
    await SafeStorage.setItem('@ledger_guest_session', 'true');
    router.replace('/(tabs)');
  };

  const isSignUp = mode === 'signup';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Brand Header */}
        <FadeSlideIn index={0}>
          <View style={styles.brandSection}>
            <View style={styles.logoBadge}>
              <ShieldCheck size={26} color="#00181A" />
            </View>
            <AppText variant="title" tone="onDark" style={styles.brandTitle}>
              LEDGER
            </AppText>
            <AppText variant="body" tone="onDarkMuted" center>
              Private expense tracking, ready when you are
            </AppText>
          </View>
        </FadeSlideIn>

        {/* Mode Toggle */}
        <FadeSlideIn index={1}>
          <View style={styles.toggleTrack}>
            <PressableScale
              style={[styles.toggleOption, !isSignUp && styles.toggleOptionActive]}
              onPress={() => switchMode('signin')}
              accessibilityRole="button"
              accessibilityLabel="Sign in"
            >
              <AppText variant="label" style={!isSignUp ? styles.toggleActive : styles.toggleIdle}>
                Sign In
              </AppText>
            </PressableScale>
            <PressableScale
              style={[styles.toggleOption, isSignUp && styles.toggleOptionActive]}
              onPress={() => switchMode('signup')}
              accessibilityRole="button"
              accessibilityLabel="Create account"
            >
              <AppText variant="label" style={isSignUp ? styles.toggleActive : styles.toggleIdle}>
                Create Account
              </AppText>
            </PressableScale>
          </View>
        </FadeSlideIn>

        {/* Auth Form Card */}
        <FadeSlideIn index={2}>
          <View style={styles.card}>
            <Animated.View style={[styles.formAnimated, animatedFormStyle]}>
              <View style={styles.formIntro}>
                <AppText variant="label" tone="accent" uppercase>
                  {isSignUp ? 'Welcome to Ledger' : 'Secure access'}
                </AppText>
                <AppText variant="heading">
                  {isSignUp ? 'Create your account' : 'Sign in to your ledger'}
                </AppText>
                <AppText variant="body" tone="muted">
                  {isSignUp
                    ? 'Start with three receipt uploads included.'
                    : 'Your expenses stay organized and ready.'}
                </AppText>
              </View>

              <AppInput
                label="Email"
                icon={Mail}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                placeholder="you@example.com"
                returnKeyType="next"
              />

              <AppInput
                label="Password"
                icon={Lock}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                placeholder={isSignUp ? 'At least 6 characters' : 'Enter your password'}
                returnKeyType="done"
                onSubmitEditing={handleAuth}
              />

              <AppButton
                label={isSubmitting ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
                variant="accent"
                full
                loading={isSubmitting}
                onPress={handleAuth}
                style={styles.submit}
              />
            </Animated.View>

            <View style={styles.dividerRow}>
              <Divider style={styles.dividerLine} />
              <AppText variant="caption" tone="muted" uppercase>
                or
              </AppText>
              <Divider style={styles.dividerLine} />
            </View>

            <AppButton
              label="Proceed as guest"
              variant="ghost"
              icon={Fingerprint}
              full
              onPress={handleGuest}
            />
          </View>
        </FadeSlideIn>

        {/* Security Footer */}
        <FadeSlideIn index={3}>
          <AppText variant="caption" tone="onDarkMuted" center style={styles.footer}>
            SOC2 Type II Certified · 256-bit hardware enclave encryption
          </AppText>
        </FadeSlideIn>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.spruce,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  brandSection: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoBadge: {
    width: 58,
    height: 58,
    borderRadius: Radius.surface,
    backgroundColor: Colors.mint,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  brandTitle: { letterSpacing: 5 },
  toggleTrack: {
    flexDirection: 'row',
    backgroundColor: Colors.spruceElevated,
    borderRadius: Radius.pill,
    padding: 4,
    gap: 4,
  },
  toggleOption: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
  },
  toggleOptionActive: {
    backgroundColor: Colors.mint,
  },
  toggleActive: { color: '#00181A', fontWeight: '700' },
  toggleIdle: { color: Colors.onSpruceMuted },
  card: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.surface,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: Spacing.base,
  },
  formAnimated: {
    gap: Spacing.base,
  },
  formIntro: {
    gap: Spacing.xs,
  },
  submit: { marginTop: Spacing.xs },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  dividerLine: {
    flex: 1,
  },
  footer: {
    lineHeight: 16,
  },
});
