"use client"

import { useEffect } from "react"
import Controlbar from "@/components/Controlbar/Controlbar"
import Main from "@/components/Main/Main"
import Result from "@/components/Result/Result"
import { useTestStore } from "@/lib/zustand/teststore"
import { useMultiplayerstore } from "@/lib/zustand/multiplayerstore"
import { useTimeStore } from "@/lib/zustand/timestore"

export default function Home() {
	const loadResult = useTestStore((state) => state.loadResult)
	const inResult = useMultiplayerstore((state) => state.inResult)
	const isInGame = useMultiplayerstore((state) => state.inGame)
	const returningFromMultiplayerResult = inResult || isInGame

	const resetTestStore = useTestStore((state) => state.reset)

	if (!loadResult && returningFromMultiplayerResult) {
		resetTestStore()
		useTimeStore.getState().reset()
		useMultiplayerstore.getState().reset()
	}

	useEffect(() => {
		if (useMultiplayerstore.getState().isMultiplayer) {
			useMultiplayerstore.getState().setisMultiplayer(false)
		}
	}, [])

	return loadResult ? (
		<Result />
	) : (
		<>
			<Controlbar />
			<Main />
		</>
	)
}
