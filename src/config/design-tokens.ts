// Design tokens and configuration constants

export const DESIGN_TOKENS = {
  // Typography
  fonts: {
    primary: { family: "Inter", style: "Regular" },
    bold: { family: "Inter", style: "Bold" },
    medium: { family: "Inter", style: "Medium" }
  },
  
  fontSizes: {
    headline: 48,
    title: 32,
    subtitle: 24,
    body: 16,
    caption: 14,
    small: 12
  },

  // Colors
  colors: {
    primary: { r: 0.13, g: 0.15, b: 0.19 },
    secondary: { r: 0.44, g: 0.51, b: 0.6 },
    accent: { r: 0.2, g: 0.47, b: 1 },
    white: { r: 1, g: 1, b: 1 },
    background: { r: 0.98, g: 0.98, b: 0.99 },
    border: { r: 0.9, g: 0.9, b: 0.92 },
    success: { r: 0.13, g: 0.69, b: 0.3 },
    warning: { r: 1, g: 0.6, b: 0 },
    error: { r: 0.96, g: 0.26, b: 0.21 }
  },

  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
    xxxxl: 80
  },

  // Layout dimensions
  dimensions: {
    desktop: { width: 1400, height: 900 },
    mobile: { width: 375, height: 812 },
    modal: { width: 600, height: 400 },
    tooltip: { width: 320, height: 240 },
    icon: { width: 80, height: 80 },
    button: { height: 48 },
    input: { height: 44 }
  },

  // Border radius
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 20,
    round: 9999
  },

  // Shadows
  shadows: {
    sm: {
      type: 'DROP_SHADOW' as const,
      color: { r: 0, g: 0, b: 0, a: 0.1 },
      offset: { x: 0, y: 2 },
      radius: 4,
      spread: 0,
      visible: true,
      blendMode: 'NORMAL' as const
    },
    md: {
      type: 'DROP_SHADOW' as const,
      color: { r: 0, g: 0, b: 0, a: 0.15 },
      offset: { x: 0, y: 4 },
      radius: 12,
      spread: 0,
      visible: true,
      blendMode: 'NORMAL' as const
    },
    lg: {
      type: 'DROP_SHADOW' as const,
      color: { r: 0, g: 0, b: 0, a: 0.2 },
      offset: { x: 0, y: 8 },
      radius: 24,
      spread: 0,
      visible: true,
      blendMode: 'NORMAL' as const
    }
  }
};

// Library component keys
export const LIBRARY_KEYS = {
  'full-screen-layout': '1612-2103',
  'modal-layout-form': '1667-23421', 
  'modal-layout': '1612-2656',
  'tooltip-layout': '1612-3898',
  'split-screen-layout': '1612-4016'
};

// Plugin configuration
export const PLUGIN_CONFIG = {
  frameSpacing: 80,
  annotationSpacing: 24,
  maxFrameWidth: 1400,
  defaultTimeout: 5000
};