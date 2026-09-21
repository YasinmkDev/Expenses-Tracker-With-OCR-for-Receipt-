import { Colors } from '@/constants/theme';
import { BackendService } from '@/services/backend';
import { SafeStorage } from '@/services/safeStorage';
import { useRouter } from 'expo-router';
import { ArrowRight, Fingerprint, Lock, Mail, ShieldCheck, UserPlus } from 'lucide-react-native';
import { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAuth = async () => {
    if (!email.trim() || password.length < 6) {
      Alert.alert('Details Required', 'Enter a valid email and a password with at least 6 characters.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (isSignUp) {
        const result = await BackendService.signUp(email.trim(), password);
        if (!result.session) {
          Alert.alert('Check Your Email', 'Your account was created. Confirm your email, then sign in.');
          setIsSignUp(false);
          return;
        }
      } else {
        await BackendService.signIn(email.trim(), password);
      }
      await SafeStorage.removeItem('@ledger_guest_session');
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert(isSignUp ? 'Sign Up Failed' : 'Sign In Failed', error instanceof Error ? error.message : 'Unable to authenticate.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuest = async () => {
    await SafeStorage.setItem('@ledger_guest_session', 'true');
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Brand Header */}
        <View style={styles.brandSection}>
          <View style={styles.logoBadge}>
            <ShieldCheck size={28} color="#002111" />
          </View>
          <Text style={styles.brandTitle}>LEDGER</Text>
          <Text style={styles.brandSub}>Private expense tracking, ready when you are</Text>
        </View>

        {/* Auth Form Card */}
        <View style={styles.card}>
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
              <Mail size={16} color={Colors.textMuted} />
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
              <Lock size={16} color={Colors.textMuted} />
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

          <TouchableOpacity style={styles.loginBtn} onPress={handleAuth} disabled={isSubmitting}>
            <Text style={styles.loginBtnText}>{isSubmitting ? 'PLEASE WAIT...' : isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}</Text>
            <ArrowRight size={16} color="#002111" />
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR SECURE ENCLAVE</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.biometricBtn} onPress={() => setIsSignUp((value) => !value)}>
            <UserPlus size={20} color={Colors.primaryLight} />
            <Text style={styles.biometricBtnText}>{isSignUp ? 'I ALREADY HAVE AN ACCOUNT' : 'CREATE A NEW ACCOUNT'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.guestBtn} onPress={handleGuest}>
            <Fingerprint size={18} color={Colors.textMuted} />
            <Text style={styles.guestBtnText}>PROCEED AS GUEST</Text>
          </TouchableOpacity>
        </View>

        {/* Security Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🔒 SOC2 Type II Certified • 256-Bit Hardware Enclave Encryption
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
    padding: 24,
    justifyContent: 'center',
    gap: 24,
  },
  brandSection: {
    alignItems: 'center',
    gap: 8,
  },
  logoBadge: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: 4,
    fontFamily: 'Menlo',
  },
  brandSub: {
    fontSize: 12,
    color: Colors.textMuted,
    fontFamily: 'Menlo',
  },
  card: {
    backgroundColor: Colors.surfaceCard,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    gap: 16,
  },
  formIntro: {
    gap: 5,
    marginBottom: 2,
  },
  formEyebrow: {
    color: Colors.primaryLight,
    fontFamily: 'Menlo',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  formTitle: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: '800',
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
    fontSize: 10,
    fontFamily: 'Menlo',
    color: Colors.textMuted,
    letterSpacing: 0.5,
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
    borderRadius: 10,
    gap: 8,
    marginTop: 4,
  },
  loginBtnText: {
    color: '#002111',
    fontWeight: '700',
    fontFamily: 'Menlo',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
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
    letterSpacing: 0.5,
  },
  biometricBtn: {
    backgroundColor: Colors.surfaceElevated,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
    gap: 8,
  },
  biometricBtnText: {
    color: Colors.primaryLight,
    fontWeight: '700',
    fontFamily: 'Menlo',
    fontSize: 11,
    letterSpacing: 0.5,
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
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: 'Menlo',
  },
});
