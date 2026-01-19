import React, { createContext, useReducer, useContext, useEffect, useCallback, useMemo } from 'react';
import { type User } from '../../domain/entities/auth_entities';
import { AuthRepositoryImpl } from '../../data/repositories/AuthRepositoryImpl';

export interface AuthState {
    user: User | null;
    isAuthChecking: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    isAuthChecking: true,
    isLoading: false,
    error: null,
};

type AuthAction =
    | { type: 'SET_USER'; payload: User | null }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
    switch (action.type) {
        case 'SET_USER':
            return { ...state, user: action.payload, isAuthChecking: false };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        default:
            return state;
    }
};

export interface AuthContextType {
    state: AuthState;
    signInWithGoogle: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Manages the global authentication state of the application.
 * Decouples the user session from story data logic.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // UseMemo ensures we only create one instance of the repository
    const authRepo = useMemo(() => new AuthRepositoryImpl(), []);

    useEffect(() => {
        // Set up the listener for Firebase Auth changes
        const unsubscribe = authRepo.onAuthStateChanged((user) => {
            dispatch({ type: 'SET_USER', payload: user });
        });

        return () => unsubscribe();
    }, [authRepo]);

    const signInWithGoogle = useCallback(async () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            await authRepo.signInWithGoogle();
        } catch (e: any) {
            console.error("Sign in error:", e);
            let errorMessage = "Authentication failed. Please check your connection.";

            if (e.code === 'auth/popup-closed-by-user') {
                errorMessage = "Sign-in cancelled by user.";
            } else if (e.message) {
                errorMessage = e.message;
            }

            dispatch({ type: 'SET_ERROR', payload: errorMessage });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [authRepo]);

    const signOut = useCallback(async () => {
        try {
            await authRepo.signOut();
        } catch (e) {
            dispatch({ type: 'SET_ERROR', payload: "Sign out failed." });
        }
    }, [authRepo]);

    const authvalue = useMemo(() => ({
        state,
        signInWithGoogle,
        signOut
    }), [state, signInWithGoogle, signOut]);

    return (
        <AuthContext.Provider value={authvalue}>
            {children}
        </AuthContext.Provider>
    );

};

/**
 * Hook to access the authentication state and actions.
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};