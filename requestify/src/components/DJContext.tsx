import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

//Defines the context for the DJ
interface DJContextProps {
    djName: string;
    setDJName: (name: string) => void;
    displayName: string;
    setDisplayName: (name: string) => void;
}

const DJContext = createContext<DJContextProps | undefined>(undefined);

export const DJProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    //Initializes the state values with the ones from local storage
    const [djName, setDJName] = useState(localStorage.getItem('djName') || '');
    const [displayName, setDisplayName] = useState(localStorage.getItem('displayName') || '');

    //Synchronizes the context with the localstorage
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

//Allows accessing the DJ context and the data associated with it
export const useDJ = (): DJContextProps => {
    const context = useContext(DJContext);
    if (!context) {
        throw new Error('useDJ must be used within a DJProvider');
    }
    return context;
};
