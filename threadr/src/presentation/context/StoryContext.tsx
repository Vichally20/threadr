import React, { createContext, useReducer, useContext, useMemo, useEffect } from 'react';
import { type StoryNode } from '../../domain/entities/story';
import { StoryRepositoryImpl } from '../../data/repositories/StoryRepositoryImpl';
import { generateId } from '../../utils/id_generator';
// --- Import Use Cases ---
import { LoadStoryUseCase } from '../../domain/usecases/load_story_usecase';
import { SaveNodeUseCase } from '../../domain/usecases/save_story_usecase';
import { DeleteNodeUseCase } from '../../domain/usecases/delete_story_usecase';
import { AnalyzeGraphUseCase, type GraphIssue } from '../../domain/usecases/graphic_validation_usecase';
import { useCallback } from 'react';


// --- INITIAL DATA STRUCTURE ---
const newEmptyNode = (id: string): StoryNode => ({
    id: id,
    title: "New Scene Title",
    content: "Write the descriptive Markdown text for the scene here.",
    choices: [],
});

const initialNodes: StoryNode[] = [
    newEmptyNode("start_node"),
];

// --- STATE AND ACTIONS ---

export interface StoryState {
    nodes: StoryNode[];
    selectedNodeId: string | null;
    isLoading: boolean;
    error: string | null;
    graphIssues: GraphIssue[];
}

const initialState: StoryState = {
    nodes: initialNodes,
    selectedNodeId: initialNodes[0].id,
    isLoading: false,
    error: null,
    graphIssues: [],
};

// Define all possible actions
type StoryAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_NODES'; payload: StoryNode[] }
    | { type: 'SELECT_NODE'; payload: string | null }
    | { type: 'UPDATE_NODE_SYNC'; payload: StoryNode }
    | { type: 'ADD_NODE_SYNC'; payload: StoryNode }
    | { type: 'DELETE_NODE_SYNC'; payload: string }
    | { type: 'SET_GRAPH_ISSUES'; payload: GraphIssue[] };

const storyReducer = (state: StoryState, action: StoryAction): StoryState => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'SET_NODES':
            return { ...state, nodes: action.payload };
        case 'SET_GRAPH_ISSUES':
            return { ...state, graphIssues: action.payload };
        case 'SELECT_NODE':
            return { ...state, selectedNodeId: action.payload };
        case 'UPDATE_NODE_SYNC':
            return {
                ...state,
                nodes: state.nodes.map(n =>
                    n.id === action.payload.id ? action.payload : n
                ),
            };
        case 'ADD_NODE_SYNC':
            return {
                ...state,
                nodes: [...state.nodes, action.payload],
                selectedNodeId: action.payload.id,
            };
        case 'DELETE_NODE_SYNC':
            if (state.nodes.length <= 1) return state;
            const remainingNodes = state.nodes.filter(n => n.id !== action.payload);
            return {
                ...state,
                nodes: remainingNodes,
                selectedNodeId: state.selectedNodeId === action.payload ? remainingNodes[0].id : state.selectedNodeId,
            };
        default:
            return state;
    }
};

// --- CONTEXT AND PROVIDER ---

// Define the exposed functions (interface for components)
export interface StoryContextType {
    state: StoryState;
    // Actions
    loadStory: () => Promise<void>;
    saveNode: (node: StoryNode) => Promise<void>;
    addNode: (parentId: string | null) => Promise<void>;
    deleteNode: (nodeId: string) => Promise<void>;
    selectNode: (nodeId: string) => void;
    // Synchronous Update for quick UI feedback
    updateNodeSync: (node: StoryNode) => void;
    // Getters
    selectedNode: StoryNode | undefined;
    graphIssues: GraphIssue[];
}


export const StoryContext = createContext<StoryContextType>({
    state: initialState,
    // Mock implementations
    loadStory: () => Promise.resolve(),
    saveNode: () => Promise.resolve(),
    addNode: () => Promise.resolve(),
    deleteNode: () => Promise.resolve(),
    selectNode: () => null,
    updateNodeSync: () => null,
    selectedNode: initialState.nodes[0],
    graphIssues: initialState.graphIssues,
});


