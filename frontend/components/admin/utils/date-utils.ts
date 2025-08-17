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
