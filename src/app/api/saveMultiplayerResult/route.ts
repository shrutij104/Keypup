export const runtime = "nodejs"

import { getUser } from "@/lib/getUser"
import { connectToDatabase } from "@/lib/utils"
import { User } from "@/models/userModel"
import { User as Usertype } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

interface PlayerResult {
	email: string
	id: string
	name: string
	mode: string
	subType: string
	correctChars: number
	rawChars: number
	wpm: number
	totalTime: number
}

export async function POST(req: NextRequest) {
	try {
		await connectToDatabase()

		const { email } = (await getUser()) as Usertype

		const user = await User.findOne({ email })

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 })
		}

		const { PlayerResult } = await req.json()

		if (!PlayerResult) {
			return NextResponse.json({ error: "Invalid data" }, { status: 400 })
		}

		let emailTicked = false

		PlayerResult.map((result: PlayerResult) => {
			if (result.email === email) {
				const wpm =
					Math.round(result.correctChars * 60) / (5 * result.totalTime)

				user.multiplayerResults.averageWPM = Math.round(
					(user.multiplayerResults.averageWPM *
						(user.multiplayerResults.wins +
							user.multiplayerResults.losses) +
						wpm) /
						(user.multiplayerResults.wins +
							user.multiplayerResults.losses +
							1)
				)

				if (PlayerResult[0].email === email && emailTicked === false) {
					user.multiplayerResults.wins += 1
					emailTicked = true
				} else {
					user.multiplayerResults.losses += 1
				}
			}
		})

		await User.findOneAndUpdate(
			{ email },
			{ $set: { multiplayerResults: user.multiplayerResults } },
			{ new: true, runValidators: true }
		)

		return NextResponse.json(
			{ message: "Result Saved successfully" },
			{ status: 200 }
		)
	} catch (error) {
		return NextResponse.json({ error: "Failed to save Result" }, { status: 500 })
	}
}
