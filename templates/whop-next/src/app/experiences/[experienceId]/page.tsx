"use client";

import { useQuery } from "@tanstack/react-query";
import { useIframeSdk } from "@whop/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useWhop } from "~/components/whop-context";
import { receiptsQuery } from "~/components/whop-context/whop-queries";
import WhopLabsLogo from "../../../../public/WhopLabsLogo.svg";

export default function Page() {
  const iframeSdk = useIframeSdk();
  const { experience, user, access } = useWhop();
  const [processingType, setProcessingType] = useState<
    "one-time" | "subscription" | null
  >(null);
  const [isHoveringSubscription, setIsHoveringSubscription] = useState(false);

  const { data: receiptsData, isLoading: isLoadingReceipts } =
    useQuery(receiptsQuery());

  useEffect(() => {
    console.log(receiptsData);
  }, [receiptsData]);

  // Check if user has active subscription
  const subscriptionPass = receiptsData?.accessPasses.find(
    (ap) => ap.type === "subscription"
  );
  const activeSubscriptionReceipt = subscriptionPass?.receipts.find(
    (r) => r.subscriptionStatus === "active"
  );
  const hasActiveSubscription = !!activeSubscriptionReceipt;
  const memberId = activeSubscriptionReceipt?.member?.id;

  // Calculate revenue stats
  const oneTimePass = receiptsData?.accessPasses.find(
    (ap) => ap.type === "one-time"
  );
  const oneTimeRevenue =
    oneTimePass?.receipts.reduce((sum, r) => sum + r.amountPaid, 0) ?? 0;
  const subscriptionRevenue =
    subscriptionPass?.receipts.reduce((sum, r) => sum + r.amountPaid, 0) ?? 0;

  const handleCheckout = async (type: "one-time" | "subscription") => {
    // If subscription and user has active subscription, open manage page
    if (type === "subscription" && hasActiveSubscription && memberId) {
      window.open(`https://whop.com/billing/manage/${memberId}`, "_blank");
      return;
    }

    setProcessingType(type);
    try {
      const response = await fetch(`/api/checkout/${type}`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const { planId, checkoutId } = await response.json();

      // Open Whop checkout
      // window.open(`https://whop.com/checkout/${checkoutId}`, "_blank");
      iframeSdk.inAppPurchase({ planId: planId, id: checkoutId });
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Failed to create checkout session. Please try again.");
    } finally {
      setProcessingType(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-8 sm:p-20 bg-black text-white font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-4 items-start flex-1 justify-center w-full max-w-[680px]">
        <div className="flex items-center gap-0.5">
          <Image
            src={WhopLabsLogo}
            alt="Whop Labs"
            width={80}
            height={80}
            priority
          />
          <span className="text-[4.8rem] font-bold">hop Labs</span>
        </div>

        <ol className="mt-4 list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
              src/app/experience/[experienceId]/page.tsx
            </code>
          </li>
          <li className="mb-2">Save and see your changes instantly.</li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
            href={`cursor://file${process.env.NEXT_PUBLIC_PROJECT_PATH}?args=-n`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in Cursor
          </a>
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

        <div className="flex gap-2 flex-wrap items-center justify-start text-xs">
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

        <div className="mt-8">Actions you can perform:</div>

        <div className="flex gap-2 flex-wrap items-center justify-center text-xs">
          <button
            type="button"
            onClick={() => handleCheckout("one-time")}
            disabled={processingType === "one-time"}
            className="px-2 py-1 rounded-full bg-white text-black border border-white hover:bg-gray-200 hover:cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_8px_rgba(255,255,255,0.2)]"
          >
            {processingType === "one-time"
              ? "Processing..."
              : "One-Time Purchase"}
          </button>
          <button
            type="button"
            onClick={() => handleCheckout("subscription")}
            onMouseEnter={() => setIsHoveringSubscription(true)}
            onMouseLeave={() => setIsHoveringSubscription(false)}
            disabled={processingType === "subscription" || isLoadingReceipts}
            className={`px-2 py-1 rounded-full border transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              hasActiveSubscription
                ? "bg-green-600/[.2] border-green-500/[.4] text-green-300 hover:bg-red-600/[.2] hover:border-red-500/[.4] hover:text-red-300 hover:cursor-pointer"
                : "bg-white text-black border-white hover:bg-gray-200 hover:cursor-pointer hover:shadow-[0_0_8px_rgba(255,255,255,0.2)]"
            }`}
          >
            {isLoadingReceipts
              ? "Loading..."
              : processingType === "subscription"
                ? "Processing..."
                : hasActiveSubscription
                  ? isHoveringSubscription
                    ? "Manage Subscription"
                    : "Subscribed ✓"
                  : "Subscribe"}
          </button>
        </div>

        <div className="mt-8">Revenue from purchases:</div>

        <div className="flex gap-2 flex-wrap items-center justify-start text-xs">
          <span className="px-2 py-1 rounded-full bg-white/[.08] border border-white/[.145]">
            Total: $
            {isLoadingReceipts
              ? "..."
              : (oneTimeRevenue + subscriptionRevenue).toFixed(2)}
          </span>
          <span className="px-2 py-1 rounded-full bg-white/[.08] border border-white/[.145]">
            One-Time: ${isLoadingReceipts ? "..." : oneTimeRevenue.toFixed(2)}
          </span>
          <span className="px-2 py-1 rounded-full bg-white/[.08] border border-white/[.145]">
            Subscription: $
            {isLoadingReceipts ? "..." : subscriptionRevenue.toFixed(2)}
          </span>
        </div>
      </main>

      <footer className="flex gap-6 flex-wrap items-center justify-center mt-16 text-sm text-center">
        <p className="text-gray-600">
          Check out more from Whop Labs on{" "}
          <Link
            className="underline hover:text-gray-400 transition-colors"
            href="https://whop.com/whoplabs-main/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Whop
          </Link>{" "}
          and{" "}
          <Link
            className="underline hover:text-gray-400 transition-colors"
            href="https://x.com/wheblabs"
            target="_blank"
            rel="noopener noreferrer"
          >
            X
          </Link>
        </p>
      </footer>
    </div>
  );
}
