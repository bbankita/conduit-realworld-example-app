import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import getUser from "../services/getUser";
import userLogout from "../services/userLogout";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

const loggedIn = JSON.parse(localStorage.getItem("loggedUser"));

const authState = {
  headers: null,
  isAuth: false,
  loggedUser: {
    bio: null,
    email: "",
    image: null,
    token: "",
    username: "",
  },
};

function AuthProvider({ children }) {
  const [{ headers, isAuth, loggedUser }, setAuthState] = useState(
    loggedIn || authState,
  );

  // A 401 on a request that sent a token means the token expired or is invalid
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(undefined, (error) => {
      const sentToken = error.config?.headers?.Authorization;
      if (error.response?.status === 401 && sentToken) setAuthState(userLogout);

      return Promise.reject(error);
    });

    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  useEffect(() => {
    if (!headers) return;

    getUser({ headers })
      .then((loggedUser) => setAuthState((prev) => ({ ...prev, loggedUser })))
      .catch(console.error);
  }, [headers, setAuthState]);

  return (
    <AuthContext.Provider value={{ headers, isAuth, loggedUser, setAuthState }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
