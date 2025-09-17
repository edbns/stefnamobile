// src/presets/unrealReflection.ts

/*

🧠 Unreal Reflection™ – Updated Presets (v2.0)

Unreal Reflection™
"Not who you are. Who you could've been."
A photoreal, alternate-identity remix powered by advanced AI models.
Think: a version of you from a mirror-dimension, dream-state, or forgotten past life.
Identity-adjacent, not fantasy. Stylized, not cosplay.
Built for scroll-stopping visuals that feel mysterious, ethereal, and beautiful.

Updated presets with cinematic fashion-forward transformations:
- The Syndicate: Feared inner circle of power with tailored suits and luxury settings
- Yakuza Heir: Raw cinematic moments with irezumi tattoos and hidden world atmosphere
- The Gothic Pact: Gothic royalty in timeless black high fashion with candlelit settings
- Oracle of Seoul: Modern shamanic presence with hanbok-inspired high fashion
- Medusa's Mirror: Modern Greek muse styled as timeless glam with flowing fabrics
- Chromatic Bloom: High-fashion editorial icons with dark couture and symbolic animals

All presets maintain identity preservation while creating cinematic, fashion-forward transformations.

*/

export type UnrealReflectionPreset = {
  id: string
  label: string
  prompt: string
  negative_prompt: string
  strength: number
  model: string
  mode: string
  input: string
  requiresSource: boolean
  source: string
  guidance_scale?: number
  num_inference_steps?: number
  features?: string[]
  // BFL-specific parameters
  prompt_upsampling?: boolean
  safety_tolerance?: number
  output_format?: string
  raw?: boolean
  image_prompt_strength?: number
  aspect_ratio?: string
}

