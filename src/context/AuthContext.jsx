import {createContext,useContext, useState} from 'react';

const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const[isLoggedIn,setIsLoggedIn] = useState(
        !!localStorage.getItem('token')
    );
    const login = (token) => {
        localStorage.setItem('token', token);
        setIsLoggedIn(true);
    };
    const logoutUser = () => {
        localStorage.removeItem('token');
        setIsLoggedIn(false);
    };
    return (
        <AuthContext.Provider value={{isLoggedIn, login, logoutUser}}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);