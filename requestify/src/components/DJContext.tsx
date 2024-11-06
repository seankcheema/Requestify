// DJContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DJContextProps {
    djName: string;
    setDJName: (name: string) => void;
}

const DJContext = createContext<DJContextProps | undefined>(undefined);

export const DJProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [djName, setDJName] = useState('DJ Grant');

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