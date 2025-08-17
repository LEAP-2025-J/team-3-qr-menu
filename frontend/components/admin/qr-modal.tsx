"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  qrCode: string; // URL string from backend
  tableNumber: number;
}

export function QRModal({
  isOpen,
  onClose,
  qrCode,
  tableNumber,
}: QRModalProps) {
  // QR код зурагны URL үүсгэх
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    qrCode
  )}`;

  console.log("QR Modal Debug:", { qrCode, qrImageUrl, tableNumber });

  const handlePrint = () => {
    // Шууд хэвлэх dialog гарч ирэх
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] print:max-w-none print:p-0 print:shadow-none print:border-0">
        <DialogHeader className="print:hidden">
          <DialogTitle className="text-center">
            QR код - Ширээ {tableNumber}
          </DialogTitle>
          <DialogDescription className="text-center">
            QR кодыг утсаараа уншуулж захиалга өгнө үү
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4 print:gap-2 print:py-2">
          {/* Хэвлэх үед харагдах загвар */}
          <div className="print:block print:text-center print:max-w-none print:w-full">
            <div className="print:text-2xl print:font-bold print:mb-4 print:text-gray-900">
              Ширээ {tableNumber}
            </div>

            <div className="p-4 bg-white border rounded-lg print:border-0 print:p-0 print:bg-transparent">
              <img
                src={qrImageUrl}
                alt={`QR Code for Table ${tableNumber}`}
                className="object-contain w-64 h-64 print:w-80 print:h-80 print:mx-auto"
              />
            </div>

            <div className="print:text-lg print:text-gray-700 print:mt-4 print:max-w-md print:mx-auto print:leading-relaxed">
              QR кодыг утсаараа уншуулж захиалга өгнө үү
            </div>
          </div>

          <Button onClick={handlePrint} className="w-full print:hidden">
            <Printer className="w-4 h-4 mr-2" />
            Хэвлэх
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
