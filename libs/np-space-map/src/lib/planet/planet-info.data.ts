/**
 * Placeholder content pools for procedurally-flavoured planet readouts. This is deliberately just
 * test data, kept out of the generator so it can be swapped for real, sector-aware content later
 * (the GDD's distortion gradient, §5) without touching the generation code. Tone leans into the
 * warm-but-uncanny, Doctor-Who-ish house style.
 */
export const PLANET_INFO_DATA = {
    namePrefixes: ['Xan', 'Vor', 'Cae', 'Mor', 'Tal', 'Zeph', 'Quel', 'Hel', 'Ori', 'Pyra', 'Nimb', 'Dross'],
    nameSuffixes: ['the', 'dris', 'con', 'une', 'ara', 'ix', 'os', 'wyn', 'eth', 'alia', 'ous', 'is'],
    numerals: ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'IX', 'XII', 'Minor', 'Prime'],
    classifications: [
        'Terrestrial',
        'Gas Giant',
        'Ice World',
        'Lava World',
        'Ocean World',
        'Barren Rock',
        'Ringed Giant',
        'Dwarf Planet',
    ],
    atmospheres: [
        'Nitrogen–Oxygen',
        'Thin CO₂',
        'Methane haze',
        'Sulphuric clouds',
        'None (vacuum)',
        'Dense hydrogen',
        'Toxic ammonia',
        'Breathable, faintly sweet',
    ],
    temperatures: [
        'Scorching (430°C)',
        'Hot (80°C)',
        'Temperate (14°C)',
        'Cold (−40°C)',
        'Frozen (−180°C)',
        'Wildly swinging',
    ],
    gravities: ['0.2 g', '0.6 g', '0.9 g', '1.0 g', '1.4 g', '2.3 g'],
    populations: [
        'Uninhabited',
        'Abandoned outpost',
        'Mining colony (≈4,000)',
        'Trade hub (≈90,000)',
        'Hermit settlement',
        'Unknown signals',
    ],
    hazards: [
        'None noted',
        'Ion storms',
        'Seismic instability',
        'Hostile wildlife',
        'Reality flux',
        'Roaming wind-up patrols',
        'Radiation belts',
    ],
    resources: [
        'Marbles (rich seam)',
        'Water ice',
        'Rare alloys',
        'Nothing of note',
        'Salvage wrecks',
        'Distortion residue',
        'Exotic flora',
    ],
    descriptions: [
        'Locals insist the sunsets here taste of copper.',
        'A garden gnome floats in orbit where no gnome should be.',
        'Charted by someone who clearly never visited.',
        'The whole place hums in a key nobody can name.',
        'Last survey returned three days before it set out.',
        'Smells, faintly, of a grandmother’s kitchen.',
        'The shadows fall the wrong way at noon.',
        'Said to be lovely, if you can ignore the ticking.',
    ],
    // Rim suns are sector exits (bail points): a fast way out, but you leave empty-handed.
    outerClassifications: [
        'Sector Exit',
        'Boundary Gate',
        'Slipgate',
        'Jump Beacon',
        'Frontier Marker',
        'Escape Vector',
    ],
    outerResources: ['None — exit only', 'Empty; just a way out', 'No cargo, only escape', 'Nothing to take here'],
    outerDescriptions: [
        'A way out of the sector. Jump here to bail.',
        'The edge of the map — slip out while it still stands.',
        'An open gate. Fast escape, empty hands.',
        'Cross here and the sector is behind you — and so is its loot.',
        'Bail point. Leave now, leave poor.',
        'Beyond this, the next sector. Nothing worth grabbing first.',
    ],
} as const;
