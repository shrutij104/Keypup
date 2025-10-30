"use server"

import {User} from "@/models/userModel"
import { signOut } from "@/auth"

const DeleteAccount = async (email:string) => {

	await User.findOneAndDelete({email})
    await signOut()

}

export {DeleteAccount}
