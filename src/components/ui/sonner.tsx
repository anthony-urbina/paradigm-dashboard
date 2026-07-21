"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "!rounded-2xl !border !px-4 !py-3.5 !shadow-lg !text-sm !font-medium !backdrop-blur-sm",
          title: "!font-semibold",
          success:
            "!bg-emerald-950/90 !border-emerald-700/50 !text-emerald-100 [&>[data-icon]]:!text-emerald-400",
          error:
            "!bg-red-950/90 !border-red-700/50 !text-red-100 [&>[data-icon]]:!text-red-400",
          warning:
            "!bg-amber-950/90 !border-amber-700/50 !text-amber-100 [&>[data-icon]]:!text-amber-400",
          info:
            "!bg-[#1a1c2e]/90 !border-[#5865F2]/40 !text-blue-100 [&>[data-icon]]:!text-[#5865F2]",
          loading:
            "!bg-[var(--vf-panel)]/90 !border-[var(--vf-border)] !text-[var(--vf-text)] [&>[data-icon]]:!text-[var(--vf-muted)]",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
