"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { MessageStorage } from "@/lib/message-storage"
import { Search, Trash2, BarChart3, Download } from "lucide-react"

interface ChatSettingsProps {
  roomId: string
  onClose: () => void
}

export default function ChatSettings({ roomId, onClose }: ChatSettingsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [stats, setStats] = useState(MessageStorage.getMessageStats(roomId))

  const handleSearch = () => {
    if (searchQuery.trim()) {
      const results = MessageStorage.searchMessages(roomId, searchQuery)
      setSearchResults(results)
      console.log("[v0] Search results:", results.length, "messages found")
    }
  }

  const handleClearMessages = () => {
    if (confirm("Are you sure you want to clear all messages? This action cannot be undone.")) {
      MessageStorage.clearMessages(roomId)
      setStats({ total: 0, today: 0, thisWeek: 0 })
      console.log("[v0] Messages cleared for room:", roomId)
      alert("Messages cleared successfully!")
    }
  }

  const handleExportMessages = () => {
    const messages = MessageStorage.getMessages(roomId)
    const exportData = {
      roomId,
      exportDate: new Date().toISOString(),
      messageCount: messages.length,
      messages: messages.map((msg) => ({
        timestamp: msg.timestamp,
        sender: msg.senderName,
        text: msg.text,
      })),
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `chat-export-${roomId}-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    console.log("[v0] Messages exported for room:", roomId)
  }

  return (
    <Card className="w-full max-w-2xl bg-white/90 backdrop-blur-sm border-white/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Chat Settings
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </CardTitle>
        <CardDescription>Manage your chat messages and search history</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Message Statistics */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Message Statistics
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Messages</div>
            </div>
            <div className="text-center p-3 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">{stats.today}</div>
              <div className="text-sm text-muted-foreground">Today</div>
            </div>
            <div className="text-center p-3 bg-primary/5 rounded-lg">
              <div className="text-2xl font-bold text-primary">{stats.thisWeek}</div>
              <div className="text-sm text-muted-foreground">This Week</div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Message Search */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Messages
          </h3>
          <div className="flex gap-2">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search messages..."
              className="flex-1"
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch}>Search</Button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto">
              <p className="text-sm text-muted-foreground">Found {searchResults.length} messages</p>
              {searchResults.map((result) => (
                <div key={result.id} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-sm">{result.senderName}</span>
                    <span className="text-xs text-muted-foreground">{result.timestamp}</span>
                  </div>
                  <p className="text-sm">{result.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Message Management */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Message Management</h3>
          <div className="flex gap-3">
            <Button variant="outline" onClick={handleExportMessages} className="flex items-center gap-2 bg-transparent">
              <Download className="w-4 h-4" />
              Export Messages
            </Button>
            <Button variant="destructive" onClick={handleClearMessages} className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" />
              Clear All Messages
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
