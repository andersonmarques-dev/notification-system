import React, { createContext, useState, useEffect, useContext } from 'react';
import { api, web } from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Verifica se a sessão já existe ao carregar a página
    useEffect(() => {
        api.get('/user')
            .then(response => setUser(response.data))
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, []);

    const login = async (email, password) => {
        // 1. Solicita o cookie de proteção contra XSS/CSRF
        await web.get('/sanctum/csrf-cookie');

        // 2. Envia as credenciais
        await api.post('/login', { email, password });

        // 3. Recupera os dados do usuário atrelados à nova sessão
        const response = await api.get('/user');
        setUser(response.data);
    };

    const logout = async () => {
        await api.post('/logout');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);