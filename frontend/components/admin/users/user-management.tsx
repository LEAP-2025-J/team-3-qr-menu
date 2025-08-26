"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Edit, Trash2, Eye, UserPlus, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_CONFIG } from "@/config/api";
import { CloudinaryImage } from "@/components/CloudinaryImage";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  photo: string;
  registerId: string;
  phoneNumber: string;
  address: string;
  username: string;
  role: "admin" | "user";
  email: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateUserForm {
  firstName: string;
  lastName: string;
  photo: string;
  registerId: string;
  phoneNumber: string;
  address: string;
  username: string;
  password: string;
  role: "admin" | "user";
  email: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  
  const { toast } = useToast();

  const [createForm, setCreateForm] = useState<CreateUserForm>({
    firstName: "",
    lastName: "",
    photo: "",
    registerId: "",
    phoneNumber: "",
    address: "",
    username: "",
    password: "",
    role: "user",
    email: "",
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/users`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch users",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Create user
  const handleCreateUser = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(createForm),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "User created successfully",
        });
        setIsCreateModalOpen(false);
        resetCreateForm();
        fetchUsers();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to create user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error",
        description: "Failed to create user",
        variant: "destructive",
      });
    }
  };

  // Update user
  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/users/${selectedUser._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(createForm),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "User updated successfully",
        });
        setIsEditModalOpen(false);
        setSelectedUser(null);
        resetCreateForm();
        fetchUsers();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  };

  // Delete user
  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/users/${userId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
        fetchUsers();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete user",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  // Toggle user status
  const handleToggleStatus = async (userId: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/users/${userId}/toggle-status`, {
        method: "PATCH",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success",
          description: data.message,
        });
        fetchUsers();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to toggle user status",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast({
        title: "Error",
        description: "Failed to toggle user status",
        variant: "destructive",
      });
    }
  };

  // Reset create form
  const resetCreateForm = () => {
    setCreateForm({
      firstName: "",
      lastName: "",
      photo: "",
      registerId: "",
      phoneNumber: "",
      address: "",
      username: "",
      password: "",
      role: "user",
      email: "",
    });
  };

  // Open edit modal
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setCreateForm({
      firstName: user.firstName,
      lastName: user.lastName,
      photo: user.photo,
      registerId: user.registerId,
      phoneNumber: user.phoneNumber,
      address: user.address,
      username: user.username,
      password: "",
      role: user.role,
      email: user.email,
    });
    setIsEditModalOpen(true);
  };

  // Filter users based on active tab and search query
  const filteredUsers = users.filter((user) => {
    const matchesTab = activeTab === "all" || user.role === activeTab;
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.registerId.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Хэрэглэгчдийн удирдлага</h2>
          <p className="text-gray-600 mt-1">Хэрэглэгчдийг үүсгэх, засах, удирдах</p>
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <UserPlus className="w-4 h-4 mr-2" />
              Шинэ хэрэглэгч
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Шинэ хэрэглэгч үүсгэх</DialogTitle>
              <DialogDescription>
                Хэрэглэгчийн мэдээллийг оруулна уу
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Нэр</Label>
                <Input
                  id="firstName"
                  value={createForm.firstName}
                  onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                  placeholder="Нэр"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Овог</Label>
                <Input
                  id="lastName"
                  value={createForm.lastName}
                  onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                  placeholder="Овог"
                />
              </div>
              <div>
                <Label htmlFor="username">Хэрэглэгчийн нэр</Label>
                <Input
                  id="username"
                  value={createForm.username}
                  onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                  placeholder="username"
                />
              </div>
              <div>
                <Label htmlFor="password">Нууц үг</Label>
                <Input
                  id="password"
                  type="password"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  placeholder="••••••"
                />
              </div>
              <div>
                <Label htmlFor="email">И-мэйл</Label>
                <Input
                  id="email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <Label htmlFor="registerId">Регистрийн дугаар</Label>
                <Input
                  id="registerId"
                  value={createForm.registerId}
                  onChange={(e) => setCreateForm({ ...createForm, registerId: e.target.value })}
                  placeholder="AA12345678"
                />
              </div>
              <div>
                <Label htmlFor="phoneNumber">Утасны дугаар</Label>
                <Input
                  id="phoneNumber"
                  value={createForm.phoneNumber}
                  onChange={(e) => setCreateForm({ ...createForm, phoneNumber: e.target.value })}
                  placeholder="99999999"
                />
              </div>
              <div>
                <Label htmlFor="role">Эрх</Label>
                <Select
                  value={createForm.role}
                  onValueChange={(value: "admin" | "user") => setCreateForm({ ...createForm, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Хэрэглэгч</SelectItem>
                    <SelectItem value="admin">Админ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label htmlFor="photo">Зурагны URL</Label>
                <Input
                  id="photo"
                  value={createForm.photo}
                  onChange={(e) => setCreateForm({ ...createForm, photo: e.target.value })}
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="address">Хаяг</Label>
                <Textarea
                  id="address"
                  value={createForm.address}
                  onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                  placeholder="Хаяг"
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Цуцлах
              </Button>
              <Button onClick={handleCreateUser}>Үүсгэх</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Хэрэглэгч хайх..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">Бүгд</TabsTrigger>
            <TabsTrigger value="admin">Админ</TabsTrigger>
            <TabsTrigger value="user">Хэрэглэгч</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Хэрэглэгчид ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Зураг</TableHead>
                <TableHead>Нэр</TableHead>
                <TableHead>Хэрэглэгчийн нэр</TableHead>
                <TableHead>И-мэйл</TableHead>
                <TableHead>Регистр</TableHead>
                <TableHead>Утас</TableHead>
                <TableHead>Эрх</TableHead>
                <TableHead>Төлөв</TableHead>
                <TableHead>Үйлдэл</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.photo} alt={`${user.firstName} ${user.lastName}`} />
                      <AvatarFallback>
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.firstName} {user.lastName}</div>
                      <div className="text-sm text-gray-500">{user.address}</div>
                    </div>
                  </TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.registerId}</TableCell>
                  <TableCell>{user.phoneNumber}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "destructive" : "secondary"}>
                      {user.role === "admin" ? "Админ" : "Хэрэглэгч"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? "default" : "secondary"}>
                      {user.isActive ? "Идэвхтэй" : "Идэвхгүй"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditModal(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleStatus(user._id)}
                      >
                        {user.isActive ? "Идэвхгүй" : "Идэвхтэй"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteUser(user._id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Хэрэглэгч засах</DialogTitle>
            <DialogDescription>
              Хэрэглэгчийн мэдээллийг засна уу
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-firstName">Нэр</Label>
              <Input
                id="edit-firstName"
                value={createForm.firstName}
                onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                placeholder="Нэр"
              />
            </div>
            <div>
              <Label htmlFor="edit-lastName">Овог</Label>
              <Input
                id="edit-lastName"
                value={createForm.lastName}
                onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                placeholder="Овог"
              />
            </div>
            <div>
              <Label htmlFor="edit-username">Хэрэглэгчийн нэр</Label>
              <Input
                id="edit-username"
                value={createForm.username}
                onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                placeholder="username"
              />
            </div>
            <div>
              <Label htmlFor="edit-password">Нууц үг (хоосон бол өөрчлөхгүй)</Label>
              <Input
                id="edit-password"
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                placeholder="••••••"
              />
            </div>
            <div>
              <Label htmlFor="edit-email">И-мэйл</Label>
              <Input
                id="edit-email"
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="email@example.com"
              />
            </div>
            <div>
              <Label htmlFor="edit-registerId">Регистрийн дугаар</Label>
              <Input
                id="edit-registerId"
                value={createForm.registerId}
                onChange={(e) => setCreateForm({ ...createForm, registerId: e.target.value })}
                placeholder="AA12345678"
              />
            </div>
            <div>
              <Label htmlFor="edit-phoneNumber">Утасны дугаар</Label>
              <Input
                id="edit-phoneNumber"
                value={createForm.phoneNumber}
                onChange={(e) => setCreateForm({ ...createForm, phoneNumber: e.target.value })}
                placeholder="99999999"
              />
            </div>
            <div>
              <Label htmlFor="edit-role">Эрх</Label>
              <Select
                value={createForm.role}
                onValueChange={(value: "admin" | "user") => setCreateForm({ ...createForm, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Хэрэглэгч</SelectItem>
                  <SelectItem value="admin">Админ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2">
              <Label htmlFor="edit-photo">Зурагны URL</Label>
              <Input
                id="edit-photo"
                value={createForm.photo}
                onChange={(e) => setCreateForm({ ...createForm, photo: e.target.value })}
                placeholder="https://example.com/photo.jpg"
              />
            </div>
            <div className="col-span-2">
              <Label htmlFor="edit-address">Хаяг</Label>
              <Textarea
                id="edit-address"
                value={createForm.address}
                onChange={(e) => setCreateForm({ ...createForm, address: e.target.value })}
                placeholder="Хаяг"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Цуцлах
            </Button>
            <Button onClick={handleUpdateUser}>Хадгалах</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
