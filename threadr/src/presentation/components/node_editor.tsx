import React, { useCallback, useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { type StoryNode, type GameChoice } from '../../domain/entities/story';
import { useStory } from '../context/StoryContext';
import { ChoiceEditor } from './choices_options';
import { generateId } from '../../utils/id_generator';

interface NodeEditorProps {
    node: StoryNode;
    nodeIds: string[];
}

/**
 * Main component for editing the content and choices of a single StoryNode.
 * Uses synchronous updates to the Context for responsiveness, followed by async saving.
 */
export const NodeEditor: React.FC<NodeEditorProps> = ({ node, nodeIds }) => {
    const { deleteNode, updateNodeSync, saveNode } = useStory();
    const [isDirty, setIsDirty] = useState(false);

    // Use local state (or a debounce function) for efficient content input
    const [localNode, setLocalNode] = useState(node);

    // Update local state when the selected node changes externally
    useEffect(() => {
        setLocalNode(node);
        setIsDirty(false);
    }, [node]);

    // --- Update Handlers ---

    const handleFieldChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setLocalNode(prev => ({ ...prev, [name]: value }));
        setIsDirty(true);
    }, []);

    const handleChoiceChange = useCallback((index: number, newChoice: GameChoice) => {
        const updatedChoices = localNode.choices.map((c, i) => (i === index ? newChoice : c));
        setLocalNode(prev => ({ ...prev, choices: updatedChoices }));
        setIsDirty(true);
    }, [localNode]);

    const handleChoiceDelete = useCallback((index: number) => {
        const updatedChoices = localNode.choices.filter((_, i) => i !== index);
        setLocalNode(prev => ({ ...prev, choices: updatedChoices }));
        setIsDirty(true);
    }, [localNode]);

    const handleChoiceAdd = useCallback(() => {
        const newChoice: GameChoice = {
            id: generateId('choice'),
            text: "New Choice",
            nextNodeId: "", // Default to no link
            adjustments: [],
        };
        setLocalNode(prev => ({ ...prev, choices: [...prev.choices, newChoice] }));
        setIsDirty(true);
    }, []);

    // --- Persistence ---

    // Synchronize local state to global context and persistence
    const handleSave = useCallback(() => {
        if (!isDirty) return;

        // 1. Update global context immediately for UI responsiveness
        updateNodeSync(localNode);

        // 2. Persist to Firebase in the background
        saveNode(localNode);

        setIsDirty(false);
    }, [localNode, isDirty, updateNodeSync, saveNode]);

    // Auto-save effect (Debounce if this were a large app, but here we save on every significant interaction)
    useEffect(() => {
        if (isDirty) {
            // Set a short timer to auto-save after the user stops typing/interacting
            const timeoutId = setTimeout(handleSave, 1500);
            return () => clearTimeout(timeoutId);
        }
    }, [localNode, isDirty, handleSave]);


    // --- Render ---

    return (
        <div className="editor-container">
            <div className="editor-header">
                <h2 className="text-3xl">Node Editor</h2>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    {isDirty && (
                        <span style={{ color: 'var(--color-yellow)', fontSize: '0.9rem' }}>Unsaved Changes...</span>
                    )}
                    <button
                        onClick={() => deleteNode(localNode.id)}
                        className="btn-delete-node"
                        title="Delete Node"
                    >
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            {/* Node ID and Title */}
            <div className='form-group'>
                <label className="form-label">Node ID (Read-Only):</label>
                <div className="node-id-display">{localNode.id}</div>

                <label className="form-label">Scene Title:</label>
                <input
                    type="text"
                    name="title"
                    placeholder="Scene Title"
                    className="form-input"
                    value={localNode.title}
                    onChange={handleFieldChange}
                />
            </div>

            {/* Content Editor */}
            <label className="form-label">Story Content (Markdown):</label>
            <textarea
                name="content"
                placeholder="Story Content (Supports Markdown)"
                className="content-textarea"
                value={localNode.content}
                onChange={handleFieldChange}
            />

            {/* Choices Editor */}
            <label className="choices-section">Choices ({localNode.choices.length})</label>
            <div className="adj-list">
                {localNode.choices.map((choice, index) => (
                    <ChoiceEditor
                        key={choice.id}
                        choice={choice}
                        index={index}
                        nodeIds={nodeIds}
                        onUpdate={handleChoiceChange}
                        onDelete={handleChoiceDelete}
                    />
                ))}
                <button onClick={handleChoiceAdd} className="btn-control btn-add">
                    <Plus size={20} />
                    <span>Add New Choice</span>
                </button>
            </div>
        </div>
    );
};