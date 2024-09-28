export const updateDayCount = (pets) => {
  const now = new Date();
  return pets.map((pet) => {
    const createdAt = new Date(pet.created_at);
    const daysPassed = Math.floor((now - createdAt) / (1000 * 60 * 60 * 24));
    return { ...pet, day_count: daysPassed + 1 };
  });
};
