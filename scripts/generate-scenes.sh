#!/bin/bash
# Until Dawn Scene Image Generator — gpt-image-2
# Usage: OPENAI_API_KEY=sk-... bash scripts/generate-scenes.sh

set -e

if [ -z "$OPENAI_API_KEY" ]; then
  echo "Fehler: OPENAI_API_KEY nicht gesetzt."
  echo "Nutzung: OPENAI_API_KEY=sk-... bash scripts/generate-scenes.sh"
  exit 1
fi

DEST="public/scenes"
mkdir -p "$DEST"

generate() {
  local FILE="$1"
  local PROMPT="$2"
  echo "🎨 Generiere $FILE..."

  RESPONSE=$(curl -s https://api.openai.com/v1/images/generations \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $OPENAI_API_KEY" \
    -d "{
      \"model\": \"gpt-image-2\",
      \"prompt\": $(echo "$PROMPT" | jq -Rs .),
      \"n\": 1,
      \"size\": \"1536x1024\",
      \"quality\": \"high\"
    }")

  ERROR=$(echo "$RESPONSE" | jq -r '.error.message // empty')
  if [ -n "$ERROR" ]; then
    echo "  ❌ Fehler: $ERROR"
    return 1
  fi

  B64=$(echo "$RESPONSE" | jq -r '.data[0].b64_json')
  echo "$B64" | base64 --decode > "$DEST/$FILE"
  echo "  ✅ Gespeichert: $DEST/$FILE"
}

# Scene context prefix used in every prompt
# "Until Dawn" is a cinematic horror survival game by Supermassive Games set on
# Blackwood Mountain — dark, snowy, isolated, with a filmic PS4/PS5 aesthetic.

batch() {
  # Run all passed generate calls in parallel, wait for completion
  local PIDS=()
  for CMD in "$@"; do
    eval "$CMD" &
    PIDS+=($!)
  done
  for PID in "${PIDS[@]}"; do
    wait "$PID" || true
  done
}

# Batch 1 (Szenen 07–10) — 01–06 bereits generiert
batch \
  'generate "07-jessicas-rescue.jpg" "Scene from the Until Dawn horror survival game by Supermassive Games. Dark dense pine forest on Blackwood Mountain at night during a blizzard, a desperate figure sprinting between black tree trunks, motion blur, something enormous moving through the shadows between trees in pursuit, moonlight cutting through branches, pure panic, cinematic horror, filmic grain, photorealistic, 4K"' \
  'generate "08-fire-tower.jpg" "Scene from the Until Dawn horror survival game by Supermassive Games. A tall wooden fire lookout tower on a remote Blackwood Mountain peak at night, storm clouds roiling around it lit by cold moonlight, the small cab at the top faintly glowing, vast dark wilderness and snowfields far below, isolated and deeply ominous, cinematic establishing shot, filmic grain, photorealistic, 4K"' \
  'generate "09-chris-honesty.jpg" "Scene from the Until Dawn horror survival game by Supermassive Games. Two young survivors face each other inside the dark Blackwood Mountain lodge, one confessing something devastating, tense emotional confrontation, low flickering candlelight casting long shadows across their faces, the weight of a terrible secret, cinematic horror drama, filmic grain, photorealistic, 4K"' \
  'generate "10-the-clue.jpg" "Scene from the Until Dawn horror survival game by Supermassive Games. A dark study room in the Blackwood Mountain lodge, a cork board on the wall covered with old photographs, newspaper clippings about the missing twins Hannah and Beth Washington, and red string connecting the evidence, a flashlight beam revealing the conspiracy, an open journal with handwritten notes, cinematic horror mystery, filmic grain, photorealistic, 4K"'

echo "▶ Batch 1/4 fertig"

