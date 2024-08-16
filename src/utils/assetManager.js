// src/utils/assetManager.js

export const PetImages = {
  WhiteCat: {
    normal: require("../../assets/Game/White_cat/status/normal.png"),
    happy: require("../../assets/Game/White_cat/status/happy.png"),
    sad: require("../../assets/Game/White_cat/status/sad.png"),
    hungry: require("../../assets/Game/White_cat/status/hungry.png"),
    dirty: require("../../assets/Game/White_cat/status/dirty.png"),
    cleaning1: require("../../assets/Game/White_cat/clean1.png"),
    cleaning2: require("../../assets/Game/White_cat/clean2.png"),
    cleaning3: require("../../assets/Game/White_cat/clean3.png"),
    cleaning4: require("../../assets/Game/White_cat/clean4.png"),
    eating1: require("../../assets/Game/White_cat/eat1.png"),
    eating2: require("../../assets/Game/White_cat/eat2.png"),
    eating3: require("../../assets/Game/White_cat/eat3.png"),
    eating4: require("../../assets/Game/White_cat/eat4.png"),
    playing1: require("../../assets/Game/White_cat/play1.png"),
    playing2: require("../../assets/Game/White_cat/play2.png"),
    playing3: require("../../assets/Game/White_cat/play3.png"),
    playing4: require("../../assets/Game/White_cat/play4.png"),
  },
  BSHCat: {
    normal: require("../../assets/Game/BSH_cat/status/normal.jpg"),
    happy: require("../../assets/Game/BSH_cat/status/happy.png"),
    sad: require("../../assets/Game/BSH_cat/status/sad.png"),
    hungry: require("../../assets/Game/BSH_cat/status/hungry.png"),
    dirty: require("../../assets/Game/BSH_cat/status/dirty.png"),
    cleaning1: require("../../assets/Game/BSH_cat/clean1.png"),
    cleaning2: require("../../assets/Game/BSH_cat/clean2.png"),
    cleaning3: require("../../assets/Game/BSH_cat/clean3.png"),
    cleaning4: require("../../assets/Game/BSH_cat/clean4.png"),
    eating1: require("../../assets/Game/BSH_cat/eat1.png"),
    eating2: require("../../assets/Game/BSH_cat/eat2.png"),
    eating3: require("../../assets/Game/BSH_cat/eat3.png"),
    eating4: require("../../assets/Game/BSH_cat/eat4.png"),
    playing1: require("../../assets/Game/BSH_cat/play1.png"),
    playing2: require("../../assets/Game/BSH_cat/play2.png"),
    playing3: require("../../assets/Game/BSH_cat/play3.png"),
    playing4: require("../../assets/Game/BSH_cat/play4.png"),
  },
};

export const getCatImage = (catType, state) => {
  const cat = catType === "White Cat" ? PetImages.WhiteCat : PetImages.BSHCat;
  return cat[state] || cat.normal;
};
