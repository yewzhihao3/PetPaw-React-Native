const palette = [
  {
    // Orange
    text: "#f97316",
    bgColor: (opacity) => `rgba(251, 148, 60, ${opacity})`,
  },
  {
    // Purple
    text: "#6d28d9",
    bgColor: (opacity) => `rgba(109, 40, 217, ${opacity})`,
  },
  {
    // Blue
    text: "#1d4ed8",
    bgColor: (opacity) => `rgba(29, 78, 216, ${opacity})`,
  },
  {
    // Green
    text: "#10b981",
    bgColor: (opacity) => `rgba(16, 185, 129, ${opacity})`,
  },
  {
    // Red
    text: "#ef4444",
    bgColor: (opacity) => `rgba(239, 68, 68, ${opacity})`,
  },
  {
    // Yellow
    text: "#facc15",
    bgColor: (opacity) => `rgba(250, 204, 21, ${opacity})`,
  },
  {
    // Teal
    text: "#14b8a6",
    bgColor: (opacity) => `rgba(20, 184, 166, ${opacity})`,
  },
  {
    // Pink
    text: "#ec4899",
    bgColor: (opacity) => `rgba(236, 72, 153, ${opacity})`,
  },
  {
    // Gray
    text: "#6b7280",
    bgColor: (opacity) => `rgba(107, 114, 128, ${opacity})`,
  },
];

export const themeColors = {
  ...palette[1],
};
