#!/usr/bin/env node

import { execSync, spawn } from 'node:child_process'
import { lstatSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { Whop } from '@whoplabs/whop-client'
import chalk from 'chalk'
import Enquirer from 'enquirer'
import ora from 'ora'
import { authStep } from './auth-step'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const prompt = Enquirer.prompt
const ORANGE = '#FFA500'

function detectPackageManager(): 'npm' | 'pnpm' | 'bun' | 'yarn' {
	const userAgent = process.env.npm_config_user_agent || ''

	if (userAgent.includes('pnpm')) return 'pnpm'
	if (userAgent.includes('yarn')) return 'yarn'
	if (userAgent.includes('bun')) return 'bun'
	return 'npm'
}

function getInstallCommand(pm: string): string {
	switch (pm) {
		case 'yarn':
			return 'yarn install'
		case 'pnpm':
			return 'pnpm install'
		case 'bun':
			return 'bun install'
		default:
			return 'npm install'
	}
}

async function copyTemplate(templateDir: string, dest: string): Promise<void> {
	// Use shell cp -r to copy
	execSync(`cp -r "${templateDir}"/* "${dest}"`, { stdio: 'ignore' })

	// Copy specific dotfiles explicitly
	const dotfiles = ['.gitignore', '.prettierrc', '.env.example']
	for (const dotfile of dotfiles) {
		const srcPath = join(templateDir, dotfile)
		const destPath = join(dest, dotfile)
		try {
			execSync(`cp "${srcPath}" "${destPath}"`, { stdio: 'ignore' })
		} catch {
			// File doesn't exist in template, skip it
		}
	}
}

interface AddonConfig {
	name: string
	description: string
	files: string[]
	dependencies?: Record<string, string>
	devDependencies?: Record<string, string>
	scripts?: Record<string, string>
}

async function applyAddon(
	addonPath: string,
	dest: string,
): Promise<AddonConfig> {
	// Read addon config
	const configPath = join(addonPath, '.addon.json')
	const config: AddonConfig = JSON.parse(readFileSync(configPath, 'utf-8'))

	// Copy addon files
	for (const filePattern of config.files) {
		const srcPath = join(addonPath, filePattern.replace('/**', ''))
		const destPath = join(dest, filePattern.replace('/**', ''))

		// Create parent directory if needed
		const parentDir = dirname(destPath)
		mkdirSync(parentDir, { recursive: true })

		// Copy files
		if (filePattern.includes('/**')) {
			// Copy directory recursively
			try {
				execSync(`cp -r "${srcPath}" "${dirname(destPath)}"`, {
					stdio: 'ignore',
				})
			} catch {
				// Directory might not exist yet
			}
		} else {
			// Copy single file
			execSync(`cp "${srcPath}" "${destPath}"`, { stdio: 'ignore' })
		}
	}

	// Merge package.json
	const packageJsonPath = join(dest, 'package.json')
	const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

	if (config.dependencies) {
		packageJson.dependencies = {
			...packageJson.dependencies,
			...config.dependencies,
		}
	}

	if (config.devDependencies) {
		packageJson.devDependencies = {
			...packageJson.devDependencies,
			...config.devDependencies,
		}
	}

	if (config.scripts) {
		packageJson.scripts = {
			...packageJson.scripts,
			...config.scripts,
		}
	}

	writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2))

	return config
}

