export const runtime = "nodejs"
export const dynamic = "force-dynamic" 

import { connectToDatabase } from "@/lib/utils"
import { Leaderboard } from "@/models/leaderboardModel"
import { NextRequest, NextResponse } from "next/server"

const gameModes = [
	{ type: "quotes", subTypes: ["small", "medium", "large"] },
	{ type: "words", subTypes: ["10", "25", "50", "100"] },
	{ type: "time", subTypes: ["15", "30", "60", "120"] },
]

export async function GET(req: NextRequest) {
	await connectToDatabase()

	try {
		const allTopResults = []

		for (const mode of gameModes) {
			const leaderboard = await Leaderboard.findOne({
				mode: mode.type,
			})

			if (leaderboard) {
				allTopResults.push({
					mode: mode.type,
					topResults: leaderboard.topResults,
				})
			}
		}

		return NextResponse.json(allTopResults, { status: 200 })
	} catch (error) {
		console.error(error)
		return NextResponse.json(
			{ error: "Failed to retrieve leaderboard" },
			{ status: 500 }
		)
	}
}
