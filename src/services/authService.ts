/* eslint-disable @typescript-eslint/no-explicit-any */
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { store } from '../Redux/store';
import { setLoading, setUser, clearUser, setError } from '../Redux/features/userSlice';

export const loginUser = async (email: string, password: string) => {
  const auth = getAuth();
  const db = getFirestore();
  
  store.dispatch(setLoading(true));
  
  try {
    // Authenticate with Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const { uid } = userCredential.user;
    
    // Get additional user data from Firestore
    const userDocRef = doc(db, 'admins', uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Store the user in Redux
      store.dispatch(setUser({
        uid,
        email,
        ...userData
      }));
      
      return true;
    } else {
      // User is authenticated but not in the admins collection
      await signOut(auth);
      store.dispatch(setError('Not authorized as admin'));
      return false;
    }
  } catch (error: any) {
    store.dispatch(setError(error.message || 'Login failed'));
    return false;
  }
};

export const logoutUser = async () => {
  const auth = getAuth();
  
  try {
    await signOut(auth);
    store.dispatch(clearUser());
    return true;
  } catch (error) {
    console.error('Logout failed:', error);
    return false;
  }
};

// To check if a user's session is valid on app load
export const checkUserSession = async () => {
  const auth = getAuth();
  const db = getFirestore();
  
  store.dispatch(setLoading(true));
  
  return new Promise<boolean>(resolve => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          // Get additional user data from Firestore
          const userDocRef = doc(db, 'admins', user.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // Store the user in Redux
            store.dispatch(setUser({
              uid: user.uid,
              email: user.email,
              ...userData
            }));
            
            resolve(true);
          } else {
            store.dispatch(clearUser());
            resolve(false);
          }
        } catch (error) {
          store.dispatch(clearUser());
          resolve(false);
        }
      } else {
        store.dispatch(clearUser());
        resolve(false);
      }
      
      unsubscribe();
    });
  });
};