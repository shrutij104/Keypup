import { create } from "zustand"

type timestore = {
	timer: number
	isTimerRunning: boolean
	setTime: (time: number) => void
	decrementTime: () => void
	incrementTime: () => void
	setIsTimerRunning: (isTimerRunning: boolean) => void
	setIsTestRecording: (isTestRecording: boolean) => void
	isTestRecording: boolean
	reset: () => void
}

export const useTimeStore = create<timestore>((set) => ({
	timer: 15,
	isTimerRunning: false,
	isTestRecording: false,
	setTime: (timer: number) => {
		set({ timer })
	},
	decrementTime: () => {
		set((state) => ({ timer: state.timer - 1 }))
	},
	incrementTime: () => {
		set((state) => ({ timer: state.timer + 1 }))
	},
	setIsTimerRunning(isTimerRunning) {
		set({ isTimerRunning })
	},
	setIsTestRecording(isTestRecording) {
		set({ isTestRecording })
	},
	reset() {
		set({ isTimerRunning: false, isTestRecording: false })
	},
}))
