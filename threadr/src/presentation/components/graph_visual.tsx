import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';
// NOTE: These imports rely on successful NPM installation of reactflow and dagre.
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    MarkerType,
    Position,
    type Node,
    type Edge,
    ReactFlowProvider,
    useReactFlow,
    MiniMap,
} from 'reactflow';
// import 'reactflow/dist/style.css'; // You must import the CSS in your main.tsx
import dagre from '@dagrejs/dagre';
import { useStory } from '../context/StoryContext';
import { type StoryNode } from '../../domain/entities/story';
//import { Zap, X, LayoutGrid } from 'lucide-react';

// --- Dagre Layout Setup ---

// Initialize Dagre graph
const g = new dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

// Configuration for Dagre layout (Left to Right flow)
const nodeWidth = 170;
const nodeHeight = 60;
const dagreGraph = g.setGraph({ rankdir: 'LR', ranksep: 100, nodesep: 50 });

/**
 * Calculates the optimal layout for nodes and edges using Dagre.
 */
const getLayoutedElements = (nodes: Node[], edges: Edge[]): { nodes: Node[], edges: Edge[] } => {
    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    const layoutedNodes: Node[] = nodes.map((node) => {
        const nodeWithLayout = dagreGraph.node(node.id);

        // Position nodes based on Dagre output
        node.position = {
            x: nodeWithLayout.x - nodeWidth / 2,
            y: nodeWithLayout.y - nodeHeight / 2,
        };

        // Set handles to the correct position for 'LR' layout
        node.targetPosition = Position.Left;
        node.sourcePosition = Position.Right;

        return node;
    });

    return { nodes: layoutedNodes, edges }; // Returns 'nodes' and 'edges'
};

// --- Custom Node Definitions ---

interface StoryEditorNodeProps {
    data: {
        title: string;
        id: string;
        isDeadEnd: boolean;
        isOrphan: boolean;
    };
}

const StoryEditorNode: React.FC<StoryEditorNodeProps> = ({ data }) => {
    const { selectNode } = useStory();
    const classes = `
    p-2 rounded-lg text-white font-semibold shadow-lg 
    border-2 transition duration-200 cursor-pointer 
    hover:scale-[1.05] hover:shadow-xl
    ${data.isDeadEnd ? 'bg-red-900 border-red-500' :
            data.isOrphan ? 'bg-yellow-900 border-yellow-500' :
                'bg-indigo-800 border-indigo-600'}
  `;

    return (
        <div
            className={classes}
            style={{ width: nodeWidth, height: nodeHeight }}
            onClick={() => selectNode(data.id)}
        >
            <div className="text-sm font-mono text-gray-300">{data.id}</div>
            <div className="text-md truncate" title={data.title}>{data.title}</div>
        </div>
    );
};

const nodeTypes = {
    storyEditorNode: StoryEditorNode,
};


// --- Main Component ---

interface GraphVisualizerProps {
    storyNodes: StoryNode[];
}

export const GraphVisualizer: React.FC<GraphVisualizerProps> = ({ storyNodes }) => {
    const { graphIssues, selectNode } = useStory();
    const { fitView } = useReactFlow();

    // 1. Transform Story JSON to React Flow format
    const { layoutedNodes, layoutedEdges } = useMemo(() => {
        if (!storyNodes || storyNodes.length === 0) {
            return { layoutedNodes: [], layoutedEdges: [] };
        }

        const nodes: Node[] = storyNodes.map(node => {
            const isDeadEnd = graphIssues.some(i => i.id === node.id && i.type === 'Dead End');
            const isOrphan = graphIssues.some(i => i.id === node.id && i.type === 'Orphan');

            return {
                id: node.id,
                type: 'storyEditorNode',
                data: { id: node.id, title: node.title, isDeadEnd, isOrphan },
                position: { x: 0, y: 0 },
            } as Node;
        });

        const edges: Edge[] = storyNodes.flatMap(node =>
            node.choices.map((choice, index) => ({
                id: `e-${node.id}-${choice.nextNodeId}-${index}`,
                source: node.id,
                target: choice.nextNodeId,
                label: choice.text.substring(0, 30) + (choice.text.length > 30 ? '...' : ''),
                type: 'smoothstep',
                markerEnd: {
                    type: MarkerType.ArrowClosed,
                    color: '#818cf8',
                },
                style: { stroke: '#818cf8', strokeWidth: 2 },
            }))
        );

        // Destructure the result of getLayoutedElements correctly here
        const { nodes: lNodes, edges: lEdges } = getLayoutedElements(nodes, edges);

        // Return with consistent names
        return { layoutedNodes: lNodes, layoutedEdges: lEdges };

    }, [storyNodes, graphIssues]); // Depend on storyNodes and issues

    // 2. React Flow State Management
    const [nodes, setNodes, onNodesChange] = useNodesState(layoutedNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(layoutedEdges);

    // 3. Update React Flow state when layouted elements change
    useEffect(() => {
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
    }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

    // 4. Fit view to graph on mount and update
    useEffect(() => {
        if (layoutedNodes.length > 0) {
            setTimeout(() => fitView({ padding: 0.2 }), 50);
        }
    }, [layoutedNodes, fitView]);


    return (
        <div style={{ width: '100%', height: '100vh', background: '#030712' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
            >
                <Controls style={{ top: 15, left: 15 }} />
                <MiniMap nodeColor="#818cf8" position="bottom-right" />
                <Background color="#1f2937" gap={16} />
            </ReactFlow>
        </div>
    );
};


// Wraps the component with ReactFlowProvider
export const GraphVisualizationWrapper: React.FC<GraphVisualizerProps> = (props) => (
    <ReactFlowProvider>
        <GraphVisualizer {...props} />
    </ReactFlowProvider>
);