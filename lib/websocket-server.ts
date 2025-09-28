import { Server as SocketIOServer } from "socket.io"
import type { Server as HTTPServer } from "http"

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

let io: SocketIOServer | null = null

export const initializeWebSocket = (server: HTTPServer) => {
  if (!io) {
    io = new SocketIOServer(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    })

    io.on("connection", (socket) => {
      console.log("[v0] User connected:", socket.id)

      // Join a chat room
      socket.on("join-room", (roomId: string, userData: User) => {
        socket.join(roomId)
        socket.to(roomId).emit("user-joined", userData)
        console.log("[v0] User joined room:", roomId, userData.name)
      })

      // Handle new messages
      socket.on("send-message", (message: Message) => {
        console.log("[v0] Broadcasting message:", message.text)
        io?.to(message.roomId).emit("new-message", message)
      })

      // Handle typing indicators
      socket.on("typing", (data: { roomId: string; userName: string; isTyping: boolean }) => {
        socket.to(data.roomId).emit("user-typing", data)
      })

      // Handle user disconnect
      socket.on("disconnect", () => {
        console.log("[v0] User disconnected:", socket.id)
      })
    })
  }

  return io
}

export const getIO = () => io
