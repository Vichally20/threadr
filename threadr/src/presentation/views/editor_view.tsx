import React, { useState, useCallback } from 'react';
import { LayoutGrid, FileText, Zap, X, Plus, Save, Users } from 'lucide-react';
import { useStory } from '../context/StoryContext';
import { NodeEditor } from '../components/node_editor';
import { GraphVisualizationWrapper } from '../components/graph_visual'; // UPDATED IMPORT
import { StatUtilityView } from './stat_view'; // NEW IMPORT

/**
 * The main application view component. Handles the sidebar layout and switches 
 * between the Node Editor and the Graph Visualization based on the view mode.
 */
export const EditorView: React.FC = () => {
    const { state, selectNode, addNode, graphIssues } = useStory();
    const [viewMode, setViewMode] = useState<'editor' | 'graph' | 'stats'>('editor'); // ADDED 'stats' mode

    const allNodeIds = state.nodes.map(n => n.id);
    const selectedNode = state.nodes.find(n => n.id === state.selectedNodeId);

    // --- Sidebar Helpers ---

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
            // Use document.execCommand('copy') for broader clipboard compatibility in iframe environments
            navigator.clipboard.writeText(jsonString).then(() => {
                alert("Story JSON copied to clipboard successfully!");
            }).catch(err => {
                alert("Failed to copy JSON to clipboard.");
                console.error(err);
            });
        } catch (e) {
            alert("Error exporting JSON.");
            console.error(e);
        }
    };

    // --- Dynamic Main Content Render ---
    const renderMainContent = () => {
        if (state.isLoading) {
            return (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <h3 style={{ color: 'var(--color-text-secondary)' }}>Loading story from Firebase...</h3>
                </div>
            );
        }

        switch (viewMode) {
            case 'editor':
                if (!selectedNode) return (
                    <div style={{ padding: '2rem', textAlign: 'center' }}>
                        <h3 style={{ color: 'var(--color-text-secondary)' }}>Select a node or start a new project.</h3>
                    </div>
                );
                return <NodeEditor node={selectedNode} nodeIds={allNodeIds} />;
            case 'graph':
                return <GraphVisualizationWrapper storyNodes={state.nodes} />;
            case 'stats':
                return <StatUtilityView />;
            default:
                return null;
        }
    };


    // --- Render ---

    return (
        <div className="app-container">
            {/* 1. Left Sidebar: Node List and Controls */}
            <div className="sidebar">
                <h1 className="sidebar-header">
                    <Zap size={24} />
                    <span>Threadr Editor</span>
                </h1>

                {state.error && (
                    <div className="sidebar-error">
                        <X size={16} />
                        <span>{state.error}</span>
                    </div>
                )}

                {/* Navigation Buttons (Switches Main View) */}
                <div className="sidebar-controls" style={{ marginBottom: '1rem' }}>
                    <button
                        onClick={() => setViewMode(viewMode === 'graph' ? 'editor' : 'graph')}
                        className={`btn-control ${viewMode === 'graph' ? 'btn-toggle-view selected' : 'btn-control'}`}
                        style={{ backgroundColor: viewMode === 'graph' ? 'var(--color-indigo)' : '#3b82f6' }}
                    >
                        <LayoutGrid size={20} />
                        <span>{viewMode === 'graph' ? 'Back to Editor' : 'View Graph'}</span>
                    </button>
                    <button
                        onClick={() => setViewMode(viewMode === 'stats' ? 'editor' : 'stats')}
                        className={`btn-control ${viewMode === 'stats' ? 'selected' : ''}`}
                        style={{ backgroundColor: viewMode === 'stats' ? 'var(--color-indigo)' : '#3b82f6' }}
                    >
                        <Users size={20} />
                        <span>Manage Stats & Utils</span>
                    </button>
                </div>


                {/* Node List */}
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'white', borderBottom: '1px solid #374151', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>Story Nodes</h3>
                <div className="node-list">
                    {state.nodes.map(node => (
                        <button
                            key={node.id}
                            onClick={() => handleNodeClick(node.id)}
                            className={`node-button ${node.id === state.selectedNodeId && viewMode === 'editor' ? 'selected' : ''
                                }`}
                        >
                            <span className="node-id">[{node.id}]</span>
                            {node.title}
                        </button>
                    ))}
                </div>

                {/* Export Controls */}
                <div className="sidebar-controls" style={{ marginTop: '1rem' }}>
                    <button
                        onClick={handleNodeAdd}
                        className="btn-control btn-add"
                        title="Add new Node and try to link it to the selected one."
                    >
                        <Plus size={20} />
                        <span>Add New Node</span>
                    </button>
                    <button
                        onClick={handleExport}
                        className="btn-control btn-export"
                        disabled={graphIssues.length > 0}
                    >
                        <Save size={20} />
                        <span>Export Story JSON</span>
                    </button>
                    {graphIssues.length > 0 && (
                        <div style={{ color: 'var(--color-red)', fontSize: '0.8rem', textAlign: 'center', marginTop: '0.5rem' }}>
                            Fix {graphIssues.length} issues before exporting.
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Main Content: Renders based on ViewMode */}
            <div className={`main-content ${viewMode === 'graph' ? 'graph-view' : ''}`}>
                {renderMainContent()}
            </div>
        </div>
    );
};








































