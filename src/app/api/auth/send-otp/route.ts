export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server"
import otpGenerator from "otp-generator"
import { OTP } from "@/models/otpModels" 
import { sendMail } from "@/lib/sendMail" 
import { connectToDatabase } from "@/lib/utils"

export async function POST(req: NextRequest) {
	const { email } = await req.json()

	if (!email) {
		return NextResponse.json({ error: "Email is required" }, { status: 400 })
	}

	const otp = otpGenerator.generate(6, {
		upperCaseAlphabets: false,
		lowerCaseAlphabets: false,
		specialChars: false,
	})

	const expiry = new Date()
	expiry.setMinutes(expiry.getMinutes() + 10) // OTP expires in 10 minutes

	try {
		// Create or update the OTP record in the database
		await connectToDatabase()

		await OTP.findOneAndUpdate(
			{ email },
			{ otp, expiry, attempts: 0 },
			{ upsert: true, new: true }
		)

		// Send the OTP email
		await sendMail(email, otp)

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error("Error sending OTP:", error)
		return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 })
	}
}