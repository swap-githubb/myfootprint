import { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken'));
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    if (authToken) {
      try {
        const decoded = jwtDecode(authToken);
        setCurrentUser({ username: decoded.sub });
        localStorage.setItem('authToken', authToken);
      } catch (error) {
        setCurrentUser(null);
        localStorage.removeItem('authToken');
      }
    } else {
        setCurrentUser(null);
        localStorage.removeItem('authToken');
    }
  }, [authToken]);

  const login = (token) => {
    setAuthToken(token);
  };

  const logout = () => {
    setAuthToken(null);
  };

  const value = {
    currentUser,
    login,
    logout,
    isAuthenticated: !!currentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}