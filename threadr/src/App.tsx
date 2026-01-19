import React from 'react';
import { AuthProvider, useAuth } from './presentation/context/authContext';
import { StoryProvider } from './presentation/context/StoryContext';
import { ThemeProvider } from './presentation/context/ThemeContext';
import { EditorView } from './presentation/views/editor_view';
import { LoginView } from './presentation/views/LoginView';
import './presentation/styles/editor_styles.css'; // Import global CSS

const MainContent: React.FC = () => {
  const { state } = useAuth();

  if (state.isAuthChecking) {
    return (
      <div style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--color-bg-body)',
        color: 'var(--color-text-muted)'
      }}>
        Loading threadr...
      </div>
    );
  }

  if (!state.user) {
    return <LoginView />;
  }

  return <EditorView />;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StoryProvider>
          <MainContent />
        </StoryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};