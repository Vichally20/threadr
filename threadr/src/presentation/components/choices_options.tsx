import React, { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, GitBranch } from 'lucide-react';
import { type GameChoice, type StatAdjustment } from '../../domain/entities/story';
import { useStory } from '../context/StoryContext';
import { StatAdjustmentEditor } from './stat_adjustment';

interface ChoiceEditorProps {
    choice: GameChoice;
    index: number;
    nodeIds: string[];
    onUpdate: (index: number, newChoice: GameChoice) => void;
    onDelete: (index: number) => void;
}

export const ChoiceEditor: React.FC<ChoiceEditorProps> = ({
    choice,
    index,
    nodeIds,
    onUpdate,
    onDelete
}) => {
    const [isExpanded, setIsExpanded] = useState(true); // Default to expanded for easier editing
    const { allStatNames } = useStory();

    const newEmptyAdjustment = useCallback((): StatAdjustment => ({
        statName: allStatNames.length > 0 ? allStatNames[0] : "",
        value: 1,
    }), [allStatNames]);

    const handleChoiceFieldChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        onUpdate(index, { ...choice, [name]: value });
    }, [choice, index, onUpdate]);

    const handleAdjustmentUpdate = useCallback((adjIndex: number, newAdj: StatAdjustment) => {
        const updatedAdjustments = choice.adjustments.map((adj, i) => (i === adjIndex ? newAdj : adj));
        onUpdate(index, { ...choice, adjustments: updatedAdjustments });
    }, [choice, index, onUpdate]);

    const handleAdjustmentDelete = useCallback((adjIndex: number) => {
        const updatedAdjustments = choice.adjustments.filter((_, i) => i !== adjIndex);
        onUpdate(index, { ...choice, adjustments: updatedAdjustments });
    }, [choice, index, onUpdate]);

    const handleAdjustmentAdd = useCallback(() => {
        onUpdate(index, { ...choice, adjustments: [...choice.adjustments, newEmptyAdjustment()] });
    }, [choice, index, onUpdate, newEmptyAdjustment]);

    return (
        <div className="choice-item">
            <div className="choice-summary" onClick={() => setIsExpanded(!isExpanded)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ background: '#eef2ff', padding: '0.35rem', borderRadius: '0.35rem', color: '#6366f1' }}>
                        <GitBranch size={18} />
                    </div>
                    <div>
                        <div className="choice-title">{choice.text || "Untitled Choice"}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            Target: <span className="choice-target">{choice.nextNodeId || "None"}</span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(index); }}
                        className="btn-ghost"
                        style={{ color: 'var(--color-danger)', padding: '0.25rem' }}
                    >
                        <Trash2 size={16} />
                    </button>
                    <button className="btn-ghost" style={{ padding: '0.25rem' }}>
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div style={{ marginTop: '1rem', borderTop: '1px solid var(--color-border)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div className="input-group">
                        <label className="input-label">Button Label</label>
                        <input
                            type="text"
                            name="text"
                            placeholder="e.g. Open the door"
                            className="text-input"
                            value={choice.text}
                            onChange={handleChoiceFieldChange}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Target Node</label>
                        <select
                            className="text-input"
                            name="nextNodeId"
                            value={choice.nextNodeId}
                            onChange={handleChoiceFieldChange}
                        >
                            <option value="">-- Select Target --</option>
                            {nodeIds.map(id => (
                                <option key={id} value={id}>{id}</option>
                            ))}
                        </select>
                    </div>

                    <div className="input-group" style={{ marginTop: '0.25rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label className="input-label">Requirements & Adjustments</label>
                            <button onClick={handleAdjustmentAdd} style={{ fontSize: '0.75rem', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Plus size={14} /> Add Stats
                            </button>
                        </div>

                        {choice.adjustments.length > 0 ? (
                            <div className="adjustment-chips">
                                {choice.adjustments.map((adj, adjIndex) => (
                                    <StatAdjustmentEditor
                                        key={adjIndex}
                                        adjustment={adj}
                                        index={adjIndex}
                                        onUpdate={handleAdjustmentUpdate}
                                        onDelete={handleAdjustmentDelete}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div style={{ fontSize: '0.85rem', color: '#9ca3af', fontStyle: 'italic' }}>No stat changes configured.</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};