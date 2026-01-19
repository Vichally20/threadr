import React from 'react';
import { useAuth } from '../context/authContext';
import '../styles/login_styles.css';
import { Sparkles, ArrowRight } from 'lucide-react';

export const LoginView: React.FC = () => {
    const { signInWithGoogle, state } = useAuth();
    const { isLoading, error } = state;

    const handleLogin = async () => {
        await signInWithGoogle();
    };

    return (
        <div className="login-container">
            <div className="login-bg-shape" />

            <div className="login-card">
                <div>
                    <div className="login-logo">
                        Threadr
                    </div>
                    <div className="login-title">Weave Your Story</div>
                </div>

                <p className="login-subtitle">
                    Enter a world of interactive storytelling. <br />
                    Create, visualize, and share your narratives with ease.
                </p>

                {error && (
                    <div style={{ color: 'var(--color-danger)', fontSize: '0.9rem' }}>
                        {error}
                    </div>
                )}

                <button
                    className="login-button"
                    onClick={handleLogin}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <>
                            <div className="loading-spinner" />
                            Connecting...
                        </>
                    ) : (
                        <>
                            <Sparkles size={18} />
                            Continue with Google
                            <ArrowRight size={18} style={{ marginLeft: '4px' }} />
                        </>
                    )}
                </button>

                <div className="footer-text">
                    Sign in with Google to start creating.
                </div>
            </div>
        </div>
    );
};