async function main() {
	// Clear terminal for clean experience
	console.clear()

	// Detect package manager
	const packageManager = detectPackageManager()

	// Step 1: Authenticate with whop
	const whopLabsDir = join(homedir(), '.whoplabs')
	mkdirSync(whopLabsDir, { recursive: true })
	const whopSessionPath = join(whopLabsDir, 'whop-session.json')
	const whop = new Whop(whopSessionPath)

	// Check if already authenticated
	const isAuthenticated = whop.isAuthenticated()
	if (!isAuthenticated) {
		await authStep(whop)
		// Clear screen and show success message after auth
		console.clear()
		console.log(chalk.green('\n✔ Authentication successful\n'))
	}

	// Step 2: Enter app name
	if (process.argv.length > 3) {
		console.error(chalk.hex(ORANGE)('Usage: create-whop-app [project-name]'))
		process.exit(1)
	}

	let name: string

	if (process.argv.length === 3 && process.argv[2] !== undefined) {
		// Project name provided as argument
		name = process.argv[2]
	} else {
		// Prompt for project name
		const response = await prompt<{ name: string }>({
			type: 'input',
			name: 'name',
			message: chalk.hex(ORANGE)('What is your app named?'),
			initial: 'My Whop App',
			prefix: chalk.hex(ORANGE)('?'),
		})
		name = response.name

		// Clear line and show completion
		process.stdout.write('\x1b[1A\x1b[2K')
		console.log(
			`${chalk.green('✔')} ${chalk.dim('(1/4) Create app:')} ${chalk.dim(name)}`,
		)
	}

	if (!name?.trim()) {
		console.error(chalk.red('Invalid project name.'))
		process.exit(1)
	}

	// Create sanitized directory name (lowercase, dashes instead of spaces)
	const dirName = name.trim().toLowerCase().replace(/\s+/g, '-')

	// Check if directory already exists
	const dest = resolve(process.cwd(), dirName)
	if (lstatSync(dest, { throwIfNoEntry: false })) {
		console.error(chalk.red(`\nDirectory already exists: ${dirName}`))
		console.log(
			chalk.dim(
				'Please choose a different name or remove the existing directory.\n',
			),
		)
		process.exit(1)
	}

	// Step 3: Fetch companies
	const spinner = ora({
		text: 'Fetching your companies...',
		color: 'yellow',
	}).start()

	let companies: Array<{ id: string; title: string }>
	try {
		companies = await whop.companies.list()
		spinner.stop()
		spinner.clear()
	} catch (error) {
		spinner.fail('Failed to fetch companies')
		throw error
	}

	// Check if companies list is empty
	if (companies.length === 0) {
		console.log('')
		console.log(chalk.hex(ORANGE)('No companies found'))
		console.log(
			chalk.dim('You need to create a company before you can create an app.'),
		)
		console.log('')

		const { companyName } = await prompt<{ companyName: string }>({
			type: 'input',
			name: 'companyName',
			message: chalk.hex(ORANGE)('Enter a name for your new company:'),
			prefix: chalk.hex(ORANGE)('?'),
			validate: (value: string) =>
				value.trim().length > 0 || 'Company name is required',
		})

		// Clear line and show completion
		process.stdout.write('\x1b[1A\x1b[2K')
		console.log(
			`${chalk.green('✔')} ${chalk.dim('Enter a name for your new company:')} ${chalk.dim(companyName)}`,
		)

		const createSpinner = ora({
			text: 'Creating company...',
			color: 'yellow',
		}).start()

		// TODO: Implement company creation when SDK supports it
		// const newCompany = await whop.companies.create({ name: companyName.trim() })
		// companies = [newCompany]

		createSpinner.warn(
			'Company creation not yet implemented. Please create a company at https://whop.com/dashboard first.',
		)
		process.exit(0)
	}

	// Step 4: Select company that will own the app
	const { createCompany } = await prompt<{ createCompany: string }>({
		type: 'autocomplete',
		name: 'createCompany',
		message: chalk.hex(ORANGE)('Which company should own this app?'),
		prefix: chalk.hex(ORANGE)('?'),
		choices: companies.map((company) => ({
			name: company.id,
			message: company.title,
		})),
	})

	// Clear line and show completion
	const createCompanyData = companies.find((c) => c.id === createCompany)
	process.stdout.write('\x1b[1A\x1b[2K')
	console.log(
		`${chalk.green('✔')} ${chalk.dim('(2/4) Create under:')} ${chalk.dim(createCompanyData?.title || createCompany)}`,
	)

	if (!createCompanyData) {
		console.error(chalk.red('Invalid company selection'))
		process.exit(1)
	}

	// Step 5: Select company to install the app on
	const { installCompany } = await prompt<{ installCompany: string }>({
		type: 'autocomplete',
		name: 'installCompany',
		message: chalk.hex(ORANGE)('Where do you want to install this app?'),
		prefix: chalk.hex(ORANGE)('?'),
		choices: companies.map((company) => ({
			name: company.id,
			message: company.title,
		})),
		initial: companies.findIndex((c) => c.id === createCompany),
	})

	// Clear line and show completion
	const installCompanyData = companies.find((c) => c.id === installCompany)
	process.stdout.write('\x1b[1A\x1b[2K')
	console.log(
		`${chalk.green('✔')} ${chalk.dim('(3/4) Install under:')} ${chalk.dim(installCompanyData?.title || installCompany)}`,
	)

	const installCompanyId = installCompany

	// Step 6: Ask about database
	const { needsDatabase } = await prompt<{ needsDatabase: string }>({
		type: 'select',
		name: 'needsDatabase',
		message: chalk.hex(ORANGE)('Do you need a database?'),
		prefix: chalk.hex(ORANGE)('?'),
		choices: [
			{ name: 'no', message: 'No' },
			{ name: 'yes', message: 'Yes' },
		],
	})

	let databaseType: string | undefined
	let databaseDisplay = 'No'

	if (needsDatabase === 'yes') {
		// Clear the "Do you need a database?" line
		process.stdout.write('\x1b[1A\x1b[2K')

		const { dbType } = await prompt<{ dbType: string }>({
			type: 'select',
			name: 'dbType',
			message: chalk.hex(ORANGE)('Select database:'),
			prefix: chalk.hex(ORANGE)('?'),
			choices: [{ name: 'sqlite', message: 'SQLite (upgradable to Turso)' }],
		})
		databaseType = dbType
		databaseDisplay = 'SQLite / Turso'

		// Clear the database selection line
		process.stdout.write('\x1b[1A\x1b[2K')
	} else {
		// Clear the "Do you need a database?" line
		process.stdout.write('\x1b[1A\x1b[2K')
	}

	console.log(
		`${chalk.green('✔')} ${chalk.dim('(4/4) Database:')} ${chalk.dim(databaseDisplay)}`,
	)
	console.log('')

	// Step 7: Setting up project (grouped)
	const setupSpinner = ora({
		text: 'Setting up project...',
		color: 'yellow',
	}).start()

	let app: { id: string; name: string }
	try {
		// Create with random name first (workaround for "whop" in name restriction)
		const randomName = `app-${Date.now()}`
		app = await whop.apps.create({
			name: randomName,
			companyId: createCompany,
		})

		// Update with user's actual name
		await whop.apps.update(app.id, {
			name: name.trim(),
		})

		setupSpinner.text = 'Installing app...'
		await whop.companies.installApp(installCompanyId, app.id)

		// Step 8: Create project directory
		mkdirSync(dest, { recursive: true })

		const templateDir = join(__dirname, '..', 'templates', 'whop-next')

		setupSpinner.text = 'Copying template files...'
		await copyTemplate(templateDir, dest)

		// Add database connector if selected
		if (needsDatabase === 'yes' && databaseType) {
			setupSpinner.text = 'Setting up database...'
			const addonPath = join(
				__dirname,
				'..',
				'templates',
				'addons',
				databaseType,
			)
			await applyAddon(addonPath, dest)
		}

		setupSpinner.text = 'Installing dependencies (this may take a minute)...'
		const installCmd = getInstallCommand(packageManager)
		execSync(installCmd, { cwd: dest, stdio: 'ignore' })

		setupSpinner.text = 'Configuring environment...'
		const credentials = await whop.apps.getCredentials(app.id, createCompany)

		const envContent = [
			`WHOP_API_KEY=${credentials.apiKey.token}`,
			`NEXT_PUBLIC_WHOP_APP_ID=${credentials.id}`,
			`NEXT_PUBLIC_WHOP_AGENT_USER_ID=${credentials.agentUsers[0]?.id || ''}`,
			`NEXT_PUBLIC_WHOP_COMPANY_ID=${createCompany}`,
		].join('\n')

		const envFilePath = join(dest, '.env')
		writeFileSync(envFilePath, envContent)

		setupSpinner.stop()
		setupSpinner.clear()

		// Show all completed steps
		console.log(chalk.green('✔') + ' Setting up project...')
		console.log(chalk.dim(`  ├─ Created app "${name.trim()}"`))
		console.log(chalk.dim(`  ├─ Installed on ${installCompanyData?.title}`))
		console.log(chalk.dim('  ├─ Template copied'))
		console.log(chalk.dim('  ├─ Dependencies installed'))
		console.log(chalk.dim('  └─ Environment configured'))
	} catch (error) {
		setupSpinner.fail('Failed to set up project')
		throw error
	}

	// Get app URL
	const appUrl = await whop.apps.getUrl(app.id, createCompany)

	console.log('')
	console.log(chalk.hex(ORANGE).bold('✓ Setup Complete!'))
	console.log('')
	console.log(chalk.hex(ORANGE)(`App: ${name.trim()}`))
	console.log(chalk.hex(ORANGE)(`Company: ${createCompanyData.title}`))
	console.log(chalk.hex(ORANGE)(`URL: ${appUrl}`))
	console.log('')

	// Step 12: Ask to open in browser
	const { openBrowser } = await prompt<{ openBrowser: boolean }>({
		type: 'confirm',
		name: 'openBrowser',
		message: chalk.hex(ORANGE)('Open app in browser when ready?'),
		prefix: chalk.hex(ORANGE)('?'),
		initial: true,
	})

	// Clear line and show completion
	process.stdout.write('\x1b[1A\x1b[2K')
	console.log(
		`${chalk.green('✔')} ${chalk.dim('Open app in browser when ready?')} ${chalk.dim(openBrowser ? 'Yes' : 'No')}`,
	)

	console.log('')
	console.log(chalk.hex(ORANGE)('Starting development server...'))
	console.log(chalk.dim(`App: ${appUrl}`))
	console.log(chalk.dim(`Dashboard: https://whop.com/dashboard/apps/${app.id}`))
	console.log('')
	console.log(chalk.dim('Press Ctrl+C to stop'))
	console.log('')

	// Change to project directory and start dev server
	process.chdir(dest)

	if (openBrowser) {
		// Open browser after a short delay to let the server start
		setTimeout(() => {
			try {
				execSync(`open "${appUrl}"`, { stdio: 'ignore' })
			} catch {
				// Ignore errors if 'open' command is not available
			}
		}, 2000)
	}

	// Use the same package manager to run dev
	const runCmd =
		packageManager === 'npm' ? 'npm run dev' : `${packageManager} dev`
	const cmdParts = runCmd.split(' ')
	const command = cmdParts[0] || 'npm'
	const args = cmdParts.slice(1)

	const dev = spawn(command, args, {
		cwd: dest,
		stdio: 'inherit' as const,
	})

	await new Promise<void>((resolve) => {
		dev.on('exit', () => resolve())
	})
}

main().catch((err) => {
	console.error(chalk.red('Error:'), err)
	process.exit(1)
})
