import React from "react";
import { ScrollView, TouchableOpacity, Text, Alert } from "react-native";
import { Feather } from "@expo/vector-icons";
import { styles } from "./styles";

const ActionButton = ({ icon, color, onPress, text, disabled, theme }) => (
  <TouchableOpacity
    style={[
      styles.actionButton,
      { backgroundColor: color, opacity: disabled ? 0.5 : 1 },
    ]}
    onPress={() => {
      console.log(`Button pressed: ${text}`);
      onPress();
    }}
    disabled={disabled}
  >
    <Feather name={icon} size={24} color={theme.buttonText} />
    <Text style={[styles.actionButtonText, { color: theme.buttonText }]}>
      {text}
    </Text>
  </TouchableOpacity>
);

const ActionButtons = ({
  theme,
  isActionInProgress,
  setIsActionInProgress,
  setPetState,
  updatePetStat,
  navigation,
  onLetGo,
  onAddPet,
}) => {
  const performAction = (action, statToUpdate, increaseAmount) => {
    if (isActionInProgress) return;
    setIsActionInProgress(true);
    let frame = 1;
    const actionInterval = setInterval(() => {
      setPetState(`${action}${frame}`);
      frame++;
      if (frame > 5) {
        clearInterval(actionInterval);
        setPetState("normal");
        updatePetStat(statToUpdate, increaseAmount);
        setIsActionInProgress(false);
      }
    }, 750);
  };

  const play = () => performAction("playing", "happiness", 15);
  const feed = () => performAction("eating", "hunger", 20);
  const clean = () => performAction("cleaning", "cleanliness", 25);

  const handleNavigation = (screenName) => {
    if (navigation.getState().routeNames.includes(screenName)) {
      navigation.navigate(screenName);
    } else {
      Alert.alert(
        "Navigation Error",
        `Screen "${screenName}" is not available.`
      );
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.actionButtonsContainer}
    >
      <ActionButton
        icon="play"
        color={theme.playButton}
        onPress={play}
        text="Play"
        disabled={isActionInProgress}
        theme={theme}
      />
      <ActionButton
        icon="coffee"
        color={theme.feedButton}
        onPress={feed}
        text="Feed"
        disabled={isActionInProgress}
        theme={theme}
      />
      <ActionButton
        icon="droplet"
        color={theme.cleanButton}
        onPress={clean}
        text="Clean"
        disabled={isActionInProgress}
        theme={theme}
      />
      <ActionButton
        icon="book-open"
        color={theme.diaryButton}
        onPress={() => handleNavigation("PetDiary")}
        text="Diary"
        disabled={isActionInProgress}
        theme={theme}
      />
      <ActionButton
        icon="plus"
        color={theme.addPetButton}
        onPress={() => {
          console.log("Add Pet button pressed");
          onAddPet();
        }}
        text="Add Pet"
        disabled={isActionInProgress}
        theme={theme}
      />
      <ActionButton
        icon="play-circle"
        color={theme.miniGameButton}
        onPress={() => {
          /* Implement mini game navigation */
        }}
        text="Mini Game"
        disabled={isActionInProgress}
        theme={theme}
      />
      <ActionButton
        icon="trash-2"
        color={theme.letGoButton}
        onPress={onLetGo}
        text="Let go"
        disabled={isActionInProgress}
        theme={theme}
      />
    </ScrollView>
  );
};

export default ActionButtons;
