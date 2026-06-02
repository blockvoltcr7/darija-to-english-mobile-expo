import { StyleSheet } from 'react-native';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

import { GlassSurface } from '@/components/GlassSurface';

interface GlassActionBarProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  visible?: boolean;
}

export function GlassActionBar({
  children,
  style,
  visible = true,
}: GlassActionBarProps) {
  if (!visible) {
    return null;
  }

  return (
    <GlassSurface variant="action" intensity={78} style={[styles.bar, style]}>
      {children}
    </GlassSurface>
  );
}

const styles = StyleSheet.create({
  bar: {
    gap: 10,
    padding: 12,
  },
});
