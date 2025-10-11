#!/usr/bin/env bun

import { $ } from 'bun'
import kleur from 'kleur'
import { lstatSync, mkdirSync } from 'node:fs'
import { dirname, join, resolve } from 'path'
import prompts from 'prompts'
import readline from 'node:readline'

const __dirname = dirname(import.meta.url.replace('file://', ''))

async function copyTemplate(templateDir: string, dest: string): Promise<void> {
  // Use shell cp -r to copy
  await $`cp -r ${templateDir}/* ${dest}`.quiet()

  // Copy specific dotfiles explicitly
  const dotfiles = ['.gitignore', '.prettierrc', '.env.example']
  for (const dotfile of dotfiles) {
    const srcPath = join(templateDir, dotfile)
    const destPath = join(dest, dotfile)
    try {
      await $`cp ${srcPath} ${destPath}`.quiet()
    } catch {
      // File doesn't exist in template, skip it
    }
  }
}

async function main() {
  // Check if running with Bun
  if (typeof Bun === 'undefined') {
    console.error(kleur.red('Use bunx loser'))
    console.log(kleur.white('Install Bun: npm install -g bun'))
    process.exit(1)
  }

  console.log(kleur.cyan('⟐ create-whop-app'))

  if (process.argv.length > 3) {
    console.error(kleur.red('Usage: create-whop-app [project-name]'))
    process.exit(1)
  }

  let name: string

  if (process.argv.length === 3) {
    // Project name provided as argument
    name = process.argv[2]!
  } else {
    // Prompt for project name
    const response = await prompts({
      type: 'text',
      name: 'name',
      message: 'Project name:',
      initial: 'my-whop-app',
    })
    name = response.name
  }

  if (!name?.trim()) {
    console.error(kleur.red('Invalid project name.'))
    process.exit(1)
  }

  const dest = resolve(process.cwd(), name.trim())
  if (lstatSync(dest, { throwIfNoEntry: false } as any)) {
    console.error(kleur.red(`Directory already exists: ${name}`))
    process.exit(1)
  }

  mkdirSync(dest, { recursive: true })

  const templateDir = join(__dirname, '..', 'templates', 'whop-next')

  console.log(kleur.cyan(`Initializing... ${name}`))

  await copyTemplate(templateDir, dest)
  await $`bun install --cwd ${dest}`
  await $`cd ${dest} && bun typegen`

  console.log('')
  console.log(kleur.cyan('Environment Setup'))
  console.log(
    kleur.white(
      '1. Go to https://whop.com/dashboard\n2. Open "Developer" tab on the left sidebar at the bottom\n3. Choose your app\n4. Click "Copy" icon next to "Environment Variables"\n5. Paste them below (press Enter on empty line when done)',
    ),
  )
  console.log('')

  // Read multiline input from stdin using readline
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  const lines: string[] = []

  process.stdout.write(kleur.dim('Paste environment variables:\n'))

  const envVars = await new Promise<string>((resolve) => {
    rl.on('line', (line) => {
      if (line.trim() === '' && lines.length > 0) {
        rl.close()
        resolve(lines.join('\n'))
      } else if (line.trim() !== '') {
        lines.push(line.trim())
      }
    })
  })

  if (!envVars.trim()) {
    console.error(kleur.red('No environment variables provided.'))
    process.exit(1)
  }

  // Parse and validate env vars
  const requiredVars = [
    'WHOP_API_KEY',
    'NEXT_PUBLIC_WHOP_APP_ID',
    'NEXT_PUBLIC_WHOP_AGENT_USER_ID',
    'NEXT_PUBLIC_WHOP_COMPANY_ID',
  ]

  // Handle both newline-separated and concatenated format from Whop
  // Split on known variable name patterns that start new entries
  const normalized = envVars
    .trim()
    .replace(/(NEXT_PUBLIC_WHOP_APP_ID=)/g, '\n$1')
    .replace(/(NEXT_PUBLIC_WHOP_AGENT_USER_ID=)/g, '\n$1')
    .replace(/(NEXT_PUBLIC_WHOP_COMPANY_ID=)/g, '\n$1')

  const envLines = normalized
    .split('\n')
    .map((line: string) => line.trim())
    .filter((line: string) => line && !line.startsWith('#'))

  const parsedEnv: Record<string, string> = {}

  for (const line of envLines) {
    const [key, ...valueParts] = line.split('=')
    if (key && valueParts.length > 0) {
      parsedEnv[key.trim()] = valueParts.join('=').trim()
    }
  }

  // Verify all required vars are present
  const missingVars = requiredVars.filter((key) => !parsedEnv[key])

  if (missingVars.length > 0) {
    console.error(
      kleur.red(`Missing required variables: ${missingVars.join(', ')}`),
    )
    process.exit(1)
  }

  // Write to .env file
  const envFilePath = join(dest, '.env')
  const envContent = Object.entries(parsedEnv)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n')

  await Bun.write(envFilePath, envContent)

  console.log(kleur.green('✓ Environment variables configured'))
  console.log(kleur.green('✓ Project ready'))
  console.log('')
  console.log(kleur.cyan('Starting development server...'))
  console.log('')

  // Change to project directory and start bun dev
  process.chdir(dest)
  const dev = Bun.spawn(['bun', 'dev'], {
    cwd: dest,
    stdio: ['inherit', 'inherit', 'inherit'],
  })

  await dev.exited
}

main().catch((err) => {
  console.error(kleur.red('Error:'), err)
  process.exit(1)
})
