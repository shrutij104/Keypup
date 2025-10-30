/* eslint-disable react-hooks/exhaustive-deps */
"use client"

import { useEffect, useState } from "react"
import { socket } from "@/lib/sockets"
import { MdCopyAll } from "react-icons/md"
import Controlbar from "../Controlbar/Controlbar"
import { useMultiplayerstore } from "@/lib/zustand/multiplayerstore"
import { useRouter } from "next/navigation"

interface User {
	id: string
	name: string
	email: string
}

function WaitingRoom({ id, name, email }: { id: string; name: string; email: string }) {
	const [users, setUsers] = useState<User[]>([]) // Store users directly
	const router = useRouter()

	useEffect(() => {
		if (!socket.connected) {
			socket.connect()
		}

		// Join the room
		socket.emit("join_room", id, name, email)

		// Handle users in the room
		const handleRoomUsers = (data: User[]) => {

			if (data[0].email == email) {
				useMultiplayerstore.setState({ isHost: true })
				useMultiplayerstore.getState().setisInWaitingRoom(true)
				useMultiplayerstore.getState().setisInGame(false)
			}

			setUsers(data) 
		}

		socket.on("room_users", handleRoomUsers)

		const handleNonHostStartGame = (initialWords: string[]) => {
			useMultiplayerstore.getState().setInitialWords(initialWords)
			useMultiplayerstore.getState().setisInWaitingRoom(false)
			useMultiplayerstore.getState().setisInGame(true)
		}

		if (!useMultiplayerstore.getState().isHost) {
			socket.on("startNonHostGame", handleNonHostStartGame)
		}

		// Cleanup on component unmount
		return () => {
			socket.off("room_users", handleRoomUsers)
			setUsers([])
		}
	}, [id, name, router])

	const handleStartGame = () => {
		useMultiplayerstore.getState().setisInWaitingRoom(false)
		useMultiplayerstore.getState().setisInGame(true)
	}

	return (
		<div className="flex flex-col justify-center items-center px-4">
			<h2 className="text-2xl md:text-4xl tracking-widest text-stone-500 dark:text-neutral-500 text-center mt-10 md:mt-16">
				Waiting Room
			</h2>
			<Controlbar />
			<h3 className="text-neutral-400 dark:text-stone-600 tracking-wider text-lg md:text-2xl mt-6 md:mt-8">
				Players joined
			</h3>
			<div className="w-full max-w-md">
				{users.length > 0 ? (
					users.map((curr) => (
						<div
							key={curr.id}
							className="text-neutral-400 dark:text-stone-600 tracking-wider text-base md:text-lg my-2 text-center"
						>
							{curr.name}
						</div>
					))
				) : (
					<p className="text-neutral-400 text-center">No players yet.</p>
				)}
			</div>
			<span className="text-neutral-500 dark:text-stone-500 tracking-wider text-base md:text-lg text-center mt-6">
				Share this room code with other players to play
			</span>
			<div className="w-3/5 md:w-2/5 flex flex-row justify-center items-center">
				<div className="w-full max-w-[90%] md:w-1/3 flex flex-row px-4 justify-between items-center text-stone-500 dark:text-neutral-400 font-thin tracking-wider py-3 border border-gray-300 dark:border-neutral-700 rounded-3xl focus:outline-none focus:ring-2 focus:ring-stone-500 bg-transparent text-center mt-4">
					{id}
					<MdCopyAll
						className="text-stone-500 dark:text-neutral-500 hover:text-stone-800 dark:hover:text-neutral-100 transition-all duration-200 cursor-pointer"
						size={25}
						onClick={() => navigator.clipboard.writeText(id)}
					/>
				</div>
			</div>
			{useMultiplayerstore.getState().isHost && (
				<button
					onClick={handleStartGame}
					disabled={users.length < 2}
					className={`relative inline-flex border border-neutral-500 dark:border-stone-900 items-center justify-center px-6 md:px-8 py-2.5 overflow-hidden tracking-tighter mt-12 md:mt-16 text-white bg-neutral-400 dark:bg-stone-800 rounded-full 
        ${users.length < 2 ? "" : "group"}`} // Remove 'group' when disabled
				>
					{users.length >= 2 && ( // Only show animations when not disabled
						<>
							<span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-purple-700 rounded-full group-hover:w-56 group-hover:h-56"></span>
							<span className="absolute bottom-0 left-0 h-full -ml-2">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="w-auto h-full opacity-100 object-stretch"
									viewBox="0 0 487 487"
								>
									<path
										fillOpacity=".1"
										fillRule="nonzero"
										fill="#FFF"
										d="M0 .3c67 2.1 134.1 4.3 186.3 37 52.2 32.7 89.6 95.8 112.8 150.6 23.2 54.8 32.3 101.4 61.2 149.9 28.9 48.4 77.7 98.8 126.4 149.2H0V.3z"
									></path>
								</svg>
							</span>
							<span className="absolute top-0 right-0 w-12 h-full -mr-3">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="object-cover w-full h-full"
									viewBox="0 0 487 487"
								>
									<path
										fillOpacity=".1"
										fillRule="nonzero"
										fill="#FFF"
										d="M487 486.7c-66.1-3.6-132.3-7.3-186.3-37s-95.9-85.3-126.2-137.2c-30.4-51.8-49.3-99.9-76.5-151.4C70.9 109.6 35.6 54.8.3 0H487v486.7z"
									></path>
								</svg>
							</span>
						</>
					)}
					<span
						className={`relative text-sm md:text-base font-semibold uppercase tracking-widest 
            ${
				users.length < 2
					? "text-neutral-500"
					: "dark:text-neutral-400 text-stone-600 group-hover:text-neutral-300 transition-all duration-200"
			}`}
					>
						Start Game!
					</span>
				</button>
			)}
		</div>
	)
}

export default WaitingRoom