// import React, { useState, useCallback } from 'react';
// import { LayoutGrid, FileText, Zap, X, Plus, Save } from 'lucide-react';
// import { useStory } from '../context/StoryContext';
// import { NodeEditor } from '../components/node_editor';
// import { GraphVisualizationWrapper } from '../components/graph_visual'; // UPDATED IMPORT
// import { StatUtilityView } from './stat_view';

// /**
//  * The main application view component. Handles the sidebar layout and switches
//  * between the Node Editor and the Graph Visualization based on the view mode.
//  */
// export const EditorView: React.FC = () => {
//     const { state, selectNode, addNode, graphIssues } = useStory();
//     const [viewMode, setViewMode] = useState<'editor' | 'graph' | 'stat'>('editor');

//     const allNodeIds = state.nodes.map(n => n.id);
//     const selectedNode = state.nodes.find(n => n.id === state.selectedNodeId);

//     // --- Sidebar Helpers ---

//     const handleNodeClick = (id: string) => {
//         selectNode(id);
//         setViewMode('editor');
//     };

//     const handleNodeAdd = () => {
//         addNode(state.selectedNodeId);
//         setViewMode('editor');
//     };

//     const handleExport = () => {
//         if (graphIssues.length > 0) {
//             alert(`Cannot export: Please fix ${graphIssues.length} graph issues (Orphans, Dead Ends, Invalid Links).`);
//             return;
//         }

//         try {
//             const jsonString = JSON.stringify(state.nodes, null, 2);
//             // Use document.execCommand('copy') for broader clipboard compatibility in iframe environments
//             navigator.clipboard.writeText(jsonString).then(() => {
//                 alert("Story JSON copied to clipboard successfully!");
//             }).catch(err => {
//                 alert("Failed to copy JSON to clipboard.");
//                 console.error(err);
//             });
//         } catch (e) {
//             alert("Error exporting JSON.");
//             console.error(e);
//         }
//     };


//     // --- Render ---

//     return (
//         <div className="app-container">
//             {/* 1. Left Sidebar: Node List and Controls */}
//             <div className="sidebar">
//                 <h1 className="sidebar-header">
//                     <Zap size={24} />
//                     <span>Threadr Editor</span>
//                 </h1>

//                 {state.error && (
//                     <div className="sidebar-error">
//                         <X size={16} />
//                         <span>{state.error}</span>
//                     </div>
//                 )}

//                 {/* Node List */}
//                 <div className="node-list">
//                     {state.nodes.map(node => (
//                         <button
//                             key={node.id}
//                             onClick={() => handleNodeClick(node.id)}
//                             className={`node-button ${node.id === state.selectedNodeId && viewMode === 'editor' ? 'selected' : ''
//                                 }`}
//                         >
//                             <span className="node-id">[{node.id}]</span>
//                             {node.title}
//                         </button>
//                     ))}
//                 </div>

//                 {/* Controls */}
//                 <div className="sidebar-controls">
//                     <button
//                         onClick={() => setViewMode(viewMode === 'editor' ? 'graph' : 'editor')}
//                         className="btn-control btn-toggle-view"
//                     >
//                         {viewMode === 'editor' ? <LayoutGrid size={20} /> : <FileText size={20} />}
//                         <span>{viewMode === 'editor' ? 'View Graph' : 'Back to Editor'}</span>
//                     </button>
//                     <button
//                         onClick={handleNodeAdd}
//                         className="btn-control btn-add"
//                         title="Add new Node and try to link it to the selected one."
//                     >
//                         <Plus size={20} />
//                         <span>Add New Node</span>
//                     </button>
//                     <button
//                         onClick={handleExport}
//                         className="btn-control btn-export"
//                         disabled={graphIssues.length > 0}
//                     >
//                         <Save size={20} />
//                         <span>Export Story JSON</span>
//                     </button>
//                     {graphIssues.length > 0 && (
//                         <div style={{ color: 'var(--color-red)', fontSize: '0.8rem', textAlign: 'center' }}>
//                             Fix {graphIssues.length} issues before exporting.
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* 2. Main Content: Editor or Graph */}
//             <div className={`main-content ${viewMode === 'graph' ? 'graph-view' : ''}`}>
//                 {state.isLoading ? (
//                     <div style={{ padding: '2rem', textAlign: 'center' }}>
//                         <h3 style={{ color: 'var(--color-text-secondary)' }}>Loading story from Firebase...</h3>
//                     </div>
//                 ) : viewMode === 'editor' && selectedNode ? (
//                     <NodeEditor
//                         node={selectedNode}
//                         nodeIds={allNodeIds}
//                     />
//                 ) : viewMode === 'graph' ? (
//                     <GraphVisualizationWrapper storyNodes={state.nodes} />
//                 ) : (
//                     <div style={{ padding: '2rem', textAlign: 'center' }}>
//                         <h3 style={{ color: 'var(--color-text-secondary)' }}>Select a node or start a new project.</h3>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };




