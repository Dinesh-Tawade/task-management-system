import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Set base URL for APIs
axios.defaults.baseURL = '/api/v1';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Synchronize token changes
    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Fetch current authenticated user if not set
            if (!user) {
                axios.get('/user')
                    .then(response => {
                        // Response returns the standard user, but let's fetch complete details
                        setUser(response.data);
                    })
                    .catch(() => {
                        logout();
                    })
                    .finally(() => {
                        setLoading(false);
                    });
            } else {
                setLoading(false);
            }
        } else {
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
            setLoading(false);
        }
    }, [token]);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const response = await axios.post('/login', { email, password });
            setToken(response.data.access_token);
            setUser(response.data.user);
            return response.data.user;
        } catch (error) {
            throw error.response?.data || new Error('Login failed');
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            await axios.post('/logout');
        } catch (e) {
            // Ignore logout errors
        } finally {
            setToken(null);
            setUser(null);
        }
    };

    const hasRole = (role) => {
        return user?.roles?.includes(role) || false;
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, hasRole, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
