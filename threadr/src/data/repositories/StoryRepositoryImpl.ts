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
  private readonly userId: string | null;


  /**
   * @param userId The UID of the authenticated user.
   * @param storyId The unique identifier for the story (defaults to 'default_story').
   */
  constructor(userId: string | null, storyId: string = STORY_ID) {
    this.userId = userId;
    this.storyId = storyId;
  }

  async getStory(): Promise<StoryNode[]> {
    if (!this.userId) return Promise.resolve([]);
    return FirebaseDataSource.fetchNodes(this.userId, this.storyId);
  }

  // NOTE: This implementation currently fetches all nodes and filters locally. 
  // For large stories, this should be optimized to use a Firestore query to fetch only the needed document.
  async getStoryNodeById(id: string): Promise<StoryNode | undefined> {
    if (!this.userId) return Promise.resolve(undefined);
    const nodes = await this.getStory();
    return nodes.find(node => node.id === id);
  }

  async saveStoryNode(node: StoryNode): Promise<void> {
    if (!this.userId) return Promise.resolve();
    return FirebaseDataSource.saveNode(this.userId, this.storyId, node);
  }

  async addStoryNode(node: StoryNode): Promise<void> {
    if (!this.userId) return Promise.resolve();
    return FirebaseDataSource.saveNode(this.userId, this.storyId, node);
  }

  async deleteStoryNode(id:string): Promise<void> {
    if (!this.userId) return Promise.resolve();
    return FirebaseDataSource.deleteNode(this.userId, this.storyId, id);
  }

  // Retain saveAllNodes for initialization/bulk operations
  async saveAllNodes(nodes: StoryNode[]): Promise<void> {
    if (!this.userId) return Promise.resolve();
    return FirebaseDataSource.saveBulkNodes(this.userId, this.storyId, nodes);
  }
  async loadStatConfig(): Promise<CustomStat[]> {
    if (!this.userId) return Promise.resolve([]);
    return FirebaseDataSource.fetchStatConfig(this.userId, this.storyId);
  }

  async saveStatConfig(stats: CustomStat[]): Promise<void> {
    if (!this.userId) return Promise.resolve();
    return FirebaseDataSource.saveStatConfig(this.userId, this.storyId, stats);
  }
}