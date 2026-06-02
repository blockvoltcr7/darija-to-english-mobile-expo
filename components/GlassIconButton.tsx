import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';
import type { ComponentProps } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { GlassSurface } from '@/components/GlassSurface';

interface GlassIconButtonProps {
  accessibilityHint?: string;
  accessibilityLabel: string;
  disabled?: boolean;
  name: ComponentProps<typeof Ionicons>['name'];
  onPress: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export function GlassIconButton({
  accessibilityHint,
  accessibilityLabel,
  disabled = false,
  name,
  onPress,
  size = 20,
  style,
}: GlassIconButtonProps) {
  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.pressable,
        disabled ? styles.disabled : null,
        pressed && !disabled ? styles.pressed : null,
        style,
      ]}
    >
      <GlassSurface variant="action" intensity={58} style={styles.surface}>
        <Ionicons name={name} size={size} color="#F4F1EA" />
      </GlassSurface>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    borderRadius: 18,
  },
  surface: {
    alignItems: 'center',
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  disabled: {
    opacity: 0.38,
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.97 }],
  },
});
