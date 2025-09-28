import ChatInterface from "@/components/chat-interface"
import AuthGuard from "@/components/auth/auth-guard"

export default function Home() {
  return (
    <AuthGuard>
      <main className="min-h-screen chat-gradient">
        <ChatInterface />
      </main>
    </AuthGuard>
  )
}
