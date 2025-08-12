"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

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

interface RecentOrdersProps {
  orders: Order[]
  onRefresh: () => void
  onUpdateStatus: (orderId: string, newStatus: string) => void
}

export function RecentOrders({ orders, onRefresh, onUpdateStatus }: RecentOrdersProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "preparing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "ready":
        return "bg-green-100 text-green-800 border-green-200"
      case "served":
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200"
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Recent Orders
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
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
                    <Button size="sm" onClick={() => onUpdateStatus(order._id, "preparing")}>
                      Start Preparing
                    </Button>
                  )}
                  {order.status === "preparing" && (
                    <Button size="sm" onClick={() => onUpdateStatus(order._id, "ready")}>
                      Mark Ready
                    </Button>
                  )}
                  {order.status === "ready" && (
                    <Button size="sm" variant="outline" onClick={() => onUpdateStatus(order._id, "served")}>
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
  )
}
