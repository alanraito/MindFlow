/*
  Arquivo: src/pages/AdminPage.js
  Descrição: Implementada a lógica de permissão hierárquica. Agora, um 'subadmin' pode gerenciar apenas usuários com papéis 'user' e 'premium', e não pode visualizar ou editar outros administradores.
*/
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchWithAuth, API_URL } from '../api';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../hooks/useAuth'; // Importa o hook de autenticação
import Modal from '../components/Modal';

// Hook customizado para detectar o tamanho da janela
const useWindowSize = () => {
    const [size, setSize] = useState([window.innerWidth, window.innerHeight]);
    useEffect(() => {
        const handleResize = () => {
            setSize([window.innerWidth, window.innerHeight]);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return size;
};

const AdminPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const { showNotification } = useNotifications();
    const { user: loggedInUser } = useAuth(); // Pega o usuário logado
    const [width] = useWindowSize();

    const usersPerPage = useMemo(() => (width < 768 ? 20 : 40), [width]);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetchWithAuth(`${API_URL}/admin/users`);
            if (!res.ok) throw new Error('Falha ao carregar usuários');
            const data = await res.json();
            setUsers(data);
        } catch (error) {
            showNotification(error.message, 'error');
        } finally {
            setLoading(false);
        }
    }, [showNotification]);
    
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Filtra usuários com base na busca e no papel do admin logado
    const filteredUsers = useMemo(() => {
        return users
            .filter(user => {
                // Se o admin logado for 'subadmin', ele não pode ver outros 'subadmin' ou 'admin'
                if (loggedInUser?.role === 'subadmin') {
                    return user.role !== 'admin' && user.role !== 'subadmin';
                }
                return true; // Admin pode ver todos
            })
            .filter(user => {
                const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
                return fullName.includes(searchTerm.toLowerCase()) || 
                       user.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       user.email.toLowerCase().includes(searchTerm.toLowerCase());
            });
    }, [users, searchTerm, loggedInUser]);
    
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const paginatedUsers = useMemo(() => {
        const indexOfLastUser = currentPage * usersPerPage;
        const indexOfFirstUser = indexOfLastUser - usersPerPage;
        return filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    }, [filteredUsers, currentPage, usersPerPage]);

    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const openEditModal = (user) => {
        setCurrentUser({ ...user });
        setEditModalOpen(true);
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const res = await fetchWithAuth(`${API_URL}/admin/users/${currentUser._id}`, {
                method: 'PUT',
                body: JSON.stringify(currentUser)
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.msg || 'Falha ao atualizar usuário.');
            }
            showNotification('Usuário atualizado com sucesso!', 'success');
            setEditModalOpen(false);
            fetchUsers();
        } catch(err) {
            showNotification(err.message, 'error');
        }
    };
    
    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Tem certeza que deseja deletar este usuário?')) return;
        try {
            const res = await fetchWithAuth(`${API_URL}/admin/users/${userId}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.msg || 'Falha ao deletar usuário');
            }
            showNotification('Usuário deletado com sucesso!', 'success');
            fetchUsers();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };
    
    const handleCreateUser = async (e) => {
        e.preventDefault();
        try {
            const res = await fetchWithAuth(`${API_URL}/admin/users`, {
                method: 'POST',
                body: JSON.stringify(currentUser)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || 'Falha ao criar usuário.');
            showNotification('Usuário criado com sucesso!', 'success');
            setCreateModalOpen(false);
            fetchUsers();
        } catch(err) {
            showNotification(err.message, 'error');
        }
    }
    
    // Define quais papéis o admin atual pode atribuir
    const availableRoles = useMemo(() => {
        if (loggedInUser?.role === 'admin') {
            return ['user', 'premium', 'subadmin', 'admin'];
        }
        if (loggedInUser?.role === 'subadmin') {
            return ['user', 'premium'];
        }
        return []; // Nenhum papel se não for admin
    }, [loggedInUser]);

    const UserTable = () => (
        <div className="overflow-x-auto">
            <table id="admin-user-table" className="w-full">
                <thead className="hidden md:table-header-group bg-gray-50">
                    <tr>
                        <th className="p-3 text-sm font-semibold tracking-wide text-left">Nome</th>
                        <th className="p-3 text-sm font-semibold tracking-wide text-left">Usuário</th>
                        <th className="p-3 text-sm font-semibold tracking-wide text-left">Email</th>
                        <th className="p-3 text-sm font-semibold tracking-wide text-left">Role</th>
                        <th className="p-3 text-sm font-semibold tracking-wide text-left">Ações</th>
                    </tr>
                </thead>
                <tbody className="md:divide-y md:divide-gray-200">
                    {paginatedUsers.map(user => {
                        // Subadmin não pode editar ou deletar admin/subadmin
                        const canManage = loggedInUser?.role === 'admin' || (loggedInUser?.role === 'subadmin' && user.role !== 'admin' && user.role !== 'subadmin');
                        return (
                            <tr key={user._id} className="block mb-4 rounded-lg shadow-md overflow-hidden bg-white md:table-row md:mb-0 md:shadow-none md:rounded-none">
                                <td className="flex justify-between items-center p-4 text-right border-b md:border-b-0 md:table-cell md:text-left md:p-3" data-label="Nome">
                                    <span className="text-gray-700">{user.firstName} {user.lastName}</span>
                                </td>
                                <td className="flex justify-between items-center p-4 text-right border-b md:border-b-0 md:table-cell md:text-left md:p-3" data-label="Usuário">
                                    <span className="text-gray-700">{user.username}</span>
                                </td>
                                <td className="flex justify-between items-center p-4 text-right border-b md:border-b-0 md:table-cell md:text-left md:p-3" data-label="Email">
                                    <span className="text-gray-700">{user.email}</span>
                                </td>
                                <td className="flex justify-between items-center p-4 text-right border-b md:border-b-0 md:table-cell md:text-left md:p-3" data-label="Role">
                                    <span className={`role-badge role-${user.role}`}>{user.role}</span>
                                </td>
                                <td className="flex justify-between items-center p-4 text-right md:table-cell md:text-left md:p-3" data-label="Ações">
                                    {canManage && (
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => openEditModal(user)} className="p-2 rounded-full hover:bg-gray-200 transition-colors" title="Editar">
                                                <span className="material-icons text-lg text-blue-600">edit</span>
                                            </button>
                                            <button onClick={() => handleDeleteUser(user._id)} className="p-2 rounded-full hover:bg-gray-200 transition-colors" title="Deletar">
                                                <span className="material-icons text-lg text-red-600">delete</span>
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );

    const Pagination = () => (
        <div className="flex justify-between items-center mt-4">
            <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                disabled={currentPage === 1}
                className="button-secondary text-sm font-semibold py-2 px-4 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Anterior
            </button>
            <span className="text-sm text-gray-700">
                Página {currentPage} de {totalPages}
            </span>
            <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                disabled={currentPage === totalPages}
                className="button-secondary text-sm font-semibold py-2 px-4 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Próxima
            </button>
        </div>
    );

    return (
        <>
            <div id="view-admin-users" className="p-4 sm:p-6 w-full bg-white rounded-xl shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h1 className="text-3xl font-bold header-text">Gerenciamento de Usuários</h1>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Pesquisar usuários..." className="form-input-settings w-full md:w-64" />
                        
                        <button onClick={() => { setCurrentUser({ role: 'user' }); setCreateModalOpen(true); }} className="hidden md:flex button-primary font-semibold py-2.5 px-5 rounded-full shadow-md hover:shadow-lg transition-all duration-200 items-center justify-center text-sm whitespace-nowrap">
                            <span className="material-icons text-base mr-2">person_add</span>
                            Criar Usuário
                        </button>
                        
                        <button onClick={() => { setCurrentUser({ role: 'user' }); setCreateModalOpen(true); }} className="md:hidden flex items-center justify-center button-primary rounded-full shadow-md p-3">
                            <span className="material-icons text-base">person_add</span>
                        </button>
                    </div>
                </div>
                {loading ? <p>Carregando...</p> : (
                    <>
                        <UserTable />
                        {totalPages > 1 && <Pagination />}
                    </>
                )}
            </div>

            <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} title="Editar Usuário">
                {currentUser && (
                    <form onSubmit={handleUpdateUser}>
                        <label className="flex flex-col mb-4">
                            <span className="form-label">Nome</span>
                            <input type="text" value={currentUser.firstName} onChange={e => setCurrentUser({...currentUser, firstName: e.target.value})} className="form-input-settings" />
                        </label>
                         <label className="flex flex-col mb-4">
                            <span className="form-label">Sobrenome</span>
                            <input type="text" value={currentUser.lastName} onChange={e => setCurrentUser({...currentUser, lastName: e.target.value})} className="form-input-settings" />
                        </label>
                         <label className="flex flex-col mb-4">
                            <span className="form-label">Usuário</span>
                            <input type="text" value={currentUser.username} onChange={e => setCurrentUser({...currentUser, username: e.target.value})} maxLength="20" className="form-input-settings" />
                        </label>
                        <label className="flex flex-col mb-4">
                            <span className="form-label">Email</span>
                            <input type="email" value={currentUser.email} onChange={e => setCurrentUser({...currentUser, email: e.target.value})} className="form-input-settings" />
                        </label>
                        <label className="flex flex-col mb-4">
                            <span className="form-label">Role</span>
                            <select value={currentUser.role} onChange={e => setCurrentUser({...currentUser, role: e.target.value})} className="form-input-settings">
                                {availableRoles.map(role => (
                                    <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                                ))}
                            </select>
                        </label>
                        <div className="flex justify-end gap-4 mt-6">
                            <button type="button" onClick={() => setEditModalOpen(false)} className="modal-button-secondary">Cancelar</button>
                            <button type="submit" className="modal-button-primary">Salvar Alterações</button>
                        </div>
                    </form>
                )}
            </Modal>
            
            <Modal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} title="Criar Novo Usuário">
                {currentUser && (
                     <form onSubmit={handleCreateUser} className="space-y-3">
                         <div id="create-user-modal" className="flex flex-col md:flex-row gap-4">
                            <label className="flex flex-col flex-1">
                                <span className="form-label">Nome</span>
                                <input required value={currentUser.firstName || ''} onChange={e => setCurrentUser({...currentUser, firstName: e.target.value})} type="text" placeholder="Nome do usuário" className="form-input-settings" />
                            </label>
                            <label className="flex flex-col flex-1">
                                <span className="form-label">Sobrenome</span>
                                <input required value={currentUser.lastName || ''} onChange={e => setCurrentUser({...currentUser, lastName: e.target.value})} type="text" placeholder="Sobrenome" className="form-input-settings" />
                            </label>
                        </div>
                        <label className="flex flex-col">
                            <span className="form-label">Usuário</span>
                            <input required value={currentUser.username || ''} onChange={e => setCurrentUser({...currentUser, username: e.target.value})} type="text" placeholder="Crie um nome de usuário" maxLength="20" className="form-input-settings" />
                        </label>
                        <label className="flex flex-col">
                            <span className="form-label">Data de Nascimento</span>
                            <input required value={currentUser.birthDate || ''} onChange={e => setCurrentUser({...currentUser, birthDate: e.target.value})} type="date" className="form-input-settings" />
                        </label>
                        <label className="flex flex-col">
                            <span className="form-label">Email</span>
                            <input required value={currentUser.email || ''} onChange={e => setCurrentUser({...currentUser, email: e.target.value})} type="email" placeholder="email@exemplo.com" className="form-input-settings" />
                        </label>
                        <label className="flex flex-col">
                            <span className="form-label">Senha</span>
                            <input required value={currentUser.password || ''} onChange={e => setCurrentUser({...currentUser, password: e.target.value})} type="password" placeholder="Crie uma senha" className="form-input-settings" />
                        </label>
                        <label className="flex flex-col">
                            <span className="form-label">Role</span>
                            <select required value={currentUser.role} onChange={e => setCurrentUser({...currentUser, role: e.target.value})} className="form-input-settings">
                               {availableRoles.map(role => (
                                    <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                                ))}
                            </select>
                        </label>
                        <div className="flex justify-end gap-4 pt-4">
                            <button type="button" onClick={() => setCreateModalOpen(false)} className="modal-button-secondary">Cancelar</button>
                            <button type="submit" className="modal-button-primary">Criar Usuário</button>
                        </div>
                    </form>
                )}
            </Modal>
        </>
    );
};

export default AdminPage;