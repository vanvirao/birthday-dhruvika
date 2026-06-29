// Constellation definitions.
// Star positions are in normalized sky-space: x in [0,1], y in [0,0.65]
// (matching SkyCanvas's star region). Edges are index pairs for line drawing.
// magnitudes: 1 = brightest, 3 = faintest (used to set star radius).

export interface ConstellationStar {
  x: number; // normalized 0-1 (horizontal)
  y: number; // normalized 0-0.65 (vertical within star region)
  mag: number; // 1=bright, 2=medium, 3=faint
}

export interface Constellation {
  id: string;
  name: string;
  stars: ConstellationStar[];
  edges: [number, number][]; // pairs of star indices for lines
  // Approximate bounding center for hover detection
  cx: number;
  cy: number;
}

export const CONSTELLATIONS: Constellation[] = [
  {
    id: 'orion',
    name: 'Orion',
    cx: 0.18, cy: 0.38,
    stars: [
      { x: 0.14, y: 0.22, mag: 1 }, // Betelgeuse (shoulder)
      { x: 0.22, y: 0.22, mag: 1 }, // Bellatrix (shoulder)
      { x: 0.15, y: 0.32, mag: 2 }, // Mintaka (belt)
      { x: 0.18, y: 0.34, mag: 2 }, // Alnilam (belt)
      { x: 0.21, y: 0.36, mag: 2 }, // Alnitak (belt)
      { x: 0.14, y: 0.44, mag: 1 }, // Rigel (foot)
      { x: 0.22, y: 0.42, mag: 2 }, // Saiph (foot)
      { x: 0.16, y: 0.17, mag: 2 }, // Head left
      { x: 0.20, y: 0.16, mag: 3 }, // Head middle
    ],
    edges: [[0,1],[0,2],[1,3],[2,3],[3,4],[4,6],[2,5],[5,6],[0,7],[1,8],[7,8]],
  },
  {
    id: 'cassiopeia',
    name: 'Cassiopeia',
    cx: 0.55, cy: 0.12,
    stars: [
      { x: 0.46, y: 0.08, mag: 2 }, // Caph
      { x: 0.51, y: 0.10, mag: 1 }, // Shedar
      { x: 0.55, y: 0.08, mag: 2 }, // Gamma Cas
      { x: 0.60, y: 0.11, mag: 2 }, // Ruchbah
      { x: 0.64, y: 0.09, mag: 2 }, // Segin
    ],
    edges: [[0,1],[1,2],[2,3],[3,4]],
  },
  {
    id: 'ursa_major',
    name: 'Ursa Major',
    cx: 0.72, cy: 0.22,
    stars: [
      { x: 0.62, y: 0.28, mag: 2 }, // Dubhe
      { x: 0.66, y: 0.30, mag: 2 }, // Merak
      { x: 0.70, y: 0.27, mag: 2 }, // Phecda
      { x: 0.73, y: 0.24, mag: 2 }, // Megrez
      { x: 0.78, y: 0.20, mag: 1 }, // Alioth
      { x: 0.83, y: 0.17, mag: 1 }, // Mizar
      { x: 0.88, y: 0.14, mag: 1 }, // Alkaid
      { x: 0.84, y: 0.22, mag: 3 }, // Alcor (faint companion)
    ],
    edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[3,0],[5,7]],
  },
  {
    id: 'cygnus',
    name: 'Cygnus',
    cx: 0.38, cy: 0.18,
    stars: [
      { x: 0.38, y: 0.12, mag: 1 }, // Deneb (tail)
      { x: 0.36, y: 0.17, mag: 2 }, // Sadr (body)
      { x: 0.34, y: 0.22, mag: 2 }, // Albireo (head)
      { x: 0.31, y: 0.16, mag: 2 }, // left wing
      { x: 0.41, y: 0.18, mag: 2 }, // right wing
    ],
    edges: [[0,1],[1,2],[1,3],[1,4]],
  },
  {
    id: 'lyra',
    name: 'Lyra',
    cx: 0.44, cy: 0.10,
    stars: [
      { x: 0.44, y: 0.07, mag: 1 }, // Vega (brightest)
      { x: 0.42, y: 0.12, mag: 2 }, // Sulafat
      { x: 0.46, y: 0.12, mag: 2 }, // Sheliak
      { x: 0.43, y: 0.15, mag: 3 }, // bottom left
      { x: 0.47, y: 0.15, mag: 3 }, // bottom right
    ],
    edges: [[0,1],[0,2],[1,2],[1,3],[2,4],[3,4]],
  },
  {
    id: 'scorpius',
    name: 'Scorpius',
    cx: 0.28, cy: 0.50,
    stars: [
      { x: 0.28, y: 0.36, mag: 1 }, // Antares (heart)
      { x: 0.26, y: 0.33, mag: 2 }, // Graffias
      { x: 0.30, y: 0.33, mag: 2 }, // Dschubba
      { x: 0.26, y: 0.40, mag: 2 }, // Sigma Sco
      { x: 0.30, y: 0.40, mag: 2 }, // Tau Sco
      { x: 0.28, y: 0.45, mag: 2 }, // Lesath
      { x: 0.26, y: 0.50, mag: 2 }, // tail curve 1
      { x: 0.24, y: 0.54, mag: 2 }, // tail curve 2
      { x: 0.27, y: 0.57, mag: 2 }, // stinger
      { x: 0.30, y: 0.55, mag: 3 }, // stinger 2
    ],
    edges: [[1,0],[0,2],[0,3],[0,4],[3,5],[4,5],[5,6],[6,7],[7,8],[8,9]],
  },
];
