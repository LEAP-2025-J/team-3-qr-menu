"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChefHat, Fish, Soup, Beef, Coffee, Clock, Calendar } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CategorySkeleton } from "@/components/ui/loading-skeleton"
import CloudinaryImage from "@/components/CloudinaryImage"

const getCategoryIcon = (categoryName: string) => {
  const category = categoryName.toLowerCase()
  if (category.includes('appetizer') || category.includes('завсрын')) return ChefHat
  if (category.includes('sushi') || category.includes('суши')) return Fish
  if (category.includes('ramen') || category.includes('рамен')) return Soup
  if (category.includes('main') || category.includes('үндсэн')) return Beef
  if (category.includes('dessert') || category.includes('амттан')) return Coffee
  if (category.includes('drink') || category.includes('ундаа')) return Coffee
  return ChefHat // default icon
}

export default function QRMenu() {
  const [activeTab, setActiveTab] = useState("appetizers")
  const [tableNumber, setTableNumber] = useState<string | null>(null)
  const [menuItems, setMenuItems] = useState<any[]>([])
  const [loadingMenu, setLoadingMenu] = useState(true)
  const [cart, setCart] = useState<{ name: string; price: number; quantity: number; image?: string }[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [restaurantName, setRestaurantName] = useState("Loading...")
  const searchParams = useSearchParams()
  const cartLoaded = useRef(false)

  // Check if current time is before 7pm for discount
  const isBefore7PM = () => {
    const now = new Date()
    const currentHour = now.getHours()
    return currentHour < 19 // 7pm = 19:00
  }

  // Calculate discounted price (10% off)
  const getDiscountedPrice = (originalPrice: number) => {
    return originalPrice * 0.9 // 10% discount
  }

  const restaurantHours = {
    monday: "11:00 AM - 10:00 PM",
    tuesday: "11:00 AM - 10:00 PM",
    wednesday: "11:00 AM - 10:00 PM",
    thursday: "11:00 AM - 10:00 PM",
    friday: "11:00 AM - 11:00 PM",
    saturday: "12:00 PM - 11:00 PM",
    sunday: "12:00 PM - 9:00 PM"
  }

  // Load cart from localStorage on mount
  useEffect(() => {
    if (!cartLoaded.current) {
      const stored = localStorage.getItem("qr-menu-cart")
      if (stored) setCart(JSON.parse(stored))
      cartLoaded.current = true
    }
  }, [])

  // Persist cart to localStorage
  useEffect(() => {
    if (cartLoaded.current) {
      localStorage.setItem("qr-menu-cart", JSON.stringify(cart))
    }
  }, [cart])

  useEffect(() => {
    console.log("Fetching menu from:", "http://localhost:5000/api/menu")
    fetch("http://localhost:5000/api/menu")
      .then(res => {
        console.log("Response status:", res.status)
        return res.json()
      })
      .then(data => {
        console.log("Menu data received:", data)
        if (data.success) {
          setMenuItems(data.data)
          // Set restaurant name based on the first menu item's category or use default
          if (data.data.length > 0) {
            const firstCategory = data.data[0].category?.nameEn
            console.log("First category:", firstCategory)
            if (firstCategory === "Sushi" || firstCategory === "Ramen") {
              setRestaurantName("Sakura Restaurant")
            } else {
              setRestaurantName("Fusion Restaurant")
            }
          }
        }
        setLoadingMenu(false)
      })
      .catch(error => {
        console.error("Error fetching menu:", error)
        setRestaurantName("Restaurant")
        setLoadingMenu(false)
      })
  }, [])

  useEffect(() => {
    const table = searchParams.get('table')
    setTableNumber(table)
  }, [searchParams])

  // Group menu items by category (using category.nameEn)
  const groupedMenu = useMemo(() => {
    const groups: Record<string, any[]> = {}
    console.log("Grouping menu items:", menuItems)
    menuItems.forEach(item => {
      const cat = item.category?.nameEn?.toLowerCase() || "other"
      console.log("Item:", item.nameEn, "Category:", item.category?.nameEn, "->", cat, "Image:", item.image)
      if (!groups[cat]) groups[cat] = []
      groups[cat].push(item)
    })
    console.log("Grouped menu:", groups)
    return groups
  }, [menuItems])

  const addToCart = (item: { nameEn: string; price: string | number; image?: string }) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.name === item.nameEn)
      const originalPrice = typeof item.price === "string"
        ? parseFloat(item.price.replace(/[^0-9.]/g, "")) || 0
        : (typeof item.price === "number" && !isNaN(item.price) ? item.price : 0)
      
      // Apply discount if before 7pm
      const finalPrice = isBefore7PM() ? getDiscountedPrice(originalPrice) : originalPrice
      
      if (idx !== -1) {
        const updated = [...prev]
        updated[idx].quantity += 1
        return updated
      }
      return [...prev, { name: item.nameEn, price: finalPrice, quantity: 1, image: item.image }]
    })
  }

  const removeFromCart = (name: string) => {
    setCart(prev => prev.filter(i => i.name !== name))
  }

  const changeQuantity = (name: string, qty: number) => {
    setCart(prev => prev.map(i => i.name === name ? { ...i, quantity: Math.max(1, qty) } : i))
  }

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF7D1' }}>
      {/* Header */}
      <div className="text-center p-4 md:p-6" style={{ backgroundColor: '#FFD09B' }}>
        <h1 className="text-2xl md:text-4xl font-bold mb-2" style={{ color: '#8B4513' }}>{restaurantName}</h1>
        <p className="text-gray-700 mb-4 text-sm md:text-base">Experience the perfect blend of tradition and innovation</p>
        
        {tableNumber && (
          <div className="mt-2">
            <Badge variant="secondary" style={{ backgroundColor: '#FFB0B0', color: '#8B4513' }} className="font-bold text-xs md:text-sm">
              Table {tableNumber}
            </Badge>
          </div>
        )}
      </div>



      {/* Discount Banner */}
      {isBefore7PM() && (
        <div className="container mx-auto px-4 py-2">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-center py-3 px-4 rounded-lg shadow-lg">
            <div className="flex items-center justify-center gap-2">
              <span className="text-lg">🎉</span>
              <span className="font-bold text-lg">Happy Hour!</span>
              <span className="text-sm">10% OFF all items before 7:00 PM</span>
              <span className="text-lg">🎉</span>
            </div>
          </div>
        </div>
      )}

      {/* Menu Content */}
      <div className="container mx-auto px-4 py-4 md:py-6 max-w-4xl">
        {loadingMenu ? (
          <div className="w-full space-y-12">
            {Object.entries(categoryIcons).map(([category]) => (
              <CategorySkeleton key={category} />
            ))}
          </div>
        ) : (
            <div className="w-full space-y-12">
              {Object.entries(groupedMenu).map(([category, items]) => (
                <div key={category} className="space-y-6 md:space-y-8">
                  <div className="mb-6 md:mb-8">
                    <div className="flex items-center gap-3">
                      {React.createElement(getCategoryIcon(category), { 
                        className: "w-8 h-8 text-gray-700" 
                      })}
                      <h2 className="text-2xl md:text-3xl font-bold capitalize text-gray-900">
                        {category}
                      </h2>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 items-start">
                    {items.map((item, index) => (
                    <Card key={item._id || index} className="overflow-hidden hover:shadow-2xl transition-all duration-200 rounded-lg border-0 shadow-xl bg-white p-0 h-full flex flex-col" style={{ boxShadow: '8px 8px 16px rgba(0, 0, 0, 0.15), 4px 4px 8px rgba(0, 0, 0, 0.1)' }}>
                      <CardContent className="p-0 flex flex-col h-full">
                        <div className="relative flex-shrink-0">
                          {item.image ? (
                            <CloudinaryImage 
                              src={item.image} 
                              alt={item.nameEn || item.name}
                              width={300}
                              height={200}
                              className="w-full h-32 md:h-48 object-cover rounded-t-lg"
                            />
                          ) : (
                            <div className="w-full h-32 md:h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                              <span className="text-gray-500 text-sm">No image</span>
                            </div>
                          )}
                        </div>
                        <div className="p-2 md:p-4 flex flex-col flex-grow">
                          <div className="flex justify-between items-center mb-1 md:mb-2">
                            <h3 className="font-bold text-sm md:text-lg text-gray-900">
                              {item.nameEn || item.name}
                            </h3>
                            <div className="flex flex-col items-end">
                              {isBefore7PM() ? (
                                <>
                                  <span className="text-xs text-gray-500 line-through">
                                    ${typeof item.price === "number" ? item.price.toFixed(2) : item.price}
                                  </span>
                                  <Badge style={{ backgroundColor: '#FFB0B0', color: '#8B4513' }} className="text-xs md:text-sm font-bold px-2 md:px-3 py-1">
                                    ${typeof item.price === "number" ? getDiscountedPrice(item.price).toFixed(2) : item.price}
                                  </Badge>
                                </>
                              ) : (
                                <Badge style={{ backgroundColor: '#FFB0B0', color: '#8B4513' }} className="text-xs md:text-sm font-bold px-2 md:px-3 py-1">
                                  ${typeof item.price === "number" ? item.price.toFixed(2) : item.price}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <p className="text-gray-600 text-xs md:text-sm leading-relaxed mb-2 md:mb-4 line-clamp-2 flex-grow">
                            {item.descriptionEn || item.description}
                          </p>
                          <Button 
                            size="sm"
                            style={{ backgroundColor: '#FFD09B', color: '#8B4513' }}
                            className="w-full hover:opacity-80 font-medium text-xs md:text-sm py-1 md:py-2 mt-auto" 
                            onClick={() => addToCart(item)}
                          >
                            Add to Cart
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                </div>
              ))}
            </div>
          )}
        {/* Floating Cart Button */}
        <Button
          className="fixed bottom-4 md:bottom-8 right-4 md:right-8 z-50 shadow-lg px-4 md:px-6 py-2 md:py-3 rounded-full text-sm md:text-base"
          style={{ display: cart.length ? "block" : "none", backgroundColor: '#FFB0B0', color: '#8B4513' }}
          onClick={() => setCartOpen(true)}
        >
          View Cart ({cart.reduce((sum, i) => sum + i.quantity, 0)})
        </Button>
        {/* Cart Modal */}
        <Dialog open={cartOpen} onOpenChange={setCartOpen}>
          <DialogContent className="max-w-lg w-[95vw] md:max-w-lg max-h-[80vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-center">Your Order</DialogTitle>
              <div className="text-sm text-gray-500 text-center">
                {cart.length} item{cart.length !== 1 ? 's' : ''} in cart
              </div>
            </DialogHeader>
            {cart.length === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <div className="text-4xl mb-2">🛒</div>
                <div className="text-lg font-medium mb-2">Your cart is empty</div>
                <div className="text-sm">Add some delicious items to get started!</div>
              </div>
                        ) : (
              <div className="flex flex-col h-[60vh]">
                {/* Scrollable food items */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                  {cart.map(item => (
                    <div key={item.name} className="flex items-center gap-4 border-b pb-4">
                      <CloudinaryImage 
                        src={item.image || "/placeholder.svg"} 
                        alt={item.name} 
                        width={80} 
                        height={80} 
                        className="w-20 h-20 rounded-lg object-cover shadow-sm flex-shrink-0" 
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-base mb-1">{item.name}</div>
                        <div className="text-sm text-gray-600 mb-2">
                          ${typeof item.price === "number" && !isNaN(item.price) ? item.price.toFixed(2) : "0.00"}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => changeQuantity(item.name, item.quantity - 1)} 
                            disabled={item.quantity === 1}
                            className="w-8 h-8 p-0"
                          >
                            -
                          </Button>
                          <span className="px-3 py-1 bg-gray-100 rounded-md text-sm font-medium min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => changeQuantity(item.name, item.quantity + 1)}
                            className="w-8 h-8 p-0"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        onClick={() => removeFromCart(item.name)} 
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
                
                {/* Sticky total and buttons section */}
                <div className="border-t pt-4 bg-white sticky bottom-0">
                  <div className="flex justify-between items-center font-bold text-lg mb-4">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline"
                      onClick={() => setCart([])}
                      className="flex-1 py-3 rounded-lg font-medium text-base border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                    >
                      Empty Cart
                    </Button>
                    <Button 
                      className="flex-1 py-3 rounded-lg font-medium text-base"
                      style={{ backgroundColor: '#FFD09B', color: '#8B4513' }}
                    >
                      Place Order
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm border-t pt-6">
          <p className="mb-2">Thank you for dining with us!</p>
          <p>Please let your server know about any allergies or dietary restrictions</p>
          <div className="mt-4 text-xs">
            <p>WiFi: Sakura_Guest | Password: sushi2024</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 md:mt-16" style={{ backgroundColor: '#FFD09B' }}>
        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div>
              <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4" style={{ color: '#8B4513' }}>{restaurantName}</h3>
              <p className="text-gray-700 text-xs md:text-sm">Experience the perfect blend of tradition and innovation</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 md:mb-4" style={{ color: '#8B4513' }}>Hours</h4>
              <div className="text-gray-700 text-xs md:text-sm space-y-1">
                <div>Mon-Thu: 11:00 AM - 10:00 PM</div>
                <div>Fri-Sat: 11:00 AM - 11:00 PM</div>
                <div>Sunday: 12:00 PM - 9:00 PM</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 md:mb-4" style={{ color: '#8B4513' }}>Location</h4>
              <div className="text-gray-700 text-xs md:text-sm">
                <div>123 Fusion Street</div>
                <div>Downtown District</div>
                <div>Phone: (555) 123-4567</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3 md:mb-4" style={{ color: '#8B4513' }}>Follow Us</h4>
              <div className="flex space-x-3 md:space-x-4 text-xs md:text-sm">
                <span className="text-gray-700 hover:text-gray-900 cursor-pointer">Instagram</span>
                <span className="text-gray-700 hover:text-gray-900 cursor-pointer">Facebook</span>
                <span className="text-gray-700 hover:text-gray-900 cursor-pointer">Twitter</span>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-400 mt-6 md:mt-8 pt-6 md:pt-8 text-center">
            <p className="text-gray-600 text-xs md:text-sm">© 2024 {restaurantName}. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
