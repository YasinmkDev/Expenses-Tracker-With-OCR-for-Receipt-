import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { Colors, Radius } from '@/constants/theme';
import { PressableScale } from './motion';

interface IconButtonProps {
  icon: LucideIcon;
  onPress?: () => void;
  accessibilityLabel: string;
  variant?: 'surface' | 'spruce' | 'ghost';
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
}

export function IconButton({
  icon: Icon,
  onPress,
  accessibilityLabel,
  variant = 'surface',
  size = 44,
  color,
  style,
}: IconButtonProps) {
  const palette = VARIANTS[variant];
  return (
    <PressableScale
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={style}
    >
      <View
        style={[
          styles.base,
          {
            width: size,
            height: size,
            backgroundColor: palette.bg,
            borderColor: palette.border,
          },
        ]}
      >
        <Icon size={Math.round(size * 0.42)} color={color ?? palette.fg} />
      </View>
    </PressableScale>
  );
}

const VARIANTS = {
  surface: { bg: Colors.surfaceCard, border: Colors.borderLight, fg: Colors.textSecondary },
  spruce: { bg: Colors.spruceElevated, border: Colors.spruceElevated, fg: Colors.onSpruce },
  ghost: { bg: 'transparent', border: 'transparent', fg: Colors.textSecondary },
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.surface,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
