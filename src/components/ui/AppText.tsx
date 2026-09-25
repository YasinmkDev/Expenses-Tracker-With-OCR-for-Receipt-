import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { Colors, Typography } from '@/constants/theme';

type Variant = keyof Pick<
  typeof Typography,
  'caption' | 'label' | 'body' | 'bodyStrong' | 'subheading' | 'heading' | 'title' | 'numeric'
>;

type Tone = 'primary' | 'secondary' | 'muted' | 'accent' | 'danger' | 'onDark' | 'onDarkMuted' | 'onAccent';

const TONE_COLOR: Record<Tone, string> = {
  primary: Colors.textPrimary,
  secondary: Colors.textSecondary,
  muted: Colors.textMuted,
  accent: Colors.primaryLight,
  danger: Colors.rust,
  onDark: Colors.onSpruce,
  onDarkMuted: Colors.onSpruceMuted,
  onAccent: '#00181A',
};

export interface AppTextProps extends TextProps {
  variant?: Variant;
  tone?: Tone;
  uppercase?: boolean;
  center?: boolean;
}

export function AppText({
  variant = 'body',
  tone = 'primary',
  uppercase,
  center,
  style,
  children,
  ...rest
}: AppTextProps) {
  const token = Typography[variant];
  return (
    <Text
      style={[
        {
          fontSize: token.fontSize,
          lineHeight: token.lineHeight,
          fontWeight: token.fontWeight,
          letterSpacing: token.letterSpacing,
          color: TONE_COLOR[tone],
        },
        uppercase && styles.uppercase,
        center && styles.center,
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  uppercase: { textTransform: 'uppercase', letterSpacing: 1 },
  center: { textAlign: 'center' },
});
