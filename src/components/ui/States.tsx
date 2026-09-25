import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { LucideIcon, TriangleAlert } from 'lucide-react-native';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { AppText } from './AppText';
import { AppButton } from './AppButton';

export function EmptyState({
  icon: Icon,
  title,
  message,
  actionLabel,
  onAction,
}: {
  icon: LucideIcon;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.iconCircle}>
        <Icon size={26} color={Colors.primaryLight} />
      </View>
      <AppText variant="subheading" center>
        {title}
      </AppText>
      {message && (
        <AppText variant="body" tone="muted" center style={styles.message}>
          {message}
        </AppText>
      )}
      {actionLabel && onAction && (
        <AppButton label={actionLabel} variant="accent" onPress={onAction} style={styles.action} />
      )}
    </View>
  );
}

export function LoadingState({ label = 'Loading' }: { label?: string }) {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" color={Colors.primaryLight} />
      <AppText variant="body" tone="muted">
        {label}
      </AppText>
    </View>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.iconCircle, { backgroundColor: Colors.rustMuted }]}>
        <TriangleAlert size={26} color={Colors.rust} />
      </View>
      <AppText variant="subheading" center>
        {title}
      </AppText>
      {message && (
        <AppText variant="body" tone="muted" center style={styles.message}>
          {message}
        </AppText>
      )}
      {onRetry && <AppButton label="Try again" variant="secondary" onPress={onRetry} style={styles.action} />}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: Radius.surface,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  message: { maxWidth: 300 },
  action: { marginTop: Spacing.sm, minWidth: 180 },
});
