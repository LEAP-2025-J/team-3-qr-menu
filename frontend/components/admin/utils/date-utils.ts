// Цагийн форматыг харуулах
export const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("mn-MN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

// Огнооны форматыг харуулах
export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("mn-MN", {
    day: "2-digit",
    month: "short",
  });
};

// Expired reservation-уудыг шалгах функц
export function isReservationExpired(reservation: any): boolean {
  if (!reservation || !reservation.date || !reservation.time) {
    return false;
  }

  const reservationTime = new Date(`${reservation.date}T${reservation.time}`);
  const now = new Date();
  const diffInMinutes =
    (now.getTime() - reservationTime.getTime()) / (1000 * 60);

  // 2 цагаас хэтэрсэн pending reservation-уудыг expired гэж үзнэ
  return diffInMinutes > 120 && reservation.status === "pending";
}

// Active reservation-уудыг шалгах функц
export function isReservationActive(reservation: any): boolean {
  if (!reservation) {
    return false;
  }

  // Зөвхөн confirmed эсвэл pending статустай reservation-уудыг active гэж үзнэ
  const isCorrectStatus =
    reservation.status === "confirmed" || reservation.status === "pending";

  // Зөвхөн өнөөдрийн огноотой reservation-уудыг active гэж үзнэ (UTC+8 timezone)
  const isToday = () => {
    if (!reservation.date) return false;

    // Өнөөдрийн огноог UTC+8 timezone-тай болгож авах (Mongolia timezone)
    const now = new Date();
    const utc8Date = new Date(now.getTime() + 8 * 60 * 60 * 1000); // UTC+8
    const todayString = utc8Date.toISOString().split("T")[0]; // YYYY-MM-DD формат

    // Reservation-ийн огноог шууд string харьцуулах
    return reservation.date === todayString;
  };

  return isCorrectStatus && isToday();
}
