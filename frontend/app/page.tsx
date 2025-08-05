"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChefHat, Fish, Soup, Beef, Coffee, Clock, Calendar } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

const menuData = {
  appetizers: [
    {
      name: "Edamame",
      description: "Steamed young soybeans with sea salt",
      price: "$6.50",
      image: "/edamame-beans.png"
    },
    {
      name: "Gyoza",
      description: "Pan-fried pork dumplings with ponzu sauce",
      price: "$8.90",
      image: "/gyoza-dumplings.png"
    },
    {
      name: "Agedashi Tofu",
      description: "Lightly fried tofu in savory dashi broth",
      price: "$7.50",
      image: "/agedashi-tofu.png"
    },
    {
      name: "Takoyaki",
      description: "Octopus balls with takoyaki sauce and bonito flakes",
      price: "$9.50",
      image: "/placeholder-2x1ms.png"
    }
  ],
  sushi: [
    {
      name: "Salmon Nigiri",
      description: "Fresh Atlantic salmon over seasoned rice",
      price: "$3.50",
      image: "/salmon-nigiri.png"
    },
    {
      name: "Tuna Nigiri",
      description: "Premium bluefin tuna over seasoned rice",
      price: "$4.50",
      image: "/tuna-nigiri-sushi.png"
    },
    {
      name: "California Roll",
      description: "Crab, avocado, cucumber with sesame seeds",
      price: "$8.90",
      image: "/california-roll.png"
    },
    {
      name: "Dragon Roll",
      description: "Eel, cucumber topped with avocado and eel sauce",
      price: "$14.50",
      image: "/dragon-roll-sushi.png"
    },
    {
      name: "Rainbow Roll",
      description: "California roll topped with assorted sashimi",
      price: "$16.90",
      image: "/rainbow-roll-sushi.png"
    }
  ],
  mains: [
    {
      name: "Chicken Teriyaki",
      description: "Grilled chicken with teriyaki glaze, steamed rice",
      price: "$16.50",
      image: "/chicken-teriyaki.png"
    },
    {
      name: "Beef Yakitori",
      description: "Grilled beef skewers with tare sauce",
      price: "$18.90",
      image: "/placeholder-f99iw.png"
    },
    {
      name: "Salmon Shioyaki",
      description: "Salt-grilled salmon with daikon radish",
      price: "$19.50",
      image: "/grilled-salmon-shioyaki.png"
    },
    {
      name: "Tonkatsu",
      description: "Breaded pork cutlet with tonkatsu sauce",
      price: "$17.50",
      image: "/tonkatsu-pork-cutlet.png"
    }
  ],
  ramen: [
    {
      name: "Tonkotsu Ramen",
      description: "Rich pork bone broth with chashu, egg, and scallions",
      price: "$14.90",
      image: "/tonkotsu-ramen.png"
    },
    {
      name: "Miso Ramen",
      description: "Fermented soybean paste broth with corn and butter",
      price: "$13.50",
      image: "/placeholder-2yk43.png"
    },
    {
      name: "Shoyu Ramen",
      description: "Clear soy sauce broth with bamboo shoots",
      price: "$12.90",
      image: "/shoyu-ramen.png"
    },
    {
      name: "Spicy Miso Ramen",
      description: "Spicy miso broth with ground pork and bean sprouts",
      price: "$15.50",
      image: "/placeholder.svg?height=120&width=120",
      spicy: true
    }
  ],
  desserts: [
    {
      name: "Mochi Ice Cream",
      description: "Sweet rice cake filled with ice cream (3 pieces)",
      price: "$7.50",
      image: "/placeholder.svg?height=120&width=120"
    },
    {
      name: "Dorayaki",
      description: "Pancake sandwich filled with sweet red bean paste",
      price: "$6.50",
      image: "/placeholder.svg?height=120&width=120"
    },
    {
      name: "Matcha Cheesecake",
      description: "Creamy green tea cheesecake with graham crust",
      price: "$8.90",
      image: "/placeholder.svg?height=120&width=120"
    }
  ]
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

const categoryIcons = {
  appetizers: ChefHat,
  sushi: Fish,
  ramen: Soup,
  mains: Beef,
  desserts: Coffee,
  hours: Clock,
  reservation: Calendar
}

export default function QRMenu() {
  const [activeTab, setActiveTab] = useState("appetizers")
  const [tableNumber, setTableNumber] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const table = searchParams.get('table')
    setTableNumber(table)
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      {/* Header */}
      <div className="bg-red-600 text-white p-6 text-center">
        <h1 className="text-3xl font-bold mb-2">桜 Sakura</h1>
        <p className="text-red-100">Authentic Japanese Cuisine</p>
        {tableNumber && (
          <div className="mt-2">
            <Badge variant="secondary" className="bg-white text-red-600 font-bold">
              Table {tableNumber}
            </Badge>
          </div>
        )}
      </div>

      {/* Menu Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-6">
            {Object.entries(categoryIcons).map(([category, Icon]) => (
              <TabsTrigger 
                key={category} 
                value={category}
                className="flex flex-col gap-1 p-3"
              >
                <Icon className="w-4 h-4" />
                <span className="text-xs capitalize">{category}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(menuData).map(([category, items]) => (
            <TabsContent key={category} value={category} className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 capitalize mb-4 text-center">
                {category}
              </h2>
              <div className="grid gap-4">
                {items.map((item, index) => (
                  <Card key={index} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex">
                        <img 
                          src={item.image || "/placeholder.svg"} 
                          alt={item.name}
                          className="w-24 h-24 object-cover flex-shrink-0"
                        />
                        <div className="flex-1 p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                              {item.name}
                              {item.spicy && (
                                <Badge variant="destructive" className="text-xs">
                                  Spicy
                                </Badge>
                              )}
                            </h3>
                            <span className="font-bold text-red-600 text-lg">
                              {item.price}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}

<TabsContent value="hours" className="space-y-4">
  <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
    Operating Hours
  </h2>
  <Card>
    <CardContent className="p-6">
      <div className="space-y-3">
        {Object.entries(restaurantHours).map(([day, hours]) => (
          <div key={day} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
            <span className="font-medium capitalize text-gray-700">{day}</span>
            <span className="text-gray-600">{hours}</span>
          </div>
        ))}
      </div>
      <div className="mt-6 p-4 bg-red-50 rounded-lg">
        <p className="text-sm text-red-700 text-center">
          <strong>Note:</strong> Kitchen closes 30 minutes before closing time
        </p>
      </div>
    </CardContent>
  </Card>
</TabsContent>

<TabsContent value="reservation" className="space-y-4">
  <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
    Table Reservation
  </h2>
  <Card>
    <CardContent className="p-6">
      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input 
              type="text" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input 
              type="tel" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Phone number"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input 
              type="date" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time
            </label>
            <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
              <option>Select time</option>
              <option>11:30 AM</option>
              <option>12:00 PM</option>
              <option>12:30 PM</option>
              <option>1:00 PM</option>
              <option>1:30 PM</option>
              <option>6:00 PM</option>
              <option>6:30 PM</option>
              <option>7:00 PM</option>
              <option>7:30 PM</option>
              <option>8:00 PM</option>
              <option>8:30 PM</option>
            </select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Party Size
          </label>
          <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500">
            <option>Select party size</option>
            <option>1 person</option>
            <option>2 people</option>
            <option>3 people</option>
            <option>4 people</option>
            <option>5 people</option>
            <option>6 people</option>
            <option>7+ people</option>
          </select>
        </div>
        
        {/* Auto-fill table number if available */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Table Number
          </label>
          <input 
            type="number"
            value={tableNumber || ""}
            onChange={(e) => setTableNumber(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            placeholder="Table number"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Requests
          </label>
          <textarea 
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            rows={3}
            placeholder="Any special requests or dietary restrictions..."
          ></textarea>
        </div>
        
        <button 
          type="submit"
          className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors"
        >
          Reserve Table
        </button>
      </form>
      
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-800 mb-2">Reservation Policy</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Reservations are held for 15 minutes past the reserved time</li>
          <li>• For parties of 6 or more, please call directly: (555) 123-4567</li>
          <li>• Cancellations must be made at least 2 hours in advance</li>
        </ul>
      </div>
    </CardContent>
  </Card>
</TabsContent>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm border-t pt-6">
          <p className="mb-2">Thank you for dining with us!</p>
          <p>Please let your server know about any allergies or dietary restrictions</p>
          <div className="mt-4 text-xs">
            <p>WiFi: Sakura_Guest | Password: sushi2024</p>
          </div>
        </div>
      </div>
    </div>
  )
}
