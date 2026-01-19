import { type IAuthRepository } from '../../domain/repositories/IAuthRepositories';
import { type User } from '../../domain/entities/auth_entities';
import { FirebaseAuthDataSource } from '../datasources/AuthDataSource';

/**
 * Concrete implementation of IAuthRepository.
 * Bridges the Domain Layer and the Firebase Data Source.
 */
export class AuthRepositoryImpl implements IAuthRepository {
    /**
     * Proxies the auth state change listener to the data source.
     */
    onAuthStateChanged(callback: (user: User | null) => void): () => void {
        return FirebaseAuthDataSource.onAuthStateChanged(callback);
    }

    /**
     * Triggers Google sign-in via the data source.
     */
    async signInWithGoogle(): Promise<User> {
        return FirebaseAuthDataSource.signInWithGoogle();
    }

    /**
     * Triggers sign-out via the data source.
     */
    async signOut(): Promise<void> {
        return FirebaseAuthDataSource.signOut();
    }

    /**
     * Retrieves the current user snapshot.
     */
    async getCurrentUser(): Promise<User | null> {
        return FirebaseAuthDataSource.getCurrentUser();
    }
}