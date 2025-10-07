'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useWhop } from '~/components/whop-context'
import WhopLabsLogo from '../../../../public/WhopLabsLogo.svg'

export default function Page() {
  const { experience, user, access } = useWhop()

  return (
    <div className="min-h-screen flex flex-col items-center p-8 sm:p-20 bg-black text-white font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-4 items-start flex-1 justify-center w-full max-w-[680px]">
        <div className="flex items-center gap-0.5">
          <Image src={WhopLabsLogo} alt="Whop Labs" width={80} height={80} priority />
          <span className="text-[4.8rem] font-bold">hop Labs</span>
        </div>

        <ol className="mt-4 list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2">
            Get started by editing{' '}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
              src/app/experience/[experienceId]/page.tsx
            </code>
          </li>
          <li className="mb-2">Save and see your changes instantly.</li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href="https://x.com/wheblabs"
            target="_blank"
            rel="noopener noreferrer"
          >
            Follow us on 𝕏
          </Link>
          <Link
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
            href="https://docs.whop.com/sdk/whop-api-client"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read Whop Docs
          </Link>
        </div>

        <div className="mt-8">Some stuff you can read from whop API:</div>

        <div className="flex gap-2 flex-wrap items-center justify-center text-xs">
          <span className="px-2 py-1 rounded-full bg-white/[.08] border border-white/[.145]">
            Experience: {experience.name}
          </span>
          <span className="px-2 py-1 rounded-full bg-white/[.08] border border-white/[.145]">
            Company: {experience.company.title}
          </span>
          <span className="px-2 py-1 rounded-full bg-white/[.08] border border-white/[.145]">
            User: {user.name} (@{user.username})
          </span>
          <span className="px-2 py-1 rounded-full bg-white/[.08] border border-white/[.145]">
            Access: {access.accessLevel}
          </span>
        </div>
      </main>

      <footer className="flex gap-6 flex-wrap items-center justify-center mt-16 text-sm text-center">
        <p className="text-gray-600">
          Check out more from Whop Labs on{' '}
          <Link
            className="underline hover:text-gray-400 transition-colors"
            href="https://whop.com/whoplabs-main/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Whop
          </Link>
        </p>
      </footer>
    </div>
  )
}
