/* eslint-disable @typescript-eslint/no-explicit-any */
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, getDoc, query, where, serverTimestamp, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { sendWelcomeEmail } from './emailService';

// Interface for waitlist entry data
export interface WaitlistEntry {
  id?: string;
  email: string;
  name?: string;
  timestamp: any; // Firebase timestamp
  hasBeenContacted?: boolean;
  emailHash?: string;
}

// Interface for email recipient
export interface EmailRecipient {
  email: string;
  name?: string;
}

// Function to add a new email to the waitlist
export const addToWaitlist = async (email: string, name?: string): Promise<string> => {
  try {
    // Create a unique document ID based on the email (for checking duplicates)
    const emailHash = btoa(email).replace(/[+/=]/g, ''); // Simple base64 encoding without special chars
    const waitlistRef = collection(db, 'waitlist');
    
    // Check if email already exists
    const q = query(waitlistRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      throw new Error('Email already exists in waitlist');
    }
    
    // Add to waitlist
    const docRef = await addDoc(waitlistRef, {
      email,
      name: name || '',
      timestamp: serverTimestamp(),
      hasBeenContacted: false,
      emailHash // Store the hash for future reference
    });
    
    // Send welcome email
    try {
      await sendWelcomeEmail(email, name);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // We don't throw this error as we still want to add the user to the waitlist
      // even if the email fails to send
    }
    
    return docRef.id;
  } catch (error: any) {
    console.error('Error adding to waitlist:', error);
    
    // Handle specific Firebase error codes
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please try again later.');
    }
    
    // If we get a Firebase duplicate key error 
    if (error.code === 'already-exists') {
      throw new Error('Email already exists in waitlist');
    }
    
    throw error;
  }
};

// Admin-only functions below
// These will only work for authenticated admin users based on your security rules

// Function to get all waitlist entries
export const getWaitlistEntries = async (): Promise<WaitlistEntry[]> => {
  try {
    const waitlistRef = collection(db, 'waitlist');
    const querySnapshot = await getDocs(waitlistRef);
    
    const entries: WaitlistEntry[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      entries.push({
        id: doc.id,
        email: data.email,
        name: data.name || '',
        timestamp: data.timestamp,
        hasBeenContacted: data.hasBeenContacted || false
      });
    });
    
    // Sort by timestamp (newest first)
    return entries.sort((a, b) => {
      const timeA = a.timestamp?.toDate?.() || new Date(0);
      const timeB = b.timestamp?.toDate?.() || new Date(0);
      return timeB.getTime() - timeA.getTime();
    });
  } catch (error) {
    console.error('Error getting waitlist entries:', error);
    throw error;
  }
};

// Function to get all emails that haven't been contacted yet
export const getUncontactedEmails = async (): Promise<EmailRecipient[]> => {
  try {
    const waitlistRef = collection(db, 'waitlist');
    const q = query(waitlistRef, where('hasBeenContacted', '==', false));
    const querySnapshot = await getDocs(q);
    
    const recipients: EmailRecipient[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      recipients.push({
        email: data.email,
        name: data.name || ''
      });
    });
    
    return recipients;
  } catch (error) {
    console.error('Error getting uncontacted emails:', error);
    throw error;
  }
};

// Function to mark a single email as contacted
export const markEmailAsContacted = async (email: string, emailType: string = 'custom'): Promise<void> => {
  try {
    const waitlistRef = collection(db, 'waitlist');
    const q = query(waitlistRef, where('email', '==', email));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('Email not found in waitlist');
    }
    
    const docSnapshot = querySnapshot.docs[0];
    
    // Update the main document to mark as contacted
    await updateDoc(doc(db, 'waitlist', docSnapshot.id), {
      hasBeenContacted: true
    });
    
    // Add to contact history
    await addDoc(collection(db, 'waitlist', docSnapshot.id, 'contactHistory'), {
      timestamp: serverTimestamp(),
      type: 'email',
      subject: emailType
    });
    
    return;
  } catch (error) {
    console.error('Error marking email as contacted:', error);
    throw error;
  }
};

// Function to mark multiple emails as contacted
export const markEmailsAsContacted = async (emails: string[]): Promise<void> => {
  try {
    for (const email of emails) {
      await markEmailAsContacted(email, 'bulk-email');
    }
  } catch (error) {
    console.error('Error marking emails as contacted:', error);
    throw error;
  }
};

// Function to delete a waitlist entry
export const deleteWaitlistEntry = async (id: string): Promise<void> => {
  try {
    // Check if the document exists
    const docRef = doc(db, 'waitlist', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Waitlist entry not found');
    }
    
    // Delete the main document
    await deleteDoc(docRef);
    
    return;
  } catch (error) {
    console.error('Error deleting waitlist entry:', error);
    throw error;
  }
};

// Function to get a single waitlist entry by ID
export const getWaitlistEntry = async (id: string): Promise<WaitlistEntry | null> => {
  try {
    const docRef = doc(db, 'waitlist', id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data();
    return {
      id: docSnap.id,
      email: data.email,
      name: data.name || '',
      timestamp: data.timestamp,
      hasBeenContacted: data.hasBeenContacted || false
    };
  } catch (error) {
    console.error('Error getting waitlist entry:', error);
    throw error;
  }
};

export default {
  addToWaitlist,
  getWaitlistEntries,
  getUncontactedEmails,
  markEmailAsContacted,
  markEmailsAsContacted,
  deleteWaitlistEntry,
  getWaitlistEntry
};