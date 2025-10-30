export const runtime = "nodejs"

import mongoose, { Schema } from "mongoose"

interface OTP {
	otp: string
	email: string
	expiry: Date
	attempts: number
}

const otpSchema = new Schema<OTP>({
	otp: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	expiry: {
		type: Date,
	},
	attempts: {
		type: Number,
	},
})

export const OTP = mongoose.models?.OTP || mongoose.model("OTP", otpSchema)
