export const runtime = "nodejs"

import { getUser } from "@/lib/getUser"
import { connectToDatabase } from "@/lib/utils"
import { Leaderboard } from "@/models/leaderboardModel"
import { User } from "@/models/userModel"
import { User as Usertype } from "next-auth"
import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
	try {
		await connectToDatabase()

		const { email } = (await getUser()) as Usertype

		const user = await User.findOne({ email })

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 })
		}

		const { type, subType, rawSpeed, wpm } = await req.json()

		if (!type || !subType || typeof wpm !== "number" || wpm < 0) {
			return NextResponse.json({ error: "Invalid data" }, { status: 400 })
		}

		const defaultResults: { type: string; subType: string; wpm: number }[] = [
			{ type: "quotes", subType: "small", wpm: 0 },
			{ type: "quotes", subType: "medium", wpm: 0 },
			{ type: "quotes", subType: "large", wpm: 0 },
			{ type: "words", subType: "10", wpm: 0 },
			{ type: "words", subType: "25", wpm: 0 },
			{ type: "words", subType: "50", wpm: 0 },
			{ type: "words", subType: "100", wpm: 0 },
			{ type: "time", subType: "15", wpm: 0 },
			{ type: "time", subType: "30", wpm: 0 },
			{ type: "time", subType: "60", wpm: 0 },
			{ type: "time", subType: "120", wpm: 0 },
		]

		if (user.allResults.length === 0) {
			defaultResults.forEach(
				(result: { type: string; subType: string; wpm: number }) => {
					user.allResults.push(result)
				}
			)
		}

		const existingResultIndex = user.allResults.findIndex(
			(result: { type: string; subType: string; wpm: number }) =>
				result.type === type && result.subType === String(subType)
		)

		if (existingResultIndex !== -1) {
			const existingResult = user.allResults[existingResultIndex]
			if (existingResult.wpm < wpm) {
				existingResult.wpm = wpm
			}
		} else {
			user.allResults.push({ type, subType: String(subType), wpm })
		}

		if (user.recentResult.length < 5) {
			user.recentResult.unshift({ type, subType: String(subType), wpm })
		} else {
			user.recentResult.pop()
			user.recentResult.unshift({ type, subType: String(subType), wpm })
		}

		await User.findOneAndUpdate(
			{ email },
			{ $set: { allResults: user.allResults, recentResult: user.recentResult } },
			{ new: true, runValidators: true }
		)

		let leaderboard = await Leaderboard.findOne({
			mode: type,
		})

		if (!leaderboard) {
			leaderboard = new Leaderboard({
				mode: type,
				topResults: [
					{
						playerName: user.name,
						subType: String(subType),
						email: user.email,
						rawSpeed: Number(rawSpeed),
						wpm: Number(wpm),
					},
				],
			})

			await leaderboard.save()
		} else {
			const isEmailExist = leaderboard.topResults.some(
				(result: { email: string }) => result.email === user.email
			)

			if (isEmailExist) {
				const index = leaderboard.topResults.findIndex(
					(result: { email: String }) => result.email === user.email
				)

				if (leaderboard.topResults[index].wpm < Number(wpm)) {
					leaderboard.topResults[index].wpm = Number(wpm)
					leaderboard.topResults[index].rawSpeed = Number(rawSpeed)
					leaderboard.topResults[index].playerName = user.name
				}
			} else {
				leaderboard.topResults.push({
					playerName: user.name,
					subType: String(subType),
					rawSpeed: Number(rawSpeed),
					email: user.email,
					wpm: Number(wpm),
				})
			}
			leaderboard.topResults.sort(
				(a: { wpm: number }, b: { wpm: number }) => b.wpm - a.wpm
			)
			leaderboard.topResults = leaderboard.topResults.slice(0, 10)
			await Leaderboard.findOneAndUpdate(
				{ mode: type },
				{ $set: { topResults: leaderboard.topResults } },
				{ new: true, runValidators: true, upsert: true }
			)
		}

		return NextResponse.json(
			{ message: "Result Saved successfully" },
			{ status: 200 }
		)
	} catch (error) {
		return NextResponse.json({ error: "Failed to save Result" }, { status: 500 })
	}
}
