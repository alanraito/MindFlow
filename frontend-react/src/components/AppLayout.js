/*
  Arquivo: src/components/AppLayout.js
  Descrição: Novo componente para gerenciar o layout responsivo da aplicação, controlando a exibição da sidebar e do conteúdo principal em diferentes tamanhos de tela.
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
      
      <div className="flex flex-grow pt-16">
        <div className="hidden md:block">
            <Sidebar isOpen={true} closeSidebar={() => {}} />
        </div>
        
        <main className="flex-grow md:ml-64 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar */}
      <div id="sidebar-overlay" className={`md:hidden fixed inset-0 bg-black/60 z-40 ${isSidebarOpen ? 'block' : 'hidden'}`} onClick={toggleSidebar}></div>
      <div className={`md:hidden fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar isOpen={isSidebarOpen} closeSidebar={toggleSidebar} />
      </div>

      <div id="notification-container" className="fixed top-20 right-6 z-[2000] space-y-3 w-80"></div>
    </div>
  );
};

export default AppLayout;