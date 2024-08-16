import React, { createContext, useState, useContext, useEffect } from "react";

const defaultTheme = {
  background: "#F5F5F5",
  title: "#6d28d9",
  text: "#1F2430",
  buttonBackground: "#E0E0E0",
  icon: "#000000",
  barBackground: "#D3D3D3",
  buttonText: "#FFFFFF",
  primaryButton: "#6d28d9",
  addPetButton: "#FFA500", // Orange
  playButton: "#3498db", // Blue
  feedButton: "#f1c40f", // Yellow
  cleanButton: "#2ecc71", // Green
  diaryButton: "#9b59b6", // Purple
  miniGameButton: "#FF69B4", // Pink
  letGoButton: "#e74c3c", // Red
};

const darkTheme = {
  ...defaultTheme,
  title: "#8f3aff",
  background: "#1E1E1E",
  text: "#FFFFFF",
  buttonBackground: "#2A3240",
  icon: "#FFFFFF",
  barBackground: "#4A4A4A",
};

const ThemeContext = createContext({
  isDarkMode: false,
  theme: defaultTheme,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [theme, setTheme] = useState(defaultTheme);

  useEffect(() => {
    setTheme(isDarkMode ? darkTheme : defaultTheme);
    console.log("Theme updated:", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode((prevMode) => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
