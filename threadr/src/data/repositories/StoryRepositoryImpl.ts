import { type CustomStat, type StoryNode } from '../../domain/entities/story';
import { FirebaseDataSource } from '../datasources/FirebaseDataSource';
import type { IStoryRepository } from '../../domain/repositories/IStoryRepository';

const STORY_ID: string = 'threadr_project_main';

/**
 * Concrete implementation of the BaseStoryRepository using Firebase.
 * This class translates Domain requests into Data Source calls (and handles errors).
 */
export class StoryRepositoryImpl implements IStoryRepository {

  // NOTE: This storyId is defined as a constant for internal use.
  private readonly storyId: string = STORY_ID;

  async getStory(): Promise<StoryNode[]> {
    return FirebaseDataSource.fetchNodes(this.storyId);
  }

  // NOTE: This implementation currently fetches all nodes and filters locally. 
  // For large stories, this should be optimized to use a Firestore query to fetch only the needed document.
  async getStoryNodeById(id: string): Promise<StoryNode | undefined> {
    const nodes = await this.getStory();
    return nodes.find(node => node.id === id);
  }

  async saveStoryNode(node: StoryNode): Promise<void> {
    return FirebaseDataSource.saveNode(this.storyId, node);
  }

  async addStoryNode(node: StoryNode): Promise<void> {
    return FirebaseDataSource.saveNode(this.storyId, node);
  }

  async deleteStoryNode(id: string): Promise<void> {
    return FirebaseDataSource.deleteNode(this.storyId, id);
  }

  // Retain saveAllNodes for initialization/bulk operations
  async saveAllNodes(nodes: StoryNode[]): Promise<void> {
    return FirebaseDataSource.saveBulkNodes(this.storyId, nodes);
  }
  async loadStatConfig(): Promise<CustomStat[]> {
    return FirebaseDataSource.fetchStatConfig(this.storyId);
  }

  async saveStatConfig(stats: CustomStat[]): Promise<void> {
    return FirebaseDataSource.saveStatConfig(this.storyId, stats);
  }
}