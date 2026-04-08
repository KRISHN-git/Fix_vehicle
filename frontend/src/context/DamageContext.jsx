import { createContext, useState, useContext } from 'react';

const DamageContext = createContext();

export const DamageProvider = ({ children }) => {
    const [results, setResults] = useState(null);

    const clearResults = () => {
        setResults(null);
    };

    return (
        <DamageContext.Provider value={{ results, setResults, clearResults }}>
            {children}
        </DamageContext.Provider>
    );
};

export const useDamageContext = () => {
    return useContext(DamageContext);
};
