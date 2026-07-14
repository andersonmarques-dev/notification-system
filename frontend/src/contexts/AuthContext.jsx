import React, { createContext, useState, useEffect, useContext } from 'react';
import { api, getToken, setToken, clearToken } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Ao carregar a página, se houver um token salvo, valida-o buscando o usuário atual
    useEffect(() => {
        if (!getToken()) {
            setLoading(false);
            return;
        }

        api.get('/user')
            .then(response => setUser(response.data))
            .catch(() => {
                clearToken();
                setUser(null);
            })
            .finally(() => setLoading(false));
    }, []);

    const login = async (email, password) => {
        const response = await api.post('/login', { email, password });
        const token = response.data?.token;
        const userData = response.data?.user;

        if (!token || !userData) {
            throw new Error('Resposta inválida do servidor.');
        }

        setToken(token);
        setUser(userData);
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } finally {
            clearToken();
            setUser(null);
        }
    };

    const registerUser = async (tenant_name, user_name, email, password, password_confirmation) => {
        const response = await api.post('/register', {
            tenant_name,
            user_name,
            email,
            password,
            password_confirmation
        });

        const token = response.data?.token;
        const userData = response.data?.user;

        if (!token || !userData) {
            throw new Error('Resposta inválida do servidor.');
        }

        setToken(token);
        setUser(userData);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, registerUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider.');
    }
    return context;
};
