import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Spacing } from '@/constants/theme';
import { AppText } from './AppText';

interface SectionHeaderProps {
  title: string;
  caption?: string;
  action?: React.ReactNode;
}

export function SectionHeader({ title, caption, action }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <View style={styles.textCol}>
        <AppText variant="subheading">{title}</AppText>
        {caption && (
          <AppText variant="caption" tone="muted" style={styles.caption}>
            {caption}
          </AppText>
        )}
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  textCol: { flex: 1, gap: 2 },
  caption: { marginTop: 1 },
});