export const UNREAL_REFLECTION_PRESETS: UnrealReflectionPreset[] = [
  // 🕴️ The Syndicate
  {
    id: 'unreal_reflection_syndicate',
    label: 'The Syndicate',
    prompt: 'Transform this person, couple or group of people in the photo into a member or members of The Syndicate — a feared and untouchable inner circle of power. If male, they wear tailored black suits, long coats, or sharp collared shirts — sometimes with gloves or dark sunglasses, always perfectly composed. If female, they appear in couture-style dresses, satin gowns, or sleek power suits — elegant, cold, and intimidating. Couples may stand together like a mafia heir and spouse, while groups may form a silent circle or hierarchy, one larger bodyguard figure half in shadow. Their posture is natural and unstaged — leaning against a luxury car, seated at a dim table with half-finished drinks, adjusting a cufflink, standing half-turned in a doorway, or caught mid-stride in a quiet hallway. The lighting changes with the setting: golden light spilling through blinds in a smoky private room, the cold blue of a deserted garage lit by a single bulb, or warm streetlights reflecting off wet pavement at night. The environment suggests wealth and secrecy — places like a hidden lounge with leather chairs and cigars, an abandoned luxury hotel lobby, a rain-soaked parking lot beside a black Mercedes, or a curtained backroom of a club. The mood is tense and cinematic, but completely real — as if this was a leaked photo from the underworld, capturing their authority without posing. Always photorealistic, fashion-forward, and intimidating.',
    negative_prompt: 'anime, cartoon, fantasy armor, horror, zombie, distorted face, makeup, casual clothing',
    strength: 0.55,
    model: 'fal-ai/nano-banana/edit',
    mode: 'i2i',
    input: 'image',
    requiresSource: true,
    source: 'unreal_reflection',
    guidance_scale: 7.0,
    num_inference_steps: 30,
    features: ['syndicate', 'power', 'luxury', 'cinematic', 'identity_preserved'],
    prompt_upsampling: true,
    safety_tolerance: 3,
    output_format: 'jpeg',
    raw: true,
    image_prompt_strength: 0.55,
    aspect_ratio: '1:1'
  },
  // 🐉 Yakuza Heir
  {
    id: 'unreal_reflection_yakuza_heir',
    label: 'Yakuza Heir',
    prompt: 'Transform this person, couple or group of people in the photo into a Yakuza Heir or heirs — captured in a raw but cinematic moment of power and style. If male, they appear shirtless or in open silk robes or vests, revealing intricate irezumi tattoos across the chest, shoulders, or back. If female, they wear elegant but revealing dresses, kimonos, or robes that expose tattooed skin along the shoulders, arms, or legs — styled with confidence, never cliché. Couples may stand close together with matching ink visible, while groups may gather naturally, one larger bodyguard-like figure in the background. Their posture is unposed and natural — leaning against a wall, adjusting clothing, walking mid-frame, sitting with one arm stretched, or glancing away. The lighting varies with the mood: neon glow bouncing from a quiet Osaka side street, soft golden dusk filtering through a paper window, or cold fluorescent light in a garage after rain. The environment reflects their hidden world — places like a tatami room with ashtrays, a private bathhouse entrance, a dim bar with cigarettes and glasses, or a deserted alley with rain on the pavement. The feeling is real, cinematic, and intimidating — like a photo captured by accident, showing the intimacy and danger of their world. Always grounded, fashion-forward, and photorealistic.',
    negative_prompt: 'anime, cartoon, fantasy armor, horror, zombie, distorted face, makeup, casual clothing',
    strength: 0.55,
    model: 'fal-ai/nano-banana/edit',
    mode: 'i2i',
    input: 'image',
    requiresSource: true,
    source: 'unreal_reflection',
    guidance_scale: 7.0,
    num_inference_steps: 30,
    features: ['yakuza', 'irezumi', 'raw', 'cinematic', 'identity_preserved'],
    prompt_upsampling: true,
    safety_tolerance: 3,
    output_format: 'jpeg',
    raw: true,
    image_prompt_strength: 0.55,
    aspect_ratio: '1:1'
  },
  // 🖤 The Gothic Pact
  {
    id: 'unreal_reflection_gothic_pact',
    label: 'The Gothic Pact',
    prompt: 'Transform this person, couple or group of people in the photo into a member or members of The Gothic Pact — gothic royalty in timeless black high fashion. If male, they wear sharp dark suits, long coats, or high collars with velvet or satin detail. If female, they wear lace gowns, corseted dresses, veils, or dramatic jewelry with pearls and silver. Tattoos or jewelry may glint faintly, but nothing exaggerated. Couples may appear bound together in secrecy, while groups may gather like a silent court. Their posture is natural, not staged — seated with calm intensity, leaning into shadow, walking mid-frame, or standing side by side. Their expressions remain regal and unreadable. The scene changes with the moment: a candlelit cathedral ruin with golden light spilling across broken stone, a moonlit balcony with mist curling through the night air, a decaying mansion hall lined with faded portraits, a shadowy room filled with candles and heavy velvet curtains, a Gothic garden at twilight with bare trees and wrought iron gates. The lighting adapts to the place: flickering candlelight, pale silver moonlight, stained glass reflections, or soft dawn shadows. The photo should always feel real, cinematic, and fashion-forward — like a leaked portrait of a Gothic dynasty, not a posed photoshoot.',
    negative_prompt: 'anime, cartoon, fantasy armor, horror, zombie, distorted face, makeup, casual clothing',
    strength: 0.55,
    model: 'fal-ai/nano-banana/edit',
    mode: 'i2i',
    input: 'image',
    requiresSource: true,
    source: 'unreal_reflection',
    guidance_scale: 7.0,
    num_inference_steps: 30,
    features: ['gothic', 'royalty', 'timeless', 'cinematic', 'identity_preserved'],
    prompt_upsampling: true,
    safety_tolerance: 3,
    output_format: 'jpeg',
    raw: true,
    image_prompt_strength: 0.55,
    aspect_ratio: '1:1'
  },
  // 🔮 Oracle of Seoul
  {
    id: 'unreal_reflection_oracle_seoul',
    label: 'Oracle of Seoul',
    prompt: 'Transform this person, couple or group of people in the photo into a member or members of the Oracle of Seoul — a modern shamanic presence expressed through fashion. They wear hanbok-inspired clothing reimagined with high-fashion sensibility: layered jackets, flowing coats, wide sleeves, and wrapped fabrics in rich colors such as deep blue, burgundy, emerald, ivory, or gold. The styling is elegant and regal, but always modern — like a runway look rooted in tradition. Accessories may include rings, earrings, or belts, but never masks or veils. Couples may stand together like mirrored guardians, while groups may gather with subtle hierarchy, one figure slightly more commanding. Their posture is natural and unposed — standing with fabrics caught in the wind, leaning against a stone wall, seated in quiet reflection, or walking mid-frame. Their expressions are calm, proud, and unreadable — projecting quiet strength rather than drama. The scene changes with the moment: stone steps of a Korean temple at dusk, lanterns softly glowing, a wooden hanok courtyard with shadows from paper doors, a narrow Seoul backstreet at night with rain on the ground, a hilltop view of the city skyline under pale dawn light, a quiet garden with pine trees and stone lanterns. The lighting adapts naturally: warm lantern glow, soft moonlight, pale morning mist, or golden dusk shadows. The photo feels authentic and cinematic — a modern portrait where tradition and fashion meet power.',
    negative_prompt: 'anime, cartoon, fantasy armor, horror, zombie, distorted face, makeup, casual clothing',
    strength: 0.55,
    model: 'fal-ai/nano-banana/edit',
    mode: 'i2i',
    input: 'image',
    requiresSource: true,
    source: 'unreal_reflection',
    guidance_scale: 7.0,
    num_inference_steps: 30,
    features: ['oracle', 'seoul', 'hanbok', 'modern', 'identity_preserved'],
    prompt_upsampling: true,
    safety_tolerance: 3,
    output_format: 'jpeg',
    raw: true,
    image_prompt_strength: 0.55,
    aspect_ratio: '1:1'
  },
  // 🏛️ Medusa's Mirror
  {
    id: 'unreal_reflection_medusa_mirror',
    label: 'Medusa\'s Mirror',
    prompt: 'Transform this person, couple or group of people in the photo into a member or members of Medusa\'s Mirror — a modern Greek muse styled as timeless glam. They wear flowing fabrics in ivory, white, bronze, or gold, draped like modern interpretations of ancient togas or gowns. Accessories may include gold cuffs, bronze jewelry, braided belts, or sculptural rings. Their style is regal, minimal, and elegant — never costume-like. Couples may appear as mirror-like figures in harmony, while groups may resemble a timeless chorus, each distinct but united in mood. Their posture is unposed and natural — seated on stone steps with fabric draped across the body, walking mid-frame with wind catching the cloth, standing half-turned as if sculpted from marble, or gazing sideways with calm intensity. Their expressions are serene and commanding, filled with quiet authority. The scene changes with the moment: marble ruins under golden sunset light, a rocky cliffside by the Aegean Sea with wind in the air, an olive grove with long shadows and ancient stone walls, a moonlit courtyard with columns casting sharp lines, a weathered marble temple with sunlight reflecting off stone. The lighting adapts naturally: strong golden hour warmth, silver moonlight, soft Mediterranean dawn, or harsh sunlight against pale stone. The photo feels like an editorial portrait where fashion meets myth — timeless, cinematic, and photorealistic.',
    negative_prompt: 'anime, cartoon, fantasy armor, horror, zombie, distorted face, makeup, casual clothing',
    strength: 0.55,
    model: 'fal-ai/nano-banana/edit',
    mode: 'i2i',
    input: 'image',
    requiresSource: true,
    source: 'unreal_reflection',
    guidance_scale: 7.0,
    num_inference_steps: 30,
    features: ['medusa', 'greek', 'timeless', 'glam', 'identity_preserved'],
    prompt_upsampling: true,
    safety_tolerance: 3,
    output_format: 'jpeg',
    raw: true,
    image_prompt_strength: 0.55,
    aspect_ratio: '1:1'
  },
  // 🌈 Chromatic Bloom
  {
    id: 'unreal_reflection_chromatic_bloom',
    label: 'Chromatic Bloom',
    prompt: 'Transform this person, couple or group of people in the photo into high-fashion editorial icons styled for a dark magazine cover look (without text). If male, they wear minimal dark couture clothing — tailored black or midnight blue suits, open shirts, or structured coats with strong silhouettes. No heavy makeup, only natural sharpness and intensity. Each male figure is accompanied by only one powerful animal symbol: a black doberman seated or standing at their side, or a coiled snake wrapped naturally around the arm, shoulder, or waist, or a raven perched close, on stone or shoulder. Only one animal should appear, never more than one per subject. If female, they wear minimal but striking couture gowns or dresses — plunging necklines, bare shoulders, or sleek fitted silhouettes in dark tones such as black, storm grey, wine red, or deep emerald. Their makeup is minimal yet captivating: luminous skin, bold eyeliner, or strong lips. Each female figure may also be accompanied by only one powerful animal symbol: a black dog at their side, a snake coiled around the body, or a raven perched nearby. Never combine more than one animal per subject. For couples, the balance is clear: each person styled distinctly with their own presence and possibly one animal each. For groups, they form a dark editorial tableau — each unique, animals appearing sparingly, never overlapping. Their posture rotates naturally — men standing tall with a snake coiled along the arm, seated with a dog by their side, or turning in shadow with a raven perched near. Women leaning against stone with fabric flowing, seated with a snake draped across the shoulders, or walking mid-frame with a doberman at her side. Expressions remain calm, regal, and untouchable. The scenery changes with the mood: a cinematic studio set with dramatic spotlight and deep shadow, an abandoned warehouse with broken windows and dust, a stone courtyard at dusk with faint mist, a rooftop at night with the skyline behind, a candlelit interior with velvet curtains and cracked marble floors. Lighting is professional and dramatic — sharp contrasts, golden dusk, pale moonlight, or a single spotlight cutting through shadow. The result must feel photoreal, stylish, and unforgettable — a world where dark couture and symbolic animals define power and beauty.',
    negative_prompt: 'anime, cartoon, fantasy armor, horror, zombie, distorted face, makeup, casual clothing',
    strength: 0.55,
    model: 'fal-ai/nano-banana/edit',
    mode: 'i2i',
    input: 'image',
    requiresSource: true,
    source: 'unreal_reflection',
    guidance_scale: 7.0,
    num_inference_steps: 30,
    features: ['chromatic_bloom', 'editorial', 'animals', 'couture', 'identity_preserved'],
    prompt_upsampling: true,
    safety_tolerance: 3,
    output_format: 'jpeg',
    raw: true,
    image_prompt_strength: 0.55,
    aspect_ratio: '1:1'
  }
];

export function getUnrealReflectionPreset(presetId: string): UnrealReflectionPreset | undefined {
  return UNREAL_REFLECTION_PRESETS.find(p => p.id === presetId)
}

export function isUnrealReflectionPreset(presetId: string): boolean {
  return UNREAL_REFLECTION_PRESETS.some(p => p.id === presetId)
}
