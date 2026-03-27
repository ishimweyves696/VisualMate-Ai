import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc,
  updateDoc,
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { VisualData, UserSubscription, UserSettings, AppAnalytics } from '../types';
import { deleteImage } from './storageService';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
  }
}
testConnection();

// Visuals
export const saveVisual = async (visual: VisualData) => {
  const path = `visuals/${visual.id}`;
  try {
    await setDoc(doc(db, 'visuals', visual.id), {
      ...visual,
      authorId: auth.currentUser?.uid
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const deleteVisual = async (visualId: string) => {
  const path = `visuals/${visualId}`;
  try {
    await deleteDoc(doc(db, 'visuals', visualId));
    // Also try to delete the image from storage
    await deleteImage(`visuals/${visualId}.png`);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
};

export const subscribeToUserVisuals = (userId: string, callback: (visuals: VisualData[]) => void) => {
  const path = 'visuals';
  const q = query(
    collection(db, path), 
    where('authorId', '==', userId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const visuals = snapshot.docs.map(doc => doc.data() as VisualData);
    callback(visuals);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
};

// User Profile & Subscription
export const getUserData = async (userId: string): Promise<{ subscription?: UserSubscription; settings?: UserSettings; analytics?: AppAnalytics } | null> => {
  const path = `users/${userId}`;
  try {
    const userSnap = await getDoc(doc(db, 'users', userId));
    if (userSnap.exists()) {
      const data = userSnap.data();
      return {
        subscription: data.subscription as UserSubscription,
        settings: data.settings as UserSettings,
        analytics: data.analytics as AppAnalytics
      };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

export const getUserSubscription = async (userId: string): Promise<UserSubscription | null> => {
  const path = `users/${userId}`;
  try {
    const userSnap = await getDoc(doc(db, 'users', userId));
    if (userSnap.exists()) {
      return userSnap.data().subscription as UserSubscription;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

export const updateUserSubscription = async (userId: string, subscription: UserSubscription) => {
  const path = `users/${userId}`;
  try {
    await updateDoc(doc(db, 'users', userId), { subscription });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const updateUserProfile = async (userId: string, data: { name?: string; photoURL?: string }) => {
  const path = `users/${userId}`;
  try {
    await updateDoc(doc(db, 'users', userId), {
      displayName: data.name,
      photoURL: data.photoURL
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
  const path = `users/${userId}`;
  try {
    const userSnap = await getDoc(doc(db, 'users', userId));
    if (userSnap.exists()) {
      return userSnap.data().settings as UserSettings;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

export const updateUserSettings = async (userId: string, settings: UserSettings) => {
  const path = `users/${userId}`;
  try {
    await updateDoc(doc(db, 'users', userId), { settings });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};

export const getUserAnalytics = async (userId: string): Promise<AppAnalytics | null> => {
  const path = `users/${userId}`;
  try {
    const userSnap = await getDoc(doc(db, 'users', userId));
    if (userSnap.exists()) {
      return userSnap.data().analytics as AppAnalytics;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
};

export const updateUserAnalytics = async (userId: string, analytics: AppAnalytics) => {
  const path = `users/${userId}`;
  try {
    await updateDoc(doc(db, 'users', userId), { analytics });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
};
