import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs, deleteDoc, getDoc } from 'firebase/firestore';
import { type StoryNode, type CustomStat } from '../../domain/entities/story';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
  measurementId: import.meta.env.VITE_MEASUREMENT_ID
};

// Initialize Firebase App and Firestore instance
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

// Defines the collection structure: stories/{storyId}/nodes/{nodeId}
const getCollectionRef = (userId: string, storyId: string) =>
  collection(db, `users/${userId}/stories/${storyId}/nodes`);

// Defines the configuration document path for global settings (like stats)
const CONFIG_DOC_ID = 'config';

const getStatDocRef = (userId: string, storyId: string) =>
  doc(db, `users/${userId}/stories/${storyId}/config`, CONFIG_DOC_ID); // Using a subcollection 'config' for better structure

export const FirebaseDataSource = {
  /**
   * Fetches all nodes for a given story from Firestore.
   */
  async fetchNodes(userId: string, storyId: string): Promise<StoryNode[]> {
    try {
      const querySnapshot = await getDocs(getCollectionRef(userId, storyId));

      // Map Firestore documents back to the StoryNode interface
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as StoryNode));
    } catch (e) {
      console.error("Error fetching nodes:", e);
      return [];
    }
  },

  /**
   * Saves or updates a single node using its ID as the document key.
   * This is the primary function for CRUD operations.
   */
  async saveNode(userId: string, storyId: string, node: StoryNode): Promise<void> {
    try {
      const docRef = doc(getCollectionRef(userId, storyId), node.id);
      // Use setDoc with merge:true to avoid overwriting the entire document
      await setDoc(docRef, node, { merge: true });
    } catch (e) {
      console.error(`Error saving node ${node.id}:`, e);
      throw new Error("Failed to save node to Firestore.");
    }
  },

  /**
   * Deletes a node.
   */
  async deleteNode(userId: string, storyId: string, nodeId: string): Promise<void> {
    try {
      const docRef = doc(getCollectionRef(userId, storyId), nodeId);
      await deleteDoc(docRef);
    } catch (e) {
      console.error(`Error deleting node ${nodeId}:`, e);
      throw new Error("Failed to delete node from Firestore.");
    }
  },

  /**
   * Saves a list of nodes (used primarily for initial synchronization).
   */
  async saveBulkNodes(userId: string, storyId: string, nodes: StoryNode[]): Promise<void> {
    for (const node of nodes) {
      await this.saveNode(userId, storyId, node);
    }
  },
  /**
  * Fetches the stat configuration document.
  */
  async fetchStatConfig(userId: string, storyId: string): Promise<CustomStat[]> {
    try {
      const docRef = getStatDocRef(userId, storyId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        // The stats are stored as an array under the 'stats' field
        return data.stats || [];
      }
      return [];
    } catch (e) {
      console.error("Error fetching stat config:", e);
      throw new Error("Failed to load stat configuration from Firestore.");
    }
  },

  async saveStatConfig(userId: string, storyId: string, stats: CustomStat[]): Promise<void> {
    try {
      const docRef = getStatDocRef(userId, storyId);
      // We save the entire array inside a field named 'stats'
      await setDoc(docRef, { stats: stats }, { merge: true });
    } catch (e) {
      console.error("Error saving stat config:", e);
      throw new Error("Failed to save stat configuration to Firestore.");
    }
  }
};