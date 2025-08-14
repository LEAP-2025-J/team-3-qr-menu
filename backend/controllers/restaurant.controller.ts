import { Request, Response } from "express"
import Restaurant from "../models/model.restaurant"

// GET /api/restaurant - Get restaurant settings
export const getRestaurantSettings = async (req: Request, res: Response) => {
  try {
    let restaurant = await (Restaurant as any).findOne()
    
    // If no restaurant exists, create default one
    if (!restaurant) {
      restaurant = new (Restaurant as any)({
        name: "桜 Sakura",
        nameEn: "Sakura",
        nameMn: "Сакура",
        address: "123 Main Street, City, State 12345",
        addressEn: "123 Main Street, City, State 12345",
        addressMn: "123 Үндсэн гудамж, Хот, Улс 12345",
        description: "Authentic Japanese cuisine in the heart of the city",
        descriptionEn: "Authentic Japanese cuisine in the heart of the city",
        descriptionMn: "Хотын төвд байрлах жинхэнэ Япон хоол",
        phone: "(555) 123-4567",
        email: "info@sakura-restaurant.com",
        website: "https://sakura-restaurant.com"
      })
      await restaurant.save()
    }

    res.json({
      success: true,
      data: restaurant
    })
  } catch (error) {
    console.error("Error getting restaurant settings:", error)
    res.status(500).json({
      success: false,
      error: "Failed to get restaurant settings"
    })
  }
}

// PUT /api/restaurant - Update restaurant settings
export const updateRestaurantSettings = async (req: Request, res: Response) => {
  try {
    const {
      name,
      nameEn,
      nameMn,
      address,
      addressEn,
      addressMn,
      description,
      descriptionEn,
      descriptionMn,
      phone,
      email,
      website,
      operatingHours,
      taxRate,
      currency,
      timezone
    } = req.body

    let restaurant = await (Restaurant as any).findOne()
    
    if (!restaurant) {
      // Create new restaurant if none exists
      restaurant = new (Restaurant as any)()
    }

    // Update fields if provided
    if (name !== undefined) restaurant.name = name
    if (nameEn !== undefined) restaurant.nameEn = nameEn
    if (nameMn !== undefined) restaurant.nameMn = nameMn
    if (address !== undefined) restaurant.address = address
    if (addressEn !== undefined) restaurant.addressEn = addressEn
    if (addressMn !== undefined) restaurant.addressMn = addressMn
    if (description !== undefined) restaurant.description = description
    if (descriptionEn !== undefined) restaurant.descriptionEn = descriptionEn
    if (descriptionMn !== undefined) restaurant.descriptionMn = descriptionMn
    if (phone !== undefined) restaurant.phone = phone
    if (email !== undefined) restaurant.email = email
    if (website !== undefined) restaurant.website = website
    if (operatingHours !== undefined) restaurant.operatingHours = operatingHours
    if (taxRate !== undefined) restaurant.taxRate = taxRate
    if (currency !== undefined) restaurant.currency = currency
    if (timezone !== undefined) restaurant.timezone = timezone

    await restaurant.save()

    res.json({
      success: true,
      data: restaurant,
      message: "Restaurant settings updated successfully"
    })
  } catch (error) {
    console.error("Error updating restaurant settings:", error)
    res.status(500).json({
      success: false,
      error: "Failed to update restaurant settings"
    })
  }
} 