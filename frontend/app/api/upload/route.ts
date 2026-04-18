import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const sellerId = formData.get("sellerId") as string | null

    if (!file || !sellerId) {
      return NextResponse.json(
        { error: "File and sellerId are required." },
        { status: 400 }
      )
    }

    // Ensure user exists
    const user = await prisma.user.upsert({
      where: { id: sellerId },
      update: {},
      create: { 
        id: sellerId,
        companyName: "Unknown Entity" // Will be updated by KYC later
      }
    })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Save locally
    const uploadDir = join(process.cwd(), "public/uploads")
    
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch {
       // Ignore if dir already exists
    }

    const uniqueId = typeof crypto.randomUUID === "function" ? crypto.randomUUID() : Math.random().toString(36).substring(7)
    const fileName = `${uniqueId}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`
    const filePath = join(uploadDir, fileName)

    await writeFile(filePath, buffer)

    // Save to database
    // We create the invoice record here BEFORE it's minted on-chain.
    // It acts as the canonical off-chain record.
    const record = await prisma.invoiceRecord.create({
      data: {
        sellerId: user.id,
        clientName: "Pending AI Extraction", // AI will update this later
        pdfPath: `/uploads/${fileName}`,
      }
    })

    return NextResponse.json({ success: true, recordId: record.id, path: `/uploads/${fileName}` })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json(
      { error: "Failed to upload file." },
      { status: 500 }
    )
  }
}
