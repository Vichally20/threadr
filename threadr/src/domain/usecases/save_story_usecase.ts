import { type IStoryRepository } from '../repositories/IStoryRepository';
import { type StoryNode } from '../entities/story';

/**
 * Use Case responsible for saving or updating a single StoryNode.
 */
export class SaveNodeUseCase {
    private readonly repository: IStoryRepository;

    constructor(repository: IStoryRepository) {
        this.repository = repository;
    }

    async execute(node: StoryNode): Promise<void> {
        return this.repository.saveStoryNode(node);
    }
}