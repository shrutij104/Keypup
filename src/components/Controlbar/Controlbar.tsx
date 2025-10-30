/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import React, {  useEffect, useState } from "react"
import { FaA } from "react-icons/fa6"
import { FaRegClock } from "react-icons/fa"
import { BiSolidQuoteAltLeft } from "react-icons/bi"
import { useGamesStore } from "@/lib/zustand/gamestore"
import { useTimeStore } from "@/lib/zustand/timestore"
import { useTestStore } from "@/lib/zustand/teststore"
import { useMultiplayerstore } from "@/lib/zustand/multiplayerstore"
import { socket } from "@/lib/sockets"

type quote = "small" | "medium" | "large" | null

function Controlbar() {
	const [selected, setSelected] = useState<string | number>(15)
	const [isDisabled, setIsDisabled] = useState(
		useMultiplayerstore.getState().isMultiplayer &&
			!useMultiplayerstore.getState().isHost
	)

	useEffect(() => {
		setSelected(useGamesStore.getState().getGameType().subType!)
	}, [])

	const { setQuotes, setWords, setTime, quotes, words, time } = useGamesStore(
		(state) => state
	)

	const handleClick = (size: string | number) => {
		setSelected(size)
	}

	useEffect(() => {
		setIsDisabled(
			useMultiplayerstore.getState().isMultiplayer &&
				!useMultiplayerstore.getState().isHost
		)
	}, [useMultiplayerstore.getState().isHost])

	useEffect(() => {
		if (!isDisabled) {
			socket.emit(
				"changeMode",
				useGamesStore.getState().getGameType().type,
				selected
			)
		}
	}, [isDisabled, selected])

	useEffect(() => {
		const handleChangeMode = (mode: string, newSelected: string | number) => {
			if (isDisabled) {
				switch (mode) {
					case "quotes":
						setQuotes(true, newSelected as quote)
						setSelected(newSelected)
						useTestStore.getState().seedQuotes(newSelected as quote)
						useTimeStore.getState().setIsTimerRunning(false)
						useTimeStore.getState().setTime(0)
						useTestStore.getState().reset()
						break
					case "words":
						setWords(true, Number(newSelected))
						setSelected(newSelected)
						useTimeStore.getState().setIsTimerRunning(false)
						useTimeStore.getState().setTime(0)
						useTestStore.getState().reset()
						break
					case "time":
						setTime(true, Number(newSelected))
						useTimeStore.getState().setTime(Number(newSelected))
						setSelected(newSelected)
						useTimeStore.getState().setIsTimerRunning(false)
						useTestStore.getState().reset()
						break
					default:
						console.warn("Unknown mode:", mode)
						break
				}
			}
		}

		if (isDisabled) {
			socket.on("changeNonHostMode", handleChangeMode)
		} else {
			socket.off("changeNonHostMode", handleChangeMode)
		}

		return () => {
			socket.off("changeNonHostMode", handleChangeMode)
		}
	}, [isDisabled])

	const disabledStyles = "opacity-50 cursor-not-allowed"

	return (
		<div className="flex justify-center mt-16">
			<div className="w-fit h-14 p-2 flex justify-between items-center bg-neutral-200 dark:bg-[#242120] rounded-full border border-stone-400 dark:border-neutral-700 text-stone-400 dark:text-neutral-600 xl:scale-100 sm:scale-90 scale-75 origin-center">
				<ul className="flex flex-row font-semibold">
					<li
						className={`lg:ml-6 ml-4 flex flex-row lg:mr-4 mr-2 items-center hover:text-stone-500 hover:dark:text-neutral-500 transition-all duration-300 ${
							isDisabled ? disabledStyles : "cursor-pointer"
						}`}
						onClick={() => {
							if (!isDisabled) {
								setSelected("small")
								setQuotes(true, "small")
								useTimeStore.getState().setIsTimerRunning(false)
								useTimeStore.getState().setTime(0)
								useTestStore.getState().reset()
							}
						}}
						style={{
							color: quotes ? "#7e22ce" : "",
							transition: "color 0.3s ease-in-out",
						}}
					>
						<BiSolidQuoteAltLeft className="w-5 h-5 mr-2" />
						<span>Quotes</span>
					</li>
					<li
						className={`flex flex-row lg:mx-4 mx-2 items-center hover:text-stone-500 hover:dark:text-neutral-500 transition-all duration-300 ${
							isDisabled ? disabledStyles : "cursor-pointer"
						}`}
						onClick={() => {
							if (!isDisabled) {
								setWords(true, 10)
								useTimeStore.getState().setIsTimerRunning(false)
								useTimeStore.getState().setTime(0)
								useTestStore.getState().reset()
								setSelected(10)
							}
						}}
						style={{
							color: words ? "#7e22ce" : "",
							transition: "color 0.3s ease-in-out",
						}}
					>
						<FaA className="w-4 h-4 mr-2" />
						<span>Words</span>
					</li>
					<li
						className={`flex flex-row lg:ml-4 ml-2 items-center hover:text-stone-500 hover:dark:text-neutral-500 transition-all duration-300 ${
							isDisabled ? disabledStyles : "cursor-pointer"
						}`}
						onClick={() => {
							if (!isDisabled) {
								setTime(true, 15)
								useTimeStore.getState().setTime(15)
								useTimeStore.getState().setIsTimerRunning(false)
								setSelected(15)
							}
						}}
						style={{
							color: time ? "#7e22ce" : "",
							transition: "color 0.3s ease-in-out",
						}}
					>
						<FaRegClock className="w-4 h-4 mr-2" />
						<span className="lg:mr-6 mr-4">Time</span>
					</li>
				</ul>
				<div className="border-r-4 rounded-full border-stone-300 dark:border-stone-800 h-full mr-2"></div>
				{quotes && (
					<ul className="flex flex-row font-semibold">
						<li
							className={`lg:mx-4 mx-2 hover:text-stone-500 hover:dark:text-neutral-500 cursor-pointer transition-all duration-300 ${
								isDisabled ? disabledStyles : "cursor-pointer"
							}`}
							onClick={() => {
								if (!isDisabled) {
									handleClick("small")
									setQuotes(true, "small")
									useTimeStore.getState().setIsTimerRunning(false)
									useTimeStore.getState().setTime(0)
									useTestStore.getState().seedQuotes("small")
								}
							}}
							style={{
								color: selected === "small" ? "#7e22ce" : "",
								transition: "color 0.3s ease-in-out",
							}}
						>
							Small
						</li>
						<li
							className={`lg:mx-4 mx-2 hover:text-stone-500 hover:dark:text-neutral-500 cursor-pointer transition-all duration-300 ${
								isDisabled ? disabledStyles : "cursor-pointer"
							}`}
							onClick={() => {
								if (!isDisabled) {
									handleClick("medium")
									setQuotes(true, "medium")
									useTimeStore.getState().setIsTimerRunning(false)
									useTimeStore.getState().setTime(0)
									useTestStore.getState().reset()
									useTestStore.getState().seedQuotes("medium")
								}
							}}
							style={{
								color: selected === "medium" ? "#7e22ce" : "",
								transition: "color 0.3s ease-in-out",
							}}
						>
							Medium
						</li>
						<li
							className={`lg:mr-6 mr-4 lg:ml-4 ml-2 hover:text-stone-500 hover:dark:text-neutral-500 cursor-pointer transition-all duration-300 ${
								isDisabled ? disabledStyles : "cursor-pointer"
							}`}
							onClick={() => {
								if (!isDisabled) {
									handleClick("large")
									setQuotes(true, "large")
									useTimeStore.getState().setIsTimerRunning(false)
									useTimeStore.getState().setTime(0)
									useTestStore.getState().reset()
									useTestStore.getState().seedQuotes("large")
								}
							}}
							style={{
								color: selected === "large" ? "#7e22ce" : "",
								transition: "color 0.3s ease-in-out",
							}}
						>
							Large
						</li>
					</ul>
				)}
				{words && (
					<ul className="flex flex-row font-semibold">
						<li
							className={`lg:mx-4 mx-2 hover:text-stone-500 hover:dark:text-neutral-500 cursor-pointer transition-all duration-300 ${
								isDisabled ? disabledStyles : "cursor-pointer"
							}`}
							onClick={() => {
								if (!isDisabled) {
									handleClick(10)
									setWords(true, 10)
									useTimeStore.getState().setIsTimerRunning(false)
									useTimeStore.getState().setTime(0)
									useTestStore.getState().reset()
								}
							}}
							style={{
								color: selected === 10 ? "#7e22ce" : "",
								transition: "color 0.3s ease-in-out",
							}}
						>
							10
						</li>
						<li
							className={`lg:mx-4 mx-2 hover:text-stone-500 hover:dark:text-neutral-500 cursor-pointer transition-all duration-300 ${
								isDisabled ? disabledStyles : "cursor-pointer"
							}`}
							onClick={() => {
								if (!isDisabled) {
									handleClick(25)
									setWords(true, 25)
									useTimeStore.getState().setIsTimerRunning(false)
									useTimeStore.getState().setTime(0)
									useTestStore.getState().reset()
								}
							}}
							style={{
								color: selected === 25 ? "#7e22ce" : "",
								transition: "color 0.3s ease-in-out",
							}}
						>
							25
						</li>
						<li
							className={`lg:mx-4 mx-2 hover:text-stone-500 hover:dark:text-neutral-500 cursor-pointer transition-all duration-300 ${
								isDisabled ? disabledStyles : "cursor-pointer"
							}`}
							onClick={() => {
								if (!isDisabled) {
									handleClick(50)
									setWords(true, 50)
									useTimeStore.getState().setIsTimerRunning(false)
									useTimeStore.getState().setTime(0)
									useTestStore.getState().reset()
								}
							}}
							style={{
								color: selected === 50 ? "#7e22ce" : "",
								transition: "color 0.3s ease-in-out",
							}}
						>
							50
						</li>
						<li
							className={`lg:mr-6 mr-4 lg:ml-4 ml-2 hover:text-stone-500 hover:dark:text-neutral-500 cursor-pointer transition-all duration-300 ${
								isDisabled ? disabledStyles : "cursor-pointer"
							}`}
							onClick={() => {
								if (!isDisabled) {
									handleClick(100)
									setWords(true, 100)
									useTimeStore.getState().setIsTimerRunning(false)
									useTimeStore.getState().setTime(0)
									useTestStore.getState().reset()
								}
							}}
							style={{
								color: selected === 100 ? "#7e22ce" : "",
								transition: "color 0.3s ease-in-out",
							}}
						>
							100
						</li>
					</ul>
				)}
				{time && (
					<ul className="flex flex-row font-semibold">
						<li
							className={`lg:mx-4 mx-2 hover:text-stone-500 hover:dark:text-neutral-500 cursor-pointer transition-all duration-300 ${
								isDisabled ? disabledStyles : "cursor-pointer"
							}`}
							onClick={() => {
								if (!isDisabled) {
									handleClick(15)
									setTime(true, 15)
									useTimeStore.getState().setIsTimerRunning(false)
									useTimeStore.getState().setTime(15)
									useTestStore.getState().reset()
								}
							}}
							style={{
								color: selected === 15 ? "#7e22ce" : "",
								transition: "color 0.3s ease-in-out",
							}}
						>
							15
						</li>
						<li
							className={`lg:mx-4 mx-2 hover:text-stone-500 hover:dark:text-neutral-500 cursor-pointer transition-all duration-300 ${
								isDisabled ? disabledStyles : "cursor-pointer"
							}`}
							onClick={() => {
								if (!isDisabled) {
									handleClick(30)
									setTime(true, 30)
									useTimeStore.getState().setIsTimerRunning(false)
									useTimeStore.getState().setTime(30)
									useTestStore.getState().reset()
								}
							}}
							style={{
								color: selected === 30 ? "#7e22ce" : "",
								transition: "color 0.3s ease-in-out",
							}}
						>
							30
						</li>
						<li
							className={`lg:mx-4 mx-2 hover:text-stone-500 hover:dark:text-neutral-500 cursor-pointer transition-all duration-300 ${
								isDisabled ? disabledStyles : "cursor-pointer"
							}`}
							onClick={() => {
								if (!isDisabled) {
									handleClick(60)
									setTime(true, 60)
									useTimeStore.getState().setIsTimerRunning(false)
									useTimeStore.getState().setTime(60)
									useTestStore.getState().reset()
								}
							}}
							style={{
								color: selected === 60 ? "#7e22ce" : "",
								transition: "color 0.3s ease-in-out",
							}}
						>
							60
						</li>
						<li
							className={`lg:mr-6 lg:ml-4 ml-2 mr-4 hover:text-stone-500 hover:dark:text-neutral-500 cursor-pointer transition-all duration-300 ${
								isDisabled ? disabledStyles : "cursor-pointer"
							}`}
							onClick={() => {
								if (!isDisabled) {
									handleClick(120)
									setTime(true, 120)
									useTimeStore.getState().setIsTimerRunning(false)
									useTimeStore.getState().setTime(120)
									useTestStore.getState().reset()
								}
							}}
							style={{
								color: selected === 120 ? "#7e22ce" : "",
								transition: "color 0.3s ease-in-out",
							}}
						>
							120
						</li>
					</ul>
				)}
			</div>
		</div>
	)
}

export default Controlbar