# Batch 2 (Szenen 11–14)
batch \
  'generate "11-bear-trap.jpg" "Scene from the Until Dawn horror survival game by Supermassive Games. A large rusted steel bear trap on a dark stone floor in a subterranean room on Blackwood Mountain, its serrated metal jaws spread open, a single harsh overhead light casting sharp shadows, old bloodstains on the stone, heavy chains anchoring it to the wall, someone trapped, extreme dread, cinematic horror, filmic grain, photorealistic, 4K"' \
  'generate "12-ashleys-door.jpg" "Scene from the Until Dawn horror survival game by Supermassive Games. A heavy weathered wooden door in a dark lodge corridor, fists pounding desperately from the other side, the wood bulging from the impact, a shadow visible through the gap beneath the door, the agonizing decision of whether to open it, dim flickering light, cinematic horror tension, filmic grain, photorealistic, 4K"' \
  'generate "13-mikes-fingers.jpg" "Scene from the Until Dawn horror survival game by Supermassive Games. A dark decaying psychiatric hospital corridor on Blackwood Mountain, crumbling plaster walls exposing brick, a dying fluorescent light tube casting sickly flicker, rusted overturned wheelchairs and broken glass on the floor, absolute darkness at the end of the corridor, something is in here, extreme horror, filmic grain, photorealistic, 4K"' \
  'generate "14-mines-escape.jpg" "Scene from the Until Dawn horror survival game by Supermassive Games. A dark underground mine tunnel beneath Blackwood Mountain, rough timber-supported rock walls, a survivor sprinting desperately toward a tiny light far in the distance, coal dust swirling in the beam of a headlamp, something massive in rapid pursuit from the darkness behind, motion blur, cinematic horror, filmic grain, photorealistic, 4K"'

echo "▶ Batch 2/4 fertig"

# Batch 4 (Szenen 15–18)
batch \
  'generate "15-emilys-bite.jpg" "Scene from the Until Dawn horror survival game by Supermassive Games. Tense confrontation in a dark Blackwood Mountain lodge room, a young woman holding up her arm to show a bite wound under a harsh flashlight, other survivors watching with horror and suspicion, the weight of an impossible decision hanging in the air, dramatic shadows, cinematic horror drama, filmic grain, photorealistic, 4K"' \
  'generate "16-sams-discovery.jpg" "Scene from the Until Dawn horror survival game by Supermassive Games. A young woman alone in a dark hidden room full of surveillance monitors showing footage of her friends being watched all night on Blackwood Mountain, her face lit in cold blue by the screens, the full scope of a sinister plan revealed, betrayal and horror, cinematic still, filmic grain, photorealistic, 4K"' \
  'generate "17-joshs-fate.jpg" "Scene from the Until Dawn horror survival game by Supermassive Games. A decrepit room in the abandoned Blackwood Mountain psychiatric hospital, peeling mint-green institutional paint, a rusted iron bed frame with leather restraints, a barred window letting in cold moonlight, decayed medical equipment on shelves, extreme horror atmosphere, filmic grain, photorealistic, 4K"' \
  'generate "18-mines-path.jpg" "Scene from the Until Dawn horror survival game by Supermassive Games. A narrow dark mine shaft tunnel deep beneath Blackwood Mountain, rough glistening rock walls, a single helmet lamp illuminating just a few feet of track ahead, ominous complete darkness beyond, deep claw marks gouged into the stone walls, something ancient living in these tunnels, filmic grain, photorealistic, 4K"'

echo "▶ Batch 3/4 fertig"

# Batch 5 (Szenen 19–22)
batch \
  'generate "19-the-basement.jpg" "Scene from the Until Dawn horror survival game by Supermassive Games. A dark basement staircase inside the Blackwood Mountain lodge descending into absolute impenetrable darkness, a single bare light bulb swinging gently on a cord above, old wooden creaking steps, stone walls damp with moisture, whatever is at the bottom cannot be seen, pure dread, cinematic horror, filmic grain, photorealistic, 4K"' \
  'generate "20-the-generator.jpg" "Scene from the Until Dawn horror survival game by Supermassive Games. A large industrial generator room in the depths of the Blackwood Mountain sanatorium, massive rusted machinery and pipes covering every wall, a single red emergency light bathing everything in blood-red shadow, steam escaping from corroded pipes, the only power source between survival and darkness, filmic grain, photorealistic, 4K"' \
  'generate "21-the-sacrifice.jpg" "Scene from the Until Dawn horror survival game by Supermassive Games. The climactic explosion of the Blackwood Mountain lodge, a massive fireball erupting against a pitch-black snowy sky, a lone silhouette standing defiantly before the inferno as burning debris flies in all directions, snow melting in a radius around the blast, the ultimate sacrifice, cinematic climax still, filmic grain, photorealistic, 4K"' \
  'generate "22-until-dawn.jpg" "Final scene from the Until Dawn horror survival game by Supermassive Games. Dawn breaking for the first time over the snow-capped Blackwood Mountain peaks after the longest night, orange and purple light splitting through dark storm clouds, a rescue helicopter silhouetted against the sunrise approaching the destroyed lodge site, smoke still rising from embers, survivors having endured until dawn, cinematic hope and relief mixed with aftermath, filmic grain, photorealistic, 4K"'

echo "▶ Batch 4/4 fertig"

echo ""
echo "✅ Alle 22 Szenenbilder generiert in $DEST/"
