const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export interface RestaurantSettings {
  _id?: string
  name: string
  nameEn: string
  nameMn: string
  address: string
  addressEn: string
  addressMn: string
  description: string
  descriptionEn: string
  descriptionMn: string
  phone: string
  email?: string
  website?: string
  operatingHours: Array<{
    day: string
    openTime: string
    closeTime: string
    isOpen: boolean
  }>
  taxRate: number
  currency: string
  timezone: string
}

export const restaurantApi = {
  // Get restaurant settings
  async getSettings(): Promise<RestaurantSettings> {
    try {
      const response = await fetch(`${API_BASE_URL}/restaurant`)
      if (!response.ok) {
        throw new Error('Failed to fetch restaurant settings')
      }
      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Error fetching restaurant settings:', error)
      throw error
    }
  },

  // Update restaurant settings
  async updateSettings(settings: Partial<RestaurantSettings>): Promise<RestaurantSettings> {
    try {
      const response = await fetch(`${API_BASE_URL}/restaurant`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })
      
      if (!response.ok) {
        throw new Error('Failed to update restaurant settings')
      }
      
      const data = await response.json()
      return data.data
    } catch (error) {
      console.error('Error updating restaurant settings:', error)
      throw error
    }
  }
} 