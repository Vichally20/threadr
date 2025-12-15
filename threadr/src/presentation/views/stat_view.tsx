import React, { useState, useCallback } from 'react';
import { useStory } from '../context/StoryContext';
import { Trash2, Plus, Users, Zap } from 'lucide-react';
import { type CustomStat } from '../../domain/entities/story';

/**
 * View for managing customizable character stats and other project utilities.
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
        <div className="main-content">
            <div className="editor-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div className="editor-header">
                    <h2 className="text-3xl">Stat Configuration & Utilities</h2>
                </div>

                {/* Stat Creation Section */}
                <div style={{ padding: '1.5rem', border: '1px solid #374151', borderRadius: '8px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-green)', marginBottom: '1rem' }}>Add New Character Stat</h3>

                    {error && <div className="sidebar-error" style={{ marginBottom: '1rem' }}>{error}</div>}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '1rem', alignItems: 'flex-end' }}>
                        <div className="form-group">
                            <label className="form-label">Stat Name (slug)</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g., courage, charisma"
                                value={newStatName}
                                onChange={(e) => setNewStatName(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Initial Value</label>
                            <input
                                type="number"
                                className="form-input"
                                value={newStatInitialValue}
                                onChange={(e) => setNewStatInitialValue(parseInt(e.target.value) || 0)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select
                                className="form-input"
                                value={newStatType}
                                onChange={(e) => setNewStatType(e.target.value as 'Personality' | 'Secondary')}
                            >
                                <option value="Personality">Personality</option>
                                <option value="Secondary">Secondary (Skill/RPG)</option>
                            </select>
                        </div>
                        <button onClick={handleAddStat} className="btn-control btn-add" style={{ width: '100px', height: '44px' }}>
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                {/* Display Current Stats */}
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-indigo)', marginTop: '2rem', marginBottom: '1rem' }}>Current Defined Stats</h3>

                {/* Personality Stats */}
                <StatList title="Personality Attributes" stats={personalityStats} onDelete={handleStatDelete} />

                {/* Secondary Stats */}
                <StatList title="Secondary (Skill/RPG) Attributes" stats={secondaryStats} onDelete={handleStatDelete} />

            </div>
        </div>
    );
};

// Sub-component for displaying a list of stats
interface StatListProps {
    title: string;
    stats: CustomStat[];
    onDelete: (name: string) => void;
}

const StatList: React.FC<StatListProps> = ({ title, stats, onDelete }) => (
    <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#1f2937', borderRadius: '8px' }}>
        <h4 style={{ color: 'var(--color-text-primary)', fontSize: '1.1rem', marginBottom: '0.75rem', borderBottom: '1px solid #374151', paddingBottom: '0.5rem' }}>{title}</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem' }}>
            {stats.map(stat => (
                <div
                    key={stat.name}
                    style={{
                        backgroundColor: '#0f172a',
                        padding: '0.75rem',
                        borderRadius: '6px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderLeft: `4px solid ${stat.type === 'Personality' ? '#3b82f6' : '#d97706'}`
                    }}
                >
                    <div>
                        <span style={{ fontSize: '1rem', fontWeight: 600, color: 'white' }}>
                            {stat.name.charAt(0).toUpperCase() + stat.name.slice(1)}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginLeft: '8px' }}>
                            (Initial: {stat.initialValue})
                        </span>
                    </div>
                    <button
                        onClick={() => onDelete(stat.name)}
                        style={{ color: 'var(--color-red)', background: 'none', border: 'none', cursor: 'pointer', padding: '5px' }}
                        title="Delete Stat"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            ))}
        </div>
    </div>
);