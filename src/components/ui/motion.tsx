import React from 'react';
import { Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Motion } from '@/constants/theme';

/**
 * Respect the OS "reduce motion" accessibility setting. When enabled we skip
 * translate/scale motion and fall back to instant or gentle fades.
 */
export function useAppReducedMotion(): boolean {
  return useReducedMotion();
}

interface EntranceProps {
  children: React.ReactNode;
  /** Order index for staggered reveals (0-based). */
  index?: number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Screen / card entrance: fade in with a slight upward slide.
 * Falls back to a plain fade when reduce-motion is on.
 */
export function FadeSlideIn({ children, index = 0, delay, style }: EntranceProps) {
  const reduced = useAppReducedMotion();
  const totalDelay = delay ?? index * Motion.stagger;

  const entering = reduced
    ? FadeIn.duration(Motion.duration.base).delay(totalDelay)
    : FadeInDown.springify()
        .damping(Motion.spring.damping)
        .stiffness(Motion.spring.stiffness)
        .mass(Motion.spring.mass)
        .delay(totalDelay);

  return (
    <Animated.View entering={entering} style={style}>
      {children}
    </Animated.View>
  );
}

interface PressableScaleProps extends PressableProps {
  children: React.ReactNode;
  /** Scale target while pressed. */
  scaleTo?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Tactile press feedback — quick scale-down on press-in, spring back on
 * release. Native-driven via Reanimated. Disabled under reduce-motion.
 */
export function PressableScale({
  children,
  scaleTo = Motion.pressScale,
  style,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}: PressableScaleProps) {
  const reduced = useAppReducedMotion();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      disabled={disabled}
      onPressIn={(e) => {
        if (!reduced && !disabled) scale.value = withTiming(scaleTo, { duration: Motion.duration.fast });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withTiming(1, { duration: Motion.duration.base });
        onPressOut?.(e);
      }}
      {...rest}
    >
      <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>
    </Pressable>
  );
}
