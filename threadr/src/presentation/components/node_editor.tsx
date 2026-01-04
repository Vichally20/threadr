import React, { useCallback, useState, useEffect } from 'react';
import { Plus, Trash2, ArrowUpRight } from 'lucide-react';
import { type StoryNode, type GameChoice } from '../../domain/entities/story';
import { useStory } from '../context/StoryContext';
import { ChoiceEditor } from './choices_options';
import { generateId } from '../../utils/id_generator';

interface NodeEditorProps {
    node: StoryNode;
    nodeIds: string[];
}

export const NodeEditor: React.FC<NodeEditorProps> = ({ node, nodeIds }) => {
    const { deleteNode, updateNodeSync, saveNode } = useStory();
    const [isDirty, setIsDirty] = useState(false);
    const [localNode, setLocalNode] = useState(node);

    useEffect(() => {
        setLocalNode(node);
        setIsDirty(false);
    }, [node]);

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
            nextNodeId: "",
            adjustments: [],
        };
        setLocalNode(prev => ({ ...prev, choices: [...prev.choices, newChoice] }));
        setIsDirty(true);
    }, []);

    const handleSave = useCallback(() => {
        if (!isDirty) return;
        updateNodeSync(localNode);
        saveNode(localNode);
        setIsDirty(false);
    }, [localNode, isDirty, updateNodeSync, saveNode]);

    useEffect(() => {
        if (isDirty) {
            const timeoutId = setTimeout(handleSave, 1500);
            return () => clearTimeout(timeoutId);
        }
    }, [localNode, isDirty, handleSave]);

    // Force save on unmount or node switch if dirty
    useEffect(() => {
        return () => {
            if (isDirty) handleSave();
        };
    }, [handleSave, isDirty]);

    return (
        <div className="editor-card">
            <div className="card-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <div style={{ textAlign: 'left' }}>
                        <span className="node-item-id">[{localNode.id}]</span>
                        <input
                            type="text"
                            name="title"
                            placeholder="Scene Title"
                            className="text-input"
                            style={{ fontSize: '1.5rem', fontWeight: 700, border: 'none', padding: 0, background: 'transparent', boxShadow: 'none' }}
                            value={localNode.title}
                            onChange={handleFieldChange}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {isDirty && <span style={{ color: 'var(--color-yellow)', fontSize: '0.85rem', alignSelf: 'center' }}>Saving...</span>}
                        <button
                            onClick={() => deleteNode(localNode.id)}
                            className="btn btn-danger"
                            title="Delete Node"
                            style={{ padding: '0.5rem' }}
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
                <div style={{ textAlign: 'left' }}>
                    <p className="card-subtitle">Configure the content and flow of your story node.</p>
                </div>
            </div>

            <div className="input-group">
                <label className="input-label">Story Content (Markdown)</label>
                <textarea
                    name="content"
                    placeholder="Once upon a time..."
                    className="text-area"
                    value={localNode.content}
                    onChange={handleFieldChange}
                />
            </div>

            <div style={{ marginTop: '1rem' }}>
                <div className="choices-header">
                    <span className="input-label">Choices ({localNode.choices.length})</span>
                    <button onClick={handleChoiceAdd} className="btn btn-ghost" style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                        Collapse All
                    </button>
                </div>

                <div className="choice-list">
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

                    <button onClick={handleChoiceAdd} className="btn btn-secondary btn-full" style={{ borderStyle: 'dashed' }}>
                        <Plus size={18} /> Add New Choice
                    </button>
                </div>
            </div>
        </div>
    );
};