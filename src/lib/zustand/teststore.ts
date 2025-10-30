import { create } from "zustand"
import english from "@/lib/Languages/english.json"
import quotesData from "@/lib/Languages/quotes.json"
import { useGamesStore } from "./gamestore"
import { useTimeStore } from "./timestore"

type quote = "small" | "medium" | "large" | null

type testStore = {
	initialWords: string[]
	typedWords: string[]
	currWord: string
	typedWord: string
	currWordIndex: number
	correctChars: number
	setInitialWords: (initialWords: string[]) => void
	setCurrWord: (currWord: string) => void
	seedWords: (totalWords: number) => void
	seedQuotes: (quoteType: quote) => void
	setChar: (typedWordandChar: string) => void
	changeWord: () => void
	reset: () => void
	loadResult: boolean
	setLoadResult: (loadResult: boolean) => void
	correctCharsForEachSecond: number[]
	rawCharsForEachSecond: number[]
	rawChars: number
	inaccuracies: number
	extraLetters: number
	missingLetters: number
	correctLetters: number
}

export const useTestStore = create<testStore>((set) => ({
	initialWords: [],
	typedWords: [],
	currWord: "",
	typedWord: "",
	currWordIndex: 0,
	correctChars: 0,
	loadResult: false,
	inaccuracies: 0,
	correctCharsForEachSecond: [],
	rawCharsForEachSecond: [],
	rawChars: 0,
	extraLetters: 0,
	missingLetters: 0,
	correctLetters: 0,

	setCurrWord: (currWord: string) => {
		set({ currWord })
	},

	setInitialWords: (initialWords: string[]) => {
		set({ initialWords })
	},

	setLoadResult: (loadResult) => {
		set({ loadResult })
	},

	seedWords: (totalWords: number) => {
		const { words } = english
		const seedWords = []
		for (let i = 0; i < totalWords; i++) {
			const index = Math.floor(Math.random() * words.length)
			seedWords.push(words[index])
		}
		set({ initialWords: seedWords, currWord: seedWords[0] })
	},

	seedQuotes: (quoteType: quote) => {
		let selectedQuote = null

		// First find an appropriate quote
		while (!selectedQuote) {
			const index = Math.floor(Math.random() * quotesData.quotes.length)
			const quote = quotesData.quotes[index]
			const length = quote.text.length

			if (quoteType === "small" && length <= 100) {
				selectedQuote = quote
			} else if (quoteType === "medium" && length > 100 && length <= 300) {
				selectedQuote = quote
			} else if (quoteType === "large" && length > 300) {
				selectedQuote = quote
			}
		}

		const words = selectedQuote.text
			.split(" ")
			.filter((word: string) => word.length > 0)

		set((state) => ({
			totalWords: words.length,
			initialWords: words,
			currWord: words[0],
		}))
	},

	setChar: (typedWordandChar) => {
		set({ typedWord: typedWordandChar })
	},

	changeWord: () => {
		set((state) => {
			const nextIndex = state.typedWords.length + 1
			return {
				typedWords: [...state.typedWords, state.typedWord.trim()],
				typedWord: "",
				currWord: state.initialWords[nextIndex] || "",
				currWordIndex: state.currWordIndex + 1,
			}
		})
	},

	// Reset function
	reset: () => {
		if (useGamesStore.getState().time) {
			useTimeStore.getState().setTime(useGamesStore.getState().totalTime!)
		}

		if (!useGamesStore.getState().quotes) {
			const { words } = english
			const seedWords = []
			for (let i = 0; i < useGamesStore.getState().totalWords!; i++) {
				const index = Math.floor(Math.random() * words.length)
				seedWords.push(words[index])
			}
			set({
				initialWords: seedWords,
				typedWords: [],
				currWord: seedWords[0],
				typedWord: "",
				currWordIndex: 0,
				correctChars: 0,
				correctCharsForEachSecond: [],
				rawCharsForEachSecond: [],
				rawChars: 0,
				correctLetters: 0,
				loadResult: false,
				extraLetters: 0,
				missingLetters: 0,
				inaccuracies: 0,
			})
		} else {
			const seedArr: string[] = []
			while (true) {
				const index = Math.floor(Math.random() * quotesData.quotes.length)
				const quote = quotesData.quotes[index]
				const quotesType = useGamesStore.getState().quotesType // Get once outside conditions

				if (quotesType === "small" && quote.length <= 150) {
					const words = quote.text.split(" ")
					seedArr.push(...words)
					break
				} else if (
					quotesType === "medium" &&
					quote.length > 150 &&
					quote.length <= 300
				) {
					const words = quote.text.split(" ")
					seedArr.push(...words)
					break
				} else if (quotesType === "large" && quote.length > 300) {
					const words = quote.text.split(" ")
					seedArr.push(...words)
					break
				}
			}
			set({
				initialWords: seedArr,
				typedWords: [],
				currWord: seedArr[0],
				typedWord: "",
				currWordIndex: 0,
				correctChars: 0,
				correctLetters: 0,
				correctCharsForEachSecond: [],
				rawCharsForEachSecond: [],
				rawChars: 0,
				extraLetters: 0,
				missingLetters: 0,
				inaccuracies: 0,
			})
		}

		const resetableSpans = document.querySelectorAll("#resetable")
		const resetableDivs = document.querySelectorAll("#resetableDiv")
		resetableSpans.forEach((span) => {
			span.classList.remove("correct", "wrong", "semiWrong")
		})
		resetableDivs.forEach((div) => {
			div.classList.remove("correct", "wrong", "semiWrong")
		})
	},
}))
