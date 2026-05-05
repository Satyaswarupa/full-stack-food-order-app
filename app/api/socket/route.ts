import { NextResponse } from 'next/server'

// This endpoint is used to broadcast socket events
// Since we can't use traditional Socket.IO with serverless, we'll use polling
// The client will poll this endpoint or use Server-Sent Events

export async function GET() {
  return NextResponse.json({ status: 'Socket endpoint ready' })
}
