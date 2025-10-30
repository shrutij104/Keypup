"use server" // ✅ Forces server execution

import mongoose from "mongoose"

export const connectToDatabase = async () => {
	try {
		if (mongoose.connection.readyState) return

		await mongoose.connect(process.env.MONGO_URL as string, {
			dbName: "authjs",
		})

		console.log("Connected to MongoDB")
	} catch (error) {
		throw new Error(`Error connecting to database: ${error}`)
	}
}
