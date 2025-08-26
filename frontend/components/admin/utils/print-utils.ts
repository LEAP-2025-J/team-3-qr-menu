import { Order, Table } from "../types";
import { formatDate, formatTime } from "./date-utils";

// Хэвлэх контент үүсгэх функц
export function generatePrintContent(order: Order, table: Table): string {
  const printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Захиалга #${order.orderNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 20px; }
        .order-info { margin-bottom: 20px; }
        .items { margin-bottom: 20px; }
        .item { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .total { font-weight: bold; border-top: 1px solid #000; padding-top: 10px; }
        .special-instructions { font-style: italic; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Захиалга #${order.orderNumber}</h1>
        <p>Ширээ ${table.number}</p>
        <p>Огноо: ${formatDate(order.createdAt)}</p>
        <p>Цаг: ${formatTime(order.createdAt)}</p>
      </div>
      
      <div class="items">
        <h2>Захиалсан хоол:</h2>
        ${order.items
          .filter((item) => item.menuItem)
          .map(
            (item) => `
          <div class="item">
            <div>
              <div>${
                item.menuItem?.nameMn || item.menuItem?.name || "Unknown Item"
              }</div>
              <div class="special-instructions">${
                item.menuItem?.nameJp || ""
              }</div>
              ${
                item.specialInstructions
                  ? `<div class="special-instructions">Тэмдэглэл: ${item.specialInstructions}</div>`
                  : ""
              }
            </div>
            <div>${item.quantity}</div>
          </div>
        `
          )
          .join("")}
      </div>
      
      <div class="total">
        <div class="item">
          <span>Нийт дүн:</span>
          <span>₮${order.total.toLocaleString()}</span>
        </div>
      </div>
    </body>
    </html>
  `;
  return printContent;
}

// Хэвлэх функцийг дуудах
export function handlePrint(
  order: Order | null,
  table: Table,
  printDevice: string,
  onStatusUpdate?: () => Promise<void>
): void {
  if (!order) return;

  if (printDevice === "browser") {
    const printContent = generatePrintContent(order, table);
    const printFrame = document.createElement("iframe");
    printFrame.style.display = "none";
    document.body.appendChild(printFrame);

    const frameDoc =
      printFrame.contentDocument || printFrame.contentWindow?.document;
    if (frameDoc) {
      frameDoc.write(printContent);
      frameDoc.close();
      printFrame.contentWindow?.print();
    }

    setTimeout(() => {
      document.body.removeChild(printFrame);
    }, 1000);
  }
}
