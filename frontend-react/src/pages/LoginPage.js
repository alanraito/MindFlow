/*
  Arquivo: src/pages/LoginPage.js
  Descrição: Corrigido o redirecionamento padrão após o login para a nova página inicial (/app/home).
*/
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import { API_URL } from '../api';
import Logo from '../assets/logo.svg';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login } = useAuth();
    const { showNotification } = useNotifications();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/app/home'; // Redirecionamento padrão corrigido

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.msg || 'Erro ao fazer login');
            }
            login(data.token);
            navigate(from, { replace: true });
        } catch (err) {
            showNotification(err.message, 'error');
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative flex size-full min-h-screen flex-col bg-gray-50 group/design-root overflow-x-hidden" style={{fontFamily: '"Work Sans", "Noto Sans", sans-serif'}}>
            <div className="layout-container flex h-full grow flex-col">
                <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-b-[#e9edf1] px-10 py-3">
                    <Link to="/" className="flex items-center gap-4 text-[#101419]">
                        <div className="size-4">
                            <img src={Logo} alt="MindFlow Logo" />
                        </div>
                        <h2 className="text-[#101419] text-lg font-bold leading-tight tracking-[-0.015em]">MindFlow</h2>
                    </Link>
                    <nav className="flex items-center gap-6">
                        <Link to="/signup" className="text-sm font-medium text-gray-700 hover:text-blue-600">Não tem uma conta? Cadastre-se</Link>
                    </nav>
                </header>
                <div className="px-4 md:px-40 flex flex-1 justify-center items-center">
                    <div className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5 max-w-[960px] flex-1">
                        <form onSubmit={handleSubmit}>
                            <h2 className="text-[#101419] tracking-light text-[28px] font-bold leading-tight px-4 text-center pb-3 pt-5">Acesse sua conta</h2>
                            <fieldset disabled={isSubmitting} className="flex flex-col gap-4">
                                <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3 mx-auto w-full">
                                    <label className="flex flex-col min-w-40 flex-1">
                                        <p className="text-[#101419] text-base font-medium leading-normal pb-2">Email</p>
                                        <input id="email" type="email" required placeholder="seu@email.com" value={formData.email} onChange={handleChange} className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#101419] focus:outline-0 focus:ring-0 border border-[#d3dbe4] bg-gray-50 focus:border-[#d3dbe4] h-14 placeholder:text-[#58728d] p-[15px] text-base font-normal leading-normal" />
                                    </label>
                                </div>
                                <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 py-3 mx-auto w-full">
                                    <label className="flex flex-col min-w-40 flex-1">
                                        <p className="text-[#101419] text-base font-medium leading-normal pb-2">Senha</p>
                                        <input id="password" type="password" required placeholder="Sua senha" value={formData.password} onChange={handleChange} className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#101419] focus:outline-0 focus:ring-0 border border-[#d3dbe4] bg-gray-50 focus:border-[#d3dbe4] h-14 placeholder:text-[#58728d] p-[15px] text-base font-normal leading-normal" />
                                    </label>
                                </div>
                                <div className="flex px-4 py-3 max-w-[480px] mx-auto w-full">
                                    <button type="submit" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 px-5 flex-1 bg-[#1e88e5] hover:bg-[#1565c0] text-white text-base font-bold leading-normal tracking-[0.015em] disabled:bg-blue-300 disabled:cursor-not-allowed">
                                        {isSubmitting ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                <span>Entrando...</span>
                                            </>
                                        ) : (
                                            <span className="truncate">Entrar</span>
                                        )}
                                    </button>
                                </div>
                            </fieldset>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;