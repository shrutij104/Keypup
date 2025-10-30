"use client"

import React, { useEffect, useState } from "react"
import { socket } from "@/lib/sockets"
import { useRouter } from "next/navigation"
import { useMultiplayerstore } from "@/lib/zustand/multiplayerstore"

function Room({ name, email }: { name: string; email: string }) {
	const [roomCode, setRoomCode] = useState<string | null>(null)
	const [inputMessage, setInputMessage] = useState<string>("")
	const [loading, setLoading] = useState<boolean>(false)
	const [createRoomLoading, setCreateRoomLoading] = useState<boolean>(false)
	const [error, setError] = useState<string>("")
	const router = useRouter()

	function generateRoomCode() {
		const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
		let result = ""
		for (let i = 0; i < 5; i++) {
			result += characters.charAt(Math.floor(Math.random() * characters.length))
		}
		return result
	}

	useEffect(() => {
		socket.disconnect()
	}, [])

	async function handleCreateRoom({ email }: { email: string }) {
		setCreateRoomLoading(true)
		if (!socket.connected) {
			socket.connect()
			const GenroomCode = generateRoomCode()
			setRoomCode(GenroomCode)
			useMultiplayerstore.getState().setisHost(true)
			useMultiplayerstore.getState().setisInWaitingRoom(true)
			useMultiplayerstore.setState({ inResult: false })
			useMultiplayerstore.setState({ inGame: false })
			socket.emit("create_room", GenroomCode, name, email)
			setCreateRoomLoading(false)
			router.push(`/multiplayer/${GenroomCode}`)
		} else {
			socket.disconnect()
			socket.connect()
			const GenroomCode = generateRoomCode()
			setRoomCode(GenroomCode)
			useMultiplayerstore.getState().setisHost(true)
			useMultiplayerstore.getState().setisInWaitingRoom(true)
			useMultiplayerstore.setState({ inResult: false })
			useMultiplayerstore.setState({ inGame: false })
			socket.emit("create_room", GenroomCode, name, email)
			setCreateRoomLoading(false)
			router.push(`/multiplayer/${GenroomCode}`)
		}
	}

	function handleJoinRoom() {
		useMultiplayerstore.getState().setisHost(false)
		setLoading(true)
		if (!socket.connected) {
			socket.connect()
			useMultiplayerstore.getState().setisInWaitingRoom(true)
			useMultiplayerstore.setState({ inResult: false })
			useMultiplayerstore.setState({ inGame: false })
			socket.emit("check_room", inputMessage)
			socket.on("room_exists", (data: boolean) => {
				if (data) {
					setLoading(false)
					router.push(`/multiplayer/${inputMessage}`)
				} else {
					setLoading(false)
					setError("Room does not exist!")
				}
			})
		} else {
			socket.disconnect()
			socket.connect()
			useMultiplayerstore.getState().setisInWaitingRoom(true)
			useMultiplayerstore.setState({ inResult: false })
			useMultiplayerstore.setState({ inGame: false })
			socket.emit("check_room", inputMessage)
			socket.on("room_exists", (data: boolean) => {
				if (data) {
					setLoading(false)
					router.push(`/multiplayer/${inputMessage}`)
				} else {
					setLoading(false)
					setError("Room does not exist!")
				}
			})
		}
	}

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		setInputMessage(e.target.value)
	}

	return (
		<div className="w-full px-4 md:px-6 lg:px-8 flex flex-col md:flex-row justify-center items-center gap-8 md:gap-12 lg:gap-16 mt-4 md:mt-24">
			{/* Create Room Section */}
			<div className="w-full md:w-1/3 flex flex-col items-center">
				<h2 className="text-center tracking-widest text-2xl md:text-3xl mb-4 text-stone-500 dark:text-neutral-500 mt-8 md:mt-16">
					Create a Room
				</h2>
				<span className="text-stone-500 dark:text-neutral-400 text-base md:text-lg tracking-widest text-center mt-4 px-4">
					Create a room and invite others to play with you
				</span>
				<div className="w-full max-w-md px-4 md:px-0 md:w-2/3 flex flex-row items-center">
					<div className="w-full text-stone-500 dark:text-neutral-400 font-thin tracking-wider px-4 py-3 border border-gray-300 dark:border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-500 bg-transparent text-center mt-8">
						Copy room code and share to play!
					</div>
				</div>
				<button
					className="font-medium text-stone-500 w-full max-w-[200px] mt-8 py-2 rounded-2xl flex justify-center items-center tracking-wide bg-transparent hover:dark:border-stone-400 border dark:border-stone-800 border-neutral-100 hover:border-stone-600 hover:text-stone-600 dark:text-neutral-500 hover:dark:text-neutral-100 transition-all duration-400"
					onClick={() => handleCreateRoom({ email })}
					disabled={createRoomLoading}
				>
					{createRoomLoading ? (
						<div className="flex justify-center items-center p-2 space-x-2">
							<div className="w-2 h-2 bg-stone-200 animate-pulse rounded-full"></div>
							<div className="w-2 h-2 bg-stone-400 animate-pulse rounded-full"></div>
							<div className="w-2 h-2 bg-stone-600 animate-pulse rounded-full"></div>
						</div>
					) : (
						"Create room"
					)}
				</button>
			</div>

			<div className="w-full h-px bg-stone-600 rounded-full md:w-px md:h-[400px]"></div>

			{/* Join Room Section */}
			<div className="w-full md:w-1/3 flex flex-col items-center">
				<h2 className="text-center tracking-widest text-2xl md:text-3xl mb-4 text-stone-500 dark:text-neutral-500 mt-8 md:mt-16">
					Join a room
				</h2>
				<span className="text-stone-500 dark:text-neutral-400 text-base md:text-lg tracking-widest text-center mt-4 px-4">
					Join an existing room and start playing
				</span>
				<div className="w-full max-w-md px-4 md:px-0 md:w-2/3">
					<input
						type="text"
						className="w-full text-stone-500 dark:text-neutral-300 font-thin tracking-wider px-4 py-3 border border-gray-300 dark:border-neutral-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-stone-500 bg-transparent mt-8"
						onChange={handleChange}
					/>
					{error && (
						<div className="w-full text-red-500 font-thin tracking-wider mt-4 text-center">
							{error}
						</div>
					)}
				</div>
				<button
					className="font-medium text-stone-500 w-full max-w-[200px] mt-8 py-2 rounded-2xl flex justify-center items-center tracking-wide bg-transparent hover:dark:border-stone-400 border dark:border-stone-800 border-neutral-100 hover:border-stone-600 hover:text-stone-600 dark:text-neutral-500 hover:dark:text-neutral-100 transition-all duration-400"
					onClick={handleJoinRoom}
					disabled={loading}
				>
					{loading ? (
						<div className="flex justify-center items-center p-2 space-x-2">
							<div className="w-2 h-2 bg-stone-200 animate-pulse rounded-full"></div>
							<div className="w-2 h-2 bg-stone-400 animate-pulse rounded-full"></div>
							<div className="w-2 h-2 bg-stone-600 animate-pulse rounded-full"></div>
						</div>
					) : (
						"Join room"
					)}
				</button>
			</div>
		</div>
	)
}

export default Room
