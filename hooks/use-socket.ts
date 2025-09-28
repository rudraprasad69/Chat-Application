"use client"

import { useEffect, useRef, useState } from "react"
import { useMessageStorage } from "./use-message-storage"

export interface Message {
  id: string
  text: string
  timestamp: string
  sender: string
  senderName: string
  senderAvatar?: string
  roomId: string
}

export interface User {
  id: string
  name: string
  avatar?: string
  isOnline: boolean
}

export const useSocket = (roomId: string, user: User) => {
  const [messages, setMessages] = useState<Message[]>([])
  const [onlineUsers, setOnlineUsers] = useState<User[]>([user])
  const [isConnected, setIsConnected] = useState(true)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const simulatedUsersRef = useRef<User[]>([
    { id: "demo-user", name: "Creative Director", avatar: "/placeholder.svg?key=c8tcx", isOnline: true },
  ])

  const { storedMessages, saveMessage: saveToStorage } = useMessageStorage(roomId)

  useEffect(() => {
    console.log("[v0] Simulated WebSocket connection established")
    setIsConnected(true)
    setOnlineUsers([user, ...simulatedUsersRef.current])

    // Load stored messages on connection
    if (storedMessages.length > 0) {
      const convertedMessages: Message[] = storedMessages.map((stored) => ({
        id: stored.id,
        text: stored.text,
        timestamp: stored.timestamp,
        sender: stored.sender,
        senderName: stored.senderName,
        senderAvatar: stored.senderAvatar,
        roomId: stored.roomId,
      }))
      setMessages(convertedMessages)
      console.log("[v0] Loaded", convertedMessages.length, "messages from storage")
    }

    // Simulate occasional demo responses
    const responseTimer = setTimeout(() => {
      if (Math.random() > 0.7) {
        const demoResponse: Message = {
          id: `demo-${Date.now()}`,
          text: "Thanks for testing the chat! This message will be saved.",
          timestamp: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
          sender: "demo-user",
          senderName: "Creative Director",
          senderAvatar: "/placeholder.svg?key=c8tcx",
          roomId,
        }

        setMessages((prev) => [...prev, demoResponse])

        // Save demo message to storage
        saveToStorage({
          id: demoResponse.id,
          text: demoResponse.text,
          timestamp: demoResponse.timestamp,
          sender: demoResponse.sender,
          senderName: demoResponse.senderName,
          senderAvatar: demoResponse.senderAvatar,
          roomId: demoResponse.roomId,
        })
      }
    }, 3000)

    return () => {
      clearTimeout(responseTimer)
      console.log("[v0] Simulated WebSocket connection closed")
    }
  }, [roomId, user, storedMessages, saveToStorage])

  const sendMessage = (text: string) => {
    if (text.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        text: text.trim(),
        timestamp: new Date().toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
        sender: user.id,
        senderName: user.name,
        senderAvatar: user.avatar,
        roomId,
      }

      console.log("[v0] Sending message:", message.text)
      setMessages((prev) => [...prev, message])

      saveToStorage({
        id: message.id,
        text: message.text,
        timestamp: message.timestamp,
        sender: message.sender,
        senderName: message.senderName,
        senderAvatar: message.senderAvatar,
        roomId: message.roomId,
      })

      // Simulate random responses from demo user
      if (Math.random() > 0.5) {
        setTimeout(
          () => {
            const responses = [
              "Got it! This response is also saved.",
              "Sounds good! Message history is working.",
              "Perfect, thanks! All messages are persistent now.",
              "Let me check on that. Storage is active.",
              "Great work! Chat history is maintained.",
              "I agree with that approach. Messages saved!",
            ]
            const randomResponse = responses[Math.floor(Math.random() * responses.length)]

            const demoResponse: Message = {
              id: `demo-${Date.now()}`,
              text: randomResponse,
              timestamp: new Date().toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              }),
              sender: "demo-user",
              senderName: "Creative Director",
              senderAvatar: "/placeholder.svg?key=c8tcx",
              roomId,
            }

            setMessages((prev) => [...prev, demoResponse])

            // Save demo response to storage
            saveToStorage({
              id: demoResponse.id,
              text: demoResponse.text,
              timestamp: demoResponse.timestamp,
              sender: demoResponse.sender,
              senderName: demoResponse.senderName,
              senderAvatar: demoResponse.senderAvatar,
              roomId: demoResponse.roomId,
            })
          },
          1000 + Math.random() * 2000,
        )
      }
    }
  }

  const sendTypingIndicator = (isTyping: boolean) => {
    console.log("[v0] Typing indicator:", isTyping)

    // Simulate other user typing occasionally
    if (isTyping && Math.random() > 0.8) {
      setTypingUsers(["Creative Director"])
      setTimeout(() => {
        setTypingUsers([])
      }, 2000)
    }
  }

  return {
    messages,
    onlineUsers,
    isConnected,
    typingUsers,
    sendMessage,
    sendTypingIndicator,
  }
}
