"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const BASE_URL = typeof window !== "undefined"
  ? window.location.origin
  : "https://your-menu.vercel.app";
const TABLE_COUNT = 8;

function getQrUrl(table: number) {
  const tableUrl = `${BASE_URL}/?table=${table}`;
  return {
    url: tableUrl,
    qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(tableUrl)}`
  };
}

export default function QRCodesPage() {
  const codes = Array.from({ length: TABLE_COUNT }, (_, i) => {
    const table = i + 1;
    return { table, ...getQrUrl(table) };
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>QR Codes for Tables 1–8</CardTitle>
            <p className="text-gray-600">Scan to view the menu for each table</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {codes.map((code) => (
                <Card key={code.table} className="text-center">
                  <CardContent className="p-4">
                    <h3 className="font-bold text-lg mb-2">Table {code.table}</h3>
                    <img src={code.qrUrl} alt={`Table ${code.table} QR`} className="mx-auto mb-2" />
                    <p className="text-xs text-gray-500 break-all">{code.url}</p>
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