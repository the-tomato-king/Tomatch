import React, { createContext, useState, useEffect, useContext } from "react";
import { auth } from "../services/firebase/firebaseConfig";
import { onAuthStateChanged, User, signOut } from "firebase/auth";

export const AuthContext = createContext<{
  user: User | null;
  userId: string | undefined;
  isLoading: boolean;
  logout: () => Promise<void>;
}>({
  user: null,
  userId: undefined,
  isLoading: true,
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

  // 3. check authentication status after loading
  if (!context.userId) {
    throw new Error("User not authenticated");
  }

  return context as {
    user: User;
    userId: string;
    isLoading: boolean;
    logout: () => Promise<void>;
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const userId = user?.uid;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userId,
        isLoading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
