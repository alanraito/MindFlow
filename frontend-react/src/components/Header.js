/*
  Arquivo: src/components/Header.js
  Descrição: Ajustado o link do logo para redirecionar para a nova página inicial (/app/home) em vez do dashboard.
*/
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Header = ({ onMenuClick }) => {
    const { user, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) && !buttonRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="fixed top-0 left-0 right-0 z-30 glass-effect shadow-sm">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
                <div className="flex items-center">
                    <button onClick={onMenuClick} className="p-2 rounded-md text-gray-700 md:hidden mr-2">
                        <span className="material-icons">menu</span>
                    </button>
                    <Link to="/app/home" className="flex items-center gap-3">
                        <span className="material-icons text-3xl text-accent">bubble_chart</span>
                        <h1 className="text-2xl font-semibold header-text hidden sm:block">MindFlow</h1>
                    </Link>
                </div>
                <div className="flex items-center">
                    <div className="relative">
                        <button
                            ref={buttonRef}
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="p-1.5 rounded-full hover:bg-gray-200/70 focus:outline-none focus:ring-2 focus:ring-gray-400/50"
                        >
                            <span className="material-icons header-text text-3xl">account_circle</span>
                        </button>
                        {dropdownOpen && (
                            <div ref={dropdownRef} className="profile-dropdown show">
                                <div className="px-4 py-3 border-b border-gray-200">
                                    <p className="text-sm font-semibold text-gray-900">{user ? `${user.firstName} ${user.lastName}` : 'Carregando...'}</p>
                                    <p className="text-sm text-gray-500 truncate">{user ? user.email : '...'}</p>
                                </div>
                                <Link to="/app/settings" className="dropdown-link" onClick={() => setDropdownOpen(false)}>
                                    <span className="material-icons sidebar-icon mr-2">settings</span>
                                    Configurações
                                </Link>
                                <a href="/login" onClick={(e) => { e.preventDefault(); logout(); }} className="dropdown-link">
                                    <span className="material-icons sidebar-icon mr-2">logout</span>
                                    Sair
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;