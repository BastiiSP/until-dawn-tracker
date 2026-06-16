'use client'

import { useState, useEffect, useCallback } from 'react'

interface Bolt {
  id: number
  path: string
  opacity: number
}

function generateBoltPath(startXPercent: number): string {
  let x = startXPercent
  let y = 0
  let path = `M ${x} ${y}`
  const steps = 8 + Math.floor(Math.random() * 6)
  for (let i = 0; i < steps; i++) {
    y += 8 + Math.random() * 6
    x += (Math.random() - 0.5) * 6
    path += ` L ${x} ${y}`
  }
  return path
}

export function LightningEffect() {
  const [bolts, setBolts] = useState<Bolt[]>([])
  const [flash, setFlash] = useState(false)

  const triggerStrike = useCallback(() => {
    const count = Math.random() < 0.3 ? 2 : 1
    const newBolts: Bolt[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      path: generateBoltPath(15 + Math.random() * 70),
      opacity: 0.6 + Math.random() * 0.4,
    }))

    setFlash(true)
    setBolts(newBolts)

    const clearDelay = 150 + Math.floor(Math.random() * 100)
    setTimeout(() => {
      setFlash(false)
      setBolts([])
    }, clearDelay)

    if (Math.random() < 0.4) {
      setTimeout(() => {
        setBolts(newBolts.map(b => ({ ...b, opacity: b.opacity * 0.5 })))
        setFlash(true)
      }, clearDelay + 120)
      setTimeout(() => {
        setFlash(false)
        setBolts([])
      }, clearDelay + 260)
    }
  }, [])

  useEffect(() => {
    function schedule() {
      const delay = 8000 + Math.random() * 27000
      return setTimeout(() => {
        triggerStrike()
        schedule()
      }, delay)
    }
    const timer = schedule()
    return () => clearTimeout(timer)
  }, [triggerStrike])

  return (
    <>
      {flash && (
        <div
          className="pointer-events-none fixed inset-0 z-50"
          style={{ background: 'rgba(180, 210, 255, 0.07)' }}
          aria-hidden
        />
      )}
      {bolts.length > 0 && (
        <svg
          className="pointer-events-none fixed inset-0 w-full h-full z-50"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden
        >
          {bolts.map(bolt => (
            <path
              key={bolt.id}
              d={bolt.path}
              stroke="rgba(200, 220, 255, 0.9)"
              strokeWidth="0.3"
              fill="none"
              opacity={bolt.opacity}
              style={{ filter: 'drop-shadow(0 0 2px rgba(180, 210, 255, 0.8))' }}
            />
          ))}
        </svg>
      )}
    </>
  )
}
