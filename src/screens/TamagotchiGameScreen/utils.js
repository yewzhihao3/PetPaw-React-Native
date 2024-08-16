import AsyncStorage from "@react-native-async-storage/async-storage";

export const loadPets = async () => {
  try {
    const storedPets = await AsyncStorage.getItem("pets");
    if (storedPets !== null) {
      return JSON.parse(storedPets);
    }
    return [];
  } catch (error) {
    console.error("Error loading pets:", error);
    return [];
  }
};

export const savePets = async (pets) => {
  try {
    await AsyncStorage.setItem("pets", JSON.stringify(pets));
  } catch (error) {
    console.error("Error saving pets:", error);
  }
};

export const updatePetStat = (pets, currentPetIndex, stat, value) => {
  return pets.map((pet, index) => {
    if (index === currentPetIndex) {
      const newValue = Math.max(0, Math.min(100, pet[stat] + value));
      return { ...pet, [stat]: newValue };
    }
    return pet;
  });
};

export const removePet = async (petId, pets) => {
  const updatedPets = pets.filter((pet) => pet.id !== petId);
  await savePets(updatedPets);
  return updatedPets;
};

export const addPet = async (newPet) => {
  const pets = await loadPets();
  const updatedPets = [
    ...pets,
    {
      ...newPet,
      createdAt: new Date().toISOString(),
      dayCount: 1,
    },
  ];
  await savePets(updatedPets);
  return updatedPets;
};

export const updateDayCount = (pets) => {
  const now = new Date();
  return pets.map((pet) => {
    const createdAt = new Date(pet.createdAt);
    const daysPassed = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));

    //
    return { ...pet, dayCount: daysPassed + 1 };
  });
};
