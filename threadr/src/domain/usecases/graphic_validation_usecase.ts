import { type StoryNode } from '../entities/story';

export interface GraphIssue {
    id: string; // ID of the node with the issue
    type: 'Dead End' | 'Orphan' | 'Invalid Link';
    message: string;
}

/**
 * Use Case responsible for analyzing the structural integrity of the story graph.
 * Identifies orphans, dead ends, and invalid links.
 */
export class AnalyzeGraphUseCase {

    execute(nodes: StoryNode[]): GraphIssue[] {
        if (nodes.length === 0) return [];

        const issues: GraphIssue[] = [];
        const targetNodes = new Set<string>();
        const allNodeIds = new Set(nodes.map(n => n.id));
        const startNodeId = nodes[0].id; // Assumed start node

        // 1. Identify all targets (Nodes with inbound edges)
        nodes.forEach(node => {
            if (node.choices) {
                node.choices.forEach(choice => {
                    if (choice.nextNodeId) {
                        targetNodes.add(choice.nextNodeId);
                    }
                });
            }
        });

        // 2. Check for Dead Ends, Orphans, and Invalid Links
        nodes.forEach(node => {
            // Dead Ends (Node has no choices)
            if (!node.choices || node.choices.length === 0) {
                issues.push({ id: node.id, type: 'Dead End', message: `Node has no outbound choices.` });
            }

            // Orphans (Node is unreachable from the start)
            if (node.id !== startNodeId && !targetNodes.has(node.id)) {
                issues.push({ id: node.id, type: 'Orphan', message: `Node is unreachable from the starting point.` });
            }

            // Invalid Links
            node.choices.forEach(choice => {
                if (choice.nextNodeId && !allNodeIds.has(choice.nextNodeId)) {
                    issues.push({
                        id: node.id,
                        type: 'Invalid Link',
                        message: `Links to missing node: '${choice.nextNodeId}'.`
                    });
                }
            });
        });

        return issues;
    }
}