import { type StoryNode } from '../entities/story';

/**
 * The contract for all story data persistence operations.
 * This ensures the Use Cases remain decoupled from Firebase implementation details,
 * and handles the internal story ID logic within the implementation layer.
 */
export interface IStoryRepository {
  /**
   * Loads all nodes for the current story.
   */
  getStory(): Promise<StoryNode[]>;

  /**
   * Loads a single node by its ID.
   */
  getStoryNodeById(nodeId: string): Promise<StoryNode | undefined>;

  /**
   * Saves/Updates a single node.
   */
  saveStoryNode(node: StoryNode): Promise<void>;

  /**
   * Deletes a node by its ID.
   */
  deleteStoryNode(nodeId: string): Promise<void>;

  /**
   * Saves the entire list of nodes atomically (useful for bulk operations).
   */
  saveAllNodes(nodes: StoryNode[]): Promise<void>;
}