import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Colors } from '@/constants/theme';

export function Divider({ onDark, style }: { onDark?: boolean; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.line, { backgroundColor: onDark ? 'rgba(255,252,246,0.12)' : Colors.borderLight }, style]} />;
}

const styles = StyleSheet.create({
  line: {
    height: 1,
    alignSelf: 'stretch',
  },
});
