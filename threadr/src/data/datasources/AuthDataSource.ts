import {
    getAuth,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    onAuthStateChanged as firebaseOnAuthStateChanged,
    type User as FirebaseUser
} from 'firebase/auth';
import { type User } from '../../domain/entities/auth_entities';

/**
 * Low-level Data Source for Firebase Authentication.
 * Interacts directly with the Firebase Auth SDK.
 */
export const FirebaseAuthDataSource = {
    /**
     * Listens to Firebase auth state changes and maps them to our Domain User entity.
     */
    onAuthStateChanged(callback: (user: User | null) => void): () => void {
        const auth = getAuth();
        return firebaseOnAuthStateChanged(auth, (firebaseUser: FirebaseUser | null) => {
            if (firebaseUser) {
                callback({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    isAnonymous: firebaseUser.isAnonymous,
                });
            } else {
                callback(null);
            }
        });
    },

    /**
     * Triggers a Google sign-in flow.
     */
    async signInWithGoogle(): Promise<User> {
        const auth = getAuth();
        const provider = new GoogleAuthProvider();
        const credential = await signInWithPopup(auth, provider);
        const firebaseUser = credential.user;

        return {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            isAnonymous: firebaseUser.isAnonymous,
        };
    },

    /**
     * Signs the user out of the current session.
     */
    async signOut(): Promise<void> {
        const auth = getAuth();
        await firebaseSignOut(auth);
    },

    /**
     * Synchronously gets the current user from the Auth SDK.
     */
    getCurrentUser(): User | null {
        const auth = getAuth();
        const firebaseUser = auth.currentUser;
        if (!firebaseUser) return null;

        return {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            isAnonymous: firebaseUser.isAnonymous,
        };
    }
};