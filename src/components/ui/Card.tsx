import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { PressableScale } from './motion';

type Surface = 'paper' | 'spruce' | 'mint' | 'info' | 'warm' | 'grape' | 'aqua';

interface CardProps {
  children: React.ReactNode;
  surface?: Surface;
  onPress?: () => void;
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const SURFACES: Record<Surface, { bg: string; border: string }> = {
  paper: { bg: Colors.surfaceCard, border: Colors.borderLight },
  spruce: { bg: Colors.spruce, border: Colors.spruceElevated },
  mint: { bg: Colors.primaryMuted, border: Colors.borderAccent },
  info: { bg: Colors.infoSoft, border: Colors.infoSoft },
  warm: { bg: Colors.warmSoft, border: Colors.warmSoft },
  grape: { bg: Colors.primary, border: Colors.primaryLight },
  aqua: { bg: Colors.surface, border: Colors.surface },
};

export function Card({ children, surface = 'paper', onPress, padded = true, style, accessibilityLabel }: CardProps) {
  const palette = SURFACES[surface];
  const content = (
    <View
      style={[
        styles.card,
        { backgroundColor: palette.bg, borderColor: palette.border },
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <PressableScale
        onPress={onPress}
        scaleTo={0.985}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
      >
        {content}
      </PressableScale>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.surface,
    borderWidth: 1,
  },
  padded: {
    padding: Spacing.lg,
  },
});
