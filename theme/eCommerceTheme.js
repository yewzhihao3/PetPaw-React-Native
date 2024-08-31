import { useTheme } from "../theme/Themecontext";

export const useECommerceTheme = () => {
  const { isDarkMode } = useTheme();

  const lightTheme = {
    background: "#F8F8FC",
    text: "#1A1A2E",
    textSecondary: "#4A4A6A",
    primary: "#6d28d9",
    primaryLight: "#8B6CB0",
    accent: "#FF6B6B",
    cardBackground: "#FFFFFF",
    buttonBackground: "#E0E0E0",
    buttonText: "#6d28d9",
    border: "#E0E0E0",
    placeholder: "#A0A0B2",
    EcomTitle: "#6d28d9",
    EcomOrderList: "#FFFFFF",
    FRow: "#6d28d9",
    BPlus: "#FFFFFF",
    BMinus: "#FFFFFF",
  };

  const darkTheme = {
    background: "#1E1E1E",
    text: "#F8F8FC",
    textSecondary: "#B0B0C0",
    primary: "#6d28d9",
    primaryLight: "#A78CC7",
    accent: "#FF6B6B",
    cardBackground: "#2e2e2e",
    buttonBackground: "#6d28d9",
    buttonText: "#FFFFFF",
    border: "#3D3D56",
    placeholder: "#6A6A8E",
    EcomOrderList: "#FFFFFF",
    FRow: "#FFFFFF",
    BPlus: "#FFFFFF",
    BMinus: "#FFFFFF",
    EcomTitle: "#FFFFFF",
  };

  return isDarkMode ? darkTheme : lightTheme;
};
