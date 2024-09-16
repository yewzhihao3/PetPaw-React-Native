import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../../theme/Themecontext";
import { getUserPets } from "../../screens/PetScreen/PapiService";

const ServiceCard = ({ title, imageSource, route }) => {
  const { theme, isDarkMode } = useTheme();
  const navigation = useNavigation();

  const backgroundColor = isDarkMode ? "#1f1f1f" : "#F0F0F0";

  const handlePress = React.useCallback(async () => {
    switch (route) {
      case "Tamagotchi":
        navigation.navigate("Tamagotchi");
        break;
      case "ECommerce":
        navigation.navigate("ECommerce");
        break;
      case "PetTaxiHome":
        navigation.navigate("PetTaxiHome");
        break;
      case "VetHome":
        navigation.navigate("VetHome");
        break;
      case "PetDiary":
        try {
          const pets = await getUserPets();
          if (pets && pets.length > 0) {
            navigation.navigate("PetDiary", { selectedPetId: pets[0].id });
          } else {
            Alert.alert(
              "No Pets",
              "Please add a pet before accessing the Pet Diary."
            );
          }
        } catch (error) {
          console.error("Error fetching pets:", error);
          Alert.alert("Error", "Unable to access Pet Diary. Please try again.");
        }
        break;

      case "PetTips":
        navigation.navigate("PetTips");
        break;

      case "ComingSoon":
        Alert.alert("Coming Soon", `The ${title} feature is coming soon!`);
        break;
      default:
        navigation.navigate(route);
    }
  }, [navigation, route, title]);

  return (
    <TouchableOpacity style={styles.cardContainer} onPress={handlePress}>
      <View
        style={[
          styles.cardContent,
          { backgroundColor: backgroundColor, borderColor: "#6d28d9" },
        ]}
      >
        <View style={styles.imageContainer}>
          <Image source={imageSource} style={styles.image} />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: "45%",
    aspectRatio: 1,
    margin: "2.5%",
    borderRadius: 18,
    overflow: "hidden",
    elevation: 5,
    shadowColor: "#6d28d9",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.5,
  },
  cardContent: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderWidth: 2,
    borderColor: "#6d28d9",
    borderRadius: 16,
  },
  imageContainer: {
    width: "80%",
    height: "70%",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 8,
    paddingHorizontal: 4,
  },
});

export default ServiceCard;
