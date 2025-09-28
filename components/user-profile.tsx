"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { User, Settings, Bell, Shield, LogOut, Camera } from "lucide-react"
import { useRouter } from "next/navigation"

interface UserData {
  id: string
  name: string
  email: string
  avatar?: string
  bio?: string
  status?: string
  preferences?: {
    notifications: boolean
    soundEnabled: boolean
    darkMode: boolean
    autoSave: boolean
  }
}

interface UserProfileProps {
  onClose: () => void
}

export default function UserProfile({ onClose }: UserProfileProps) {
  const [user, setUser] = useState<UserData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<UserData>>({})
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Load user data from localStorage
    try {
      const storedUser = localStorage.getItem("chat-user")
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        const fullUserData: UserData = {
          ...userData,
          bio: userData.bio || "",
          status: userData.status || "Available",
          preferences: {
            notifications: true,
            soundEnabled: true,
            darkMode: false,
            autoSave: true,
            ...userData.preferences,
          },
        }
        setUser(fullUserData)
        setFormData(fullUserData)
        console.log("[v0] User profile loaded:", fullUserData.name)
      }
    } catch (error) {
      console.error("[v0] Error loading user profile:", error)
    }
  }, [])

  const handleSave = async () => {
    if (!user || !formData) return

    setIsLoading(true)
    console.log("[v0] Saving user profile changes")

    // Simulate API call
    setTimeout(() => {
      const updatedUser = { ...user, ...formData }
      setUser(updatedUser)
      localStorage.setItem("chat-user", JSON.stringify(updatedUser))
      setIsEditing(false)
      setIsLoading(false)
      console.log("[v0] User profile updated successfully")
    }, 1000)
  }

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("chat-user")
      console.log("[v0] User logged out")
      router.push("/auth/login")
    }
  }

  const handlePreferenceChange = useCallback((key: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      preferences: {
        // @ts-ignore
        ...prev.preferences,
        [key]: value,
      },
    }));
  }, []);

  if (!user) {
    return (
      <Card className="w-full max-w-2xl bg-white/90 backdrop-blur-sm border-white/30">
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl bg-white/90 backdrop-blur-sm border-white/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            User Profile
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </CardTitle>
        <CardDescription>Manage your account settings and preferences</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Profile Section */}
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user.avatar || "/placeholder.svg"} />
              <AvatarFallback className="text-lg">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            {isEditing && (
              <Button size="sm" variant="secondary" className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0">
                <Camera className="w-4 h-4" />
              </Button>
            )}
          </div>

          <div className="flex-1 space-y-3">
            {isEditing ? (
              <>
                <div>
                  <Label htmlFor="name" className="text-sm font-medium">
                    Display Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="bio" className="text-sm font-medium">
                    Bio
                  </Label>
                  <Input
                    id="bio"
                    value={formData.bio || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="status" className="text-sm font-medium">
                    Status
                  </Label>
                  <Input
                    id="status"
                    value={formData.status || ""}
                    onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                    placeholder="Available"
                    className="mt-1"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <h3 className="text-xl font-semibold">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
                {user.bio && <p className="text-sm">{user.bio}</p>}
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-muted-foreground">{user.status}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <Separator />

        {/* Preferences Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Preferences
          </h3>

          <div className="space-y-4">
          {/* <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive message notifications</p>
                </div>
              </div>
              <Switch
                checked={formData.preferences?.notifications ?? true}
                onCheckedChange={(checked) => handlePreferenceChange("notifications", checked)}
                disabled={!isEditing}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Sound Effects</p>
                  <p className="text-sm text-muted-foreground">Play sounds for new messages</p>
                </div>
              </div>
              <Switch
                checked={formData.preferences?.soundEnabled ?? true}
                onCheckedChange={(checked) => handlePreferenceChange("soundEnabled", checked)}
                disabled={!isEditing}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Auto-save Messages</p>
                  <p className="text-sm text-muted-foreground">Automatically save chat history</p>
                </div>
              </div>
              <Switch
                checked={formData.preferences?.autoSave ?? true}
                onCheckedChange={(checked) => handlePreferenceChange("autoSave", checked)}
                disabled={!isEditing}
              />
            </div> */}
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button variant="destructive" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            Log Out
          </Button>

          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isLoading}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
