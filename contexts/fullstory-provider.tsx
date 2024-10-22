"use client"

import { ReactNode, useEffect } from "react"
import * as fullstory from "@fullstory/browser"

interface FullstoryProviderProps {
  children: ReactNode
}

function FullstoryProvider({ children }: FullstoryProviderProps) {
  useEffect(() => {
    fullstory.init({ orgId: process.env.NEXT_PUBLIC_FULLSTORY_ORG })
    ;(window as any)._fs_run_in_iframe = true
  }, [])

  return <>{children}</>
}

export default FullstoryProvider
