import { useTestStore } from "../zustand/teststore"

const handleBackspace = (
	activeLetter: HTMLSpanElement | null,
	activeWord: HTMLDivElement | null
) => {
	const { typedWord, currWord, currWordIndex, setChar } = useTestStore.getState()

	if (typedWord.length > 0) {
		// Handle case when the typed word matches current word
		if (currWord === typedWord) {
			useTestStore.setState((state) => ({
				correctChars: state.correctChars - currWord.length - 1,
			}))
		}

		// Reset word styling
		if (activeWord) {
			activeWord.classList.remove("correct", "wrong", "semiWrong")
		}
		// Only handle extraLetters if we're removing a character beyond the current word length
		if (typedWord.length > currWord.length) {
			useTestStore.setState((state) => ({
				extraLetters: state.extraLetters - 1,
				inaccuracies: state.inaccuracies - 1,
			}))
		}

		// Remove the last character from typedWord
		setChar(typedWord.slice(0, -1))
		useTestStore.setState((state) => ({
			rawChars: state.rawChars - 1,
		}))

		if (currWord[typedWord.length - 1] === typedWord[typedWord.length - 1]) {
			useTestStore.setState((state) => ({
				correctLetters: state.correctLetters - 1,
			}))
		}

		// Reset letter styling
		if (activeLetter && activeLetter.parentElement) {
			const spanElements = activeLetter.parentElement.querySelectorAll("span")
			const lastSpan = spanElements[typedWord.length]
			if (lastSpan) {
				lastSpan.classList.remove("correct", "wrong", "semiWrong")
			}
		}
	} else if (currWordIndex > 0) {
		// Handle backspace at the beginning of a word

		useTestStore.setState((state) => ({
			correctChars: state.correctChars - 1,
			rawChars: state.rawChars - 1,
			correctLetters: state.correctLetters - 1,
			missingLetters:
				state.missingLetters -
				state.initialWords[currWordIndex - 1].length +
				state.typedWords[currWordIndex - 1].length,
			inaccuracies:
				state.inaccuracies -
				state.initialWords[currWordIndex - 1].length +
				state.typedWords[currWordIndex - 1].length,
		}))

		const prevWordIndex = currWordIndex - 1

		useTestStore.setState((state) => ({
			currWordIndex: prevWordIndex,
			typedWord: state.typedWords[prevWordIndex] || "",
			typedWords: state.typedWords.slice(0, -1),
			currWord: state.initialWords[prevWordIndex],
		}))

		// Reset word styling
		if (activeWord) {
			activeWord.classList.remove("correct", "wrong", "semiWrong")
		}
	}

	// Reset active letter styling
	if (activeLetter) {
		activeLetter.classList.remove("correct", "wrong", "semiWrong")
	}
}

const handleSpace = (
	activeWord: HTMLDivElement | null,
	typedWord: string,
	currWord: string
) => {
	if (typedWord === "") return

	// Handle word completion
	if (activeWord) {
		if (currWord !== typedWord) {
			activeWord.classList.add("semiWrong")
			useTestStore.setState((state) => ({
				rawChars: state.rawChars + 1,
				correctLetters: state.correctLetters + 1,
			}))
		} else {
			activeWord.classList.remove("semiWrong")
			useTestStore.setState((state) => ({
				correctChars: state.correctChars + currWord.length + 1,
				correctLetters: state.correctLetters + 1,
				rawChars: state.rawChars + 1,
			}))
		}
	}

	// Calculate and update extra/missing letters
	const lengthDiff = typedWord.length - currWord.length
	if (lengthDiff < 0) {
		useTestStore.setState((state) => ({
			missingLetters: state.missingLetters + Math.abs(lengthDiff),
			inaccuracies: state.inaccuracies + Math.abs(lengthDiff),
		}))
	}

	// Move to next word
	useTestStore.getState().changeWord()
}

export const RecordTest = (
	key: string,
	activeLetter: HTMLSpanElement | null,
	activeWord: HTMLDivElement | null
) => {
	const { setChar, typedWord, currWord } = useTestStore.getState()

	switch (key) {
		case "Backspace":
			handleBackspace(activeLetter, activeWord)
			break

		case " ":
			handleSpace(activeWord, typedWord, currWord)
			break

		default:
			setChar(typedWord + key)

			if (currWord[typedWord.length] === key) {
				useTestStore.setState((state) => ({
					correctLetters: state.correctLetters + 1,
					rawChars: state.rawChars + 1,
				}))
			} else {
				useTestStore.setState((state) => ({
					rawChars: state.rawChars + 1,
					inaccuracies: state.inaccuracies + 1,
				}))
			}

			if (typedWord.length >= currWord.length) {
				useTestStore.setState((state) => ({
					extraLetters: state.extraLetters + 1,
					inaccuracies: state.inaccuracies + 1,
				}))
			}

			break
	}
}
