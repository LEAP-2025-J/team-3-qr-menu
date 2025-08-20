// Cart utility functions
// Сагсны хэрэгслүүд

import { CartItem } from "@/hooks/use-cart";

// Toast мессежүүдийг тусад нь функц болгох
export const showToast = (
  toast: any,
  getText: any,
  type:
    | "noTable"
    | "tableUnavailable"
    | "emptyCart"
    | "orderSuccess"
    | "orderFailed"
) => {
  const messages = {
    noTable: {
      title: getText(
        "❌ No Table Selected",
        "❌ Ширээ сонгоогүй",
        "❌ テーブルが選択されていません"
      ),
      description: getText(
        "Please scan a QR code to select a table first.",
        "Эхлээд QR код уншуулж ширээ сонгоно уу.",
        "まずQRコードをスキャンしてテーブルを選択してください。"
      ),
      variant: "destructive" as const,
      duration: 3000,
    },
    tableUnavailable: {
      title: getText(
        "❌ Cannot Add Items",
        "❌ Бараа нэмэх боломжгүй",
        "❌ 商品を追加できません"
      ),
      description: getText(
        "This table has an active order. Please wait for the table to become available.",
        "Энэ ширээ идэвхтэй захиалгатай байна. Та ширээ сулрахыг хүлээнэ үү.",
        "このテーブルは使用中です。テーブルが空くまでお待ちください。"
      ),
      variant: "destructive" as const,
      duration: 5000,
    },
    emptyCart: {
      title: getText("❌ Empty Cart", "❌ Сагс хоосон", "❌ カートが空です"),
      description: getText(
        "Please add items to your cart before placing an order.",
        "Захиалга өгөхийн өмнө сагсанд бараа нэмнэ үү.",
        "注文する前にカートに商品を追加してください。"
      ),
      variant: "destructive" as const,
      duration: 3000,
    },
    orderSuccess: {
      title: getText(
        "✅ Order Submitted!",
        "✅ Захиалга илгээгдлээ!",
        "✅ 注文が送信されました！"
      ),
      description: getText(
        "Your order has been successfully submitted. We'll prepare it right away!",
        "Таны захиалга амжилттай илгээгдлээ. Бид түүнийг шууд бэлтгэх болно!",
        "注文が正常に送信されました。すぐに準備いたします！"
      ),
      duration: 5000,
    },
    orderFailed: {
      title: getText(
        "❌ Order Failed",
        "❌ Захиалга амжилтгүй",
        "❌ 注文に失敗しました"
      ),
      description: getText(
        "Failed to submit order. Please try again.",
        "Захиалга илгээх амжилтгүй боллоо. Дахин оролдоно уу.",
        "注文の送信に失敗しました。もう一度お試しください。"
      ),
      variant: "destructive" as const,
      duration: 5000,
    },
  };

  toast(messages[type]);
};

// LocalStorage логикийг тусад нь функц болгох
export const clearLocalStorage = () => {
  localStorage.removeItem("qr-menu-cart");
  localStorage.removeItem("qr-menu-table-number");
  localStorage.removeItem("qr-menu-timestamp");
};

export const saveToLocalStorage = (cart: CartItem[], tableNumber: string | null) => {
  localStorage.setItem("qr-menu-cart", JSON.stringify(cart));
  if (tableNumber) {
    localStorage.setItem("qr-menu-table-number", tableNumber);
    localStorage.setItem("qr-menu-timestamp", Date.now().toString());
  }
};
