"use client"

import React, { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { PiMedalFill } from "react-icons/pi"
import { FaA } from "react-icons/fa6"
import { FaRegClock } from "react-icons/fa"
import { BiSolidQuoteAltLeft } from "react-icons/bi"
import { socket } from "@/lib/sockets"
import { motion } from "framer-motion"
import Logo from "../../../public/logo_purple.svg"
import Image from "next/image"

interface TopResult {
	playerName: string
	subType: string
	rawSpeed: number
	wpm: number
}

interface LeaderboardMode {
	mode: string
	topResults: TopResult[]
}

const Leaderboard = () => {
	const [leaderboard, setLeaderboard] = useState<LeaderboardMode[]>([])
	const [selectedMode, setSelectedMode] = useState<string>("words")

	useEffect(() => {
		socket.disconnect()
	}, [])

	useEffect(() => {
		const fetchLeaderboard = async () => {
			try {
				const res = await fetch("/api/leaderboard", { cache: "no-store" }) // Force fresh data
				const data = await res.json()

				if (!res.ok) {
					console.error("Failed to fetch leaderboard", data)
				} else {
					setLeaderboard(data)
				}
			} catch (err) {
				console.error("Error fetching leaderboard:", err)
			}
		}

		fetchLeaderboard()
	}, [])

	const getModeResults = (mode: string) =>
		leaderboard.find((item) => item.mode.toLowerCase() === mode.toLowerCase())

	return (
		<div className="flex flex-col items-center w-full mt-3 px-4 sm:px-6">
			<h1 className="tracking-widest text-2xl sm:text-3xl my-4 sm:my-7 text-stone-500 dark:text-neutral-500 text-center">
				Leaderboard
			</h1>

			{/* Mode Selector */}
			<div className="w-full max-w-lg sm:max-w-md md:max-w-lg lg:max-w-xl h-14 p-2 mx-auto flex justify-between items-center mt-4 sm:mt-8 mb-6 bg-neutral-200 dark:bg-[#242120] rounded-full border border-stone-400 dark:border-neutral-700 text-stone-400 dark:text-neutral-600">
				<ul className="flex flex-row font-semibold w-full justify-around">
					<li
						className="flex items-center cursor-pointer transition-all duration-300"
						onClick={() => setSelectedMode("quotes")}
						style={{ color: selectedMode === "quotes" ? "#7e22ce" : "" }}
					>
						<BiSolidQuoteAltLeft className="w-4 h-4 mr-2" />
						<span>Quotes</span>
					</li>
					<li
						className="flex items-center cursor-pointer transition-all duration-300"
						onClick={() => setSelectedMode("words")}
						style={{ color: selectedMode === "words" ? "#7e22ce" : "" }}
					>
						<FaA className="w-4 h-4 mr-2" />
						<span>Words</span>
					</li>
					<li
						className="flex items-center cursor-pointer transition-all duration-300"
						onClick={() => setSelectedMode("time")}
						style={{ color: selectedMode === "time" ? "#7e22ce" : "" }}
					>
						<FaRegClock className="w-4 h-4 mr-2" />
						<span>Time</span>
					</li>
				</ul>
			</div>

			{leaderboard.length === 0 ? (
				<div className="text-center text-lg sm:text-xl text-stone-500 mb-8">
					<div className="flex flex-col justify-center items-center mt-16">
						<motion.div
							initial={{ rotate: "0deg" }}
							animate={{ rotate: "360deg" }}
							transition={{ duration: 2, repeat: Infinity }}
						>
							<Image src={Logo} alt="Logo" width={75} height={75} />
						</motion.div>
					</div>
				</div>
			) : (
				<div className="w-full md:w-4/5 lg:w-3/4 flex justify-center">
					<div className="w-full flex flex-col">
						<div className="w-full border border-stone-300 dark:border-neutral-600 rounded-xl sm:rounded-3xl py-1 px-2 sm:px-4 bg-white dark:bg-[#242120]">
							{/* Table Header */}
							<div className="grid grid-cols-5 text-sm sm:text-lg font-medium pt-1 pb-3 border-b border-stone-200 dark:border-neutral-700 text-center bg-white dark:bg-[#242120] text-purple-600">
								<span className="px-1 sm:px-2">Rank</span>
								<span className="px-1 sm:px-2">Player</span>
								<span className="px-1 sm:px-2">Subtype</span>
								<span className="px-1 sm:px-2">Raw WPM</span>
								<span className="px-1 sm:px-2">WPM</span>
							</div>

							{/* Table Rows */}
							{getModeResults(selectedMode)?.topResults?.length ? (
								getModeResults(selectedMode)?.topResults.map(
									(result, idx) => (
										<div
											key={idx}
											className={`grid grid-cols-5 text-sm sm:text-base py-2 border-b last:border-b-0 border-stone-200 dark:border-neutral-700 text-center text-stone-400 ${
												idx % 2 === 0
													? "bg-neutral-200 dark:bg-stone-800"
													: "bg-white dark:bg-[#242120]"
											}`}
										>
											<span className="flex justify-center items-center">
												{idx < 3 ? (
													<PiMedalFill
														className={`${
															idx === 0
																? "text-yellow-400"
																: idx === 1
																? "text-gray-300"
																: "text-[#CD7F32]"
														} w-5 h-5`}
													/>
												) : (
													idx + 1
												)}
											</span>
											<span className="px-1 truncate">
												{result.playerName}
											</span>
											<span className="px-1 truncate">
												{result.subType}
											</span>
											<span className="px-1">
												{result.rawSpeed}
											</span>
											<span className="px-1">{result.wpm}</span>
										</div>
									)
								)
							) : (
								<div className="text-center text-stone-500 py-4">
									No results available
								</div>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	)
}

// Force Client-Side Rendering (avoids build issues)
export default dynamic(() => Promise.resolve(Leaderboard), { ssr: false })
