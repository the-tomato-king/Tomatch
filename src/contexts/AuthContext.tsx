import React, { createContext, useState, useEffect, useContext } from "react";
import { auth } from "../services/firebase/firebaseConfig";
import AsyncStorage from '@react-native-async-storage/async-storage';
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

const ONBOARDING_COMPLETE_KEY = 'onboarding_complete';

export type UnauthenticatedState = {
  user: null;
  userId: null;
  isLoading: boolean;
  isEmailVerified: false;
  hasCompletedOnboarding: boolean;
  markOnboardingComplete: () => Promise<void>;
};

export type AuthenticatedState = {
  user: User;
  userId: string;
  isLoading: boolean;
  isEmailVerified: true;
  hasCompletedOnboarding: boolean;
  markOnboardingComplete: () => Promise<void>;
  logout: () => Promise<void>;
};

type AuthContextType = UnauthenticatedState | AuthenticatedState;

export const AuthContext = createContext<AuthContextType>({
  user: null,
  userId: null,
  isLoading: true,
  isEmailVerified: false,
  hasCompletedOnboarding: false,
  markOnboardingComplete: async () => {},
});

// type guard function
function isAuthenticated(state: AuthContextType): state is AuthenticatedState {
  return state.user !== null;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  // when used in the App screen, we know that the user is definitely logged in
  if (isAuthenticated(context)) {
    return context; // TypeScript knows that here the return type is AuthenticatedState
  }

  return context; // TypeScript knows that here the return type is UnauthenticatedState
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previousEmail, setPreviousEmail] = useState<string | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Check if onboarding has been completed
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
        setHasCompletedOnboarding(value === 'true');
      } catch (error) {
        console.error("Error reading onboarding status:", error);
      }
    };
    
    checkOnboardingStatus();
  }, []);

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
      setIsLoading(false); // important: set the loading state to false
    });

    return () => unsubscribe();
  }, []);

  const markOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setPreviousEmail(null);
    } catch (error) {
      console.error("Error during logout:", error);
      throw error;
    }
  };

  // construct the context value based on the current state
  const value: AuthContextType = user
    ? {
        // authenticated state
        user,
        userId: user.uid,
        isLoading,
        isEmailVerified: true,
        hasCompletedOnboarding,
        markOnboardingComplete,
        logout,
      }
    : {
        // unauthenticated state
        user: null,
        userId: null,
        isLoading,
        isEmailVerified: false,
        hasCompletedOnboarding,
        markOnboardingComplete,
      };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};