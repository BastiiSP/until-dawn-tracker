const FLAKES = [
  { l: 5, s: 2, d: 9, dl: 0 },
  { l: 10, s: 3, d: 12, dl: -3 },
  { l: 15, s: 1, d: 8, dl: -6 },
  { l: 20, s: 2, d: 11, dl: -1 },
  { l: 25, s: 3, d: 10, dl: -4 },
  { l: 30, s: 1, d: 13, dl: -2 },
  { l: 35, s: 2, d: 9, dl: -7 },
  { l: 40, s: 3, d: 11, dl: -5 },
  { l: 45, s: 1, d: 8, dl: -3 },
  { l: 50, s: 2, d: 12, dl: -9 },
  { l: 55, s: 3, d: 10, dl: -8 },
  { l: 60, s: 1, d: 9, dl: -6 },
  { l: 65, s: 2, d: 14, dl: -2 },
  { l: 70, s: 3, d: 11, dl: -4 },
  { l: 75, s: 1, d: 8, dl: -9 },
  { l: 80, s: 2, d: 10, dl: -1 },
  { l: 85, s: 3, d: 12, dl: -5 },
  { l: 90, s: 1, d: 9, dl: -3 },
  { l: 95, s: 2, d: 11, dl: -7 },
  { l: 12, s: 2, d: 10, dl: -10 },
  { l: 28, s: 1, d: 13, dl: -2 },
  { l: 43, s: 3, d: 9, dl: -6 },
  { l: 58, s: 2, d: 11, dl: -4 },
  { l: 72, s: 1, d: 8, dl: -11 },
  { l: 88, s: 3, d: 12, dl: -1 },
]

export function SnowEffect() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      {FLAKES.map((f, i) => (
        <span
          key={i}
          className="absolute top-0 rounded-full bg-white animate-snowfall"
          style={{
            left: `${f.l}%`,
            width: `${f.s}px`,
            height: `${f.s}px`,
            opacity: 0.1 + f.s * 0.05,
            animationDuration: `${f.d}s`,
            animationDelay: `${f.dl}s`,
          }}
        />
      ))}
    </div>
  )
}
