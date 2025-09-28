import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  console.log("[v0] WebSocket API route accessed")
  return NextResponse.json({ message: "WebSocket server endpoint" })
}

export async function POST(request: NextRequest) {
  console.log("[v0] WebSocket POST request received")
  return NextResponse.json({ message: "WebSocket server endpoint" })
}
