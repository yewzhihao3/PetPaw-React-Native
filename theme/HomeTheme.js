// HomeTheme.js

const lightTheme = {
  background: "#F3F4F6",
  text: "#1F2937",
  textSecondary: "#6B7280",
  primary: "#6d28d9",
  primaryLight: "#8B5CF6",
  accent: "#EF4444",
  cardBackground: "#FFFFFF",
  headerBackground: "#6d28d9",
  buttonBackground: "#6d28d9",
  buttonText: "#FFFFFF",
  border: "#E5E7EB",
  icon: "#1F2937",
  error: "#EF4444",
};

const darkTheme = {
  background: "#1E1E1E",
  text: "#FFFFFF",
  textSecondary: "#D1D5DB",
  primary: "#8B5CF6",
  primaryLight: "#A78BFA",
  accent: "#F87171",
  cardBackground: "#2D2D2D",
  headerBackground: "#6d28d9",
  buttonBackground: "#6d28d9",
  buttonText: "#FFFFFF",
  border: "#4B5563",
  icon: "#FFFFFF",
  error: "#F87171",
};

export const getTheme = (isDarkMode) => {
  return isDarkMode ? darkTheme : lightTheme;
};

export const commonStyles = {
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
};
