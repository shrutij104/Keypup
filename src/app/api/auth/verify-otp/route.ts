export const runtime = "nodejs";

import {NextRequest, NextResponse} from "next/server"
import {OTP} from "@/models/otpModels" 
import { connectToDatabase } from "@/lib/utils"

export async function POST(req: NextRequest) {
	const {email, otp} = await req.json()

	if (!email || !otp) {
		return NextResponse.json({error: "Email and OTP are required"}, {status: 400})
	}

	try {
		await connectToDatabase()
		const otpRecord = await OTP.findOne({email})
		

		if (!otpRecord) {
			return NextResponse.json(
				{success: false, error: "OTP not found"},
				{status: 400}
			)
		}

		const {expiry, attempts} = otpRecord

		if (new Date() > expiry) {
			return NextResponse.json(
				{success: false, error: "OTP expired"},
				{status: 400}
			)
		}

		if (attempts >= 3) {
			return NextResponse.json(
				{success: false, error: "OTP verification attempts exceeded"},
				{status: 400}
			)
		}

		if (otpRecord.otp === otp) {
			await OTP.deleteOne({email}) // Remove the OTP record after successful verification
			return NextResponse.json({success: true})
		} else {
			// Increment attempts if OTP is incorrect
			await OTP.findOneAndUpdate({email}, {$inc: {attempts: 1}})
			return NextResponse.json(
				{success: false, error: "Invalid OTP"},
				{status: 400}
			)
		}
	} catch (error) {
		console.error("Error verifying OTP:", error)
		return NextResponse.json({error: "Failed to verify OTP"}, {status: 500})
	}
}
