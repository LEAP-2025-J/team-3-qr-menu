"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Download, Copy } from "lucide-react"

export default function QRGenerator() {
  const [url, setUrl] = useState("https://your-menu.vercel.app")
  const [qrUrl, setQrUrl] = useState("")

  const generateQR = () => {
    // Google Charts API ашиглан QR код үүсгэх
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`
    setQrUrl(qrCodeUrl)
    // qr generator
  }

  const downloadQR = () => {
    const link = document.createElement("a")
    link.href = qrUrl
    link.download = "haku-menu-qr.png"
    link.click()
  }

  const copyUrl = () => {
    navigator.clipboard.writeText(url)
    alert("URL copied to clipboard!")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">QR Code Generator</CardTitle>
            <p className="text-center text-gray-600">Generate QR code for your menu</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Menu URL</label>
              <div className="flex gap-2">
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://your-menu.vercel.app"
                />
                <Button onClick={copyUrl} variant="outline" size="icon">
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Button onClick={generateQR} className="w-full">
              Generate QR Code
            </Button>

            {qrUrl && (
              <div className="text-center space-y-4">
                <img src={qrUrl || ""} alt="QR Code" className="mx-auto border rounded-lg" />
                <Button onClick={downloadQR} className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download QR Code
                </Button>
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Usage Instructions:</h3>
              <ol className="text-sm text-blue-700 space-y-1">
                <li>1. Deploy your menu to get a URL</li>
                <li>2. Enter the URL above</li>
                <li>3. Generate and download the QR code</li>
                <li>4. Print and place on restaurant tables</li>
                <li>5. Customers scan to view menu</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
