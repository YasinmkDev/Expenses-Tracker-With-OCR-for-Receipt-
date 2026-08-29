import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ShieldCheck, Fingerprint, Lock, Mail, ArrowRight } from 'lucide-react-native';
import { Colors } from '@/constants/theme';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('alex.vance@institutional.capital');
  const [password, setPassword] = useState('••••••••••••');

  const handleBiometricAuth = async () => {
    router.replace('/(tabs)');
  };

  const handleStandardLogin = () => {
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
          <Text style={styles.brandSub}>Institutional Financial Operating System</Text>
        </View>

        {/* Auth Form Card */}
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>ORGANIZATION EMAIL</Text>
            <View style={styles.inputBox}>
              <Mail size={16} color={Colors.textMuted} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>SECURITY KEY / PASSCODE</Text>
            <View style={styles.inputBox}>
              <Lock size={16} color={Colors.textMuted} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity style={styles.loginBtn} onPress={handleStandardLogin}>
            <Text style={styles.loginBtnText}>ACCESS VAULT</Text>
            <ArrowRight size={16} color="#002111" />
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR SECURE ENCLAVE</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.biometricBtn} onPress={handleBiometricAuth}>
            <Fingerprint size={20} color={Colors.primaryLight} />
            <Text style={styles.biometricBtnText}>SIGN IN WITH FACEID / BIOMETRICS</Text>
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
  footer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: Colors.textMuted,
    fontFamily: 'Menlo',
  },
});
