import React from 'react';
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { Colors, Spacing } from '@/constants/theme';

interface AppScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  surface?: 'cream' | 'spruce';
  contentStyle?: StyleProp<ViewStyle>;
  edges?: Edge[];
}

/**
 * Standard screen wrapper: safe-area aware, cream (or spruce) canvas,
 * consistent horizontal padding, optional scrolling.
 */
export function AppScreen({
  children,
  scroll = true,
  surface = 'cream',
  contentStyle,
  edges = ['top', 'left', 'right'],
}: AppScreenProps) {
  const bg = surface === 'spruce' ? Colors.spruce : Colors.background;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={edges}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[styles.content, contentStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, styles.flex, contentStyle]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.huge,
    gap: Spacing.lg,
  },
});
