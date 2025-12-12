import { type IStoryRepository } from '../repositories/IStoryRepository';
import { type StoryNode } from '../entities/story';

/**
 * Use Case responsible for loading the entire story structure from persistence.
 * Used primarily upon application startup.
 */
export class LoadStoryUseCase {
    private readonly repository: IStoryRepository;

    constructor(repository: IStoryRepository) {
        this.repository = repository;
    }

    async execute(): Promise<StoryNode[]> {
        return this.repository.getStory();
    }
}