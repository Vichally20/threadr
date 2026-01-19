import { type User } from '../entities/auth_entities';

/**
 * The contract for authentication operations.
 * Decouples the application from specific auth providers (e.g. Firebase Auth).
 */
export interface IAuthRepository {
    /**
     * Retrieves the currently authenticated user, or null if not logged in.
     */
    getCurrentUser(): Promise<User | null>;

    /**
     * Signs in a user using Google.
     */
    signInWithGoogle(): Promise<User>;

    /**
     * Signs out the current user.
     */
    signOut(): Promise<void>;

    /**
     * Subscribes to auth state changes.
     */
    onAuthStateChanged(callback: (user: User | null) => void): () => void;
}
