export interface StoredMessage {
  id: string
  text: string
  timestamp: string
  sender: string
  senderName: string
  senderAvatar?: string
  roomId: string
  createdAt: number
}

export interface ChatRoom {
  id: string
  name: string
  participants: string[]
  lastMessage?: StoredMessage
  lastActivity: number
}

const MESSAGES_KEY = "chat-messages"
const ROOMS_KEY = "chat-rooms"
const MAX_MESSAGES_PER_ROOM = 1000

export class MessageStorage {
  static saveMessage(message: StoredMessage): void {
    try {
      const messages = this.getMessages(message.roomId)
      messages.push(message)

      // Keep only the latest messages to prevent storage overflow
      const trimmedMessages = messages
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, MAX_MESSAGES_PER_ROOM)
        .sort((a, b) => a.createdAt - b.createdAt)

      const allMessages = this.getAllMessages()
      allMessages[message.roomId] = trimmedMessages

      localStorage.setItem(MESSAGES_KEY, JSON.stringify(allMessages))
      console.log("[v0] Message saved to storage:", message.text)

      // Update room last activity
      this.updateRoomActivity(message.roomId, message)
    } catch (error) {
      console.error("[v0] Error saving message:", error)
    }
  }

  static getMessages(roomId: string): StoredMessage[] {
    try {
      const allMessages = this.getAllMessages()
      return allMessages[roomId] || []
    } catch (error) {
      console.error("[v0] Error loading messages:", error)
      return []
    }
  }

  static getAllMessages(): Record<string, StoredMessage[]> {
    try {
      const stored = localStorage.getItem(MESSAGES_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error("[v0] Error loading all messages:", error)
      return {}
    }
  }

  static clearMessages(roomId: string): void {
    try {
      const allMessages = this.getAllMessages()
      delete allMessages[roomId]
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(allMessages))
      console.log("[v0] Messages cleared for room:", roomId)
    } catch (error) {
      console.error("[v0] Error clearing messages:", error)
    }
  }

  static searchMessages(roomId: string, query: string): StoredMessage[] {
    try {
      const messages = this.getMessages(roomId)
      return messages.filter(
        (message) =>
          message.text.toLowerCase().includes(query.toLowerCase()) ||
          message.senderName.toLowerCase().includes(query.toLowerCase()),
      )
    } catch (error) {
      console.error("[v0] Error searching messages:", error)
      return []
    }
  }

  static getMessageStats(roomId: string): { total: number; today: number; thisWeek: number } {
    try {
      const messages = this.getMessages(roomId)
      const now = Date.now()
      const oneDayAgo = now - 24 * 60 * 60 * 1000
      const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000

      return {
        total: messages.length,
        today: messages.filter((m) => m.createdAt > oneDayAgo).length,
        thisWeek: messages.filter((m) => m.createdAt > oneWeekAgo).length,
      }
    } catch (error) {
      console.error("[v0] Error getting message stats:", error)
      return { total: 0, today: 0, thisWeek: 0 }
    }
  }

  // Room management
  static saveRoom(room: ChatRoom): void {
    try {
      const rooms = this.getAllRooms()
      rooms[room.id] = room
      localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms))
      console.log("[v0] Room saved:", room.name)
    } catch (error) {
      console.error("[v0] Error saving room:", error)
    }
  }

  static getAllRooms(): Record<string, ChatRoom> {
    try {
      const stored = localStorage.getItem(ROOMS_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error("[v0] Error loading rooms:", error)
      return {}
    }
  }

  static getRoom(roomId: string): ChatRoom | null {
    try {
      const rooms = this.getAllRooms()
      return rooms[roomId] || null
    } catch (error) {
      console.error("[v0] Error loading room:", error)
      return null
    }
  }

  static updateRoomActivity(roomId: string, lastMessage: StoredMessage): void {
    try {
      const room = this.getRoom(roomId)
      if (room) {
        room.lastMessage = lastMessage
        room.lastActivity = Date.now()
        this.saveRoom(room)
      }
    } catch (error) {
      console.error("[v0] Error updating room activity:", error)
    }
  }

  static initializeDefaultRoom(roomId: string, roomName: string): void {
    try {
      const existingRoom = this.getRoom(roomId)
      if (!existingRoom) {
        const defaultRoom: ChatRoom = {
          id: roomId,
          name: roomName,
          participants: [],
          lastActivity: Date.now(),
        }
        this.saveRoom(defaultRoom)
        console.log("[v0] Default room initialized:", roomName)
      }
    } catch (error) {
      console.error("[v0] Error initializing default room:", error)
    }
  }
}
