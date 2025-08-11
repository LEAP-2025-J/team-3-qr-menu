"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UploadProgressSkeleton } from "@/components/ui/loading-skeleton"

export default function UploadPage() {
  const [uploading, setUploading] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    setUploading(true)

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', 'menu_images') // You'll need to create this preset

      try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: formData,
        })

        const data = await response.json()
        
        if (data.public_id) {
          setUploadedImages(prev => [...prev, data.public_id])
          console.log(`✅ Uploaded: ${data.public_id}`)
        }
      } catch (error) {
        console.error('Upload failed:', error)
      }
    }

    setUploading(false)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Upload Menu Images to Cloudinary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="image-upload">Select Images</Label>
            <Input
              id="image-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
            />
          </div>

          {uploading && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Uploading images...</p>
              </div>
              
              {/* Upload Progress Skeletons */}
              <div className="space-y-3">
                {[...Array(3)].map((_, index) => (
                  <UploadProgressSkeleton key={index} />
                ))}
              </div>
            </div>
          )}

          {uploadedImages.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Successfully Uploaded:</h3>
              <ul className="space-y-1">
                {uploadedImages.map((publicId, index) => (
                  <li key={index} className="text-sm text-green-600">
                    ✅ {publicId}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Instructions:</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Create an upload preset in your Cloudinary dashboard</li>
              <li>2. Update the upload_preset value in this code</li>
              <li>3. Select your menu images and upload them</li>
              <li>4. Copy the public IDs and update your seed script</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 