import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  errorText: {
    fontSize: 14,
    fontFamily: "PressStart2P",
    textAlign: "center",
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  topNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  navButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  petImageContainer: {
    width: "75%",
    aspectRatio: 1,
    marginBottom: 20,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    overflow: "hidden",
  },
  petImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  petInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  petNameLevel: {
    alignItems: "center",
  },
  petName: {
    fontSize: 24,
    marginBottom: 5,
    fontFamily: "PressStart2P",
  },
  petLevel: {
    fontSize: 14,
    fontFamily: "PressStart2P",
  },
  progressBarContainer: {
    marginBottom: 15,
  },
  progressBarLabel: {
    fontSize: 12,
    marginBottom: 5,
    fontFamily: "PressStart2P",
  },
  actionButtonsContainer: {
    marginBottom: 20,
  },
  actionButton: {
    padding: 10,
    borderRadius: 5,
    marginRight: 10,
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 10,
    marginTop: 5,
    textAlign: "center",
    fontFamily: "PressStart2P",
  },
  dayCounter: {
    fontSize: 12,
    textAlign: "center",
    fontFamily: "PressStart2P",
  },
  petMood: {
    fontSize: 15,
    fontFamily: "PressStart2P",
    marginTop: 5,
  },
  removeButton: {
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
  },
  removeButtonText: {
    fontSize: 16,
    fontFamily: "PressStart2P",
  },
});
