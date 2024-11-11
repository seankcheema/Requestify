// DJContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DJContextProps {
    djName: string;
    setDJName: (name: string) => void;
}



const DJContext = createContext<DJContextProps | undefined>(undefined);

export const DJProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [djName, setDJName] = useState(() => localStorage.getItem('djName') || 'DJ Grant');

    useEffect(() => {
        localStorage.setItem('djName', djName);
    }, [djName]);

    return (
        <DJContext.Provider value={{ djName, setDJName }}>
            {children}
        </DJContext.Provider>
    );
};

export const useDJ = (): DJContextProps => {
    const context = useContext(DJContext);
    if (!context) {
        throw new Error('useDJ must be used within a DJProvider');
    }
    return context;
};

interface DisplayNameContextProps {
    displayName: string;
    setDisplayName: (name: string) => void;
}

const DisplayNameContext = createContext<DisplayNameContextProps | undefined>(undefined);

export const DisplayNameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [displayName, setDisplayName] = useState('Default Display Name');

    return (
        <DisplayNameContext.Provider value={{ displayName, setDisplayName }}>
            {children}
        </DisplayNameContext.Provider>
    );
};

export const useDisplayName = (): DisplayNameContextProps => {
    const context = useContext(DisplayNameContext);
    if (!context) {
        throw new Error('useDisplayName must be used within a DisplayNameProvider');
    }
    return context;
};