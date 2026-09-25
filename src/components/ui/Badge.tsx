import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { AppText } from './AppText';

type Tone = 'neutral' | 'success' | 'info' | 'warning' | 'danger' | 'onDark';

const TONES: Record<Tone, { bg: string; fg: string; border: string }> = {
  neutral: { bg: Colors.surfaceElevated, fg: Colors.textSecondary, border: Colors.borderLight },
  success: { bg: Colors.primaryMuted, fg: Colors.primaryLight, border: 'transparent' },
  info: { bg: Colors.infoSoft, fg: Colors.info, border: 'transparent' },
  warning: { bg: Colors.goldMuted, fg: Colors.gold, border: 'transparent' },
  danger: { bg: Colors.rustMuted, fg: Colors.rust, border: 'transparent' },
  onDark: { bg: 'rgba(255,252,246,0.1)', fg: Colors.onSpruce, border: 'rgba(255,252,246,0.16)' },
};

interface BadgeProps {
  label: string;
  tone?: Tone;
  style?: StyleProp<ViewStyle>;
}

export function Badge({ label, tone = 'neutral', style }: BadgeProps) {
  const palette = TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: palette.bg, borderColor: palette.border }, style]}>
      <AppText
        variant="caption"
        style={{ color: palette.fg, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' }}
      >
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
    borderWidth: 1,
  },
});
