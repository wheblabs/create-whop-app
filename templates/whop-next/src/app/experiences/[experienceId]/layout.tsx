import { dehydrate } from "@tanstack/react-query";
import { WhopIframeSdkProvider } from "@whop/react";
import { WhopProvider } from "~/components/whop-context";
import {
  serverQueryClient,
  whopExperienceQuery,
  whopUserQuery,
} from "~/components/whop-context/whop-queries";

export const experimental_ppr = true;

export default async function ExperienceLayout({
  children,
  params,
}: LayoutProps<"/experiences/[experienceId]">) {
  const { experienceId } = await params;

  serverQueryClient.prefetchQuery(whopExperienceQuery(experienceId));
  serverQueryClient.prefetchQuery(whopUserQuery(experienceId));

  return (
    <WhopIframeSdkProvider>
      <WhopProvider
        state={dehydrate(serverQueryClient)}
        experienceId={experienceId}
      >
        {children}
      </WhopProvider>
    </WhopIframeSdkProvider>
  );
}
