import { db } from "./firebaseConfig";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  FirestoreError,
  writeBatch,
} from "firebase/firestore";

// create a document in the database
export async function createDoc<T extends object>(
  collectionName: string,
  data: T
): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef.id;
  } catch (err) {
    console.error("Error creating document:", (err as FirestoreError).message);
    return null;
  }
}

// read a document from the database
export async function readOneDoc<T>(
  collectionName: string,
  id: string
): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, id);
    const docSnapshot = await getDoc(docRef);
    return docSnapshot.exists() ? (docSnapshot.data() as T) : null;
  } catch (err) {
    console.error("Error reading document:", (err as FirestoreError).message);
    return null;
  }
}

// read all documents from the database
export async function readAllDocs<T>(collectionName: string): Promise<T[]> {
  try {
    if (!collectionName) {
      throw new Error("Collection name is required");
    }

    console.log("Fetching collection:", collectionName);

    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(
      (doc) =>
        ({
          id: doc.id,
          ...doc.data(),
        } as T)
    );
  } catch (err) {
    console.error(
      "Error reading all documents:",
      (err as FirestoreError).message
    );
    return [];
  }
}

// update a document in the database
export async function updateOneDocInDB<T extends object>(
  collectionName: string,
  id: string,
  data: T
): Promise<boolean> {
  try {
    await updateDoc(doc(db, collectionName, id), data);
    return true;
  } catch (err) {
    console.error("Error updating document:", err);
    return false;
  }
}

// delete a document from the database
export async function deleteOneDocFromDB(
  collectionName: string,
  id: string
): Promise<boolean> {
  try {
    await deleteDoc(doc(db, collectionName, id));
    return true;
  } catch (err) {
    console.error("Error deleting document:", (err as FirestoreError).message);
    return false;
  }
}

// delete all documents from the database
export async function deleteAllDocs(collectionName: string): Promise<void> {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const deletePromises = querySnapshot.docs.map((docSnapshot) =>
      deleteDoc(doc(db, collectionName, docSnapshot.id))
    );
    await Promise.all(deletePromises);
  } catch (err) {
    console.error(
      "Error deleting all documents:",
      (err as FirestoreError).message
    );
  }
}

export async function batchCreateDocs<T extends object>(
  collectionName: string,
  dataArray: T[]
): Promise<boolean> {
  try {
    const batch = writeBatch(db);

    dataArray.forEach((item) => {
      const docRef = doc(collection(db, collectionName));
      batch.set(docRef, item);
    });

    await batch.commit();
    return true;
  } catch (err) {
    console.error(
      "Error in batch creating documents:",
      (err as FirestoreError).message
    );
    return false;
  }
}
