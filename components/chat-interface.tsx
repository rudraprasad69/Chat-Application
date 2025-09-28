"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Send, Settings, User } from "lucide-react"
import { useSocket } from "@/hooks/use-socket"
import ChatSettings from "./chat-settings"
import UserProfile from "./user-profile"

interface Message {
  id: string
  text: string
  timestamp: string
  sender: string
  senderName?: string
  senderAvatar?: string
  roomId?: string
}

export default function ChatInterface() {
  const [currentUser, setCurrentUser] = useState({
    id: "user-1",
    name: "You",
    avatar: "/placeholder.svg?key=user1",
    isOnline: true,
  })

  const [showSettings, setShowSettings] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const roomId = "general-chat"
  const { messages, onlineUsers, isConnected, typingUsers, sendMessage, sendTypingIndicator } = useSocket(
    roomId,
    currentUser,
  )

  const [newMessage, setNewMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [localMessages, setLocalMessages] = useState<Message[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    // Load current user from localStorage
    try {
      const storedUser = localStorage.getItem("chat-user")
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        setCurrentUser({
          id: userData.id,
          name: userData.name,
          avatar: userData.avatar || "/placeholder.svg?key=user1",
          isOnline: true,
        })
        console.log("[v0] Current user loaded:", userData.name)
      }
    } catch (error) {
      console.error("[v0] Error loading current user:", error)
    }
  }, [])

  useEffect(() => {
    if (messages.length === 0 && localMessages.length === 0) {
      const demoMessages: Message[] = [
        {
          id: "1",
          text: "Hey! Are you here?",
          timestamp: "13:53",
          sender: "demo-user",
          senderName: "Creative Director",
          senderAvatar: "/placeholder.svg?key=c8tcx",
          roomId,
        },
        {
          id: "2",
          text: "Yeah...",
          timestamp: "13:53",
          sender: currentUser.id,
          senderName: currentUser.name,
          senderAvatar: currentUser.avatar,
          roomId,
        },
        {
          id: "3",
          text: "Great work on the slides! Love it! Just one more thing...",
          timestamp: "13:53",
          sender: "demo-user",
          senderName: "Creative Director",
          senderAvatar: "/placeholder.svg?key=c8tcx",
          roomId,
        },
      ]
      setLocalMessages(demoMessages)
    }
  }, [messages.length, localMessages.length, currentUser.id, currentUser.name, currentUser.avatar, roomId])

  const allMessages = [...localMessages, ...messages]

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [allMessages])

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      console.log("[v0] Sending message via WebSocket:", newMessage)
      sendMessage(newMessage)
      setNewMessage("")
      handleStopTyping()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value)
    handleStartTyping()
  }

  const handleStartTyping = () => {
    if (!isTyping) {
      setIsTyping(true)
      sendTypingIndicator(true)
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }

    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping()
    }, 2000)
  }

  const handleStopTyping = () => {
    if (isTyping) {
      setIsTyping(false)
      sendTypingIndicator(false)
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
    }
  }

  if (showSettings) {
    return (
      <div className="min-h-screen chat-gradient flex items-center justify-center p-6">
        <ChatSettings roomId={roomId} onClose={() => setShowSettings(false)} />
      </div>
    )
  }

  if (showProfile) {
    return (
      <div className="min-h-screen chat-gradient flex items-center justify-center p-6">
        <UserProfile onClose={() => setShowProfile(false)} />
      </div>
    )
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-80 bg-white/80 backdrop-blur-sm border-r border-white/20 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
              <span className="text-sm font-medium text-muted-foreground">
                Messenger {isConnected ? "(Connected)" : "(Disconnected)"}
              </span>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => setShowSettings(true)} className="p-2">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowProfile(true)} className="p-2">
                <User className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={currentUser.avatar || "/placeholder.svg"} />
              <AvatarFallback>{currentUser.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-foreground">{currentUser.name}</h2>
              <p className="text-xs text-muted-foreground">{onlineUsers.length} online</p>
            </div>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 p-4">
          <div className="space-y-2">
            <Card className="p-3 bg-white/60 border-white/30 cursor-pointer hover:bg-white/80 transition-colors">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="/placeholder.svg?key=c8tcx" />
                  <AvatarFallback>CD</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">Creative Director</p>
                  <p className="text-xs text-muted-foreground truncate">Great work on the slides!</p>
                </div>
                <span className="text-xs timestamp-text">13:53</span>
              </div>
            </Card>

            {/* Online Users */}
            <div className="mt-4">
              <h3 className="text-xs font-medium text-muted-foreground mb-2">ONLINE ({onlineUsers.length})</h3>
              <div className="space-y-1">
                {onlineUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/40">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={user.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-foreground">{user.name}</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full ml-auto"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="p-4 border-t border-white/20">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" className="text-primary">
              Skip & Start
            </Button>
            <Button variant="ghost" size="sm" className="text-primary">
              Messenger
            </Button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 p-6 overflow-y-auto h-0">
          <div className="max-w-2xl mx-auto space-y-6">
            {allMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === currentUser.id ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-md ${message.sender === currentUser.id ? "order-2" : "order-1"}`}>
                  {message.sender !== currentUser.id && (
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={message.senderAvatar || "/placeholder.svg"} />
                        <AvatarFallback>{message.senderName?.charAt(0) || "U"}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground">{message.senderName}</span>
                    </div>
                  )}
                  <div className="message-bubble rounded-2xl px-4 py-3 shadow-sm">
                    <p className="text-sm leading-relaxed">{message.text}</p>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs timestamp-text">{message.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}

            {typingUsers.length > 0 && (
              <div className="flex justify-start">
                <div className="max-w-md">
                  <div className="message-bubble rounded-2xl px-4 py-3 shadow-sm">
                    <p className="text-sm text-muted-foreground italic">
                      {typingUsers.join(", ")} {typingUsers.length === 1 ? "is" : "are"} typing...
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Message Input */}
        <div className="p-6 border-t border-white/20 bg-white/50 backdrop-blur-sm">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Input
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter Message"
                  className="bg-white/80 border-white/30 rounded-xl px-4 py-3 text-sm placeholder:text-muted-foreground focus:bg-white focus:border-primary/50"
                  disabled={!isConnected}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-4 py-3"
                disabled={!isConnected || !newMessage.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Status */}
        <div className="px-6 py-2 bg-white/30 backdrop-blur-sm">
          <div className="max-w-2xl mx-auto flex justify-end">
            <span className="text-xs timestamp-text">1:53 PM</span>
          </div>
        </div>
      </div>
    </div>
  )
}
