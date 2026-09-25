import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { PressableScale } from './motion';
import { AppText } from './AppText';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';

interface AppButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: LucideIcon;
  iconRight?: boolean;
  loading?: boolean;
  disabled?: boolean;
  full?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

/**
 * Primary: dark spruce with cream text.
 * Accent: mint accent with dark text.
 * Secondary: cream with hairline spruce border.
 * Danger: soft red, clearly distinct but not neon.
 */
export function AppButton({
  label,
  onPress,
  variant = 'primary',
  icon: Icon,
  iconRight,
  loading,
  disabled,
  full,
  style,
  accessibilityLabel,
}: AppButtonProps) {
  const palette = VARIANTS[variant];
  const isDisabled = disabled || loading;

  return (
    <PressableScale
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      style={[
        styles.base,
        { backgroundColor: palette.bg, borderColor: palette.border },
        full && styles.full,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.inner}>
        {loading ? (
          <ActivityIndicator size="small" color={palette.fg} />
        ) : (
          <>
            {Icon && !iconRight && <Icon size={17} color={palette.fg} />}
            <AppText
              variant="label"
              style={[styles.text, { color: palette.fg }]}
              numberOfLines={1}
            >
              {label}
            </AppText>
            {Icon && iconRight && <Icon size={17} color={palette.fg} />}
          </>
        )}
      </View>
    </PressableScale>
  );
}

const VARIANTS: Record<ButtonVariant, { bg: string; fg: string; border: string }> = {
  primary: { bg: Colors.spruceElevated, fg: Colors.onSpruce, border: Colors.spruceElevated },
  accent: { bg: Colors.mint, fg: '#00181A', border: Colors.mint },
  secondary: { bg: Colors.background, fg: Colors.textPrimary, border: Colors.spruceElevated },
  ghost: { bg: 'transparent', fg: Colors.textPrimary, border: Colors.borderLight },
  danger: { bg: Colors.rustMuted, fg: Colors.rust, border: Colors.rust },
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  full: { alignSelf: 'stretch' },
  disabled: { opacity: 0.5 },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  text: {
    fontWeight: Typography.label.fontWeight,
  },
});
