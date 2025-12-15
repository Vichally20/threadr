import React, { useCallback } from 'react';
import { Trash2 } from 'lucide-react';
import { type StatAdjustment } from '../../domain/entities/story';
import { useStory } from '../context/StoryContext'; // Import useStory

interface StatAdjustmentEditorProps {
    adjustment: StatAdjustment;
    index: number;
    onUpdate: (index: number, newAdj: StatAdjustment) => void;
    onDelete: (index: number) => void;
}

/**
 * Component for editing a single stat adjustment within a choice.
 * Dynamically loads the list of available stats from the context.
 */
export const StatAdjustmentEditor: React.FC<StatAdjustmentEditorProps> = ({
    adjustment,
    index,
    onUpdate,
    onDelete
}) => {
    const { allStatNames } = useStory(); // Get dynamic stat names

    const handleChange = useCallback((e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;

        let newValue: string | number = value;
        if (name === 'value') {
            newValue = parseInt(value) || 0;
        }

        onUpdate(index, { ...adjustment, [name]: newValue });
    }, [adjustment, index, onUpdate]);

    return (
        <div className="adj-editor">
            <select
                className="adj-select"
                name="statName"
                value={adjustment.statName}
                onChange={handleChange}
            >
                {/* Render dynamic stat names */}
                {allStatNames.map(stat => (
                    <option key={stat} value={stat}>
                        {stat.charAt(0).toUpperCase() + stat.slice(1)}
                    </option>
                ))}
                {/* If the stat name currently used in the adjustment doesn't exist anymore, display it as an invalid option */}
                {!allStatNames.includes(adjustment.statName) && (
                    <option key={adjustment.statName} value={adjustment.statName} style={{ color: 'red' }}>
                        {adjustment.statName} (MISSING!)
                    </option>
                )}
            </select>
            <input
                type="number"
                name="value"
                placeholder="Value"
                className="adj-input"
                value={adjustment.value}
                onChange={handleChange}
            />
            <button
                onClick={() => onDelete(index)}
                className="text-red-400 hover:text-red-500 transition duration-150"
                title="Remove adjustment"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );
};