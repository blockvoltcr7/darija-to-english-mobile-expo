import { BlurView } from 'expo-blur';
import type { BlurTint } from 'expo-blur';
import {
  GlassView,
  isGlassEffectAPIAvailable,
  isLiquidGlassAvailable,
} from 'expo-glass-effect';
import { useEffect, useMemo, useState } from 'react';
import {
  AccessibilityInfo,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

type GlassVariant = 'nav' | 'panel' | 'action' | 'solid';

interface GlassSurfaceProps {
  children: ReactNode;
  fallbackColor?: string;
  intensity?: number;
  style?: StyleProp<ViewStyle>;
  tint?: BlurTint;
  variant?: GlassVariant;
}

const variantFallbacks: Record<GlassVariant, string> = {
  nav: '#151515E6',
  panel: '#151515F2',
  action: '#191919E8',
  solid: '#111111',
};

function canUseNativeGlass() {
  if (Platform.OS !== 'ios') {
    return false;
  }

  try {
    return isGlassEffectAPIAvailable() && isLiquidGlassAvailable();
  } catch {
    return false;
  }
}

export function GlassSurface({
  children,
  fallbackColor,
  intensity = 72,
  style,
  tint = 'systemMaterialDark',
  variant = 'panel',
}: GlassSurfaceProps) {
  const [reduceTransparency, setReduceTransparency] = useState(false);
  const solidColor = fallbackColor || variantFallbacks[variant];
  const nativeGlassAvailable = useMemo(() => canUseNativeGlass(), []);
  const shouldUseSolidSurface =
    Platform.OS !== 'ios' || reduceTransparency || variant === 'solid';

  useEffect(() => {
    let isMounted = true;

    AccessibilityInfo.isReduceTransparencyEnabled().then((enabled) => {
      if (isMounted) {
        setReduceTransparency(enabled);
      }
    });

    const subscription = AccessibilityInfo.addEventListener(
      'reduceTransparencyChanged',
      setReduceTransparency,
    );

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  const surfaceStyle = [
    styles.base,
    styles[variant],
    shouldUseSolidSurface ? { backgroundColor: solidColor } : null,
    style,
  ];

  if (shouldUseSolidSurface) {
    return <View style={surfaceStyle}>{children}</View>;
  }

  if (nativeGlassAvailable) {
    return (
      <GlassView
        colorScheme="dark"
        glassEffectStyle="regular"
        style={surfaceStyle}
      >
        {children}
      </GlassView>
    );
  }

  return (
    <BlurView intensity={intensity} tint={tint} style={surfaceStyle}>
      {children}
    </BlurView>
  );
}

const styles = StyleSheet.create({
  base: {
    borderColor: '#FFFFFF24',
    borderWidth: 1,
    overflow: 'hidden',
  },
  nav: {
    borderRadius: 24,
  },
  panel: {
    borderRadius: 22,
  },
  action: {
    borderRadius: 18,
  },
  solid: {
    borderRadius: 18,
  },
});
