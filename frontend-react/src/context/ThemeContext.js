/*
  Arquivo: src/context/ThemeContext.js
  Descrição: Adicionado o estado para 'borderStyle', com sua respectiva função e persistência, para permitir a escolha do estilo da borda dos nós.
*/
import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [fontSize, setFontSize] = useState(localStorage.getItem('fontSize') || 'medium');
    const [nodeColor, setNodeColor] = useState(localStorage.getItem('nodeColor') || '#ffffff');
    const [fontColor, setFontColor] = useState(localStorage.getItem('fontColor') || '#1a202c');
    const [mapBgColor, setMapBgColor] = useState(localStorage.getItem('mapBgColor') || '#f3f4f6');
    const [lineThickness, setLineThickness] = useState(Number(localStorage.getItem('lineThickness')) || 2);
    const [borderStyle, setBorderStyle] = useState(localStorage.getItem('borderStyle') || 'solid');

    useEffect(() => { localStorage.setItem('theme', theme); }, [theme]);
    useEffect(() => { localStorage.setItem('fontSize', fontSize); }, [fontSize]);
    useEffect(() => { localStorage.setItem('nodeColor', nodeColor); }, [nodeColor]);
    useEffect(() => { localStorage.setItem('fontColor', fontColor); }, [fontColor]);
    useEffect(() => { localStorage.setItem('mapBgColor', mapBgColor); }, [mapBgColor]);
    useEffect(() => { localStorage.setItem('lineThickness', lineThickness); }, [lineThickness]);
    useEffect(() => { localStorage.setItem('borderStyle', borderStyle); }, [borderStyle]);
    
    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const value = { 
        theme, toggleTheme, 
        fontSize, setFontSize, 
        nodeColor, setNodeColor,
        fontColor, setFontColor,
        mapBgColor, setMapBgColor,
        lineThickness, setLineThickness,
        borderStyle, setBorderStyle
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};