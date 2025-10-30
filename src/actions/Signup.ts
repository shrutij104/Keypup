"use server"

import { User } from "@/models/userModel"
import { hash } from "bcryptjs"
import { connectToDatabase } from "@/lib/utils"

const credentialsSignup = async (name: string, email: string, password: string) => {
	try {
		// Connect to the database
		await connectToDatabase()

		// Check if user already exists
		const existingUser = await User.findOne({ email })
		if (existingUser) {
			return "User already exists"
		}

		// Hash password
		const hashedPassword = await hash(password, 10)

		// Create new user
		const newUser = await User.create({
			name,
			email,
			password: hashedPassword,
		})

		return null
	} catch (error) {
		console.error("Error in credentialsSignup:", error)
		return "Something went wrong"
	}
}

export { credentialsSignup }
