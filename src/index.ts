#!/usr/bin/env node
import kleur from 'kleur'
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import prompts from 'prompts'

async function main() {
  console.log(kleur.cyan('🚀 create-whop-app'))

  const response = await prompts([
    {
      type: 'text',
      name: 'name',
      message: 'App name:',
      initial: 'my-whop-app',
    },
  ])

  const appName = response.name || 'my-whop-app'
  const appDir = join(process.cwd(), appName)
  if (existsSync(appDir)) {
    console.error(kleur.red(`Directory ${appName} already exists.`))
    process.exit(1)
  }
  mkdirSync(appDir)

  console.log(kleur.yellow('Creating Next.js app...'))
  execSync(`bunx create-next-app@latest ${appName} --ts --eslint --app`, {
    stdio: 'inherit',
  })

  console.log(kleur.yellow('Adding Whop additions...'))
  writeFileSync(
    join(appDir, 'whop.config.ts'),
    `export default { appId: "", devMode: true }`,
  )
  writeFileSync(join(appDir, '.env.local'), 'WHOP_API_KEY=\n')

  execSync(`cd ${appDir} && bun add @whop/api @whop/ui`, { stdio: 'inherit' })

  console.log(kleur.green('✅ Done'))
  console.log(kleur.cyan(`cd ${appName} && bun dev`))
}

main().catch((e) => {
  console.error(kleur.red('Error:'), e)
  process.exit(1)
})
