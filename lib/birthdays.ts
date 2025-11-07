import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "./firebase"
import type { Birthday } from "./types"

const COLLECTION_NAME = "birthdays"

export async function addBirthday(birthday: Omit<Birthday, "id" | "createdAt">) {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...birthday,
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function updateBirthday(id: string, birthday: Partial<Birthday>) {
  const docRef = doc(db, COLLECTION_NAME, id)
  await updateDoc(docRef, birthday)
}

export async function deleteBirthday(id: string) {
  const docRef = doc(db, COLLECTION_NAME, id)
  await deleteDoc(docRef)
}

export async function getBirthdays(userId: string): Promise<Birthday[]> {
  const q = query(collection(db, COLLECTION_NAME), where("userId", "==", userId))
  const querySnapshot = await getDocs(q)

  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Birthday[]
}
