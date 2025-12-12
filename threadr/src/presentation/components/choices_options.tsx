import React, { useState, useCallback, useMemo } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { type GameChoice, type StatAdjustment, type StoryNode, ALL_STATS } from '../../domain/entities/story';
import { StatAdjustmentEditor } from './stat_adjustment';
import { generateId } from '../../utils/id_generator';

interface ChoiceEditorProps {
    choice: GameChoice;
    index: number;
    nodeIds: string[]; // List of all possible target node IDs
    onUpdate: (index: number, newChoice: GameChoice) => void;
    onDelete: (index: number) => void;
}

const newEmptyAdjustment = (): StatAdjustment => ({
    statName: ALL_STATS[0],
    value: 1,
});

/**
 * Component for editing a single GameChoice, including its adjustments.
 */
export const ChoiceEditor: React.FC<ChoiceEditorProps> = ({
    choice,
    index,
    nodeIds,
    onUpdate,
    onDelete
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // --- Handlers for Choice's Main Fields ---

    const handleChoiceFieldChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        onUpdate(index, { ...choice, [name]: value });
    }, [choice, index, onUpdate]);


    // --- Handlers for Adjustments Array ---

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
    }, [choice, index, onUpdate]);


    return (
        <div className="choice-card">
            <div className="choice-header" onClick={() => setIsExpanded(!isExpanded)}>
                <span className="choice-text" title={choice.text}>
                    {choice.text || "New Choice"} ({choice.nextNodeId || "DEAD END"})
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(index); }}
                        className="text-red-400 hover:text-red-500 transition duration-150"
                    >
                        <Trash2 size={18} />
                    </button>
                    <button className="text-gray-400">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                </div>
            </div>
            {isExpanded && (
                <div className="adjustment-area">
                    {/* Choice Text Input */}
                    <input
                        type="text"
                        name="text"
                        placeholder="Choice Text"
                        className="form-input text-sm"
                        style={{ padding: '0.5rem', fontSize: '0.875rem', marginBottom: '0.5rem' }}
                        value={choice.text}
                        onChange={handleChoiceFieldChange}
                    />
                    {/* Next Node Selector */}
                    <select
                        className="next-node-selector"
                        name="nextNodeId"
                        style={{ marginBottom: '0.5rem' }}
                        value={choice.nextNodeId}
                        onChange={handleChoiceFieldChange}
                    >
                        <option value="">-- Select Next Node ID (Required) --</option>
                        {nodeIds.map(id => (
                            <option key={id} value={id}>{id}</option>
                        ))}
                    </select>

                    {/* Stat Adjustments */}
                    <div className="form-label adj-label">Stat Adjustments:</div>
                    <div className='adj-list'>
                        {choice.adjustments.map((adj, adjIndex) => (
                            <StatAdjustmentEditor
                                key={adjIndex}
                                adjustment={adj}
                                index={adjIndex}
                                onUpdate={handleAdjustmentUpdate}
                                onDelete={handleAdjustmentDelete}
                            />
                        ))}
                        <button onClick={handleAdjustmentAdd} className="btn-add-adjustment">
                            <Plus size={16} /> Add Adjustment
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};