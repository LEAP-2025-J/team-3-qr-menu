// Категорийн нэрийг одоогийн хэлээр орчуулах utility function
export function translateCategoryName(
  category: { nameEn: string; nameMn: string; nameJa: string },
  currentLanguage: "en" | "mn" | "ja"
): string {
  switch (currentLanguage) {
    case "en":
      return category.nameEn;
    case "ja":
      return category.nameJa;
    default:
      return category.nameMn; // Mongolian as default
  }
}

// Категорийн жагсаалтыг одоогийн хэлээр орчуулах
export function translateCategories(
  categories: Array<{ nameEn: string; nameMn: string; nameJa: string }>,
  currentLanguage: "en" | "mn" | "ja"
): Array<{ nameEn: string; nameMn: string; nameJa: string; translatedName: string }> {
  return categories.map(category => ({
    ...category,
    translatedName: translateCategoryName(category, currentLanguage)
  }));
} 