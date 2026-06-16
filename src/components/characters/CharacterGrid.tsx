import { CharacterCard } from './CharacterCard'

interface Character {
  id: string
  name: string
  status: 'alive' | 'dead' | 'unknown'
}

interface CharacterGridProps {
  characters: Character[]
}

export function CharacterGrid({ characters }: CharacterGridProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {characters.map(c => (
        <CharacterCard
          key={c.id}
          id={c.id}
          name={c.name}
          initialStatus={c.status}
        />
      ))}
    </div>
  )
}
