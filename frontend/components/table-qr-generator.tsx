"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download } from 'lucide-react'

export default function TableQRGenerator() {
  const [baseUrl, setBaseUrl] = useState("https://your-menu.vercel.app")
  const [tableCount, setTableCount] = useState(10)
  const [qrCodes, setQrCodes] = useState<Array<{table: number, url: string, qrUrl: string}>>([])

  const generateTableQRs = () => {
    const codes = []
    for (let i = 1; i <= tableCount; i++) {
      const tableUrl = `${baseUrl}?table=${i}`
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(tableUrl)}`
      codes.push({
        table: i,
        url: tableUrl,
        qrUrl: qrUrl
      })
    }
    setQrCodes(codes)
  }

  const downloadAll = () => {
    qrCodes.forEach((code, index) => {
      setTimeout(() => {
        const link = document.createElement("a")
        link.href = code.qrUrl
        link.download = `table-${code.table}-qr.png`
        link.click()
      }, index * 500) // Delay to avoid browser blocking
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Table QR Code Generator</CardTitle>
            <p className="text-gray-600">Generate unique QR codes for each table</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Base Menu URL</label>
                <Input
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://your-menu.vercel.app"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Number of Tables</label>
                <Input
                  type="number"
                  value={tableCount}
                  onChange={(e) => setTableCount(parseInt(e.target.value))}
                  min="1"
                  max="50"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={generateTableQRs} className="flex-1">
                Generate QR Codes
              </Button>
              {qrCodes.length > 0 && (
                <Button onClick={downloadAll} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download All
                </Button>
              )}
            </div>

            {qrCodes.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {qrCodes.map((code) => (
                  <Card key={code.table} className="text-center">
                    <CardContent className="p-4">
                      <h3 className="font-bold text-lg mb-2">Table {code.table}</h3>
                      <img src={code.qrUrl || "/placeholder.svg"} alt={`Table ${code.table} QR`} className="mx-auto mb-2" />
                      <p className="text-xs text-gray-500 break-all">{code.url}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
