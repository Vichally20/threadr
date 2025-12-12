import { type IStoryRepository } from '../repositories/IStoryRepository';

/**
 * Use Case responsible for deleting a single StoryNode by its ID.
 */
export class DeleteNodeUseCase {
    private readonly repository: IStoryRepository;

    constructor(repository: IStoryRepository) {
        this.repository = repository;
    }

    async execute(nodeId: string): Promise<void> {
        return this.repository.deleteStoryNode(nodeId);
    }
}