/*
  Arquivo: src/context/MapProvider.js
  Descrição: Adicionadas novas funções 'updateCollaboratorRole' e 'getPermissionForMap' para gerenciar o novo sistema de permissões. A função 'inviteCollaborator' foi atualizada para enviar o 'role' selecionado.
*/
import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { fetchWithAuth, API_URL } from '../api';
import { useNotifications } from '../hooks/useNotifications';
import { useAuth } from '../hooks/useAuth';

export const MapContext = createContext(null);

export const useMapsAPI = () => {
    return useContext(MapContext);
};

export const MapProvider = ({ children }) => {
    const [myMaps, setMyMaps] = useState([]);
    const [sharedMaps, setSharedMaps] = useState([]);
    const [loading, setLoading] = useState(false);
    const { showNotification } = useNotifications();
    const { user, isAuthenticated } = useAuth();

    const fetchAllMaps = useCallback(async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const [myMapsRes, sharedMapsRes] = await Promise.all([
                fetchWithAuth(`${API_URL}/maps`),
                fetchWithAuth(`${API_URL}/maps/shared-with-me`)
            ]);

            const myMapsData = await myMapsRes.json();
            const sharedMapsData = await sharedMapsRes.json();

            if (myMapsRes.ok) {
                setMyMaps(Array.isArray(myMapsData) ? myMapsData : []);
            } else {
                throw new Error(myMapsData.message || 'Falha ao buscar seus mapas');
            }

            if (sharedMapsRes.ok) {
                setSharedMaps(Array.isArray(sharedMapsData) ? sharedMapsData : []);
            } else {
                throw new Error(sharedMapsData.message || 'Falha ao buscar mapas compartilhados');
            }
        } catch (err) {
            showNotification(err.message, 'error');
            setMyMaps([]);
            setSharedMaps([]);
        } finally {
            setLoading(false);
        }
    }, [showNotification, isAuthenticated]);
    
    const createNewMap = async (mapData) => {
        try {
            const response = await fetchWithAuth(`${API_URL}/maps`, {
                method: 'POST',
                body: JSON.stringify(mapData),
            });
            const newMap = await response.json();
            if (response.ok) {
                setMyMaps(prevMaps => [newMap, ...prevMaps]);
                showNotification('Novo mapa mental criado com sucesso!', 'success');
                return newMap;
            } else {
                throw new Error(newMap.message);
            }
        } catch (error) {
            showNotification(error.message || 'Erro ao criar novo mapa.', 'error');
            return null;
        }
    };

    const saveMap = async (mapData) => {
        const url = mapData._id ? `${API_URL}/maps/${mapData._id}` : `${API_URL}/maps`;
        const method = mapData._id ? 'PUT' : 'POST';
        
        try {
            const res = await fetchWithAuth(url, { 
                method: method, 
                body: JSON.stringify(mapData) 
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.msg || `Falha ao ${method === 'PUT' ? 'atualizar' : 'salvar'} o mapa`);
            }
            const savedMap = await res.json();
            
            if (method === 'PUT') {
                setMyMaps(prevMaps => prevMaps.map(m => m._id === savedMap._id ? savedMap : m));
            } else {
                setMyMaps(prevMaps => [savedMap, ...prevMaps]);
            }
            
            showNotification('Mapa salvo com sucesso!', 'success');
            return savedMap;
        } catch (err) {
            showNotification(err.message, 'error');
            return null;
        }
    };
    
    const deleteMap = async (mapId, mapTitle) => {
        if (!window.confirm(`Tem certeza que deseja apagar o mapa "${mapTitle}" permanentemente?`)) return;
        setLoading(true);
        try {
            const res = await fetchWithAuth(`${API_URL}/maps/${mapId}`, { method: 'DELETE' });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.msg || 'Falha ao deletar o mapa');
            }
            setMyMaps(prevMaps => prevMaps.filter(m => m._id !== mapId));
            showNotification('Mapa deletado com sucesso!', 'success');
        } catch (err) {
            showNotification(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };
    
    const getMapById = useCallback((mapId) => {
        return [...myMaps, ...sharedMaps].find(m => m._id === mapId);
    }, [myMaps, sharedMaps]);

    const getPermissionForMap = useCallback(async (mapId) => {
        const map = getMapById(mapId);
        if (!map) return null;
        if (map.user._id === user?._id) return 'owner';

        try {
            const res = await fetchWithAuth(`${API_URL}/permissions/${mapId}`);
            if(!res.ok) return null;
            const permissions = await res.json();
            const userPermission = permissions.find(p => p.user._id === user?._id);
            return userPermission ? userPermission.role : null;
        } catch (err) {
            return null;
        }
    }, [getMapById, user]);


    const generateShareLink = async (mapId) => {
        try {
            const res = await fetchWithAuth(`${API_URL}/maps/${mapId}/share`, { method: 'POST' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.msg || 'Falha ao gerar link');
            return `${window.location.origin}/view/${data.shareId}`;
        } catch (err) {
            showNotification(err.message, 'error');
            return null;
        }
    };
    
    const getCollaborators = async (mapId) => {
        try {
            const res = await fetchWithAuth(`${API_URL}/permissions/${mapId}`);
            if(!res.ok) throw new Error('Falha ao buscar colaboradores');
            return await res.json();
        } catch (err) {
            showNotification(err.message, 'error');
            return [];
        }
    };
    
    const inviteCollaborator = async (mapId, email, role) => {
        try {
            const res = await fetchWithAuth(`${API_URL}/permissions`, {
                method: 'POST',
                body: JSON.stringify({ mapId, email, role })
            });
            const data = await res.json();
            if(!res.ok) throw new Error(data.msg || 'Falha ao convidar');
            showNotification('Convite enviado com sucesso!', 'success');
            return data;
        } catch (err) {
            showNotification(err.message, 'error');
            return null;
        }
    };
    
    const updateCollaboratorRole = async (permissionId, role) => {
        try {
            const res = await fetchWithAuth(`${API_URL}/permissions/${permissionId}`, {
                method: 'PUT',
                body: JSON.stringify({ role })
            });
            const data = await res.json();
            if(!res.ok) throw new Error(data.msg || 'Falha ao atualizar permissão');
            showNotification('Permissão atualizada!', 'success');
            return data;
        } catch (err) {
            showNotification(err.message, 'error');
            return null;
        }
    };

    const removeCollaborator = async (permissionId) => {
        try {
            const res = await fetchWithAuth(`${API_URL}/permissions/${permissionId}`, { method: 'DELETE' });
            if(!res.ok) throw new Error('Falha ao remover colaborador');
            showNotification('Colaborador removido.', 'success');
            return true;
        } catch (err) {
            showNotification(err.message, 'error');
            return false;
        }
    };

    const value = {
        myMaps,
        sharedMaps,
        loading,
        fetchAllMaps,
        createNewMap,
        saveMap,
        deleteMap,
        getMapById,
        getPermissionForMap,
        generateShareLink,
        getCollaborators,
        inviteCollaborator,
        updateCollaboratorRole,
        removeCollaborator
    };

    return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};