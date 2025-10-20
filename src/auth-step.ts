import type { Whop } from '@whoplabs/whop-client'
import chalk from 'chalk'
import Enquirer from 'enquirer'
import ora from 'ora'

const prompt = Enquirer.prompt
const ORANGE = '#FFA500'

export async function authStep(whop: Whop): Promise<void> {
	console.log(chalk.hex(ORANGE).bold('Authentication Required'))
	console.log(
		chalk.dim("Don't have a Whop account? Sign up at https://whop.com/signup"),
	)
	console.log(
		chalk.dim('Your session will be saved to ~/.whoplabs/whop-session.json'),
	)
	console.log('')

	// Get email from user
	const emailResponse = await prompt<{ email: string }>({
		type: 'input',
		name: 'email',
		message: chalk.hex(ORANGE)('Enter your Whop email:'),
		prefix: chalk.hex(ORANGE)('?'),
		validate: (value: string) => {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
			return emailRegex.test(value) || 'Please enter a valid email address'
		},
	})

	const email = emailResponse.email

	// Clear line and show completion
	process.stdout.write('\x1b[1A\x1b[2K')
	console.log(
		`${chalk.green('✔')} ${chalk.dim('Enter your Whop email:')} ${chalk.dim(email)}`,
	)

	if (!email) {
		console.error(chalk.red('Email is required.'))
		process.exit(1)
	}

	const otpSpinner = ora({
		text: 'Sending OTP code...',
		color: 'yellow',
	}).start()

	let ticket: string
	try {
		ticket = await whop.auth.sendOTP(email)
		otpSpinner.succeed(chalk.dim('Code sent to your email'))
		console.log('')
	} catch {
		otpSpinner.fail('Failed to send code')
		console.log('')
		console.log(chalk.dim('This email may not be registered with Whop.'))
		console.log('')

		const { retry } = await prompt<{ retry: string }>({
			type: 'select',
			name: 'retry',
			message: chalk.hex(ORANGE)('What would you like to do?'),
			prefix: chalk.hex(ORANGE)('?'),
			choices: [
				{ name: 'email', message: 'Try a different email' },
				{ name: 'exit', message: 'Exit' },
			],
		})

		// Clear line and show completion
		process.stdout.write('\x1b[1A\x1b[2K')
		const retryMap: Record<string, string> = {
			email: 'Try a different email',
			exit: 'Exit',
		}
		console.log(
			`${chalk.green('✔')} ${chalk.dim('What would you like to do?')} ${chalk.dim(retryMap[retry] || retry)}`,
		)
		console.log('')

		if (retry === 'exit') {
			process.exit(0)
		} else {
			// Clear terminal and restart the auth process
			console.clear()
			return authStep(whop)
		}
	}

	// Get code from user
	const codeResponse = await prompt<{ code: string }>({
		type: 'input',
		name: 'code',
		message: chalk.hex(ORANGE)('Enter the 6-digit code from your email:'),
		prefix: chalk.hex(ORANGE)('?'),
		validate: (value: string) => {
			return /^\d{6}$/.test(value) || 'Please enter a 6-digit code'
		},
	})

	const code = codeResponse.code

	// Clear line and show completion
	process.stdout.write('\x1b[1A\x1b[2K')
	console.log(
		`${chalk.green('✔')} ${chalk.dim('Enter the 6-digit code from your email:')} ${chalk.dim('••••••')}`,
	)

	if (!code) {
		console.error(chalk.red('Code is required.'))
		process.exit(1)
	}

	const verifySpinner = ora({
		text: 'Verifying code...',
		color: 'yellow',
	}).start()

	try {
		await whop.auth.verify({ code, ticket })
		verifySpinner.stop()
		verifySpinner.clear()
	} catch {
		verifySpinner.fail('Verification failed')
		console.log('')

		const { retry } = await prompt<{ retry: string }>({
			type: 'select',
			name: 'retry',
			message: chalk.hex(ORANGE)(
				'The code was incorrect or expired. What would you like to do?',
			),
			prefix: chalk.hex(ORANGE)('?'),
			choices: [
				{ name: 'code', message: 'Try another code' },
				{ name: 'email', message: 'Use a different email' },
				{ name: 'exit', message: 'Exit' },
			],
		})

		// Clear line and show completion
		process.stdout.write('\x1b[1A\x1b[2K')
		const retryMap: Record<string, string> = {
			code: 'Try another code',
			email: 'Use a different email',
			exit: 'Exit',
		}
		console.log(
			`${chalk.green('✔')} ${chalk.dim('What would you like to do?')} ${chalk.dim(retryMap[retry] || retry)}`,
		)
		console.log('')

		if (retry === 'exit') {
			process.exit(0)
		} else if (retry === 'email') {
			// Clear terminal and restart the auth process
			console.clear()
			return authStep(whop)
		} else {
			// Try another code with same ticket
			return retryCodeVerification(whop, ticket)
		}
	}
}

async function retryCodeVerification(
	whop: Whop,
	ticket: string,
): Promise<void> {
	const codeResponse = await prompt<{ code: string }>({
		type: 'input',
		name: 'code',
		message: chalk.hex(ORANGE)('Enter the 6-digit code from your email:'),
		prefix: chalk.hex(ORANGE)('?'),
		validate: (value: string) => {
			return /^\d{6}$/.test(value) || 'Please enter a 6-digit code'
		},
	})

	const code = codeResponse.code

	// Clear line and show completion
	process.stdout.write('\x1b[1A\x1b[2K')
	console.log(
		`${chalk.green('✔')} ${chalk.dim('Enter the 6-digit code from your email:')} ${chalk.dim('••••••')}`,
	)

	if (!code) {
		console.error(chalk.red('Code is required.'))
		process.exit(1)
	}

	const verifySpinner = ora({
		text: 'Verifying code...',
		color: 'yellow',
	}).start()

	try {
		await whop.auth.verify({ code, ticket })
		verifySpinner.stop()
		verifySpinner.clear()
	} catch {
		verifySpinner.fail('Verification failed')
		console.log('')

		const { retry } = await prompt<{ retry: string }>({
			type: 'select',
			name: 'retry',
			message: chalk.hex(ORANGE)(
				'The code was incorrect or expired. What would you like to do?',
			),
			prefix: chalk.hex(ORANGE)('?'),
			choices: [
				{ name: 'code', message: 'Try another code' },
				{ name: 'email', message: 'Use a different email' },
				{ name: 'exit', message: 'Exit' },
			],
		})

		// Clear line and show completion
		process.stdout.write('\x1b[1A\x1b[2K')
		const retryMap: Record<string, string> = {
			code: 'Try another code',
			email: 'Use a different email',
			exit: 'Exit',
		}
		console.log(
			`${chalk.green('✔')} ${chalk.dim('What would you like to do?')} ${chalk.dim(retryMap[retry] || retry)}`,
		)
		console.log('')

		if (retry === 'exit') {
			process.exit(0)
		} else if (retry === 'email') {
			// Clear terminal and restart the auth process
			console.clear()
			return authStep(whop)
		} else {
			// Try another code with same ticket
			return retryCodeVerification(whop, ticket)
		}
	}
}
