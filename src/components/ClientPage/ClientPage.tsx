"use client"

import { useMultiplayerstore } from "@/lib/zustand/multiplayerstore"
import WaitingRoom from "../WaitingRoom/WaitingRoom"
import MultiplayerResults from "../MultiplayerResult/MultiplayerResults"
import MultiplayerMain from "../MultiplayerMain/MultiplayerMain"

function ClientPage({ id, name, email }: { id: string; name: string; email: string }) {
	const multiplayerState = useMultiplayerstore((state) => state)

	return (
		<div>
			{multiplayerState.inWaitingRoom && (
				<WaitingRoom id={id} name={name} email={email} />
			)}
			{multiplayerState.inGame && <MultiplayerMain />}
			{multiplayerState.inResult && <MultiplayerResults email={email} />}
		</div>
	)
}

export default ClientPage
