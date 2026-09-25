import { Colors } from '@/constants/theme';
import { BackendService } from '@/services/backend';
import { SafeStorage } from '@/services/safeStorage';
import { useRouter } from 'expo-router';
import { ArrowRight, Fingerprint, Lock, Mail, ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
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
    // slide out → update state → slide in
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
      Alert.alert(mode === 'signup' ? 'Sign Up Failed' : 'Sign In Failed', error instanceof Error ? error.message : 'Unable to authenticate.');
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
        <View style={styles.brandSection}>
          <View style={styles.logoBadge}>
            <View style={styles.logoGlow} />
            <ShieldCheck size={26} color="#002111" />
          </View>
          <Text style={styles.brandTitle}>LEDGER</Text>
          <Text style={styles.brandSub}>Private expense tracking, ready when you are</Text>
        </View>

        {/* Mode Toggle */}
        <View style={styles.toggleTrack}>
          <TouchableOpacity
            style={[styles.toggleOption, !isSignUp && styles.toggleOptionActive]}
            onPress={() => switchMode('signin')}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleLabel, !isSignUp && styles.toggleLabelActive]}>Sign In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleOption, isSignUp && styles.toggleOptionActive]}
            onPress={() => switchMode('signup')}
            activeOpacity={0.8}
          >
            <Text style={[styles.toggleLabel, isSignUp && styles.toggleLabelActive]}>Create Account</Text>
          </TouchableOpacity>
        </View>

        {/* Auth Form Card */}
        <View style={styles.card}>
          <Animated.View style={[styles.formAnimated, animatedFormStyle]}>
            <View style={styles.formIntro}>
              <Text style={styles.formEyebrow}>{isSignUp ? 'WELCOME TO LEDGER' : 'SECURE ACCESS'}</Text>
              <Text style={styles.formTitle}>{isSignUp ? 'Create your account' : 'Sign in to your ledger'}</Text>
              <Text style={styles.formHint}>
                {isSignUp ? 'Start with three receipt uploads included.' : 'Your expenses stay organized and ready.'}
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>EMAIL</Text>
              <View style={styles.inputBox}>
                <Mail size={15} color={Colors.textMuted} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors.textMuted}
                  returnKeyType="done"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PASSWORD</Text>
              <View style={styles.inputBox}>
                <Lock size={15} color={Colors.textMuted} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  placeholder={isSignUp ? 'At least 6 characters' : 'Enter your password'}
                  placeholderTextColor={Colors.textMuted}
                  returnKeyType="done"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginBtn, isSubmitting && styles.loginBtnDisabled]}
              onPress={handleAuth}
              disabled={isSubmitting}
              activeOpacity={0.85}
            >
              <Text style={styles.loginBtnText}>
                {isSubmitting ? 'PLEASE WAIT...' : isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
              </Text>
              {!isSubmitting && <ArrowRight size={15} color="#002111" />}
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.guestBtn} onPress={handleGuest} activeOpacity={0.7}>
            <Fingerprint size={16} color={Colors.textMuted} />
            <Text style={styles.guestBtnText}>PROCEED AS GUEST</Text>
          </TouchableOpacity>
        </View>

        {/* Security Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🔒 SOC2 Type II Certified · 256-Bit Hardware Enclave Encryption
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    gap: 20,
  },
  brandSection: {
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  logoGlow: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: Colors.primaryLight,
    opacity: 0.18,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 5,
    fontFamily: 'Menlo',
  },
  brandSub: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: 'Menlo',
    textAlign: 'center',
  },
  toggleTrack: {
    flexDirection: 'row',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    padding: 4,
    gap: 4,
  },
  toggleOption: {
    flex: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  toggleOptionActive: {
    backgroundColor: Colors.surfaceCard,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
  },
  toggleLabel: {
    fontFamily: 'Menlo',
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textMuted,
    letterSpacing: 0.3,
  },
  toggleLabelActive: {
    color: Colors.primaryLight,
  },
  card: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  formAnimated: {
    gap: 14,
  },
  formIntro: {
    gap: 4,
  },
  formEyebrow: {
    color: Colors.primaryLight,
    fontFamily: 'Menlo',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  formTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  formHint: {
    color: Colors.textMuted,
    fontFamily: 'Menlo',
    fontSize: 11,
    lineHeight: 17,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 9,
    fontFamily: 'Menlo',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceElevated,
    borderRadius: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 10,
    height: 46,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 14,
    fontFamily: 'Menlo',
  },
  loginBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 11,
    gap: 8,
    marginTop: 2,
  },
  loginBtnDisabled: {
    opacity: 0.6,
  },
  loginBtnText: {
    color: '#002111',
    fontWeight: '800',
    fontFamily: 'Menlo',
    fontSize: 12,
    letterSpacing: 0.6,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  dividerText: {
    fontSize: 9,
    fontFamily: 'Menlo',
    color: Colors.textMuted,
    letterSpacing: 1,
  },
  guestBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 10,
  },
  guestBtnText: {
    color: Colors.textMuted,
    fontFamily: 'Menlo',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    color: Colors.textMuted,
    fontFamily: 'Menlo',
    textAlign: 'center',
    lineHeight: 16,
  },
});
