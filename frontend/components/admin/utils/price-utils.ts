/**
 * Үнийн форматыг монгол төгрөгөөр харуулах utility функцууд
 */

/**
 * Үнийг монгол төгрөгийн форматаар өөрчлөх
 * Жишээ: 10000 -> "10,000₮"
 * @param price - үнэ (number)
 * @returns форматлагдсан үнэ (string)
 */
export const formatPrice = (price: number): string => {
  // Бүхэл тоогоор харуулах (ардаас .00 хасах)
  const wholePrice = Math.round(price);

  // Таслалаар ангилах (10,000 гэж харуулах)
  const formattedPrice = wholePrice.toLocaleString("en-US");

  // Монгол төгрөгийн тэмдэг нэмэх (хоосон зайтай)
  return `${formattedPrice} ₮`;
};

/**
 * Үнийг input талбарт харуулахад зориулсан формат
 * Жишээ: 10000 -> "10000", 0 -> "" (хоосон)
 * @param price - үнэ (number)
 * @returns цэвэр тоо (string) эсвэл хоосон string
 */
export const formatPriceForInput = (price: number): string => {
  // Хэрэв үнэ 0 бол хоосон string буцаах
  if (price === 0) {
    return "";
  }
  return Math.round(price).toString();
};

/**
 * Текстээс үнэ задлах (input-аас авах үед)
 * Жишээ: "10,000₮" -> 10000
 * @param priceText - үнийн текст
 * @returns үнэ (number)
 */
export const parsePriceFromText = (priceText: string): number => {
  // Таслал, төгрөгийн тэмдэг, зай зэргийг хасах
  const cleanText = priceText.replace(/[,₮\s]/g, "");
  const price = parseFloat(cleanText);
  return isNaN(price) ? 0 : price;
};

/**
 * Тоон input талбарт харуулахад зориулсан формат
 * Жишээ: 15 -> "15", 0 -> "" (хоосон)
 * @param value - тоон утга
 * @param defaultValue - default утга (хэрэв 0 бол хоосон харуулах)
 * @returns тоо (string) эсвэл хоосон string
 */
export const formatNumberForInput = (
  value: number,
  defaultValue: number = 0
): string => {
  // Хэрэв утга default утгатай тэнцүү бол хоосон string буцаах
  if (value === defaultValue) {
    return "";
  }
  return value.toString();
};
