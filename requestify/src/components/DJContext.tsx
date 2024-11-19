import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface DJContextProps {
    djName: string;
    setDJName: (name: string) => void;
    displayName: string;
    setDisplayName: (name: string) => void;
}

const DJContext = createContext<DJContextProps | undefined>(undefined);

export const DJProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [djName, setDJName] = useState(localStorage.getItem('djName') || ''); // Initialize with localStorage
    const [displayName, setDisplayName] = useState(localStorage.getItem('displayName') || ''); // Initialize with localStorage

    useEffect(() => {
        if (djName) {
            localStorage.setItem('djName', djName); // Save to localStorage
        }
        if (displayName) {
            localStorage.setItem('displayName', displayName); // Save to localStorage
        }
    }, [djName, displayName]);

    return (
        <DJContext.Provider value={{ djName, setDJName, displayName, setDisplayName }}>
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
