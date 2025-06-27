/*
  Arquivo: src/components/ShareModal.js
  Descrição: Adicionado um filtro para garantir que apenas colaboradores com dados de usuário válidos sejam renderizados, evitando que a aplicação quebre caso uma permissão "órfã" seja encontrada.
*/
import React, { useState, useEffect, useCallback } from 'react';
import './ShareModal.css';
import { useNotifications } from '../hooks/useNotifications';
import { useMapsAPI } from '../context/MapProvider';
import { useAuth } from '../hooks/useAuth';

const RoleSelector = ({ currentRole, onRoleChange, permissionId }) => {
    return (
        <div className="role-selector-wrapper">
            <select 
                value={currentRole} 
                onChange={(e) => onRoleChange(permissionId, e.target.value)}
                className="role-selector"
                onClick={(e) => e.stopPropagation()}
            >
                <option value="editor">Editor</option>
                <option value="contributor">Contribuidor</option>
                <option value="viewer">Visualizador</option>
            </select>
            <span className="material-icons role-selector-arrow">expand_more</span>
        </div>
    );
};


const ShareModal = ({ isOpen, onClose, mapId }) => {
    const [activeTab, setActiveTab] = useState('invite');
    const [collaborators, setCollaborators] = useState([]);
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('viewer');
    const [isLoading, setIsLoading] = useState(false);
    const [shareLink, setShareLink] = useState('');
    
    const { showNotification } = useNotifications();
    const { getCollaborators, inviteCollaborator, removeCollaborator, updateCollaboratorRole, generateShareLink, getMapById } = useMapsAPI();
    const { user: currentUser } = useAuth();

    const fetchCollaborators = useCallback(async () => {
        if (isOpen && mapId) {
            setIsLoading(true);
            const fetchedCollaborators = await getCollaborators(mapId);
            setCollaborators(fetchedCollaborators);
            setIsLoading(false);
        }
    }, [isOpen, mapId, getCollaborators]);

    useEffect(() => {
        if (isOpen && mapId) {
            const map = getMapById(mapId);
            if (map && map.isPublic && map.shareId) {
                setShareLink(`${window.location.origin}/view/${map.shareId}`);
            } else {
                setShareLink('');
            }
            fetchCollaborators();
        }
    }, [isOpen, mapId, getMapById, fetchCollaborators]);

    const handleInvite = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const newCollaborator = await inviteCollaborator(mapId, email, role);
        if (newCollaborator) {
            setCollaborators(prev => [...prev, newCollaborator]);
            setEmail('');
        }
        setIsLoading(false);
    };

    const handleRemove = async (permissionId) => {
        const success = await removeCollaborator(permissionId);
        if (success) {
            setCollaborators(prev => prev.filter(c => c._id !== permissionId));
        }
    };
    
    const handleRoleChange = async (permissionId, newRole) => {
        const updatedPermission = await updateCollaboratorRole(permissionId, newRole);
        if(updatedPermission) {
            setCollaborators(prev => prev.map(c => c._id === permissionId ? updatedPermission : c));
        }
    };

    const handleGenerateLink = async () => {
        setIsLoading(true);
        const link = await generateShareLink(mapId);
        if (link) setShareLink(link);
        setIsLoading(false);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareLink).then(() => {
            showNotification('Link copiado!', 'success');
        });
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold mb-4">Compartilhar e Gerenciar Acesso</h2>
                
                <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
                    <nav className="-mb-px flex space-x-6">
                        <button onClick={() => setActiveTab('invite')} className={`tab-button ${activeTab === 'invite' ? 'active' : ''}`}>Convidar Pessoas</button>
                        <button onClick={() => setActiveTab('link')} className={`tab-button ${activeTab === 'link' ? 'active' : ''}`}>Link Público</button>
                    </nav>
                </div>

                {activeTab === 'invite' && (
                    <div>
                        <form onSubmit={handleInvite} className="invite-form">
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email do colaborador" className="form-input-settings flex-grow" required/>
                            <div className="role-selector-wrapper">
                                <select value={role} onChange={(e) => setRole(e.target.value)} className="role-selector invite-role-selector">
                                    <option value="viewer">Visualizador</option>
                                    <option value="contributor">Contribuidor</option>
                                    <option value="editor">Editor</option>
                                </select>
                                <span className="material-icons role-selector-arrow">expand_more</span>
                            </div>
                            <button type="submit" disabled={isLoading} className="modal-button-primary">Convidar</button>
                        </form>
                        <h3 className="font-semibold my-4">Pessoas com Acesso</h3>
                        <div className="collaborators-list">
                            <div className="collaborator-item">
                                <div className="collaborator-info">
                                    <p className="font-medium">{currentUser.firstName} {currentUser.lastName} (Você)</p>
                                    <p className="text-sm secondary-text">{currentUser.email}</p>
                                </div>
                                <span className="role-badge owner-badge">Proprietário</span>
                            </div>
                            {/* Adicionado filtro para garantir que c.user exista antes de mapear */}
                            {collaborators.filter(c => c.user).map(c => (
                                <div key={c._id} className="collaborator-item">
                                    <div className="collaborator-info">
                                        <p className="font-medium">{c.user.firstName} {c.user.lastName}</p>
                                        <p className="text-sm secondary-text">{c.user.email}</p>
                                    </div>
                                    <div className="collaborator-actions">
                                        <RoleSelector currentRole={c.role} onRoleChange={handleRoleChange} permissionId={c._id}/>
                                        <button onClick={() => handleRemove(c._id)} className="remove-collaborator-btn" title="Remover acesso">
                                            <span className="material-icons">person_remove</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'link' && (
                        <div className="space-y-4">
                            <p className="secondary-text">Qualquer pessoa com este link poderá visualizar o mapa (não poderá editar).</p>
                            {shareLink ? (
                                 <div className="flex items-center gap-2">
                                     <input type="text" value={shareLink} readOnly className="form-input-settings flex-grow"/>
                                     <button onClick={copyToClipboard} className="modal-button-primary" title="Copiar link"><span className="material-icons text-base">content_copy</span></button>
                                </div>
                            ) : (
                                 <button onClick={handleGenerateLink} disabled={isLoading} className="modal-button-primary w-full">
                                     {isLoading ? 'Gerando...' : 'Gerar Link de Visualização'}
                                 </button>
                            )}
                        </div>
                )}
                
                <div className="flex justify-end pt-6">
                    <button type="button" onClick={onClose} className="modal-button-secondary">Concluído</button>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;