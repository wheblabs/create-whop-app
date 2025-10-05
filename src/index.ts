#!/usr/bin/env bun

import { join, resolve, dirname } from 'path'
import { lstatSync, mkdirSync } from 'node:fs'
import kleur from 'kleur'
import prompts from 'prompts'
import { $ } from 'bun'

const __dirname = dirname(import.meta.url.replace('file://', ''))

async function copyTemplate(templateDir: string, dest: string): Promise<void> {
  // Use shell cp -r to copy
  await $`cp -r ${templateDir}/* ${dest}`.quiet()
  // also hidden files (suppress error if none exist)
  await $`cp -r ${templateDir}/.* ${dest} 2>/dev/null || true`.quiet()
}

async function main() {
  console.log(kleur.cyan('⟐ create-whop-app'))

  if (process.argv.length > 2) {
    console.error(kleur.red('This CLI accepts no arguments.'))
    process.exit(1)
  }

  const { name } = await prompts({
    type: 'text',
    name: 'name',
    message: 'Project name:',
    initial: 'my-whop-app',
  })

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

  const templateDir = join(__dirname, '..', 'templates', 'next-whop')

  console.log(kleur.cyan(`Initializing... ${name}`))

  await copyTemplate(templateDir, dest)
  await $`bun install --cwd ${dest}`
  await $`bun typegen --cwd ${dest}`

  console.log('')
  console.log(kleur.cyan('Environment Setup'))
  console.log(
    kleur.white(
      'Go to https://whop.com/dashboard/developer and copy all env variables',
    ),
  )
  console.log('')

  const { envVars } = await prompts({
    type: 'text',
    name: 'envVars',
    message: 'Paste your environment variables:',
  })

  if (!envVars?.trim()) {
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

  const envLines = envVars
    .trim()
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
  console.log(kleur.white(`cd ${name}`))
}

main().catch((err) => {
  console.error(kleur.red('Error:'), err)
  process.exit(1)
})
