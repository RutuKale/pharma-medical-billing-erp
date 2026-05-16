import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";

import {
  auth,
  provider,
} from "../firebase/firebase";

const AuthContext =
  createContext();

export const AuthProvider = ({
  children,
}) => {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  // GOOGLE LOGIN

  const loginWithGoogle =
    async () => {
      try {
        const result =
          await signInWithPopup(
            auth,
            provider
          );

        setUser(result.user);

        return {
          success: true,
        };
      } catch (error) {
        console.error(error);

        return {
          success: false,
          message: error.message,
        };
      }
    };

  // EMAIL LOGIN

  const loginWithEmail =
    async (email, password) => {
      try {
        const result =
          await signInWithEmailAndPassword(
            auth,
            email,
            password
          );

        setUser(result.user);

        return {
          success: true,
        };
      } catch (error) {
        console.error(error);

        return {
          success: false,
          message: error.message,
        };
      }
    };

  // REGISTER

  const registerWithEmail =
    async (email, password) => {
      try {
        const result =
          await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );

        setUser(result.user);

        return {
          success: true,
        };
      } catch (error) {
        console.error(error);

        return {
          success: false,
          message: error.message,
        };
      }
    };

  // LOGOUT

  const logout = async () => {
    try {
      await signOut(auth);

      setUser(null);
    } catch (error) {
      console.error(error);
    }
  };

  // SESSION

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (currentUser) => {
          setUser(currentUser);

          setLoading(false);
        }
      );

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () =>
  useContext(AuthContext);