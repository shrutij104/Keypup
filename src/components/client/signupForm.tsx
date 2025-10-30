"use client"

import { useState } from "react"
import Link from "next/link"
import { credentialsSignup } from "@/actions/Signup"
import { useRouter } from "next/navigation"
import googleSignin from "@/google/signin"
import validator from "validator"
import { FaGoogle } from "react-icons/fa"

const SignupForm = () => {
	const [formData, setFormData] = useState({
		username: "",
		email: "",
		password: "",
		otp: "",
		confirmPassword: "",
	})
	const [error, setError] = useState("")
	const [OTPInputVisible, setOtpInputVisible] = useState(false)
	const [otpLoading, setOtpLoading] = useState(false)
	const [otpVerified, setOtpVerified] = useState(false)
	const [loading, setLoading] = useState(false)
	const [googleLoading, setGoogleLoading] = useState(false)
	const router = useRouter()

	const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setLoading(true)
		const { username, email, password, confirmPassword } = formData

		// Validate inputs
		if (!username || !email || !password || !confirmPassword) {
			setError("Please fill out all fields.")
			setLoading(false)
			return
		}

		if (password !== confirmPassword) {
			setError("Passwords do not match.")
			setLoading(false)
			return
		}

		if (!otpVerified) {
			setError("Please verify your OTP before signing up.")
			setLoading(false)
			return
		}

		if (!validator.isEmail(email)) {
			return setError("Please enter a valid email address")
			setLoading(false)
		}

		if (!validator.isStrongPassword(password)) {
			setLoading(false)
			return setError(
				"Please enter a strong password,\n Password must contain atleast 1 uppercase alphabet, 1 lowercase alphabet,1 number and 1 special character"
			)
		}

		try {
			// Attempt Signup
			const signupError = await credentialsSignup(username, email, password)

			if (signupError) {
				setLoading(false)
				setError(signupError)
			} else {
				setLoading(false)
				router.push("/login")
			}
		} catch (err) {
			setLoading(false)
			setError("An unexpected error occurred. Please try again.")
			console.error("Signup error:", err)
		}
		setLoading(false)
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.id]: e.target.value })
		if (e.target.id === "email" && validator.isEmail(formData.email)) {
			return setError("")
		}
		if (e.target.id === "email" && !validator.isEmail(formData.email)) {
			return setError("Please enter a valid email address")
		}
	}

	const sendOtp = async () => {
		setOtpLoading(true)
		setError("") // Clear previous errors
		if (!validator.isEmail(formData.email)) {
			setOtpLoading(false)
			return setError("Please enter a valid email address")
		}
		try {
			const res = await fetch(`/api/auth/send-otp`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email: formData.email }),
				credentials: "include",
			})

			const data = await res.json()

			if (!res.ok) {
				setOtpLoading(false)
				setError(data.msg || "Failed to send OTP, please try again.")
			} else {
				setOtpLoading(false)
				setOtpInputVisible(true)
			}
		} catch (err) {
			setOtpLoading(false)
			setError("Failed to send OTP, please try again.")
			console.error("OTP send error:", err)
		}
	}

	const verifyOtp = async () => {
		setLoading(true)
		setOtpLoading(true)
		setError("") // Clear previous errors
		try {
			const res = await fetch(`/api/auth/verify-otp`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ email: formData.email, otp: formData.otp }),
				credentials: "include",
			})

			const data = await res.json()

			if (!res.ok) {
				setLoading(false)
				setOtpLoading(false)
				setError(data.msg || "Incorrect OTP, please try again.")
			} else {
				setOtpVerified(true)
			}
		} catch (err) {
			setLoading(false)
			setOtpLoading(false)
			setError("Incorrect OTP, please try again.")
			console.error("OTP verification error:", err)
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
				SIGN UP
			</h2>

			<div className="flex justify-center w-full mb-4">
				{" "}
				<form>
					<button
						onClick={handleGoogleSignin}
						className="w-full text-stone-500 py-2 px-4 sm:px-6 md:px-8 lg:px-12 rounded-2xl flex items-center justify-center tracking-wide font-medium bg-transparent hover:dark:border-stone-400 border dark:border-stone-800 border-neutral-100 hover:border-stone-600 hover:text-stone-600 dark:text-neutral-500 hover:dark:text-neutral-100 transition-all duration-400"
						type="submit"
						disabled={googleLoading}
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
									Signup with Google
								</span>
							</div>
						)}
					</button>
				</form>
			</div>

			<div className="text-stone-400 dark:text-neutral-600">OR</div>
			<form
				onSubmit={handleFormSubmit}
				className="mx-auto w-full max-w-md bg-transparent"
			>
				<div className="mb-4">
					<label
						htmlFor="username"
						className="block text-stone-500 dark:text-neutral-400 font-medium text-sm mb-2"
					>
						Name
					</label>
					<input
						onChange={handleChange}
						autoComplete="off"
						type="text"
						id="username"
						name="username"
						className="w-full font-light px-4 py-3 border border-gray-300 dark:border-neutral-700 rounded-2xl bg-transparent text-stone-500 dark:text-neutral-300 focus:ring-2 focus:ring-stone-500"
						placeholder="Enter your Name"
					/>
				</div>

				<div className="relative">
					<label
						htmlFor="email"
						className="block text-stone-500 dark:text-neutral-400 font-medium text-sm mb-2"
					>
						Email
					</label>
					<div className="relative mb-4">
						<input
							onChange={handleChange}
							autoComplete="off"
							type="email"
							id="email"
							name="email"
							className="w-full font-light px-4 py-3 border border-gray-300 dark:border-neutral-700 rounded-2xl bg-transparent text-stone-500 dark:text-neutral-300 focus:ring-2 focus:ring-stone-500 pr-[110px]"
							placeholder="Enter your Email"
						/>
						<button
							type="button"
							onClick={sendOtp}
							className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-cente bg-transparent text-stone-500 dark:text-neutral-400 font-thin h-[calc(100%)] px-4 hover:text-stone-800 hover:dark:text-neutral-100 hover:bg-neutral-400 hover:dark:bg-neutral-700 hover:rounded-r-2xl transition-all duration-200"
						>
							{otpLoading ? (
								<div className="flex justify-center items-center p-2 space-x-2">
									<div className="w-2 h-2 bg-stone-200 animate-pulse rounded-full"></div>
									<div className="w-2 h-2 bg-stone-400 animate-pulse rounded-full"></div>
									<div className="w-2 h-2 bg-stone-600 animate-pulse rounded-full"></div>
								</div>
							) : (
								"Send OTP"
							)}
						</button>
					</div>
				</div>
				<div className="flex justify-center items-center">
					{OTPInputVisible && !otpVerified && (
						<p className="text-green-500 mx-auto font-thin">
							OTP sent successfully
						</p>
					)}
				</div>

				{OTPInputVisible && (
					<>
						<div className="relative">
							<label
								htmlFor="otp"
								className="block text-stone-500 dark:text-neutral-400 font-medium text-sm mb-2"
							>
								OTP
							</label>
							<div className="relative mb-4">
								<input
									onChange={handleChange}
									type="text"
									id="otp"
									name="otp"
									className="w-full font-light px-4 py-3 border border-gray-300 dark:border-neutral-700 rounded-2xl bg-transparent text-stone-500 dark:text-neutral-300 focus:ring-2 focus:ring-stone-500 pr-[120px]"
									placeholder="Enter your OTP"
								/>
								<button
									type="button"
									onClick={verifyOtp}
									className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-cente bg-transparent text-stone-500 dark:text-neutral-400 font-thin h-[calc(100%)] px-4 hover:text-stone-800 hover:dark:text-neutral-100 hover:bg-neutral-400 hover:dark:bg-neutral-700 hover:rounded-r-2xl transition-all duration-200"
								>
									{otpLoading ? (
										<div className="flex justify-center items-center p-2 space-x-2">
											<div className="w-2 h-2 bg-stone-200 animate-pulse rounded-full"></div>
											<div className="w-2 h-2 bg-stone-400 animate-pulse rounded-full"></div>
											<div className="w-2 h-2 bg-stone-600 animate-pulse rounded-full"></div>
										</div>
									) : (
										"Verify OTP"
									)}
								</button>
							</div>
						</div>
						<div className="flex justify-center items-center">
							{otpVerified && (
								<p className="text-green-500 mx-auto font-thin">
									OTP verified successfully
								</p>
							)}
						</div>
					</>
				)}

				<div className="mb-4">
					<label
						htmlFor="password"
						className="block text-stone-500 dark:text-neutral-400 font-medium text-sm mb-2"
					>
						Password
					</label>
					<input
						onChange={handleChange}
						type="password"
						id="password"
						name="password"
						className="w-full font-light px-4 py-3 border border-gray-300 dark:border-neutral-700 rounded-2xl bg-transparent text-stone-500 dark:text-neutral-300 focus:ring-2 focus:ring-stone-500"
						placeholder="Enter your password"
					/>
				</div>

				<div className="">
					<label
						htmlFor="confirmpassword"
						className="block text-stone-500 dark:text-neutral-400 font-medium text-sm mb-2"
					>
						Confirm Password
					</label>
					<input
						onChange={handleChange}
						type="password"
						id="confirmPassword"
						name="confirmPassword"
						className="w-full font-light px-4 py-3 border border-gray-300 dark:border-neutral-700 rounded-2xl bg-transparent text-stone-500 dark:text-neutral-300 focus:ring-2 focus:ring-stone-500"
						placeholder="Enter your password again"
					/>
				</div>

				<div className="flex items-center justify-between">
					<button
						type="submit"
						className="text-stone-500 w-full mt-6 py-2 px-32 rounded-2xl flex justify-center items-center tracking-wide font-medium bg-transparent hover:dark:border-stone-400 border dark:border-stone-800 border-neutral-100 hover:border-stone-600 hover:text-stone-600 dark:text-neutral-500 hover:dark:text-neutral-100 transition-all duration-400"
					>
						{loading ? (
							<div className="w-full gap-x-2 flex justify-center items-center p-2">
								<div className="w-2 bg-stone-200 animate-pulse h-2 rounded-full"></div>
								<div className="w-2 animate-pulse h-2 bg-stone-400 rounded-full"></div>
								<div className="w-2 h-2 animate-pulse bg-stone-600 rounded-full"></div>
							</div>
						) : (
							"SignUp"
						)}
					</button>
				</div>
			</form>
			<Link
				className="mt-4 text-stone-400 font-light dark:text-neutral-400 hover:text-stone-500 text-sm tracking-wider"
				href="/login"
			>
				Already on Keypup?{" "}
				<p className="hover:text-stone-600 dark:hover:text-neutral-200 hover:underline inline">
					Login
				</p>
			</Link>

			<div className="flex flex-row justify-center items-center mt-2 tracking-wider font-thin">
				{error && <p className="text-red-500 mx-auto">{error}</p>}
			</div>
		</div>
	)
}

export { SignupForm }