export const StoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(storyReducer, initialState);

    // 1. Dependency Injection (Use Memo for stability)
    const repo = useMemo(() => new StoryRepositoryImpl(), []);
    const loadStoryUseCase = useMemo(() => new LoadStoryUseCase(repo), [repo]);
    const saveNodeUseCase = useMemo(() => new SaveNodeUseCase(repo), [repo]);
    const deleteNodeUseCase = useMemo(() => new DeleteNodeUseCase(repo), [repo]);
    const analyzeGraphUseCase = useMemo(() => new AnalyzeGraphUseCase(), []);


    // --- 2. ASYNC FUNCTIONS (Actions) ---

    const loadStory = useCallback(async () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const loadedNodes = await loadStoryUseCase.execute();
            if (loadedNodes.length > 0) {
                dispatch({ type: 'SET_NODES', payload: loadedNodes });
                dispatch({ type: 'SELECT_NODE', payload: loadedNodes[0].id });
            } else {
                // If no data, initialize with mock data and save it.
                await repo.saveAllNodes(initialNodes);
                dispatch({ type: 'SET_NODES', payload: initialNodes });
            }
            dispatch({ type: 'SET_ERROR', payload: null });
        } catch (e) {
            console.error("Load Error:", e);
            dispatch({ type: 'SET_ERROR', payload: "Failed to load story from persistence." });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [loadStoryUseCase, repo]);

    const saveNode = useCallback(async (node: StoryNode) => {
        // Optimistic UI update first
        dispatch({ type: 'UPDATE_NODE_SYNC', payload: node });
        try {
            await saveNodeUseCase.execute(node);
            dispatch({ type: 'SET_ERROR', payload: null });
        } catch (e) {
            console.error("Save Error:", e);
            dispatch({ type: 'SET_ERROR', payload: "Failed to save node to persistence." });
            // NOTE: In a real app, you would revert the UI change here (pessimistic update).
        }
    }, [saveNodeUseCase]);

    const addNode = useCallback(async (parentId: string | null) => {
        const newNode = newEmptyNode(generateId('node'));
        // If we have a parent, try to link it automatically for flow visualization
        if (parentId && state.selectedNodeId) {
            const parentNode = state.nodes.find(n => n.id === parentId);
            if (parentNode) {
                // Find an open choice slot and link it
                const updatedChoices = parentNode.choices.map(c =>
                    c.nextNodeId === "" ? { ...c, nextNodeId: newNode.id } : c
                );
                // This is a complex synchronization point, requires care!
                dispatch({ type: 'UPDATE_NODE_SYNC', payload: { ...parentNode, choices: updatedChoices } });
                await saveNode({ ...parentNode, choices: updatedChoices });
            }
        }

        dispatch({ type: 'ADD_NODE_SYNC', payload: newNode });
        await saveNode(newNode);
    }, [state.selectedNodeId, state.nodes, saveNode]);


    const deleteNode = useCallback(async (nodeId: string) => {
        if (state.nodes.length <= 1) {
            dispatch({ type: 'SET_ERROR', payload: "Cannot delete the last node." });
            return;
        }
        // Optimistic UI update
        dispatch({ type: 'DELETE_NODE_SYNC', payload: nodeId });

        try {
            await deleteNodeUseCase.execute(nodeId);
            dispatch({ type: 'SET_ERROR', payload: null });
        } catch (e) {
            console.error("Delete Error:", e);
            dispatch({ type: 'SET_ERROR', payload: "Failed to delete node from persistence." });
            // Re-fetch or manually re-add node here if needed.
        }
    }, [state.nodes.length, deleteNodeUseCase]);

    const selectNode = useCallback((nodeId: string) => {
        dispatch({ type: 'SELECT_NODE', payload: nodeId });
    }, []);

    const updateNodeSync = useCallback((node: StoryNode) => {
        dispatch({ type: 'UPDATE_NODE_SYNC', payload: node });
    }, []);

    // --- 3. Memoized Values and Effects ---

    const selectedNode = useMemo(() =>
        state.nodes.find(n => n.id === state.selectedNodeId),
        [state.nodes, state.selectedNodeId]
    );

    // Effect to analyze graph issues whenever nodes change
    useEffect(() => {
        const issues = analyzeGraphUseCase.execute(state.nodes);
        dispatch({ type: 'SET_GRAPH_ISSUES', payload: issues });
    }, [state.nodes, analyzeGraphUseCase]);


    // Effect to load data on initial mount
    useEffect(() => {
        loadStory();
    }, [loadStory]);


    const contextValue = useMemo(() => ({
        state,
        loadStory,
        saveNode,
        addNode,
        deleteNode,
        selectNode,
        updateNodeSync,
        selectedNode,
        graphIssues: state.graphIssues,
    }), [
        state,
        loadStory,
        saveNode,
        addNode,
        deleteNode,
        selectNode,
        updateNodeSync,
        selectedNode,
        state.graphIssues,
    ]);

    return (
        <StoryContext.Provider value={contextValue}>
            {children}
        </StoryContext.Provider>
    );
};

export const useStory = () => useContext(StoryContext);