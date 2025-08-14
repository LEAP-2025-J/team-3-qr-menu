"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { restaurantApi, RestaurantSettings } from "@/lib/restaurant-api"
import { useToast } from "@/hooks/use-toast"

export function SettingsForm() {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      const data = await restaurantApi.getSettings()
      setSettings(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load restaurant settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return
    
    try {
      setSaving(true)
      console.log('Saving settings:', settings) // Debug log
      const result = await restaurantApi.updateSettings(settings)
      console.log('Save result:', result) // Debug log
      setSettings(result) // Update local state with the result
      toast({
        title: "Success",
        description: "Restaurant settings updated successfully",
      })
    } catch (error) {
      console.error('Save error:', error) // Debug log
      toast({
        title: "Error",
        description: "Failed to update restaurant settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const updateField = (field: keyof RestaurantSettings, value: any) => {
    if (!settings) return
    setSettings({ ...settings, [field]: value })
  }

  const updateOperatingHours = (index: number, field: string, value: any) => {
    if (!settings) return
    const newHours = [...settings.operatingHours]
    newHours[index] = { ...newHours[index], [field]: value }
    setSettings({ ...settings, operatingHours: newHours })
  }

  if (loading) {
    return (
      <div className="grid gap-8">
        <Card>
          <CardContent className="p-8">
            <div className="animate-pulse space-y-6">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-4">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="grid gap-8">
        <Card>
          <CardContent className="p-8">
            <p className="text-center text-gray-500 text-lg">Failed to load settings</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      {/* Restaurant Information Card */}
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold">Restaurant Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 flex-1">
          {/* Restaurant Names Section */}
          <div className="space-y-3">
            <div className="p-3 border rounded-lg bg-gray-50 space-y-2">
              <Label htmlFor="nameEn" className="text-sm font-semibold">Restaurant Name</Label>
              <Input
                id="nameEn"
                value={settings.nameEn}
                onChange={(e) => updateField("nameEn", e.target.value)}
                placeholder="Sakura"
                className="h-10"
              />
            </div>
            
            <div className="p-3 border rounded-lg bg-gray-50 space-y-2">
              <Label htmlFor="phone" className="text-sm font-semibold">Phone</Label>
              <Input
                id="phone"
                value={settings.phone}
                onChange={(e) => updateField("phone", e.target.value)}
                placeholder="(555) 123-4567"
                className="h-10"
              />
            </div>
          </div>

          {/* Address Section */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 border rounded-lg bg-gray-50 space-y-2">
                <Label htmlFor="addressEn" className="text-sm font-semibold">Address (English)</Label>
                <Input
                  id="addressEn"
                  value={settings.addressEn}
                  onChange={(e) => updateField("addressEn", e.target.value)}
                  placeholder="123 Main Street, City, State 12345"
                  className="h-10"
                />
              </div>
              <div className="p-3 border rounded-lg bg-gray-50 space-y-2">
                <Label htmlFor="addressMn" className="text-sm font-semibold">Address (Mongolian)</Label>
                <Input
                  id="addressMn"
                  value={settings.addressMn}
                  onChange={(e) => updateField("addressMn", e.target.value)}
                  placeholder="123 Үндсэн гудамж, Хот, Улс 12345"
                  className="h-10"
                />
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="space-y-3">
            <div className="p-3 border rounded-lg bg-gray-50 space-y-2">
              <Label htmlFor="descriptionEn" className="text-sm font-semibold">Description</Label>
              <Textarea
                id="descriptionEn"
                value={settings.descriptionEn}
                onChange={(e) => {
                  // Update both description and descriptionEn fields
                  updateField("description", e.target.value)
                  updateField("descriptionEn", e.target.value)
                }}
                placeholder="Authentic Japanese cuisine in the heart of the city"
                rows={3}
                className="min-h-[80px]"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2 mt-auto">
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="w-full h-10 text-base font-semibold"
            >
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Operating Hours Card */}
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold">Operating Hours</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 flex-1 flex flex-col">
          <div className="space-y-2 flex-1">
            {settings.operatingHours.map((hours, index) => (
              <div key={hours.day} className="flex items-center gap-4 p-3 border rounded-lg bg-gray-50">
                <span className="font-semibold w-24 text-gray-700">{hours.day}</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={hours.openTime}
                    onChange={(e) => updateOperatingHours(index, "openTime", e.target.value)}
                    className="w-24 h-9"
                  />
                  <span className="text-gray-500 font-medium">-</span>
                  <Input
                    type="time"
                    value={hours.closeTime}
                    onChange={(e) => updateOperatingHours(index, "closeTime", e.target.value)}
                    className="w-24 h-9"
                  />
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <input
                    type="checkbox"
                    id={`open-${index}`}
                    checked={hours.isOpen}
                    onChange={(e) => updateOperatingHours(index, "isOpen", e.target.checked)}
                    className="rounded w-4 h-4"
                  />
                  <Label htmlFor={`open-${index}`} className="text-sm font-medium text-gray-700">Open</Label>
                </div>
              </div>
            ))}
          </div>
          
          {/* Save Hours Button */}
          <div className="pt-2 mt-auto">
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="w-full h-10 text-base font-semibold"
            >
              {saving ? "Saving..." : "Save Hours"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

