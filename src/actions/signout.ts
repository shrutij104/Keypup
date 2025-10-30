"use server"

import {signOut} from "@/auth"

const SignOut = async () => {
	await signOut()
}

export {SignOut}
