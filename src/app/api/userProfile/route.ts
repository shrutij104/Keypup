export const runtime = "nodejs"

import { getUser } from "@/lib/getUser"
import { connectToDatabase } from "@/lib/utils"
import { User } from "@/models/userModel"
import { Leaderboard } from "@/models/leaderboardModel" // Import the Leaderboard model
import { hash } from "bcryptjs"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
	const { email, password, username } = await req.json()

	try {
		const user = await getUser()

		await connectToDatabase()

		if (email !== user?.email) {
			return NextResponse.json(
				{ error: "You can only update your profile" },
				{ status: 403 }
			)
		}

		const updateData: { name: string; password?: string } = {
			name: username ? username : user?.name,
		}

		if (password !== "") {
			const hashedPassword = await hash(password, 10)
			updateData.password = hashedPassword
		}

		const updatedUser = await User.findOneAndUpdate({ email }, updateData, {
			new: true,
		})

		if (!updatedUser) {
			return NextResponse.json({ error: "User not found" }, { status: 404 })
		}

		await updatedUser.save()

		if (username && username !== user?.name) {
			await Leaderboard.updateMany(
				{ "topResults.email": email },
				{
					$set: {
						"topResults.$[elem].playerName": username,
					},
				},
				{
					arrayFilters: [{ "elem.email": email }],
				}
			)
		}

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error("Error updating profile:", error)
		return NextResponse.json({ error: "Failed to Update Profile" }, { status: 500 })
	}
}
