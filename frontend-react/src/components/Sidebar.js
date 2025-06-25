/*
  Arquivo: src/components/Sidebar.js
  Descrição: Adicionado um controle de botões para permitir ao usuário escolher entre um estilo de borda 'Sólida' ou 'Pontilhada' para os nós.
*/
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

const Sidebar = ({ isOpen, closeSidebar }) => {
    const { user } = useAuth();
    const { 
        nodeColor, setNodeColor, 
        fontColor, setFontColor, 
        mapBgColor, setMapBgColor,
        lineThickness, setLineThickness,
        borderStyle, setBorderStyle
    } = useTheme();
    const isAdmin = user?.role === 'admin' || user?.role === 'subadmin';

    const handleLinkClick = () => {
        if (window.innerWidth < 768) {
            closeSidebar();
        }
    }

    return (
        <aside id="app-sidebar" className={`w-64 p-4 space-y-4 glass-effect fixed top-16 left-0 h-[calc(100vh-64px)] overflow-y-auto border-r border-gray-200/80 ${isOpen ? 'sidebar-mobile-open' : ''}`}>
            <nav className="flex flex-col space-y-2">
                <NavLink to="/app/dashboard" className="sidebar-link" onClick={handleLinkClick}>
                    <span className="material-icons sidebar-icon mr-3">dashboard</span>
                    Dashboard
                </NavLink>
                <NavLink to="/app/mindmap" className="sidebar-link" onClick={handleLinkClick}>
                    <span className="material-icons sidebar-icon mr-3">hub</span>
                    Novo Mapa
                </NavLink>
                {isAdmin && (
                    <NavLink to="/app/admin" className="sidebar-link" onClick={handleLinkClick}>
                        <span className="material-icons sidebar-icon mr-3">admin_panel_settings</span>
                        Administração
                    </NavLink>
                )}
            </nav>

            <div className="pt-4 border-t border-gray-200/80">
                <h3 className="px-2 text-xs font-semibold secondary-text uppercase tracking-wider mb-2">Estilo do Mapa</h3>
                <div className="setting-item px-2 justify-between">
                    <label className="setting-label text-sm">Cor do Card</label>
                    <input type="color" value={nodeColor} onChange={(e) => setNodeColor(e.target.value)} className="w-10 h-8 p-1 border border-gray-300 rounded-md cursor-pointer"/>
                </div>
                 <div className="setting-item px-2 justify-between">
                    <label className="setting-label text-sm">Cor da Fonte</label>
                    <input type="color" value={fontColor} onChange={(e) => setFontColor(e.target.value)} className="w-10 h-8 p-1 border border-gray-300 rounded-md cursor-pointer"/>
                </div>
                 <div className="setting-item px-2 justify-between">
                    <label className="setting-label text-sm">Cor do Fundo</label>
                    <input type="color" value={mapBgColor} onChange={(e) => setMapBgColor(e.target.value)} className="w-10 h-8 p-1 border border-gray-300 rounded-md cursor-pointer"/>
                </div>
                <div className="setting-item px-2 flex-col items-start">
                    <div className="flex justify-between w-full mb-1">
                        <label className="setting-label text-sm">Grossura da Linha</label>
                        <span className="text-sm secondary-text">{lineThickness}px</span>
                    </div>
                    <input 
                        type="range" 
                        min="2" 
                        max="10" 
                        step="1"
                        value={lineThickness} 
                        onChange={(e) => setLineThickness(Number(e.target.value))} 
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                </div>
                <div className="setting-item px-2 flex-col items-start">
                    <label className="setting-label text-sm mb-2">Estilo da Borda</label>
                    <div className="flex w-full">
                        <button onClick={() => setBorderStyle('solid')} className={`font-size-btn flex-1 rounded-l-md ${borderStyle === 'solid' ? 'active' : ''}`}>Sólida</button>
                        <button onClick={() => setBorderStyle('dashed')} className={`font-size-btn flex-1 rounded-r-md ${borderStyle === 'dashed' ? 'active' : ''}`}>Pontilhada</button>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;