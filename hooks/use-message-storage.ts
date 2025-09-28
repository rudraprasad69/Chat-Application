"use client"

import { useEffect, useState } from "react"
import { MessageStorage, type StoredMessage } from "@/lib/message-storage"

export const useMessageStorage = (roomId: string) => {
  const [storedMessages, setStoredMessages] = useState<StoredMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize default room
    MessageStorage.initializeDefaultRoom(roomId, "General Chat")

    // Load existing messages
    const messages = MessageStorage.getMessages(roomId)
    setStoredMessages(messages)
    setIsLoading(false)

    console.log("[v0] Loaded", messages.length, "messages from storage for room:", roomId)
  }, [roomId])

  const saveMessage = (message: Omit<StoredMessage, "createdAt">) => {
    const messageWithTimestamp: StoredMessage = {
      ...message,
      createdAt: Date.now(),
    }

    MessageStorage.saveMessage(messageWithTimestamp)
    setStoredMessages((prev) => [...prev, messageWithTimestamp])
  }

  const clearMessages = () => {
    MessageStorage.clearMessages(roomId)
    setStoredMessages([])
  }

  const searchMessages = (query: string) => {
    return MessageStorage.searchMessages(roomId, query)
  }

  const getMessageStats = () => {
    return MessageStorage.getMessageStats(roomId)
  }

  return {
    storedMessages,
    isLoading,
    saveMessage,
    clearMessages,
    searchMessages,
    getMessageStats,
  }
}
