"use client"

import React, { useMemo, useEffect, useState } from "react"
import { useTestStore } from "@/lib/zustand/teststore"
import { useGamesStore } from "@/lib/zustand/gamestore"
import { useTimeStore } from "@/lib/zustand/timestore"
import dynamic from "next/dynamic"
import "chart.js/auto"
import { VscDebugRestart } from "react-icons/vsc"

const Line = dynamic(() => import("react-chartjs-2").then((mod) => mod.Line), {
	ssr: false,
})

// Create a custom event for theme changes
const THEME_CHANGE_EVENT = "themeChange"

export default function Result() {
	const correctCharsForEachSecond = useTestStore.getState().correctCharsForEachSecond
	const reset = useTestStore.getState().reset
	const rawCharsForEachSecond = useTestStore.getState().rawCharsForEachSecond
	const extraLetters = useTestStore.getState().extraLetters
	const missingLetters = useTestStore.getState().missingLetters
	const type = useGamesStore.getState().getGameType().type
	const subType = useGamesStore.getState().getGameType().subType
	const correctChars = useTestStore.getState().correctChars
	const rawChars = useTestStore.getState().rawChars
	const correctLetters = useTestStore.getState().correctLetters
	const inaccuracies = useTestStore.getState().inaccuracies
	let totalTime = 0
	if (type !== "time") {
		totalTime = useTimeStore.getState().timer || 1
		correctCharsForEachSecond.pop()
	} else {
		totalTime = useGamesStore.getState().totalTime || 1
	}

	const [isClient, setIsClient] = useState(false)
	const [theme, setTheme] = useState<"dark" | "light">("dark")
	const [isHovered, setIsHovered] = useState(false)

	const Restart = () => {
		useTimeStore.getState().setIsTimerRunning(false)
		useTimeStore.getState().setTime(useGamesStore.getState().totalTime as number)
		useTestStore.getState().reset()
		useTestStore.getState().setLoadResult(false)
	}

	useEffect(() => {
		setIsClient(true)

		const getInitialTheme = () => {
			const storedTheme = localStorage.getItem("theme")
			return storedTheme === "light" || storedTheme === "dark"
				? storedTheme
				: "dark"
		}

		setTheme(getInitialTheme())

		// Handle theme changes from both storage events and custom events
		const handleThemeChange = (e: StorageEvent | CustomEvent) => {
			let newTheme: string | null = null

			if (e instanceof StorageEvent) {
				// Storage event (from other tabs)
				if (e.key === "theme") newTheme = e.newValue
			} else {
				// Custom event (from same tab)
				newTheme = localStorage.getItem("theme")
			}

			if (newTheme === "light" || newTheme === "dark") {
				setTheme(newTheme)
			}
		}

		// Listen for both storage events (other tabs) and custom events (same tab)
		window.addEventListener("storage", handleThemeChange)

		// Create a MutationObserver to watch for theme changes in the HTML element
		const observer = new MutationObserver((mutations) => {
			mutations.forEach((mutation) => {
				if (mutation.attributeName === "class") {
					const htmlElement = document.documentElement
					const isDark = htmlElement.classList.contains("dark")
					const newTheme = isDark ? "dark" : "light"
					setTheme(newTheme)
				}
			})
		})

		// Start observing the HTML element for class changes
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		})

		return () => {
			window.removeEventListener("storage", handleThemeChange)
			observer.disconnect()
		}
	}, [])

	const overallWPM = Math.max(0, Math.round((correctChars * 60) / (5 * totalTime)))
	const rawWPM = Math.max(0, Math.round((rawChars * 60) / (5 * totalTime)))

	useEffect(() => {
		const saveResult = async () => {
			try {
				const res = await fetch(`/api/saveResult`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						type,
						subType,
						rawSpeed: rawWPM,
						wpm: overallWPM,
					}),
					credentials: "include",
				})

				const data = await res.json()
				if (!res.ok) {
					console.log("Failed to save result", data)
				}
			} catch (err) {
				console.error("Result error:", err)
			}
		}
		if (!useTimeStore.getState().isTestRecording) {
			useTimeStore.getState().setIsTestRecording(true)
			saveResult()
		}
	}, [overallWPM, rawWPM, subType, type])

	const wpmForEachSecond = useMemo(() => {
		let cumulativeChars = 0
		return correctCharsForEachSecond.map((chars, index) => {
			cumulativeChars += chars
			const cumulativeWPM = Math.max(
				0,
				Math.round((cumulativeChars * 60) / (5 * (index + 1)))
			)
			return { second: index + 1, wpm: cumulativeWPM }
		})
	}, [correctCharsForEachSecond])

	const rawWpmForEachSecond = useMemo(() => {
		let cumulativeChars = 0
		return rawCharsForEachSecond.map((chars, index) => {
			cumulativeChars += chars
			const cumulativeWPM = Math.max(
				0,
				Math.round((cumulativeChars * 60) / (5 * (index + 1)))
			)
			return { second: index + 1, wpm: cumulativeWPM }
		})
	}, [rawCharsForEachSecond])

	const chartData = useMemo(
		() => ({
			labels: wpmForEachSecond.map((entry) => `${entry.second}`),
			datasets: [
				{
					label: "WPM Over Time",
					data: wpmForEachSecond.map((entry) => entry.wpm),
					borderColor: "rgb(136, 4, 228)",
					borderWidth: 2,
					fill: false,
					tension: 0.4,
					pointRadius: 2,
				},
				{
					label: "Raw Speed Over Time",
					data: rawWpmForEachSecond.map((entry) => entry.wpm),
					borderColor:
						theme === "dark" ? "rgb(68, 64, 60)" : "rgb(163, 163, 163)",
					backgroundColor:
						theme === "dark"
							? "rgba(68,64,60,0.3)"
							: "rgba(212, 212, 212, 0.5)",
					fill: true,
					tension: 0.4,
					pointRadius: 2,
				},
			],
		}),
		[wpmForEachSecond, rawWpmForEachSecond, theme]
	)

	const chartOptions = useMemo(
		() => ({
			responsive: true,
			maintainAspectRatio: false,
			plugins: {
				legend: {
					display: false,
				},
			},
			scales: {
				x: {
					grid: {
						display: false,
					},
					ticks: {
						maxTicksLimit: 30,
						color:
							theme === "dark" ? "rgb(163, 163, 163)" : "rgb(68, 64, 60)",
					},
				},
				y: {
					beginAtZero: true,

					ticks: {
						stepSize: 20,
						color:
							theme === "dark" ? "rgb(163, 163, 163)" : "rgb(68, 64, 60)",
					},
				},
			},
		}),
		[theme]
	)

	return (
		<div className="flex justify-center items-center flex-col lg:mt-32">
			<div className="flex flex-row max-lg:flex-col">
				<div className="flex flex-col lg:mr-8">
					<div className="flex flex-col mt-12 items-center">
						<span className="text-2xl font-normal text-stone-400 dark:text-neutral-500">
							wpm
						</span>
						<span className="text-6xl text-purple-600">{overallWPM}</span>
					</div>
					<div className="flex flex-col mt-4 lg:mt-8 items-center">
						<span className="text-2xl font-normal text-stone-400 dark:text-neutral-500">
							acc
						</span>
						<span className="text-6xl text-purple-600 ">
							{Math.round(
								(correctLetters / (rawChars + inaccuracies)) * 100
							)}
							%
						</span>
					</div>
				</div>
				<div className="w-[80rem] h-[20rem] max-lg:hidden max-2xl::w-[50rem]">
					{isClient ? (
						<Line data={chartData} options={chartOptions} />
					) : (
						<p>Loading chart...</p>
					)}
				</div>
			</div>
			<div className="flex flex-row max-lg:flex-col justify-between w-2/3 mt-8 lg:ml-32 max-lg:mt-8">
				<div className="flex flex-col items-center max-lg:mt-4">
					<span className="text-lg font-normal text-stone-400 dark:text-neutral-500">
						test type
					</span>
					<span className="text-4xl text-purple-600 ">
						{type}-{subType}
					</span>
				</div>
				<div className="flex flex-col items-center max-lg:mt-4">
					<span className="text-lg font-normal text-stone-400 dark:text-neutral-500">
						raw
					</span>
					<span className="text-4xl text-purple-600 ">{rawWPM}</span>
				</div>
				<div className="flex flex-col items-center max-lg:mt-4">
					<span className="text-lg font-normal text-stone-400 dark:text-neutral-500">
						characters
					</span>

					<span className="text-4xl text-purple-600 ">
						{correctLetters}/{rawChars - correctLetters}/{extraLetters}/
						{missingLetters}
					</span>
					<span className="text-stone-500 dark:text-neutral-500 max-lg:text-sm">
						Correct / Wrong / Extra / Missing
					</span>
				</div>
				<div className="flex flex-col max-lg:items-center max-lg:mt-4">
					<span className="text-lg font-normal text-stone-400 dark:text-neutral-500">
						time
					</span>
					<span className="text-4xl text-purple-600 ">{totalTime}</span>
				</div>
			</div>
			<VscDebugRestart
				onClick={Restart}
				onMouseEnter={() => setIsHovered(true)}
				onMouseLeave={() => setIsHovered(false)}
				className="max-lg:mt-12 w-8 h-8 text-stone-400 dark:text-neutral-600 hover:text-stone-500 hover:dark:text-neutral-500 transition-all duration-200 ease-in-out mx-auto mt-8"
			/>
			<div
				className={`text-center text-xs tracking-widest text-stone-500 dark:text-neutral-500 transition-opacity duration-300 ease-in-out ${
					isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
				}`}
			>
				Restart Test
			</div>
		</div>
	)
}
