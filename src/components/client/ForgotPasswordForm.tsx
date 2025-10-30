"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import validator from "validator"

const ForgotPasswordForm = () => {
	const [error, setError] = useState("")
	const [OTPInputVisible, setOtpInputVisible] = useState(false)
	const [otpVerified, setOtpVerified] = useState(false)
	const [loading, setLoading] = useState(false)
	const [otpLoading, setOTPLoading] = useState(false)
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		otp: "",
		confirmPassword: "",
	})
	const router = useRouter()

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
		setOTPLoading(true)
		setError("") // Clear previous errors
		if (!validator.isEmail(formData.email)) {
			setOTPLoading(false)
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
				setOTPLoading(false)
				setError(data.msg || "Failed to send OTP, please try again.")
			} else {
				setOTPLoading(false)
				setOtpInputVisible(true)
			}
		} catch (err) {
			setOTPLoading(false)
			setError("Failed to send OTP, please try again.")
			console.error("OTP send error:", err)
		}
	}

	const verifyOtp = async () => {
		setLoading(true)
		setOTPLoading(true)
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
				setOTPLoading(false)
				setError(data.msg || "Incorrect OTP, please try again.")
			} else {
				setLoading(false)
				setOTPLoading(false)
				setOtpVerified(true)
			}
		} catch (err) {
			setLoading(false)
			setOTPLoading(false)
			setError("Incorrect OTP, please try again.")
			console.error("OTP verification error:", err)
		}
	}

	const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		const { email, password, confirmPassword } = formData

		// Validate inputs
		if (!email || !password || !confirmPassword) {
			setError("Please fill out all the fields.")
			return
		}

		if (password !== confirmPassword) {
			setError("Passwords do not match.")
			return
		}

		if (!otpVerified) {
			setError("Please verify your OTP before changing the password.")
			return
		}

		if (!validator.isEmail(email)) {
			return setError("Please enter a valid email address")
		}

		if (!validator.isStrongPassword(password)) {
			return setError(
				"Please enter a strong password.\nPassword must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character."
			)
		}

		try {
			setLoading(true) // Start loading
			setError("") // Clear previous errors

			const res = await fetch(`/api/auth/forgot-password`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ ...formData }),
				credentials: "include",
			})

			const data = await res.json()
			if (!res.ok) {
				setError(data.msg || "Failed to reset password.")
			} else {
				router.push("/login")
			}
		} catch (err) {
			setError("An unexpected error occurred. Please try again.")
			console.error("Reset password error:", err)
		} finally {
			setLoading(false) // Stop loading
		}
	}

	return (
		<div className="flex flex-col items-center mt-8 lg:mt-16 min-h-screen px-4">
			<h2 className="text-3xl tracking-widest mb-4 text-stone-500 dark:text-neutral-500">
				RESET PASSWORD
			</h2>
			<form
				onSubmit={handleFormSubmit}
				className="mx-auto w-full max-w-md bg-transparent"
			>
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
							placeholder="Enter your email"
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
						disabled={loading}
						className={`w-full mt-6 py-2 px-24 lg:px-32 rounded-2xl flex justify-center items-center tracking-wide font-medium bg-transparent border dark:border-stone-800 border-neutral-100 
		${
			loading
				? "opacity-50 cursor-not-allowed"
				: "hover:border-stone-600 hover:text-stone-600 dark:text-neutral-500 hover:dark:text-neutral-100 transition-all duration-400"
		}
	`}
					>
						{loading ? (
							<div className="flex justify-center items-center p-2 space-x-2">
								<div className="w-2 h-2 bg-stone-200 animate-pulse rounded-full"></div>
								<div className="w-2 h-2 bg-stone-400 animate-pulse rounded-full"></div>
								<div className="w-2 h-2 bg-stone-600 animate-pulse rounded-full"></div>
							</div>
						) : (
							"Reset Password"
						)}
					</button>
				</div>
			</form>

			<div className="flex flex-row justify-center items-center mt-2 tracking-wider font-thin">
				{error && <p className="text-red-500 mx-auto">{error}</p>}
			</div>
		</div>
	)
}

export { ForgotPasswordForm }
