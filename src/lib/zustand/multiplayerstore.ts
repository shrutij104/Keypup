import { create } from "zustand"

type multiplayerstore = {
	inWaitingRoom: boolean
	inGame: boolean
	inResult: boolean
	isMultiplayer: boolean
	isHost: boolean
	mode: string
	subType: string
	setisInWaitingRoom: (inWaitingRoom: boolean) => void
	setisInGame: (inGame: boolean) => void
	setisInResult: (inResult: boolean) => void
	setisHost: (isHost: boolean) => void
	setisMultiplayer: (isMultiplayer: boolean) => void
	initialWords: string[]
	setInitialWords: (initialWords: string[]) => void
	reset: () => void
}

export const useMultiplayerstore = create<multiplayerstore>((set) => ({
	inWaitingRoom: false,
	inGame: false,
	inResult: false,
	isHost: false,
	isMultiplayer: false,
	mode: "time",
	subType: "15",
	initialWords: [],
	setInitialWords(initialWords) {
		set({ initialWords })
	},
	setisHost(isHost) {
		set({ isHost })
	},
	setisMultiplayer(isMultiplayer) {
		set({ isMultiplayer })
	},
	setisInWaitingRoom(inWaitingRoom) {
		set({ inWaitingRoom })
	},
	setisInGame(inGame) {
		set({ inGame })
	},
	setisInResult(inResult) {
		set({ inResult })
	},
	reset() {
		set({
			inWaitingRoom: false,
			inGame: false,
			inResult: false,
			isHost: false,
			isMultiplayer: false,
			mode: "time",
			subType: "15",
			initialWords: [],
		})
	},
}))
