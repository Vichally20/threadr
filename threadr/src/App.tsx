import React from 'react';
import { StoryProvider } from './presentation/context/StoryContext';
import { EditorView } from './presentation/views/editor_view';
import './presentation/styles/editor_styles.css'; // Import global CSS

export const App: React.FC = () => {
  return (
    <StoryProvider>
      <EditorView />
    </StoryProvider>
  );
};