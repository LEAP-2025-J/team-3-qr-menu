"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { StatsCardSkeleton, OrderRowSkeleton, AdminTabSkeleton, ReservationSkeleton, MenuManagementSkeleton } from "@/components/ui/loading-skeleton"
import { LayoutDashboard, ShoppingCart, Users, Calendar, MenuIcon, Settings, TrendingUp, Clock, CheckCircle, AlertCircle, Search, Filter, Download, Bell, User, Plus, Edit, Trash2, Eye, RefreshCw } from 'lucide-react'

// Types
interface Order {
  _id: string
  orderNumber: string
  table: { number: number }
  items: Array<{
    menuItem: { name: string; nameEn: string; price: number }
    quantity: number
    price: number
  }>
  total: number
  status: string
  customerName?: string
  customerPhone?: string
  createdAt: string
}

interface Table {
  _id: string
  number: number
  capacity: number
  status: string
  currentOrder?: { orderNumber: string; status: string; total: number }
}

interface Reservation {
  _id: string
  reservationNumber: string
  customerName: string
  customerPhone: string
  date: string
  time: string
  partySize: number
  status: string
  table?: { number: number }
}

interface MenuItem {
  _id: string
  name: string
  nameEn: string
  nameMn: string
  description: string
  price: number
  category: { name: string; nameEn: string }
  image?: string
  isAvailable: boolean
  isSpicy: boolean
  preparationTime: number
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [orders, setOrders] = useState<Order[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [restaurantSettings, setRestaurantSettings] = useState(() => {
    // Load saved settings from localStorage on component mount
    const saved = localStorage.getItem('restaurantSettings')
    if (saved) {
      return JSON.parse(saved)
    }
    // Default values if nothing is saved
    return {
      name: "桜 Sakura",
      phone: "(555) 123-4567",
      address: "123 Main Street, City, State 12345",
      description: "Authentic Japanese cuisine in the heart of the city"
    }
  })

  const [operatingHours, setOperatingHours] = useState(() => {
    // Load saved operating hours from localStorage on component mount
    const saved = localStorage.getItem('operatingHours')
    if (saved) {
      return JSON.parse(saved)
    }
    // Default values if nothing is saved
    return [
      { day: "Monday", hours: "11:00 AM - 10:00 PM" },
      { day: "Tuesday", hours: "11:00 AM - 10:00 PM" },
      { day: "Wednesday", hours: "11:00 AM - 10:00 PM" },
      { day: "Thursday", hours: "11:00 AM - 10:00 PM" },
      { day: "Friday", hours: "11:00 AM - 11:00 PM" },
      { day: "Saturday", hours: "12:00 PM - 11:00 PM" },
      { day: "Sunday", hours: "12:00 PM - 9:00 PM" },
    ]
  })
  const [stats, setStats] = useState({
    todayOrders: 0,
    activeReservations: 0,
    totalRevenue: 0,
    averageOrderValue: 0,
  })

  // Load all data function
  const loadData = async () => {
    if (loading) {
      setLoading(true)
      // Add a small delay to show skeleton loading (remove in production)
      await new Promise(resolve => setTimeout(resolve, 2000))
    } else {
      setRefreshing(true)
    }
    
    await Promise.all([
      fetchOrders(),
      fetchTables(),
      fetchReservations(),
      fetchMenuItems(),
    ])
    
    setLoading(false)
    setRefreshing(false)
  }

  // Fetch data functions
  const fetchOrders = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/orders?limit=20")
      const data = await response.json()
      if (data.success) {
        setOrders(data.data)
        
        // Calculate stats
        const today = new Date().toDateString()
        const todayOrders = data.data.filter((order: Order) => 
          new Date(order.createdAt).toDateString() === today
        )
        
        const totalRevenue = todayOrders.reduce((sum: number, order: Order) => sum + order.total, 0)
        const averageOrderValue = todayOrders.length > 0 ? totalRevenue / todayOrders.length : 0
        
        setStats(prev => ({
          ...prev,
          todayOrders: todayOrders.length,
          totalRevenue,
          averageOrderValue,
        }))
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    }
  }

  const fetchTables = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/tables")
      const data = await response.json()
      if (data.success) {
        setTables(data.data)
      }
    } catch (error) {
      console.error("Error fetching tables:", error)
    }
  }

  const fetchReservations = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const response = await fetch(`http://localhost:5000/api/reservations?date=${today}`)
      const data = await response.json()
      if (data.success) {
        setReservations(data.data)
        setStats(prev => ({
          ...prev,
          activeReservations: data.data.filter((res: Reservation) => 
            res.status === 'confirmed' || res.status === 'pending'
          ).length
        }))
      }
    } catch (error) {
      console.error("Error fetching reservations:", error)
    }
  }

  const fetchMenuItems = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/menu")
      const data = await response.json()
      if (data.success) {
        setMenuItems(data.data)
      }
    } catch (error) {
      console.error("Error fetching menu items:", error)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      
      if (response.ok) {
        fetchOrders() // Refresh orders
        fetchTables() // Refresh tables as they might be affected
      }
    } catch (error) {
      console.error("Error updating order status:", error)
    }
  }

  const updateRestaurantSetting = (field: string, value: string) => {
    setRestaurantSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const saveRestaurantSettings = async () => {
    try {
      // Save to localStorage for persistence
      localStorage.setItem('restaurantSettings', JSON.stringify(restaurantSettings))
      
      // Here you would typically save to your backend API
      // For now, we'll just update the local state
      console.log('Saving restaurant settings:', restaurantSettings)
      
      // TODO: Add API call to save to backend
      // const response = await fetch('/api/settings', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(restaurantSettings)
      // })
      
      alert('Restaurant settings saved successfully!')
    } catch (error) {
      console.error("Error saving restaurant settings:", error)
      alert('Error saving settings')
    }
  }

  const loadRestaurantSettings = async () => {
    try {
      // TODO: Load from backend API when available
      // const response = await fetch('/api/settings')
      // if (response.ok) {
      //   const data = await response.json()
      //   setRestaurantSettings(data)
      // }
      
      // For now, settings are loaded from localStorage in useState initializer
      console.log('Restaurant settings loaded from localStorage')
    } catch (error) {
      console.error("Error loading restaurant settings:", error)
    }
  }

  const updateOperatingHours = (day: string, hours: string) => {
    setOperatingHours(prev => 
      prev.map(item => 
        item.day === day ? { ...item, hours } : item
      )
    )
  }

  const saveOperatingHours = async () => {
    try {
      // Save to localStorage for persistence
      localStorage.setItem('operatingHours', JSON.stringify(operatingHours))
      
      // TODO: Add API call to save to backend
      // const response = await fetch('/api/operating-hours', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(operatingHours)
      // })
      
      console.log('Saving operating hours:', operatingHours)
      alert('Operating hours saved successfully!')
    } catch (error) {
      console.error("Error saving operating hours:", error)
      alert('Error saving operating hours')
    }
  }

  useEffect(() => {
    loadData()
    loadRestaurantSettings()

    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "preparing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "ready":
        return "bg-green-100 text-green-800 border-green-200"
      case "served":
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "occupied":
        return "bg-red-100 text-red-800 border-red-200"
      case "available":
        return "bg-green-100 text-green-800 border-green-200"
      case "reserved":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "cleaning":
        return "bg-gray-100 text-gray-800 border-gray-200"
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "preparing":
        return <Clock className="w-4 h-4" />
      case "ready":
        return <CheckCircle className="w-4 h-4" />
      case "served":
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`
    return date.toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header Skeleton */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-6 w-20" />
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-32" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        </header>

        <div className="flex">
          {/* Sidebar Skeleton */}
          <aside className="w-64 bg-white border-r border-gray-200 min-h-screen sticky top-16">
            <nav className="p-4 space-y-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </nav>
          </aside>

          {/* Main Content Skeleton */}
          <main className="flex-1 p-6">
            <div className="space-y-6">
              {/* Show different skeleton based on active tab */}
              {activeTab === "dashboard" && (
                <>
                  {/* Stats Cards Skeleton */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <Card key={i}>
                        <StatsCardSkeleton />
                      </Card>
                    ))}
                  </div>

                  {/* Recent Orders Skeleton */}
                  <Card>
                    <CardHeader>
                      <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                          <OrderRowSkeleton key={i} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {activeTab === "orders" && <AdminTabSkeleton />}
              {activeTab === "tables" && <AdminTabSkeleton />}
              {activeTab === "reservations" && <AdminTabSkeleton />}
              {activeTab === "menu" && <MenuManagementSkeleton />}
            </div>
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Refreshing Overlay */}
      {refreshing && (
        <div className="absolute inset-0 bg-black bg-opacity-20 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-lg font-medium">Refreshing data...</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">{restaurantSettings.name} Admin</h1>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Live
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => loadData()}>
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
            <Button variant="outline" size="sm">
              <Bell className="w-4 h-4 mr-2" />
              Notifications ({orders.filter(o => o.status === 'pending').length})
            </Button>
            <Button variant="outline" size="sm">
              <User className="w-4 h-4 mr-2" />
              Admin
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen sticky top-16">
          <nav className="p-4">
            <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
              <TabsList className="grid w-full grid-rows-6 h-auto bg-transparent">
                <TabsTrigger value="dashboard" className="justify-start w-full">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="orders" className="justify-start w-full">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Orders ({orders.filter(o => o.status !== 'completed').length})
                </TabsTrigger>
                <TabsTrigger value="tables" className="justify-start w-full">
                  <Users className="w-4 h-4 mr-2" />
                  Tables ({tables.filter(t => t.status === 'occupied').length}/{tables.length})
                </TabsTrigger>
                <TabsTrigger value="reservations" className="justify-start w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  Reservations ({reservations.length})
                </TabsTrigger>
                <TabsTrigger value="menu" className="justify-start w-full">
                  <MenuIcon className="w-4 h-4 mr-2" />
                  Menu ({menuItems.length})
                </TabsTrigger>
                <TabsTrigger value="settings" className="justify-start w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
                <div className="flex space-x-2">
                  <Button variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                  <Button>
                    <TrendingUp className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.todayOrders}</div>
                    <p className="text-xs text-muted-foreground">
                      {orders.filter(o => o.status === 'pending').length} pending
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Reservations</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.activeReservations}</div>
                    <p className="text-xs text-muted-foreground">For today</p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">
                      {tables.filter(t => t.status === 'occupied').length} tables occupied
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${stats.averageOrderValue.toFixed(2)}</div>
                    <p className="text-xs text-muted-foreground">Per order today</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Orders */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Recent Orders
                    <Button variant="outline" size="sm" onClick={fetchOrders}>
                      <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                      {refreshing ? 'Refreshing...' : 'Refresh'}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">{order.orderNumber}</p>
                            <p className="text-sm text-gray-500">Table {order.table.number}</p>
                          </div>
                          <div>
                            <p className="text-sm">
                              {order.items.map(item => `${item.quantity}x ${item.menuItem.nameEn}`).join(", ")}
                            </p>
                            <p className="text-xs text-gray-500">{formatTime(order.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <p className="font-medium">${order.total.toFixed(2)}</p>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1 capitalize">{order.status}</span>
                          </Badge>
                          <div className="flex space-x-1">
                            {order.status === "pending" && (
                              <Button size="sm" onClick={() => updateOrderStatus(order._id, "preparing")}>
                                Start Preparing
                              </Button>
                            )}
                            {order.status === "preparing" && (
                              <Button size="sm" onClick={() => updateOrderStatus(order._id, "ready")}>
                                Mark Ready
                              </Button>
                            )}
                            {order.status === "ready" && (
                              <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order._id, "served")}>
                                Mark Served
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Orders Tab */}
            <TabsContent value="orders" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-900">Orders Management</h2>
                <div className="flex space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input placeholder="Search orders..." className="pl-10 w-64" />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="preparing">Preparing</SelectItem>
                      <SelectItem value="ready">Ready</SelectItem>
                      <SelectItem value="served">Served</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-4">
                {orders.map((order) => (
                  <Card key={order._id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div>
                            <h3 className="font-semibold text-lg">{order.orderNumber}</h3>
                            <p className="text-sm text-gray-500">
                              Table {order.table.number} • {formatTime(order.createdAt)}
                            </p>
                            {order.customerName && (
                              <p className="text-sm text-gray-600">Customer: {order.customerName}</p>
                            )}
                          </div>
                          <Badge className={getStatusColor(order.status)}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1 capitalize">{order.status}</span>
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-semibold text-lg">${order.total.toFixed(2)}</p>
                            <p className="text-sm text-gray-500">{order.items.length} items</p>
                          </div>
                          <div className="flex space-x-2">
                            {order.status === "pending" && (
                              <Button size="sm" onClick={() => updateOrderStatus(order._id, "preparing")}>
                                Start Preparing
                              </Button>
                            )}
                            {order.status === "preparing" && (
                              <Button size="sm" onClick={() => updateOrderStatus(order._id, "ready")}>
                                Mark Ready
                              </Button>
                            )}
                            {order.status === "ready" && (
                              <Button size="sm" variant="outline" onClick={() => updateOrderStatus(order._id, "served")}>
                                Mark Served
                              </Button>
                            )}
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-1" />
                              Details
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">Order Items:</h4>
                        <div className="space-y-1">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span>{item.quantity}x {item.menuItem.nameEn}</span>
                              <span>${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Tables Tab */}
            <TabsContent value="tables" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-900">Table Management</h2>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Table
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {tables.map((table) => (
                  <Card key={table._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Table {table.number}</CardTitle>
                        <Badge className={getStatusColor(table.status)}>{table.status}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">Capacity:</span>
                          <span>{table.capacity} guests</span>
                        </div>
                        {table.currentOrder && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">Order:</span>
                              <span>{table.currentOrder.orderNumber}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">Total:</span>
                              <span>${table.currentOrder.total.toFixed(2)}</span>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="mt-4 flex space-x-2">
                        {table.status === "occupied" && (
                          <Button size="sm" variant="outline" className="flex-1">
                            Clear Table
                          </Button>
                        )}
                        {table.status === "cleaning" && (
                          <Button size="sm" className="flex-1">
                            Mark Available
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Reservations Tab */}
            <TabsContent value="reservations" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-900">Reservations</h2>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Reservation
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Today's Reservations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reservations.map((reservation) => (
                      <div key={reservation._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-medium">{reservation.customerName}</p>
                            <p className="text-sm text-gray-500">{reservation.customerPhone}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{reservation.time}</p>
                            <p className="text-xs text-gray-500">{reservation.partySize} guests</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge className={getStatusColor(reservation.status)}>
                            {reservation.status}
                          </Badge>
                          {reservation.table && (
                            <Badge variant="outline">Table {reservation.table.number}</Badge>
                          )}
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              Cancel
                            </Button>
                            {reservation.status === "pending" && (
                              <Button size="sm">Confirm</Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Menu Tab */}
            <TabsContent value="menu" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-900">Menu Management</h2>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Menu Item
                </Button>
              </div>

              <div className="grid gap-4">
                {menuItems.map((item) => (
                  <Card key={item._id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {item.image && (
                            <img src={item.image || "/placeholder.svg"} alt={item.nameEn} className="w-16 h-16 object-cover rounded-lg" />
                          )}
                          <div>
                            <h3 className="font-semibold text-lg">{item.nameEn}</h3>
                            <p className="text-sm text-gray-600">{item.nameMn}</p>
                            <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <Badge variant="outline">{item.category.nameEn}</Badge>
                              {item.isSpicy && <Badge variant="destructive">Spicy</Badge>}
                              {!item.isAvailable && <Badge variant="secondary">Unavailable</Badge>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="font-semibold text-lg">${item.price.toFixed(2)}</p>
                            <p className="text-sm text-gray-500">{item.preparationTime} min</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">Settings</h2>

              <div className="flex gap-6 justify-center items-center">
                <Card className="flex-1 min-w-[350px]">
                  <CardHeader>
                    <CardTitle>Restaurant Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                                         <div className="flex flex-wrap gap-4">
                       <div className="flex items-center gap-4 w-full">
                         <label className="text-sm font-medium w-32">Restaurant Name:</label>
                         <Input 
                           value={restaurantSettings.name} 
                           onChange={(e) => updateRestaurantSetting('name', e.target.value)}
                           className="flex-1" 
                         />
                       </div>
                       <div className="flex items-center gap-4 w-full">
                         <label className="text-sm font-medium w-32">Phone:</label>
                         <Input 
                           value={restaurantSettings.phone} 
                           onChange={(e) => updateRestaurantSetting('phone', e.target.value)}
                           className="flex-1" 
                         />
                       </div>
                       <div className="flex items-center gap-4 w-full">
                         <label className="text-sm font-medium w-32">Address:</label>
                         <Input 
                           value={restaurantSettings.address} 
                           onChange={(e) => updateRestaurantSetting('address', e.target.value)}
                           className="flex-1" 
                         />
                       </div>
                       <div className="flex items-center gap-4 w-full">
                         <label className="text-sm font-medium w-32">Description:</label>
                         <Textarea 
                           value={restaurantSettings.description} 
                           onChange={(e) => updateRestaurantSetting('description', e.target.value)}
                           className="flex-1" 
                         />
                       </div>
                       <div className="flex w-full">
                         <Button className="ml-auto" onClick={saveRestaurantSettings}>Save Changes</Button>
                       </div>
                     </div>
                  </CardContent>
                </Card>

                <Card className="flex-1 min-w-[350px]">
                  <CardHeader>
                    <CardTitle>Operating Hours</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4">
                      {operatingHours.map(({ day, hours }) => (
                        <div key={day} className="flex items-center justify-between">
                          <span className="font-medium w-24">{day}</span>
                          <Input 
                            value={hours} 
                            onChange={(e) => updateOperatingHours(day, e.target.value)}
                            className="flex-1 mx-4" 
                          />
                          <Button variant="outline" size="sm">Edit</Button>
                        </div>
                      ))}
                    </div>
                    <Button className="mt-4" onClick={saveOperatingHours}>Save Hours</Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
