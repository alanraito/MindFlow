/*
  Arquivo: src/components/AppLayout.js
  Descrição: Removida a aplicação redundante da classe de tema, que agora é gerenciada pelo componente App.js para garantir que o modo escuro seja aplicado apenas quando o usuário está autenticado.
*/
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const AppLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <Header onMenuClick={toggleSidebar} />
      
      <div id="main-container" className="flex flex-grow pt-16">
        <main className="flex-grow md:ml-64 p-4 sm:p-8 flex flex-col">
          <div className="main-view-area flex-grow">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Overlay e Sidebar movidos para o final para garantir a sobreposição correta */}
      <div id="sidebar-overlay" className={`md:hidden ${isSidebarOpen ? 'active' : 'hidden'}`} onClick={toggleSidebar}></div>
      <Sidebar isOpen={isSidebarOpen} closeSidebar={() => setSidebarOpen(false)} />

      <div id="notification-container" className="fixed top-20 right-6 z-[2000] space-y-3 w-80"></div>
    </div>
  );
};

export default AppLayout;