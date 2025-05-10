import React, { createContext, useState, useEffect } from 'react';
import axios from '../api/axios';
import { jwtDecode } from 'jwt-decode'; // jwt-decode kullanıyorsanız

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Bu satırı ekledik

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (token) {
            // Token varsa kullanıcıyı al
            fetchUserProfile(token);
        } else {
            logout(); // token yoksa temizle
            setLoading(false);
        }
    }, []);

    const fetchUserProfile = async (token) => {
        try {
            const response = await axios.get('/api/auth/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            setUser(response.data);
            setIsAuthenticated(true); // <-- BUNU EKLE
            setLoading(false);
        } catch (error) {
            console.error('Kullanıcı profili alınamadı:', error);
            logout();
            setLoading(false);
        }
    };

    const login = async (username, password) => {
        try {
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/signin`, {
                username,
                password
            });

            localStorage.setItem('token', res.data.accessToken);

            setUser({
                id: res.data.id,
                username: res.data.username,
                email: res.data.email,
                roles: res.data.roles
            });

            setIsAuthenticated(true);
            return { success: true };
        } catch (err) {
            // Hata durumunda detaylı bilgi döndür
            return {
                success: false,
                error: err.response?.data?.message || 'Giriş başarısız',
                status: err.response?.status
            };
        }
    };


    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false); // Artık tanımlı
    };

    const register = async (userData) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/signup`, userData);
            return { success: true, data: response.data };
        } catch (error) {
            return { success: false, error: error.response?.data?.message || 'Kayıt başarısız' };
        }
    };

    const value = {
        user,
        login,
        logout,
        loading
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                loading,
                login,
                logout,
                setIsAuthenticated, // Provider'a ekledik
                register
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};


export default AuthContext;