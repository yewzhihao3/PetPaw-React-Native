import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const PetTheme = StyleSheet.create({
  // Shared styles
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  headerContainer: {
    backgroundColor: "#6d28d9",
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center",
  },
  backButton: {
    padding: 8,
  },
  settingsButton: {
    padding: 8,
  },
  container: {
    flex: 1,
  },

  // PetHome styles
  petSelectorContainer: {
    backgroundColor: "white", // This will be the red background
    paddingBottom: 2, // Add some padding at the bottom
  },
  petSelectorList: {
    paddingVertical: 10,
  },
  petSelectorContent: {
    paddingHorizontal: 16,
  },
  petSelectorItem: {
    alignItems: "center",
    marginRight: 20,
  },
  selectedPetSelectorItem: {
    opacity: 1,
  },
  petSelectorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 5,
  },
  petSelectorName: {
    fontSize: 12,
    color: "#4B5563",
  },
  mainContent: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  selectedPetCard: {
    backgroundColor: "white",
    borderRadius: 12,
    margin: 16,
    marginTop: 8,
    overflow: "hidden",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedPetImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  selectedPetInfo: {
    padding: 16,
    paddingTop: 12,
  },
  selectedPetName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  selectedPetDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  infoItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    marginBottom: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: "#111827",
    flex: 1,
    marginLeft: 16,
  },
  addButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#06B6D4",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  // PetCard styles (used in PetHome)
  petCard: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  petInfo: {
    flex: 1,
    justifyContent: "center",
  },
  petName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  petDetails: {
    fontSize: 14,
    color: "#6B7280",
  },

  // AddPet screen styles
  formContainer: {
    padding: 16,
    backgroundColor: "white",
  },
  input: {
    backgroundColor: "#F3F4F6",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  submitButton: {
    backgroundColor: "#6d28d9",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  // PetProfile screen styles
  petProfileContainer: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  petProfileHeaderContainer: {
    backgroundColor: "#6d28d9",
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  petProfileHeaderTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
    textAlign: "center",
  },
  petProfileBackButton: {
    padding: 8,
  },
  petProfileEditButton: {
    padding: 8,
  },
  petProfileImageContainer: {
    width: width,
    height: width * 0.75,
    overflow: "hidden",
    position: "relative",
  },
  petProfileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  updateImageButton: {
    position: "absolute",
    right: 16,
    bottom: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 8,
  },
  petProfileInfoSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    margin: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  petProfileSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6d28d9",
    marginBottom: 16,
  },
  petProfileInfoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  petProfileInfoItem: {
    width: "48%",
    marginBottom: 16,
    alignItems: "center",
  },
  petProfileInfoLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  petProfileInfoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginTop: 4,
    textAlign: "center",
  },
  //Edit Pet Profile
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
});

export default PetTheme;
