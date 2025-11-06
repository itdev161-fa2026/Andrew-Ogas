import { useState, useEffect } from "react";
import { jwtDecode } from 'jwt-decode';
import { registerUser as registerUserAPI, loginUser as loginUserAPI } from '../services/api';
import { AuthContext } from './authContext';

//AuthProvider component to wrap the app
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    //Check for existing token on app load
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            try {
                // Decode token to get user info
                const decoded = jwtDecode(storedToken);

                // Check if token is expired
                if (decoded.exp * 1000 < Date.now()) {
                    // Token expired, clear it
                    localStorage.removeItem('token');
                    setLoading(false);
                } else {
                    // Token is valid, set user and token
                    setToken(storedToken);
                    setUser(decoded.user);
                    setLoading(false);
                }
            } catch (err) {
                console.error('Error decoding token:', err);
                localStorage.removeItem('token');
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    }, []);

    //Register function
    const register = async (name, email, password) => {
        try {
            setError(null);
            setLoading(true);

            // Call API to register user
            const data = await registerUserAPI(name, email, password);

            // Store token in localStorage
            localStorage.setItem('token', data.token);

            // Decode token to get user info
            const decoded = jwtDecode(data.token);

            // Update state
            setToken(data.token);
            setUser(decoded.user);
            setLoading(false);

            return { success: true };
        } catch (err) {
            const errorMsg = err.response?.data?.errors?.[0]?.msg || 'Registration failed';
            setError(errorMsg);
            setLoading(false);
            return { success: false, error: errorMsg };
        }
    };

    // Login function
    const login = async (email, password) => {
        try{
            setError(null);
            setLoading(true);

            // Call API to login user
            const data = await loginUserAPI(email, password);

            // Store token in localStorage
            localStorage.setItem('token', data.token);

            // Decode token to get user info
            const decoded = jwtDecode(data.token);

            // Update state
            setToken(data.token);
            setUser(decoded.user);
            setLoading(false);

            return { success: true };
        } catch (err) {
            const errorMsg = err.response?.data?.errors?.[0]?.msg || 'Login failed';
            setError(errorMsg);
            setLoading(false);
            
            return { success: false, error: errorMsg };
        }
    };

    // Logout fuction
    const logout = () => {
        // Remove token from localStorage
        localStorage.removeItem('token');

        // Clear state
        setToken(null);
        setUser(null);
        setError(null);
    };

    // Context value to provide
    const value = {
        user,
        token,
        loading,
        error,
        register,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};