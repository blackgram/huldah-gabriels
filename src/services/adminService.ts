import { db } from '../firebase/config';
import { 
//   collection, 
  doc, 
  getDoc, 
//   setDoc, 
//   query, 
//   where, 
//   getDocs 
} from 'firebase/firestore';
// import { getAuth } from 'firebase/auth';

// Check if a user is an admin
export const checkIfUserIsAdmin = async (uid: string): Promise<boolean> => {
  try {
    const adminRef = doc(db, 'admins', uid);
    const adminSnap = await getDoc(adminRef);
    
    return adminSnap.exists();
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Get admin details
export const getAdminDetails = async (uid: string) => {
  try {
    const adminRef = doc(db, 'admins', uid);
    const adminSnap = await getDoc(adminRef);
    
    if (adminSnap.exists()) {
      return adminSnap.data();
    }
    
    return null;
  } catch (error) {
    console.error('Error getting admin details:', error);
    return null;
  }
};

// Check if admin has specific permission
export const checkAdminPermission = async (uid: string, permission: string): Promise<boolean> => {
  try {
    const adminDetails = await getAdminDetails(uid);
    
    if (!adminDetails) return false;
    
    return adminDetails.permissions?.includes(permission) || false;
  } catch (error) {
    console.error('Error checking admin permission:', error);
    return false;
  }
};