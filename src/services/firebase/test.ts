import { db } from './firebaseConfig'; 
import { collection, addDoc } from 'firebase/firestore';

export async function testFirestoreConnection() {
  try {
    const docRef = await addDoc(collection(db, 'test-collection'), {
      name: 'Test',
      age: 30,
    });
    console.log('Document written with ID:', docRef.id);
  } catch (e) {
    console.error('Error adding document:', e);
  }
}

testFirestoreConnection();
