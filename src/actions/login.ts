export const runtime = "nodejs";
import {signIn} from "next-auth/react"
import {CredentialsSignin} from "next-auth"


const credentialsLogin = async (email: string, password: string) => {
	
	try {
		const res = await signIn("credentials", {
			email,
			password,
			redirect: false, 
		})

		if (res?.error) {
			if (res.error === "CredentialsSignin") {
				throw new CredentialsSignin({cause:"Invalid credentials"})
			}
		}else{
            return null;
        }

	} catch (error) {
		const err = error as CredentialsSignin
		return err.cause || err
	}
}

export {credentialsLogin}
