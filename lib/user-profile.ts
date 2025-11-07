import { doc, setDoc, getDoc } from "firebase/firestore"
import { db } from "./firebase"

export interface UserProfile {
  email: string
  userId: string
  createdAt: number
}

export async function createUserProfile(userId: string, email: string) {
  await setDoc(doc(db, "users", userId), {
    email,
    userId,
    createdAt: Date.now(),
  })
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const docSnap = await getDoc(doc(db, "users", userId))
  if (docSnap.exists()) {
    return docSnap.data() as UserProfile
  }
  return null
}
