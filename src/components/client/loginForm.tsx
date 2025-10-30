"use client"

import { useState } from "react"
import Link from "next/link"
import { credentialsLogin } from "@/actions/login"
import { useRouter } from "next/navigation"
import googleSignin from "@/google/signin"
import validator from "validator"
import { FaGoogle } from "react-icons/fa"

const LoginForm = () => {
	const router = useRouter()
	const [error, setError] = useState("")
	const [loading, setLoading] = useState(false)
	const [googleLoading, setGoogleLoading] = useState(false)

	const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setLoading(true)
		const formData = new FormData(event.currentTarget)
		const email = formData.get("email") as string
		const password = formData.get("password") as string

		setError("")

		if (!email || !password) {
			setError("Please fill all the details.")
			setLoading(false)
			return
		}

		if (!validator.isEmail(email)) {
			setError("Please enter a valid email address")
			setLoading(false)
			return
		}

		const loginError = await credentialsLogin(email, password)

		setLoading(false)
		if (loginError) {
			console.log(loginError)
			setError("Invalid Credentials, please try again")
		} else {
			router.refresh()
		}
	}

	const handleGoogleSignin = async () => {
		setGoogleLoading(true)
		await googleSignin()
		setGoogleLoading(false)
	}

	return (
		<div className="flex flex-col items-center mt-8 lg:mt-16 min-h-screen px-4">
			<h2 className="text-3xl tracking-widest mb-4 text-stone-500 dark:text-neutral-500">
				LOG IN
			</h2>

			<div className="flex justify-center w-full mb-4">
				<form>
					<button
						onClick={handleGoogleSignin}
						type="button"
						disabled={googleLoading}
						className="w-full text-stone-500 py-2 px-4 sm:px-6 md:px-8 lg:px-12 rounded-2xl flex items-center justify-center tracking-wide font-medium bg-transparent hover:dark:border-stone-400 border dark:border-stone-800 border-neutral-100 hover:border-stone-600 hover:text-stone-600 dark:text-neutral-500 hover:dark:text-neutral-100 transition-all duration-400"
					>
						{googleLoading ? (
							<div className="flex justify-center items-center p-2 space-x-2">
								<div className="w-2 h-2 bg-stone-200 animate-pulse rounded-full"></div>
								<div className="w-2 h-2 bg-stone-400 animate-pulse rounded-full"></div>
								<div className="w-2 h-2 bg-stone-600 animate-pulse rounded-full"></div>
							</div>
						) : (
							<div className="flex items-center justify-center w-full">
								<FaGoogle className="mr-2 sm:mr-3 md:mr-4 text-lg sm:text-xl" />
								<span className="text-sm sm:text-base">
									Login with Google
								</span>
							</div>
						)}
					</button>
				</form>
			</div>

			<div className="text-stone-400 dark:text-neutral-600">OR</div>

			<form onSubmit={handleFormSubmit} className="w-full max-w-md">
				<div className="mb-4">
					<label className="block text-stone-500 dark:text-neutral-400 font-medium text-sm mb-2">
						Email
					</label>
					<input
						type="text"
						name="email"
						className="w-full font-light px-4 py-3 border border-gray-300 dark:border-neutral-700 rounded-2xl bg-transparent text-stone-500 dark:text-neutral-300 focus:ring-2 focus:ring-stone-500"
						placeholder="Enter your email"
						autoComplete="off"
					/>
				</div>

				<div className="mb-4">
					<label className="block text-stone-500 dark:text-neutral-400 font-medium text-sm mb-2">
						Password
					</label>
					<input
						type="password"
						name="password"
						className="w-full font-light px-4 py-3 border border-gray-300 dark:border-neutral-700 rounded-2xl bg-transparent text-stone-500 dark:text-neutral-300 focus:ring-2 focus:ring-stone-500"
						placeholder="Enter your password"
					/>
				</div>

				<Link
					className="text-stone-400 font-light dark:text-neutral-400 hover:underline text-sm hover:text-stone-600 dark:hover:text-neutral-200"
					href="/forgotpassword"
				>
					Forgot Password?
				</Link>

				<button
					type="submit"
					className="text-stone-500 w-full mt-6 py-2 px-32 rounded-2xl flex justify-center items-center tracking-wide font-medium bg-transparent hover:dark:border-stone-400 border dark:border-stone-800 border-neutral-100 hover:border-stone-600 hover:text-stone-600 dark:text-neutral-500 hover:dark:text-neutral-100 transition-all duration-400"
					disabled={loading}
				>
					{loading ? (
						<div className="w-full gap-x-2 flex justify-center items-center p-2">
							<div className="w-2 bg-stone-200 animate-pulse h-2 rounded-full"></div>
							<div className="w-2 animate-pulse h-2 bg-stone-400 rounded-full"></div>
							<div className="w-2 h-2 animate-pulse bg-stone-600 rounded-full"></div>
						</div>
					) : (
						"Sign In"
					)}
				</button>
			</form>

			<Link
				className="mt-4 text-stone-400 font-light dark:text-neutral-400 hover:text-stone-500 text-sm tracking-wider"
				href="/signup"
			>
				New to Keypup?{" "}
				<p className="hover:text-stone-600 dark:hover:text-neutral-200 hover:underline inline">
					Signup
				</p>
			</Link>

			{error && <p className="text-red-500 mt-4">{error}</p>}
		</div>
	)
}

export { LoginForm }
