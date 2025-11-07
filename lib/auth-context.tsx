"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
} from "firebase/auth"
import { auth } from "./firebase"
import { createUserProfile } from "./user-profile"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function useAuth() {
  return useContext(AuthContext)
}

function getAuthErrorMessage(errorCode: string, context?: string): string {
  switch (errorCode) {
    case "auth/user-not-found":
      return "No account exists with this email address. Please sign up to create a new account."
    case "auth/wrong-password":
      return "Incorrect password. Please try again or click 'Forgot Password' to reset it."
    case "auth/invalid-email":
      return "Please enter a valid email address."
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support."
    case "auth/too-many-requests":
      return "Too many failed login attempts. Please try again in a few minutes or reset your password."
    case "auth/email-already-in-use":
      return "An account with this email already exists. Please sign in instead."
    case "auth/weak-password":
      return "Password must be at least 6 characters long."
    case "auth/invalid-credential":
      return context === "check"
        ? "No account exists with this email address. Please sign up to create a new account."
        : "Incorrect email or password. Please check your credentials and try again."
    default:
      return "An error occurred. Please try again."
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      // First check if user exists
      const methods = await fetchSignInMethodsForEmail(auth, email)
      if (methods.length === 0) {
        throw new Error("No account exists with this email address. Please sign up to create a new account.")
      }

      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      // If it's our custom error, throw it directly
      if (error.message.includes("No account exists")) {
        throw error
      }
      // Otherwise format the Firebase error
      throw new Error(getAuthErrorMessage(error.code))
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await createUserProfile(result.user.uid, email)
    } catch (error: any) {
      throw new Error(getAuthErrorMessage(error.code))
    }
  }

  const logout = async () => {
    await signOut(auth)
  }

  const resetPassword = async (email: string) => {
    try {
      // Check if account exists first
      const methods = await fetchSignInMethodsForEmail(auth, email)
      if (methods.length === 0) {
        throw new Error(
          "No account exists with this email address. Please check your email or sign up for a new account.",
        )
      }

      await sendPasswordResetEmail(auth, email)
    } catch (error: any) {
      // If it's our custom error, throw it directly
      if (error.message.includes("No account exists")) {
        throw error
      }
      // Otherwise format the Firebase error
      throw new Error(getAuthErrorMessage(error.code))
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    logout,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
