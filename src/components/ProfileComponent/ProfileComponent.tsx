"use client"
import { multiplayerResults, result } from "@/lib/types/types"
import React, { useEffect } from "react"
import { socket } from "@/lib/sockets"


interface ProfileComponentProps {
	data: result[] | multiplayerResults
	type: "multiplayer" | "all" | "recent"
	heading: string
}

function isResultArray(data: result[] | multiplayerResults): data is result[] {
	return Array.isArray(data)
}

function findDetails(data: result[], toFind: string): number | null {
	for (let i = 0; i < data.length; i++) {
		if (data[i].subType === toFind) {
			return data[i].wpm
		}
	}
	return null
}

function ProfileComponent({ data, type, heading }: ProfileComponentProps) {
	useEffect(() => {
		socket.disconnect()
	}, [])
	return (
		<div className="w-full">
			<h2 className="text-2xl tracking-widest text-stone-500 dark:text-neutral-500 text-center mt-4 mb-2 max-lg:text-xl">
				{heading}
			</h2>
			<div className="w-11/12 bg-neutral-300 dark:bg-stone-900 flex flex-row justify-between px-12 max-lg:px-4 py-4 mx-10 max-lg:mx-auto rounded-2xl border border-neutral-400 dark:border-stone-950">
				{heading === "Recents" &&
					Array.from({ length: 5 }).map((_, index) => {
						return (
							<div key={index}>
								<div className="text-stone-500 dark:text-neutral-500 tracking-wider font-medium text-center max-lg:text-xs">
									{isResultArray(data) && data[index] ? (
										<>
											{data[index].type}-{data[index].subType}
										</>
									) : (
										<>game {index + 1}</>
									)}
								</div>
								<div className="text-center font-medium text-purple-700 tracking-wider max-lg:text-xs">
									{isResultArray(data) && data[index] ? (
										<>{data[index].wpm} wpm</>
									) : (
										<>--</>
									)}
								</div>
							</div>
						)
					})}
				{heading === "Multiplayer" && (
					<>
						<div>
							<div className="text-stone-500 dark:text-neutral-500 tracking-wider font-medium text-center max-lg:text-xs">
								wins
							</div>
							<div className="text-center font-medium text-purple-700 tracking-wider max-lg:text-xs">
								{!isResultArray(data) ? <>{data.wins}</> : <>0</>}
							</div>
						</div>
						<div>
							<div className="text-stone-500 dark:text-neutral-500 tracking-wider font-medium text-center max-lg:text-xs">
								losses
							</div>
							<div className="text-center font-medium text-purple-700 tracking-wider max-lg:text-xs">
								{!isResultArray(data) ? <>{data.losses}</> : <>0</>}
							</div>
						</div>
						<div>
							<div className="text-stone-500 dark:text-neutral-500 tracking-wider font-medium text-center max-lg:text-xs">
								avg wpm
							</div>
							<div className="text-center font-medium text-purple-700 tracking-wider max-lg:text-xs">
								{!isResultArray(data) && data.averageWPM !== 0 ? (
									<>{data.averageWPM}</>
								) : (
									<>--</>
								)}
							</div>
						</div>
					</>
				)}
				{heading === "Time" && (
					<>
						<div>
							<div className="text-stone-500 dark:text-neutral-500 tracking-wider font-medium text-center max-lg:text-xs">
								15s
							</div>
							<div className="text-center font-medium text-purple-700 tracking-wider max-lg:text-xs">
								{(() => {
									const res =
										isResultArray(data) && findDetails(data, "15")
									return res ? <>{res}</> : <>--</>
								})()}
							</div>
						</div>
						<div>
							<div className="text-stone-500 dark:text-neutral-500 tracking-wider font-medium text-center max-lg:text-xs">
								30s
							</div>
							<div className="text-center font-medium text-purple-700 tracking-wider max-lg:text-xs">
								{(() => {
									const res =
										isResultArray(data) && findDetails(data, "30")
									return res ? <>{res}</> : <>--</>
								})()}
							</div>
						</div>
						<div>
							<div className="text-stone-500 dark:text-neutral-500 tracking-wider font-medium text-center max-lg:text-xs">
								60s
							</div>
							<div className="text-center font-medium text-purple-700 tracking-wider max-lg:text-xs">
								{(() => {
									const res =
										isResultArray(data) && findDetails(data, "60")
									return res ? <>{res}</> : <>--</>
								})()}
							</div>
						</div>
						<div>
							<div className="text-stone-500 dark:text-neutral-500 tracking-wider font-medium text-center max-lg:text-xs">
								120s
							</div>
							<div className="text-center font-medium text-purple-700 tracking-wider max-lg:text-xs">
								{(() => {
									const res =
										isResultArray(data) && findDetails(data, "120")
									return res ? <>{res}</> : <>--</>
								})()}
							</div>
						</div>
					</>
				)}
				{heading === "Words" && (
					<>
						<div>
							<div className="text-stone-500 dark:text-neutral-500 tracking-wider font-medium text-center max-lg:text-xs">
								10
							</div>
							<div className="text-center font-medium text-purple-700 tracking-wider max-lg:text-xs">
								{(() => {
									const res =
										isResultArray(data) && findDetails(data, "10")
									return res ? <>{res}</> : <>--</>
								})()}
							</div>
						</div>
						<div>
							<div className="text-stone-500 dark:text-neutral-500 tracking-wider font-medium text-center max-lg:text-xs">
								25
							</div>
							<div className="text-center font-medium text-purple-700 tracking-wider max-lg:text-xs">
								{(() => {
									const res =
										isResultArray(data) && findDetails(data, "25")
									return res ? <>{res}</> : <>--</>
								})()}
							</div>
						</div>
						<div>
							<div className="text-stone-500 dark:text-neutral-500 tracking-wider font-medium text-center max-lg:text-xs">
								50
							</div>
							<div className="text-center font-medium text-purple-700 tracking-wider max-lg:text-xs">
								{(() => {
									const res =
										isResultArray(data) && findDetails(data, "50")
									return res ? <>{res}</> : <>--</>
								})()}
							</div>
						</div>
						<div>
							<div className="text-stone-500 dark:text-neutral-500 tracking-wider font-medium text-center max-lg:text-xs">
								100
							</div>
							<div className="text-center font-medium text-purple-700 tracking-wider max-lg:text-xs">
								{(() => {
									const res =
										isResultArray(data) && findDetails(data, "100")
									return res ? <>{res}</> : <>--</>
								})()}
							</div>
						</div>
					</>
				)}
				{heading === "Quotes" && (
					<>
						<div>
							<div className="text-stone-500 dark:text-neutral-500 tracking-wider font-medium text-center max-lg:text-xs">
								small
							</div>
							<div className="text-center font-medium text-purple-700 tracking-wider max-lg:text-xs">
								{(() => {
									const res =
										isResultArray(data) &&
										findDetails(data, "small")
									return res ? <>{res}</> : <>--</>
								})()}
							</div>
						</div>
						<div>
							<div className="text-stone-500 dark:text-neutral-500 tracking-wider font-medium text-center max-lg:text-xs">
								medium
							</div>
							<div className="text-center font-medium text-purple-700 tracking-wider max-lg:text-xs">
								{(() => {
									const res =
										isResultArray(data) &&
										findDetails(data, "medium")
									return res ? <>{res}</> : <>--</>
								})()}
							</div>
						</div>
						<div>
							<div className="text-stone-500 dark:text-neutral-500 tracking-wider font-medium text-center max-lg:text-xs">
								large
							</div>
							<div className="text-center font-medium text-purple-700 tracking-wider max-lg:text-xs">
								{(() => {
									const res =
										isResultArray(data) &&
										findDetails(data, "large")
									return res ? <>{res}</> : <>--</>
								})()}
							</div>
						</div>
					</>
				)}
			</div>
		</div>
	)
}

export default ProfileComponent
