import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserContextProps {
    scannedDJName: string;
    setScannedDJName: (name: string) => void;
    scannedDisplayName: string;
    setScannedDisplayName: (name: string) => void;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [scannedDJName, setScannedDJName] = useState('');
    const [scannedDisplayName, setScannedDisplayName] = useState('');

    return (
        <UserContext.Provider
            value={{ scannedDJName, setScannedDJName, scannedDisplayName, setScannedDisplayName }}
        >
            {children}
        </UserContext.Provider>
    );
};

export const useUser = (): UserContextProps => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
