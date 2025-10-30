/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import React, { useEffect, useRef, useState } from "react"
import { useTestStore } from "@/lib/zustand/teststore"
import { useTimeStore } from "@/lib/zustand/timestore"
import { RecordTest } from "@/lib/TestHelpers/recordTest"
import { useGamesStore } from "@/lib/zustand/gamestore"
import { useMultiplayerstore } from "@/lib/zustand/multiplayerstore"
import { socket } from "@/lib/sockets"

function MultiplayerMain() {
	const typedWord = useTestStore((state) => state.typedWord)
	const typedWords = useTestStore((state) => state.typedWords)
	const currWord = useTestStore((state) => state.currWord)
	const currWordIndex = useTestStore((state) => state.currWordIndex)
	const seedWords = useTestStore((state) => state.seedWords)
	const seedQuotes = useTestStore((state) => state.seedQuotes)

	const isDisabled =
		useMultiplayerstore.getState().isMultiplayer &&
		!useMultiplayerstore.getState().isHost

	const timer = useTimeStore((state) => state.timer)

	const time = useGamesStore((state) => state.time)
	const words = useGamesStore((state) => state.words)
	const quotes = useGamesStore((state) => state.quotes)
	const quoteType = useGamesStore((state) => state.quotesType)
	const totalWords = useGamesStore((state) => state.totalWords)

	const [initialWords, setInitialWords] = useState<string[]>([])
	const [isBlinking, setIsBlinking] = useState(false)
	const [isBackspacing, setIsBackspacing] = useState(false)

	const correctCharsForEachSecond = useTestStore(
		(state) => state.correctCharsForEachSecond
	)
	const rawCharsForEachSecond = useTestStore((state) => state.rawCharsForEachSecond)

	const activeWord = useRef<HTMLDivElement>(null)
	const activeLetter = useRef<HTMLSpanElement>(null)
	const cursorRef = useRef<HTMLSpanElement>(null)
	const measureRef = useRef<HTMLSpanElement>(null)
	const wordsContainerRef = useRef<HTMLDivElement>(null)
	let timeoutId = useRef<NodeJS.Timeout | null>(null)

	// Track correct characters typed each second
	const correctCharsPerSecond = useRef(0)
	const rawCharsPerSecond = useRef(0)
	const [hasTouch, setHasTouch] = useState(false)
	const [hasKey, setHasKey] = useState(true)

	useEffect(() => {
		if (
			useMultiplayerstore.getState().isMultiplayer &&
			useMultiplayerstore.getState().isHost
		) {
			socket.emit("startGame", useTestStore.getState().initialWords)
			setInitialWords(useTestStore.getState().initialWords)
		}
	}, [initialWords])

	useEffect(() => {
		if (
			useMultiplayerstore.getState().isMultiplayer &&
			!useMultiplayerstore.getState().isHost
		) {
			setInitialWords(useMultiplayerstore.getState().initialWords)
			useTestStore
				.getState()
				.setInitialWords(useMultiplayerstore.getState().initialWords)
			useTestStore.getState().setCurrWord(useTestStore.getState().initialWords[0])
		}
	}, [useMultiplayerstore.getState().initialWords])

	useEffect(() => {
		useTimeStore.getState().setIsTestRecording(false)
		if (time) {
			let interval: NodeJS.Timeout | null = null

			if (
				useTimeStore.getState().isTimerRunning &&
				useTimeStore.getState().timer > 1
			) {
				interval = setInterval(() => {
					const timeLeft = useTimeStore.getState().timer

					if (timeLeft > 1) {
						useTimeStore.getState().decrementTime()
					} else {
						clearInterval(interval!)

						useMultiplayerstore.getState().setisInGame(false)
						useMultiplayerstore.getState().setisInResult(true)
					}
					correctCharsForEachSecond.push(correctCharsPerSecond.current)
					correctCharsPerSecond.current = 0
					rawCharsForEachSecond.push(rawCharsPerSecond.current)
					rawCharsPerSecond.current = 0
				}, 1000)
			}

			return () => {
				if (interval) {
					clearInterval(interval)
				}
			}
		}
	}, [
		correctCharsForEachSecond,
		time,
		useTimeStore.getState().isTimerRunning,
		rawCharsForEachSecond,
	])

	useEffect(() => {
		useTimeStore.getState().setIsTestRecording(false)
		if (!time) {
			let interval: NodeJS.Timeout | null = null

			if (useTimeStore.getState().isTimerRunning) {
				interval = setInterval(() => {
					const isTestComplete =
						useTestStore.getState().currWordIndex >=
							useTestStore.getState().initialWords.length! - 1 &&
						useTestStore.getState().typedWord.length ===
							useTestStore.getState().currWord.length &&
						useTestStore.getState().typedWord ===
							useTestStore.getState().currWord

					if (isTestComplete) {
						if (
							useTestStore.getState().typedWord ===
							useTestStore.getState().currWord
						) {
							useTestStore.getState().correctChars =
								useTestStore.getState().correctChars +
								useTestStore.getState().currWord.length
						}
						clearInterval(interval!)
						useMultiplayerstore.getState().setisInGame(false)
						useMultiplayerstore.getState().setisInResult(true)
					} else {
						useTimeStore.getState().incrementTime()
					}
					correctCharsForEachSecond.push(correctCharsPerSecond.current)
					correctCharsPerSecond.current = 0
					rawCharsForEachSecond.push(rawCharsPerSecond.current)
					rawCharsPerSecond.current = 0
				}, 1000)
			}

			return () => {
				if (interval) {
					clearInterval(interval)
				}
			}
		}
	}, [
		correctCharsForEachSecond,
		time,
		totalWords,
		useTimeStore.getState().isTimerRunning,
		rawCharsForEachSecond,
	])

	useEffect(() => {
		if (!isDisabled) {
			if (words) {
				seedWords(totalWords as number)
			} else if (quotes) {
				seedQuotes(quoteType)
			} else {
				seedWords(800)
			}
		}
	}, [quoteType, quotes, seedQuotes, seedWords, totalWords, words])

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (!useTimeStore.getState().isTimerRunning) {
				useTimeStore.getState().setIsTimerRunning(true)
			}

			if (e.key.length === 1 || e.key === "Backspace") {
				setIsBackspacing(e.key === "Backspace")
				RecordTest(e.key, activeLetter.current, activeWord.current)
				setIsBlinking(false)

				if (e.key === "Backspace") {
					rawCharsPerSecond.current = Math.max(
						0,
						rawCharsPerSecond.current - 1
					)
				} else {
					rawCharsPerSecond.current += 1
				}

				if (timeoutId.current) {
					clearTimeout(timeoutId.current)
				}

				timeoutId.current = setTimeout(() => {
					setIsBlinking(true)
				}, 500)
			}
		}

		document.addEventListener("keydown", handleKeyDown)

		return () => {
			document.removeEventListener("keydown", handleKeyDown)
		}
	}, [])

	useEffect(() => {
		if (cursorRef.current && activeWord.current && measureRef.current) {
			measureRef.current.textContent = typedWord
			const typedWidth = measureRef.current.getBoundingClientRect().width
			cursorRef.current.style.transform = `translateX(${typedWidth + 3}px)`
			cursorRef.current.style.transition = isBackspacing
				? "none"
				: "transform 0.1s ease"
		}
	}, [typedWord, isBackspacing])

	useEffect(() => {
		const index = typedWord.length - 1
		const currWordRef = activeWord.current

		if (currWordRef && index >= 0) {
			if (currWord[index] === typedWord[index]) {
				activeLetter.current?.classList.add("correct")
				correctCharsPerSecond.current = correctCharsPerSecond.current + 1
			} else {
				activeLetter.current?.classList.add("wrong")
			}
		}
	}, [currWord, typedWord])

	useEffect(() => {
		if (cursorRef.current && wordsContainerRef.current) {
			const container = wordsContainerRef.current
			const cursorPosition = cursorRef.current.getBoundingClientRect().top
			const containerPosition = container.getBoundingClientRect().top
			const containerHeight = container.getBoundingClientRect().height

			const cursorDistanceFromTop = cursorPosition - containerPosition
			const desiredScrollDistance = Math.max(
				0,
				cursorDistanceFromTop - (1 / 3) * containerHeight
			)

			container.scrollBy({
				top: desiredScrollDistance,
				behavior: "smooth",
			})
		}
	}, [typedWord])

	useEffect(() => {
		setHasTouch(
			navigator.maxTouchPoints > 0 ||
				window.matchMedia("(pointer: coarse)").matches
		)
		setHasKey("keyboard" in navigator)
		if (window.screen.width < 765) {
			setHasKey(false)
			setHasTouch(true)
		}
	}, [])

	if (!hasKey && hasTouch) {
		return (
			<div className="flex flex-row justify-center text-center mt-32 p-4 text-2xl text-stone-500">
				<div>
					Keypup is not available on touch devices. Please use a PC for the
					best experience.
				</div>
			</div>
		)
	}

	const extraLetters = currWord ? typedWord.slice(currWord.length).split("") : []

	return (
		<div>
			<div className="flex justify-center w-full mt-12 lg:mt-28">
				<div className="w-3/4 flex flex-col">
					{time && (
						<span className="ml-2 text-3xl font-medium text-purple-700 mb-1 self-start">
							{timer}
						</span>
					)}
					{words && (
						<span className="ml-2 text-3xl font-medium text-purple-700 mb-1 self-start">
							{currWordIndex}/{totalWords}
						</span>
					)}
					{quotes && (
						<span className="ml-2 text-3xl font-medium text-purple-700 mb-1 self-start">
							{currWordIndex}/{initialWords.length}
						</span>
					)}
					<div
						className="w-full flex flex-wrap max-h-[120px] overflow-hidden"
						ref={wordsContainerRef}
					>
						<span
							ref={measureRef}
							className="absolute opacity-0 text-3xl tracking-wide mx-2 my-1"
							aria-hidden="true"
						/>
						{initialWords.map((word, id) => {
							const isActive = id === currWordIndex

							return (
								<div
									key={id}
									ref={isActive ? activeWord : null}
									id="resetableDiv"
									className="text-3xl text-stone-500 dark:text-neutral-500 tracking-wide mx-2 mb-1 inline-block relative"
								>
									{isActive ? (
										<span
											ref={cursorRef}
											className={`absolute ml-[-10px] select-none text-purple-700 text-4xl bottom-0 ${
												isBlinking ? "blink" : ""
											}`}
										>
											|
										</span>
									) : null}
									{word.split("").map((letter, key) => {
										return (
											<span
												id="resetable"
												key={key}
												ref={
													isActive &&
													typedWord.length - 1 === key
														? activeLetter
														: null
												}
												className="mx-0"
											>
												{letter}
											</span>
										)
									})}
									{isActive
										? extraLetters.map((char, charId) => (
												<span
													key={charId}
													className="text-red-500"
												>
													{char}
												</span>
										  ))
										: typedWords[id]
										? typedWords[id]
												.slice(initialWords[id].length)
												.split("")
												.map((char, charId) => (
													<span
														key={charId}
														className="text-red-500"
													>
														{char}
													</span>
												))
										: null}
								</div>
							)
						})}
					</div>
				</div>
			</div>
		</div>
	)
}

export default MultiplayerMain
