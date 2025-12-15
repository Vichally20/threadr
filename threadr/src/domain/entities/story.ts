

export interface CustomStat {
  name: string; // The stat name (e.g., 'charm', 'charisma', 'courage')
  initialValue: number; // The default starting value
  type: 'Personality' | 'Secondary'; // Category for UI grouping
}
/**
 * Defines the static list of character stats used for adjustments.
 */
export const ALL_STATS: CustomStat[] = [
  //personality stats
  {name: 'discipline', initialValue: 5, type: 'Personality'},
  {name: 'empathy', initialValue: 5, type: 'Personality'},
  {name: 'logic', initialValue: 5, type: 'Personality'},
  {name: 'impulse', initialValue: 5, type: 'Personality'},
  {name: 'loyalty', initialValue: 5, type: 'Personality'},
  {name: 'skepticism', initialValue: 5, type: 'Personality'},

  //secondary stats
  {name: 'strength', initialValue: 5, type: 'Secondary'},
  {name: 'dexterity', initialValue: 5, type: 'Secondary'},
  {name: 'charm', initialValue: 5, type: 'Secondary'},
  {name: 'power', initialValue: 5, type: 'Secondary'}
];

/**
 * Defines a single stat change resulting from a choice.
 */
export interface StatAdjustment {
  statName: string;
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
