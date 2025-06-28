// import { createContext, useState, useContext, useEffect } from 'react';
// import { jwtDecode } from 'jwt-decode';

// const AuthContext = createContext();

// export function useAuth() {
//   return useContext(AuthContext);
// }

// export function AuthProvider({ children }) {
//   const [authToken, setAuthToken] = useState(() => localStorage.getItem('authToken'));
//   const [currentUser, setCurrentUser] = useState(null);

//   useEffect(() => {
//     if (authToken) {
//       try {
//         const decoded = jwtDecode(authToken);
//         setCurrentUser({ username: decoded.sub });
//         localStorage.setItem('authToken', authToken);
//       } catch (error) {
//         setCurrentUser(null);
//         localStorage.removeItem('authToken');
//       }
//     } else {
//         setCurrentUser(null);
//         localStorage.removeItem('authToken');
//     }
//   }, [authToken]);

//   const login = (token) => {
//     setAuthToken(token);
//   };

//   const logout = () => {
//     setAuthToken(null);
//   };

//   const value = {
//     currentUser,
//     login,
//     logout,
//     isAuthenticated: !!currentUser,
//   };

//   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
// }



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
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Check if token is expired
        if (decoded.exp * 1000 > Date.now()) {
          setCurrentUser({ username: decoded.sub });
        } else {
          // Token expired, clear it
          localStorage.removeItem('authToken');
          setCurrentUser(null);
        }
      } catch (error) {
        localStorage.removeItem('authToken');
        setCurrentUser(null);
      }
    }
  }, [authToken]);

  // THIS IS THE FIX. IT'S NOW ASYNC.
  const login = (token) => {
    localStorage.setItem('authToken', token);
    const decoded = jwtDecode(token);
    setCurrentUser({ username: decoded.sub });
    setAuthToken(token); // Trigger re-render for components that use the token
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setCurrentUser(null);
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