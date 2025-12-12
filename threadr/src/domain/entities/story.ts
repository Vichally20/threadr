/**
 * Defines the static list of character stats used for adjustments.
 */
export const ALL_STATS = [
  'discipline', 'empathy', 'logic', 'impulse', 'loyalty', 'skepticism', 
  'strength', 'cunning', 'charm', 'power'
];

/**
 * Defines a single stat change resulting from a choice.
 */
export interface StatAdjustment {
  statName: typeof ALL_STATS[number];
  value: number;
}

/**
 * Defines a single branching path the player can take.
 */
export interface GameChoice {
  id: string;
  text: string;
  nextNodeId: string; // ID of the target node
  adjustments: StatAdjustment[];
  // Optional fields for skill checks could be added here (e.g., requiredStat, difficulty)
}

/**
 * Defines a single scene or block of narrative.
 */
export interface StoryNode {
  id: string; // Unique identifier (e.g., "chapter0_p1")
  title: string;
  content: string; // Markdown supported text
  choices: GameChoice[];
}
