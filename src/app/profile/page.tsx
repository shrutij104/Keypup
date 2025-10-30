import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { ProfileForm } from "@/components/client/ProfileForm"
import ProfileComponent from "@/components/ProfileComponent/ProfileComponent"
import { findUser } from "@/actions/findUser"
import { multiplayerResults, result } from "@/lib/types/types"

const Page = async () => {
	const session = await auth()
	if (!session?.user) redirect("/login")

	const email = session?.user.email
	const user = await findUser(email as string)

	const {
		multiplayerResults,
		recentResult,
		allResults,
	}: {
		multiplayerResults: multiplayerResults
		recentResult: result[]
		allResults: result[]
	} = user
	

	return (
		<div className="w-full flex flex-row max-lg:flex-col">
			<div className="w-1/3 max-lg:w-full">
				<ProfileForm email={email as string} />
			</div>
			<div className="w-2/3 flex flex-col max-lg:w-full">
				<ProfileComponent
					data={recentResult as result[]}
					type="recent"
					heading="Recents"
				/>
				<ProfileComponent
					data={allResults as result[]}
					type="all"
					heading="Time"
				/>
				<ProfileComponent
					data={allResults as result[]}
					type="all"
					heading="Words"
				/>
				<ProfileComponent
					data={allResults as result[]}
					type="all"
					heading="Quotes"
				/>
				<ProfileComponent
					data={multiplayerResults as multiplayerResults}
					type="multiplayer"
					heading="Multiplayer"
				/>
			</div>
		</div>
	)
}

export default Page
