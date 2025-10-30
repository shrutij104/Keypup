/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react"
import { PiMedalFill } from "react-icons/pi"
import { socket } from "@/lib/sockets"
import { useMultiplayerstore } from "@/lib/zustand/multiplayerstore"
import { useTestStore } from "@/lib/zustand/teststore"
import { useTimeStore } from "@/lib/zustand/timestore"
import { useGamesStore } from "@/lib/zustand/gamestore"
import { VscDebugRestart } from "react-icons/vsc"
import { useRouter } from "next/navigation"

interface PlayerResult {
	id: string
	name: string
	mode: string
	subType: string
	correctChars: number
	rawChars: number
	wpm: number
	totalTime: number
}

export default function MultiplayerResults({ email }: { email: string }) {
	let totalTime = useGamesStore.getState().time
		? useGamesStore.getState().totalTime || 1
		: useTimeStore.getState().timer || 1

	const mode = useMultiplayerstore((state) => state.mode)
	const subType = useMultiplayerstore((state) => state.subType)
	const correctChars = useTestStore((state) => state.correctChars)
	const rawChars = useTestStore((state) => state.rawChars)
	const [results, setResults] = useState<PlayerResult[]>([])
	const reset = useTestStore((state) => state.reset)

	const [isHovered, setIsHovered] = useState(false)
	const [room, setRoom] = useState("")
	const router = useRouter()

	const Restart = () => {
		useTimeStore.getState().setIsTimerRunning(false)
		useTimeStore.getState().setTime(useGamesStore.getState().totalTime as number)
		reset()
		useTestStore.getState().setLoadResult(false)
		useMultiplayerstore.setState({
			inGame: false,
			inResult: false,
			inWaitingRoom: true,
		})

		router.push(`/multiplayer/${room}`)
	}

	useEffect(() => {
		socket.emit("endGame", mode, subType, correctChars, rawChars, totalTime)

		socket.on("gameResults", (gameResults: PlayerResult[], roomCode: string) => {
			setRoom(roomCode)
			const sortedResults = [...gameResults].sort(
				(a, b) =>
					Math.round((b.correctChars * 60) / (5 * b.totalTime)) -
					Math.round((a.correctChars * 60) / (5 * a.totalTime))
			)

			setResults(sortedResults)

			// Save results only if not already saved in this session
			if (!localStorage.getItem("resultsSaved")) {
				localStorage.setItem("resultsSaved", "true")
				saveMultiplayerResult(sortedResults)
			}
		})

		return () => {
			socket.off("gameResults")
		}
	}, [])

	const saveMultiplayerResult = async (sortedResults: PlayerResult[]) => {
		try {
			const res = await fetch(`/api/saveMultiplayerResult`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
 				},
				body: JSON.stringify({ PlayerResult: sortedResults }),
				credentials: "include",
			})
			const data = await res.json()
			if (!res.ok) console.log("Failed to save result", data)
		} catch (err) {
			console.error("Result error:", err)
		}
	}

	return (
		<div className="flex flex-col items-center w-full mt-3">
			<div className="tracking-widest text-3xl my-7 text-stone-500 dark:text-neutral-500 text-center">
				Multiplayer Results
			</div>

			{results.length === 0 ? (
				<div className="text-center text-xl text-stone-500">
					Waiting for results...
				</div>
			) : (
				<div className="w-full md:w-4/5 lg:w-3/4 flex justify-center px-4 sm:px-6">
					<div className="w-full flex flex-col">
						<div className="w-full border border-stone-300 dark:border-neutral-600 rounded-xl sm:rounded-3xl py-1 px-2 sm:px-4 bg-white dark:bg-[#242120]">
							{/* Table Header */}
							<div className="grid grid-cols-4 text-sm sm:text-lg font-medium pt-1 pb-3 border-b border-stone-200 dark:border-neutral-700 text-center bg-white dark:bg-[#242120] text-purple-600">
								<span className="px-1 sm:px-2">Rank</span>
								<span className="px-1 sm:px-2">Player</span>
								<span className="px-1 sm:px-2">Raw WPM</span>
								<span className="px-1 sm:px-2">WPM</span>
							</div>

							{results.map((player, idx) => (
								<div
									key={player.id}
									className={`grid grid-cols-4 text-sm sm:text-base py-2 border-b last:border-b-0 border-stone-200 dark:border-neutral-700 text-center text-stone-400 ${
										idx % 2 === 0
											? "bg-neutral-200 dark:bg-stone-800"
											: "bg-white dark:bg-[#242120]"
									}`}
								>
									<span className="flex justify-center items-center">
										{idx === 0 ? (
											<PiMedalFill className="text-yellow-400 w-5 h-5" />
										) : idx === 1 ? (
											<PiMedalFill className="text-gray-300 w-5 h-5" />
										) : idx === 2 ? (
											<PiMedalFill className="text-[#CD7F32] w-5 h-5" />
										) : (
											idx + 1
										)}
									</span>
									<span className="px-1 truncate">{player.name}</span>
									<span className="px-1">
										{Math.round(
											(player.rawChars * 60) /
												(5 * player.totalTime)
										)}
									</span>
									<span className="px-1">
										{Math.round(
											(player.correctChars * 60) /
												(5 * player.totalTime)
										)}
									</span>
								</div>
							))}
						</div>
						<VscDebugRestart
							onClick={Restart}
							onMouseEnter={() => setIsHovered(true)}
							onMouseLeave={() => setIsHovered(false)}
							className="w-8 h-8 text-stone-400 dark:text-neutral-600 hover:text-stone-500 hover:dark:text-neutral-500 transition-all duration-200 ease-in-out mx-auto mt-8"
						/>
						<div
							className={`text-center text-xs tracking-widest text-stone-500 dark:text-neutral-500 transition-opacity duration-300 ease-in-out ${
								isHovered
									? "opacity-100"
									: "opacity-0 pointer-events-none"
							}`}
						>
							Restart Test
						</div>
					</div>
				</div>
			)}
		</div>
	)
}
