import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Spacing } from '@/constants/theme';
import { AppText } from './AppText';

interface ScreenHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onDark?: boolean;
}

export function ScreenHeader({ eyebrow, title, subtitle, right, onDark }: ScreenHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.col}>
        {eyebrow && (
          <AppText variant="label" tone={onDark ? 'onDarkMuted' : 'accent'} uppercase>
            {eyebrow}
          </AppText>
        )}
        <AppText variant="title" tone={onDark ? 'onDark' : 'primary'} style={styles.title}>
          {title}
        </AppText>
        {subtitle && (
          <AppText variant="body" tone={onDark ? 'onDarkMuted' : 'muted'}>
            {subtitle}
          </AppText>
        )}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.base,
  },
  col: { flex: 1, gap: 4 },
  title: { marginTop: 2 },
});
