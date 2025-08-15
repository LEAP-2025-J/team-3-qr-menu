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
  const [currentDescLang, setCurrentDescLang] = useState<'en' | 'ja' | 'mn'>('en')
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

  // Helper functions for description language switching
  const getCurrentDescription = () => {
    if (!settings) return ''
    switch (currentDescLang) {
      case 'en': return settings.descriptionEn || ''
      case 'ja': return settings.description || ''
      case 'mn': return settings.descriptionMn || ''
      default: return settings.descriptionEn || ''
    }
  }

  const updateCurrentDescription = (value: string) => {
    if (!settings) return
    switch (currentDescLang) {
      case 'en':
        setSettings({ ...settings, descriptionEn: value })
        break
      case 'ja':
        setSettings({ ...settings, description: value })
        break
      case 'mn':
        setSettings({ ...settings, descriptionMn: value })
        break
    }
  }

  const getDescriptionPlaceholder = () => {
    switch (currentDescLang) {
      case 'en': return "Authentic Japanese cuisine in the heart of the city"
      case 'ja': return "街の中心で本格的な日本料理をお楽しみください"
      case 'mn': return "Хотын төвд байрлах жинхэнэ Япон хоол"
      default: return "Authentic Japanese cuisine in the heart of the city"
    }
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-3 border rounded-lg bg-gray-50 space-y-2">
                <Label htmlFor="nameEn" className="text-sm font-semibold">Restaurant Name (English)</Label>
                <Input
                  id="nameEn"
                  value={settings.nameEn}
                  onChange={(e) => updateField("nameEn", e.target.value)}
                  placeholder="Sakura"
                  className="h-10"
                />
              </div>
              <div className="p-3 border rounded-lg bg-gray-50 space-y-2">
                <Label htmlFor="nameMn" className="text-sm font-semibold">Restaurant Name (Mongolian)</Label>
                <Input
                  id="nameMn"
                  value={settings.nameMn}
                  onChange={(e) => updateField("nameMn", e.target.value)}
                  placeholder="Сакура"
                  className="h-10"
                />
              </div>
              <div className="p-3 border rounded-lg bg-gray-50 space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold">Restaurant Name (Japanese)</Label>
                <Input
                  id="name"
                  value={settings.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="桜 Sakura"
                  className="h-10"
                />
              </div>
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
              <div className="flex items-center justify-between mb-2">
                <Label className="text-sm font-semibold">Description</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCurrentDescLang('en')}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      currentDescLang === 'en' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentDescLang('ja')}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      currentDescLang === 'ja' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    日本語
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentDescLang('mn')}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      currentDescLang === 'mn' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Монгол
                  </button>
                </div>
              </div>
              
              <Textarea
                value={getCurrentDescription()}
                onChange={(e) => updateCurrentDescription(e.target.value)}
                placeholder={getDescriptionPlaceholder()}
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

