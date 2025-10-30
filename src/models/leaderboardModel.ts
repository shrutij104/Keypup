export const runtime = "nodejs"

import mongoose from "mongoose"

const topResultSchema = new mongoose.Schema({
	playerName: { type: String, required: true },
	subType: {
		type: String,
		required: true,
		enum: [
			"small",
			"medium",
			"large",
			"10",
			"25",
			"50",
			"100",
			"15",
			"30",
			"60",
			"120",
		],
	},
	email: { type: String, required: true },
	rawSpeed: { type: Number, required: true },
	wpm: { type: Number, required: true },
})

const leaderboardSchema = new mongoose.Schema({
	mode: {
		type: String,
		required: true,
		enum: ["quotes", "words", "time"],
	},
	topResults: [topResultSchema],
})

export const Leaderboard =
	mongoose.models?.Leaderboard || mongoose.model("Leaderboard", leaderboardSchema)
