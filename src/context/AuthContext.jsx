import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import { auth } from "../services/firebase";

// Create a "box" that holds login info so any page can read it
const AuthContext = createContext();

// Any component can call this to get the current user info
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true); // wait until Firebase tells us who is logged in

  // Create a new account with email and password
  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  // Log in with an existing email and password
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Log the current user out
  function logout() {
    return signOut(auth);
  }

  // Runs once when the app starts — listens for login/logout changes from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user); // save the logged-in user (or null if logged out)
      setLoading(false);    // Firebase has replied, we can now show the app
    });

    return unsubscribe; // stop listening when the component is removed
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children} {/* don't show anything until Firebase responds */}
    </AuthContext.Provider>
  );
}
