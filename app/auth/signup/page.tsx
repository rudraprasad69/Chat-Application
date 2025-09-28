import SignupForm from "@/components/auth/signup-form"

export default function SignupPage() {
  return (
    <main className="min-h-screen chat-gradient flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <SignupForm />
      </div>
    </main>
  )
}
