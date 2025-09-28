import type { NextRequest } from "next/server"
import { Server as SocketIOServer } from "socket.io"
import type { Server as HTTPServer } from "http"

const SocketHandler = (req: NextRequest, res: any) => {
  if (!res.socket.server.io) {
    console.log("[v0] Setting up Socket.IO server...")

    const httpServer: HTTPServer = res.socket.server as any
    const io = new SocketIOServer(httpServer, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    })

    io.on("connection", (socket) => {
      console.log("[v0] User connected:", socket.id)

      socket.on("join-room", (roomId: string, userData: any) => {
        socket.join(roomId)
        socket.to(roomId).emit("user-joined", userData)
        console.log("[v0] User joined room:", roomId, userData.name)
      })

      socket.on("send-message", (message: any) => {
        console.log("[v0] Broadcasting message:", message.text)
        io.to(message.roomId).emit("new-message", message)
      })

      socket.on("typing", (data: any) => {
        socket.to(data.roomId).emit("user-typing", data)
      })

      socket.on("disconnect", () => {
        console.log("[v0] User disconnected:", socket.id)
      })
    })

    res.socket.server.io = io
  }

  res.end()
}

export { SocketHandler as GET, SocketHandler as POST }
