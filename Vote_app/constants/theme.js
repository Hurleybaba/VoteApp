export const COLORS = {
  primary: {
    default: "#E8612D",
    light: "#FF8F5C",
    dark: "#D14E1A",
    background: "#FFF5F0",
  },
  secondary: {
    default: "#2D3748",
    light: "#4A5568",
    dark: "#1A202C",
  },
  neutral: {
    white: "#FFFFFF",
    black: "#000000",
    gray: {
      50: "#F7FAFC",
      100: "#EDF2F7",
      200: "#E2E8F0",
      300: "#CBD5E0",
      400: "#A0AEC0",
      500: "#718096",
      600: "#4A5568",
      700: "#2D3748",
      800: "#1A202C",
      900: "#171923",
    },
  },
  feedback: {
    success: "#48BB78",
    warning: "#ECC94B",
    error: "#FF3B30",
    info: "#4299E1",
  },
};

export const TYPOGRAPHY = {
  sizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    "2xl": 24,
    "3xl": 30,
    "4xl": 36,
  },
  weights: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  families: {
    heading: "System",
    body: "System",
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 40,
  "3xl": 48,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 20,
  full: 9999,
};

export const SHADOWS = {
  sm: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 5,
  },
};

export const ANIMATIONS = {
  durations: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
  easings: {
    easeInOut: "ease-in-out",
    easeIn: "ease-in",
    easeOut: "ease-out",
    linear: "linear",
  },
};
