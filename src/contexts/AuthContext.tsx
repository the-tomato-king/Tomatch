import React, { createContext, useState, useEffect, useContext } from "react";
import { auth } from "../services/firebase/firebaseConfig";
import {
  onAuthStateChanged,
  User,
  signOut,
  sendEmailVerification,
} from "firebase/auth";
import { Alert } from "react-native";
import {
  updateOneDocInDB,
  readOneDoc,
} from "../services/firebase/firebaseHelper";
import { COLLECTIONS } from "../constants/firebase";

export const AuthContext = createContext<{
  user: User | null;
  userId: string | undefined;
  isLoading: boolean;
  isEmailVerified: boolean;
  logout: () => Promise<void>;
}>({
  user: null,
  userId: undefined,
  isLoading: true,
  isEmailVerified: false,
  logout: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);

  // 1. check if context exists
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  // 2. if still loading, don't throw authentication error
  if (context.isLoading) {
    return context;
  }

  // 3. no longer throw authentication error, return current state
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previousEmail, setPreviousEmail] = useState<string | null>(null);

  const userId = user?.uid;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        if (currentUser.emailVerified) {
          // 1. get user data from Firestore
          const userData = await readOneDoc<User>(
            COLLECTIONS.USERS,
            currentUser.uid
          );

          // 2. if the email in Firestore is different from the current email, it means the email has been updated
          if (userData && userData.email !== currentUser.email) {
            await signOut(auth);
            Alert.alert(
              "Email Changed",
              "Your email has been updated. Please log in again with your new email."
            );
            return;
          }

          setUser(currentUser);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
      setPreviousEmail(null);
    } catch (error) {
      console.error("Error during logout:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userId,
        isLoading,
        isEmailVerified: user?.emailVerified || false,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
