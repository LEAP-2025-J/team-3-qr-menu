"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { QRCodeSkeleton } from "@/components/ui/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { API_CONFIG } from "@/config/api";

// Компьютерийн IP хаягийг config файлаас авна
const COMPUTER_IP = API_CONFIG.FRONTEND_URL.replace("http://", "").replace(
  ":3000",
  ""
);

const BASE_URL =
  "https://frontend-c0ampiaxt-kherlenchimegs-projects.vercel.app";
const TABLE_COUNT = 21;

function getQrUrl(table: number) {
  const tableUrl = `${BASE_URL}/?table=${table}`;
  return {
    url: tableUrl,
    qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      tableUrl
    )}`,
  };
}

export default function QRCodesPage() {
  const [loading, setLoading] = useState(true);

  const handlePrint = () => {
    window.print();
  };

  const codes = Array.from({ length: TABLE_COUNT }, (_, i) => {
    const table = i + 1;
    return { table, ...getQrUrl(table) };
  });

  // Simulate loading for QR code generation
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <Skeleton className="w-64 h-8 mb-2" />
              <Skeleton className="h-4 w-80" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-5">
                {[...Array(20)].map((_, index) => (
                  <Card key={index} className="text-center">
                    <QRCodeSkeleton />
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto print:max-w-none">
        <Card className="print:shadow-none print:border-0">
          <CardHeader className="print:pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>QR Codes for Tables 1–20</CardTitle>
                <p className="text-gray-600">
                  Scan to view the menu for each table
                </p>
              </div>
              <Button onClick={handlePrint} className="print:hidden">
                <Printer className="w-4 h-4 mr-2" />
                Print All QR Codes
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-5">
              {codes.map((code) => (
                <Card key={code.table} className="text-center">
                  <CardContent className="p-4">
                    <h3 className="mb-2 text-lg font-bold">
                      Table {code.table}
                    </h3>
                    <img
                      src={code.qrUrl}
                      alt={`Table ${code.table} QR`}
                      className="mx-auto mb-2"
                    />
                    <p className="text-xs text-gray-500 break-all">
                      {code.url}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
