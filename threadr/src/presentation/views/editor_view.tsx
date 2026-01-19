import React, { useState } from 'react';
import { LayoutGrid, AlertCircle, Plus, Save, Users, Zap, FileText, Sun, Moon, LogOut, User as UserIcon } from 'lucide-react';
import { useStory } from '../context/StoryContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/authContext';
import { NodeEditor } from '../components/node_editor';
import { GraphVisualizationWrapper } from '../components/graph_visual';
import { StatUtilityView } from './stat_view';

/**
 * The main application view component.
 * Refactored to match the "Modern Node Editor" dark sidebar / light content layout.
 */
export const EditorView: React.FC = () => {
    const { state, selectNode, addNode, graphIssues } = useStory();
    const { theme, toggleTheme } = useTheme();
    const { state: authState, signOut } = useAuth();
    const [viewMode, setViewMode] = useState<'editor' | 'graph' | 'stats'>('editor');

    const allNodeIds = state.nodes.map(n => n.id);
    const selectedNode = state.nodes.find(n => n.id === state.selectedNodeId);

    // --- Actions ---

    const handleNodeClick = (id: string) => {
        selectNode(id);
        setViewMode('editor');
    };

    const handleNodeAdd = () => {
        addNode(state.selectedNodeId);
        setViewMode('editor');
    };

    const handleExport = () => {
        if (graphIssues.length > 0) {
            alert(`Cannot export: Please fix ${graphIssues.length} graph issues (Orphans, Dead Ends, Invalid Links).`);
            return;
        }
        try {
            const jsonString = JSON.stringify(state.nodes, null, 2);
            navigator.clipboard.writeText(jsonString).then(() => {
                alert("Story JSON copied to clipboard successfully!");
            }).catch(err => {
                console.error(err);
                alert("Failed to copy JSON to clipboard.");
            });
        } catch (e) {
            console.error(e);
            alert("Error exporting JSON.");
        }
    };

    // --- Render Helpers ---

    const renderMainContent = () => {
        if (state.isLoading) {
            return (
                <div className="flex items-center justify-center h-full">
                    <h3 className="card-subtitle">Loading story from Firebase...</h3>
                </div>
            );
        }

        switch (viewMode) {
            case 'editor':
                if (!selectedNode) {
                    return (
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                            <div className="editor-card" style={{ maxWidth: 400, textAlign: 'center' }}>
                                <Zap size={48} style={{ color: 'var(--color-primary)', margin: '0 auto 1rem' }} />
                                <h2>Welcome to Threadr</h2>
                                <p className="card-subtitle">Select a node from the sidebar or create a new one to get started.</p>
                                <button onClick={handleNodeAdd} className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%' }}>
                                    <Plus size={18} /> Create First Node
                                </button>
                            </div>
                        </div>
                    );
                }
                return <NodeEditor node={selectedNode} nodeIds={allNodeIds} />;
            case 'graph':
                return <GraphVisualizationWrapper storyNodes={state.nodes} />;
            case 'stats':
                return <StatUtilityView />;
            default:
                return null;
        }
    };

    return (
        <div className="app-layout">
            {/* Sidebar */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '0.25rem', borderRadius: '0.25rem' }}>
                        <Zap size={20} color="#818cf8" />
                    </div>
                    <span>Threadr Editor</span>
                </div>

                <div className="sidebar-content">
                    {/* Node List */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', paddingLeft: '0.5rem', paddingRight: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Story Nodes ({state.nodes.length})
                        </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {state.nodes.map(node => (
                            <button
                                key={node.id}
                                onClick={() => handleNodeClick(node.id)}
                                className={`node-item ${node.id === state.selectedNodeId && viewMode === 'editor' ? 'active' : ''}`}
                            >
                                <span className="node-item-id">{node.id}</span>
                                <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {node.title || "Untitled Scene"}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="sidebar-footer">
                    {authState.user && (
                        <div style={{
                            marginBottom: '1rem',
                            padding: '0.75rem',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '0.5rem'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden' }}>
                                <div style={{
                                    width: '24px',
                                    height: '24px',
                                    borderRadius: '50%',
                                    background: 'var(--color-primary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.75rem',
                                    fontWeight: 'bold',
                                    color: 'white'
                                }}>
                                    {authState.user.displayName ? authState.user.displayName[0].toUpperCase() : <UserIcon size={14} />}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {authState.user.displayName || 'User'}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={signOut}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#94a3b8',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                title="Sign Out"
                            >
                                <LogOut size={16} />
                            </button>
                        </div>
                    )}

                    {state.error && (
                        <div style={{ background: '#450a0a', color: '#fca5a5', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                            <AlertCircle size={16} />
                            <span>{state.error}</span>
                        </div>
                    )}

                    <button
                        onClick={handleNodeAdd}
                        className="btn btn-primary btn-full"
                    >
                        <Plus size={18} /> Add New Node
                    </button>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button
                            onClick={() => setViewMode(viewMode === 'graph' ? 'editor' : 'graph')}
                            className={`btn ${viewMode === 'graph' ? 'btn-primary' : 'btn-ghost'}`}
                            style={{ justifyContent: 'center', fontSize: '0.85rem' }}
                        >
                            {viewMode === 'graph' ? <FileText size={16} /> : <LayoutGrid size={16} />}
                            {viewMode === 'graph' ? 'Editor' : 'Graph'}
                        </button>
                        <button
                            onClick={() => setViewMode(viewMode === 'stats' ? 'editor' : 'stats')}
                            className={`btn ${viewMode === 'stats' ? 'btn-primary' : 'btn-ghost'}`}
                            style={{ justifyContent: 'center', fontSize: '0.85rem' }}
                        >
                            <Users size={16} /> Stats
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                        <button
                            onClick={handleExport}
                            disabled={graphIssues.length > 0}
                            className="btn btn-ghost"
                            style={{ flex: 1, fontSize: '0.85rem', opacity: 0.7 }}
                        >
                            <Save size={16} /> Export
                        </button>
                        <button
                            onClick={toggleTheme}
                            className="btn btn-ghost"
                            style={{ opacity: 0.7 }}
                            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
                        >
                            {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`main-content ${viewMode === 'graph' ? 'graph-view' : ''}`}>
                {renderMainContent()}
            </main>
        </div>
    );
};
