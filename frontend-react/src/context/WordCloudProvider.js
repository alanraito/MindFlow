/*
  Arquivo: src/context/WordCloudProvider.js
  Descrição: O provider foi expandido para gerenciar o estado das nuvens de palavras, incluindo funções para buscar e deletar dados da API.
*/
import React, { createContext, useContext, useCallback, useState } from 'react';
import { fetchWithAuth, API_URL } from '../api';
import { useNotifications } from '../hooks/useNotifications';

const WordCloudContext = createContext(null);

export const useWordCloudsAPI = () => {
    return useContext(WordCloudContext);
};

export const WordCloudProvider = ({ children }) => {
    const [wordClouds, setWordClouds] = useState([]);
    const [loading, setLoading] = useState(false);
    const { showNotification } = useNotifications();

    const getWordCloudsByMap = useCallback(async (mapId) => {
        setLoading(true);
        try {
            const response = await fetchWithAuth(`${API_URL}/wordclouds/map/${mapId}`);
            if (!response.ok) {
                throw new Error('Falha ao buscar as nuvens de palavras.');
            }
            const data = await response.json();
            setWordClouds(data);
        } catch (error) {
            showNotification(error.message, 'error');
            setWordClouds([]);
        } finally {
            setLoading(false);
        }
    }, [showNotification]);

    const saveWordCloud = useCallback(async (wordCloudData) => {
        try {
            const response = await fetchWithAuth(`${API_URL}/wordclouds`, {
                method: 'POST',
                body: JSON.stringify(wordCloudData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'Falha ao salvar a nuvem de palavras.');
            }
            const savedData = await response.json();
            setWordClouds(prev => [savedData, ...prev]);
            showNotification('Nuvem de palavras salva com sucesso!', 'success');
            return savedData;
        } catch (error) {
            showNotification(error.message, 'error');
            return null;
        }
    }, [showNotification]);
    
    const deleteWordCloud = useCallback(async (id) => {
        try {
            const response = await fetchWithAuth(`${API_URL}/wordclouds/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Falha ao deletar a nuvem de palavras.');
            }
            setWordClouds(prev => prev.filter(wc => wc._id !== id));
            showNotification('Nuvem de palavras deletada.', 'success');
            return true;
        } catch (error) {
            showNotification(error.message, 'error');
            return false;
        }
    }, [showNotification]);


    const value = {
        wordClouds,
        loading,
        getWordCloudsByMap,
        saveWordCloud,
        deleteWordCloud,
    };

    return (
        <WordCloudContext.Provider value={value}>
            {children}
        </WordCloudContext.Provider>
    );
};