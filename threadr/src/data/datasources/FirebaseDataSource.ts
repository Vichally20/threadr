import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { type StoryNode } from '../../domain/entities/story';

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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Defines the collection structure: stories/{storyId}/nodes/{nodeId}
const getCollectionRef = (storyId: string) => 
  collection(db, `stories/${storyId}/nodes`);

export const FirebaseDataSource = {
  /**
   * Fetches all nodes for a given story from Firestore.
   */
  async fetchNodes(storyId: string): Promise<StoryNode[]> {
    try {
        const querySnapshot = await getDocs(getCollectionRef(storyId));
        
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
  async saveNode(storyId: string, node: StoryNode): Promise<void> {
    try {
        const docRef = doc(getCollectionRef(storyId), node.id);
        // Use setDoc with merge:true to avoid overwriting the entire document
        await setDoc(docRef, node as any, { merge: true }); // Cast to 'any' for simpler Firestore interaction
    } catch (e) {
        console.error(`Error saving node ${node.id}:`, e);
        throw new Error("Failed to save node to Firestore.");
    }
  },

  /**
   * Deletes a node.
   */
  async deleteNode(storyId: string, nodeId: string): Promise<void> {
    try {
        const docRef = doc(getCollectionRef(storyId), nodeId);
        await deleteDoc(docRef);
    } catch (e) {
        console.error(`Error deleting node ${nodeId}:`, e);
        throw new Error("Failed to delete node from Firestore.");
    }
  },

  /**
   * Saves a list of nodes (used primarily for initial synchronization).
   */
  async saveBulkNodes(storyId: string, nodes: StoryNode[]): Promise<void> {
    await Promise.all(nodes.map(node => this.saveNode(storyId, node)));
  }
};