"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { siteConfig } from "@/config/site"
import { Button } from "@/components/ui/button"

interface AnalyticsEvent {
  id: number
  event: string
  timestamp: string
}

export default function IndexPage() {
  const [events, setEvents] = useState<AnalyticsEvent[]>([])
  const [newEvent, setNewEvent] = useState("")

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data.data)
      })
      .catch((err) => console.error("Error fetching analytics:", err))
  }, [])

  const handleAddEvent = async () => {
    if (!newEvent.trim()) return

    try {
      const res = await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event: newEvent }),
      })

      const result = await res.json()

      if (res.ok) {
        setEvents((prev) => [
          {
            id: result.id,
            event: newEvent,
            timestamp: new Date().toISOString(),
          },
          ...prev,
        ])
        setNewEvent("")
      } else {
        console.error("Error adding event:", result.error)
      }
    } catch (error) {
      console.error("Error adding event:", error)
    }
  }

  return (
    <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
      <div className="flex flex-col items-start gap-2 max-w-[980px]">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          “What if” is the new programming language
        </h1>
        <p className="max-w-[700px] text-lg text-muted-foreground">
          If you can type it, you can build it. with Dream by Aliases, Inc.
        </p>
      </div>
      <div className="flex flex-col gap-4 w-full max-w-[980px]">
        <div className="flex gap-4">
          <Button asChild variant="default">
            <Link
              href={siteConfig.links.dream}
              target="_blank"
              rel="noreferrer"
            >
              Visit askdream.ai
            </Link>
          </Button>
        </div>
        <div className="mt-4">
          <h2 className="text-xl font-semibold">Recent Analytics Events</h2>
          <ul className="mt-2 space-y-2">
            {events &&
              events.map((event) => (
                <li key={event.id} className="p-4 border rounded-md">
                  <p className="font-medium">{event.event}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(event.timestamp).toLocaleString()}
                  </p>
                </li>
              ))}
          </ul>
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">Add New Event</h2>
          <input
            type="text"
            value={newEvent}
            onChange={(e) => setNewEvent(e.target.value)}
            placeholder="Enter event description"
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button onClick={handleAddEvent} disabled={!newEvent.trim()}>
            Add Event
          </Button>
        </div>
      </div>
    </section>
  )
}
