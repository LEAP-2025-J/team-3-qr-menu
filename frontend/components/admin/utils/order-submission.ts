// Order submission utility functions
// Захиалга илгээх хэрэгслүүд

interface OrderData {
  tableNumber: number;
  items: Array<{
    menuItem: string;
    quantity: number;
    price: number;
  }>;
  total: number;
}

export const submitOrder = async (orderData: OrderData): Promise<any> => {
  const response = await fetch(
    `https://backend-htk90mjru-kherlenchimegs-projects.vercel.app/api/orders`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
