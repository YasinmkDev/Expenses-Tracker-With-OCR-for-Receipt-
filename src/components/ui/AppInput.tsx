import React, { useState } from 'react';
import { StyleProp, StyleSheet, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { AppText } from './AppText';

interface AppInputProps extends TextInputProps {
  label?: string;
  icon?: LucideIcon;
  containerStyle?: StyleProp<ViewStyle>;
}

export function AppInput({ label, icon: Icon, containerStyle, onFocus, onBlur, style, ...rest }: AppInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.group, containerStyle]}>
      {label && (
        <AppText variant="label" tone="muted" uppercase>
          {label}
        </AppText>
      )}
      <View style={[styles.box, focused && styles.boxFocused]}>
        {Icon && <Icon size={16} color={focused ? Colors.primaryLight : Colors.textMuted} />}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={Colors.textMuted}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: Spacing.sm },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    minHeight: 50,
    paddingHorizontal: Spacing.base,
    backgroundColor: Colors.surfaceCard,
    borderRadius: Radius.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  boxFocused: {
    borderColor: Colors.spruceElevated,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: Typography.body.fontSize,
    fontWeight: '500',
    paddingVertical: Spacing.md,
  },
});
