import React, { useState, useCallback } from 'react';
import { useStory } from '../context/StoryContext';
import { Trash2, Plus, Users, Zap, AlertCircle } from 'lucide-react';
import { type CustomStat } from '../../domain/entities/story';

/**
 * View for managing customizable character stats and other project utilities.
 * Refactored to match the modern application UI.
 */
export const StatUtilityView: React.FC = () => {
    const { state, addCustomStat, deleteCustomStat } = useStory();
    const [newStatName, setNewStatName] = useState('');
    const [newStatInitialValue, setNewStatInitialValue] = useState(0);
    const [newStatType, setNewStatType] = useState<'Personality' | 'Secondary'>('Personality');
    const [error, setError] = useState<string | null>(null);

    const handleAddStat = useCallback(() => {
        const name = newStatName.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        if (!name) {
            setError("Stat name cannot be empty.");
            return;
        }
        if (state.customStats.some(s => s.name === name)) {
            setError(`Stat '${name}' already exists.`);
            return;
        }

        const newStat: CustomStat = {
            name: name,
            initialValue: newStatInitialValue,
            type: newStatType,
        };

        addCustomStat(newStat);
        setNewStatName('');
        setNewStatInitialValue(0);
        setError(null);
    }, [newStatName, newStatInitialValue, newStatType, state.customStats, addCustomStat]);

    const handleStatDelete = useCallback((name: string) => {
        if (!window.confirm(`Are you sure you want to delete stat: ${name}? This will break adjustments in your story nodes!`)) {
            return;
        }
        deleteCustomStat(name);
    }, [deleteCustomStat]);

    // Group stats for clean display
    const personalityStats = state.customStats.filter(s => s.type === 'Personality');
    const secondaryStats = state.customStats.filter(s => s.type === 'Secondary');

    return (
        <div style={{ width: '100%', maxWidth: '800px' }}>
            <div className="editor-card">
                <div className="card-header">
                    <h2>Stat Configuration</h2>
                    <p className="card-subtitle">Manage character stats and variables for your story.</p>
                </div>

                {/* Stat Creation Section */}
                <div style={{ backgroundColor: '#f9fafb', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                        <Plus size={20} />
                        <h3>Add New Stat</h3>
                    </div>

                    {error && (
                        <div style={{
                            backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem',
                            borderRadius: '0.5rem', fontSize: '0.9rem', marginBottom: '1rem',
                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}>
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
                        <div className="input-group">
                            <label className="input-label">Stat Name (ID)</label>
                            <input
                                type="text"
                                className="text-input"
                                placeholder="e.g. courage"
                                value={newStatName}
                                onChange={(e) => setNewStatName(e.target.value)}
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Initial Value</label>
                            <input
                                type="number"
                                className="text-input"
                                value={newStatInitialValue}
                                onChange={(e) => setNewStatInitialValue(parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div className="input-group">
                            <label className="input-label">Type</label>
                            <select
                                className="text-input"
                                value={newStatType}
                                onChange={(e) => setNewStatType(e.target.value as 'Personality' | 'Secondary')}
                            >
                                <option value="Personality">Personality</option>
                                <option value="Secondary">Secondary</option>
                            </select>
                        </div>
                        <button onClick={handleAddStat} className="btn btn-primary" style={{ height: '42px', width: '42px', padding: 0 }}>
                            <Plus size={24} />
                        </button>
                    </div>
                </div>

                <div style={{ marginTop: '1rem' }}>
                    <StatList title="Personality Attributes" stats={personalityStats} onDelete={handleStatDelete} color="blue" />
                    <div style={{ height: '1.5rem' }}></div>
                    <StatList title="Secondary Attributes" stats={secondaryStats} onDelete={handleStatDelete} color="orange" />
                </div>
            </div>
        </div>
    );
};

// Sub-component for displaying a list of stats
interface StatListProps {
    title: string;
    stats: CustomStat[];
    onDelete: (name: string) => void;
    color: 'blue' | 'orange';
}

const StatList: React.FC<StatListProps> = ({ title, stats, onDelete, color }) => {
    const accentColor = color === 'blue' ? '#3b82f6' : '#f59e0b';
    const borderColor = color === 'blue' ? 'var(--color-primary)' : 'var(--color-accent)'; // Use theme vars for cleaner look
    // unused bgColor removed

    if (stats.length === 0) return null;

    return (
        <div>
            <div className="choices-header" style={{ marginBottom: '0.75rem', borderBottom: 'none', paddingBottom: 0 }}>
                <span className="input-label" style={{ fontSize: '0.9rem' }}>{title}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                {stats.map(stat => (
                    <div
                        key={stat.name}
                        style={{
                            backgroundColor: 'var(--color-bg-card)',
                            border: `1px solid ${borderColor}`,
                            borderRadius: '0.5rem',
                            padding: '1rem',
                            position: 'relative',
                            boxShadow: 'var(--shadow-sm)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.25rem'
                        }}
                    >
                        <div style={{
                            position: 'absolute', left: 0, top: '10px', bottom: '10px', width: '4px',
                            backgroundColor: accentColor, borderTopRightRadius: '4px', borderBottomRightRadius: '4px'
                        }}></div>

                        <div style={{ marginLeft: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span style={{ fontWeight: 600, color: 'var(--color-text-main)', textTransform: 'capitalize' }}>
                                {stat.name}
                            </span>
                            <button
                                onClick={() => onDelete(stat.name)}
                                className="btn-ghost"
                                style={{ color: 'var(--color-text-muted)', padding: '2px' }}
                                title="Delete Stat"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                        <div style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                            Initial Value: <span style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>{stat.initialValue}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};