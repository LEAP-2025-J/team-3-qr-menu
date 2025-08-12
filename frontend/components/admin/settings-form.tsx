"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export function SettingsForm() {
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Restaurant Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Restaurant Name</label>
              <Input defaultValue="桜 Sakura" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <Input defaultValue="(555) 123-4567" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Address</label>
            <Input defaultValue="123 Main Street, City, State 12345" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Textarea defaultValue="Authentic Japanese cuisine in the heart of the city" />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Operating Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { day: "Monday", hours: "11:00 AM - 10:00 PM" },
              { day: "Tuesday", hours: "11:00 AM - 10:00 PM" },
              { day: "Wednesday", hours: "11:00 AM - 10:00 PM" },
              { day: "Thursday", hours: "11:00 AM - 10:00 PM" },
              { day: "Friday", hours: "11:00 AM - 11:00 PM" },
              { day: "Saturday", hours: "12:00 PM - 11:00 PM" },
              { day: "Sunday", hours: "12:00 PM - 9:00 PM" },
            ].map(({ day, hours }) => (
              <div key={day} className="flex items-center justify-between">
                <span className="font-medium w-24">{day}</span>
                <Input defaultValue={hours} className="flex-1 mx-4" />
                <Button variant="outline" size="sm">Edit</Button>
              </div>
            ))}
          </div>
          <Button className="mt-4">Save Hours</Button>
        </CardContent>
      </Card>
    </div>
  )
}
