/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';

interface WaitlistEntry {
  email: string;
  timestamp: any;
  name?: string;
  hasBeenContacted?: boolean;
}

// Function to add a new email to the waitlist
export const addToWaitlist = async (email: string, name?: string): Promise<string> => {
  try {
    // Check if email already exists
    const emailExists = await checkIfEmailExists(email);
    if (emailExists) {
      throw new Error('Email already exists in waitlist');
    }
    
    // Add new entry
    const docRef = await addDoc(collection(db, 'waitlist'), {
      email,
      name: name || '',
      timestamp: serverTimestamp(),
      hasBeenContacted: false
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    throw error;
  }
};

// Function to check if an email already exists in the waitlist
export const checkIfEmailExists = async (email: string): Promise<boolean> => {
  try {
    const waitlistRef = collection(db, 'waitlist');
    const q = query(waitlistRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking if email exists:', error);
    throw error;
  }
};

// Function to get all waitlist entries
export const getWaitlistEntries = async (): Promise<WaitlistEntry[]> => {
  try {
    const waitlistRef = collection(db, 'waitlist');
    const querySnapshot = await getDocs(waitlistRef);
    
    const entries: WaitlistEntry[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      entries.push({
        email: data.email,
        name: data.name || '',
        timestamp: data.timestamp,
        hasBeenContacted: data.hasBeenContacted || false
      });
    });
    
    return entries;
  } catch (error) {
    console.error('Error getting waitlist entries:', error);
    throw error;
  }
};

// Function to get all emails that haven't been contacted yet
export const getUncontactedEmails = async (): Promise<string[]> => {
  try {
    const waitlistRef = collection(db, 'waitlist');
    const q = query(waitlistRef, where('hasBeenContacted', '==', false));
    const querySnapshot = await getDocs(q);
    
    const emails: string[] = [];
    querySnapshot.forEach((doc) => {
      emails.push(doc.data().email);
    });
    
    return emails;
  } catch (error) {
    console.error('Error getting uncontacted emails:', error);
    throw error;
  }
};

// Function to mark emails as contacted
export const markEmailsAsContacted = async (emails: string[]): Promise<void> => {
  try {
    for (const email of emails) {
      const waitlistRef = collection(db, 'waitlist');
      const q = query(waitlistRef, where('email', '==', email));
      const querySnapshot = await getDocs(q);
      
      querySnapshot.forEach(async (doc) => {
        await addDoc(collection(db, 'waitlist', doc.id, 'contactHistory'), {
          timestamp: serverTimestamp(),
          type: 'email',
          subject: 'Launch Announcement'
        });
      });
    }
  } catch (error) {
    console.error('Error marking emails as contacted:', error);
    throw error;
  }
};

export default {
  addToWaitlist,
  checkIfEmailExists,
  getWaitlistEntries,
  getUncontactedEmails,
  markEmailsAsContacted
};