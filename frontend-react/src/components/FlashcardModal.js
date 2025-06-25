/*
  Arquivo: src/components/FlashcardModal.js
  Descrição: O componente recebe a função `showNotification` via props para garantir o funcionamento correto.
*/
import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import './FlashcardModal.css';
import { API_URL, fetchWithAuth } from '../api';

const FlashcardModal = ({ isOpen, onClose, topic, mapId, onSubmit, showNotification }) => {
    const [front, setFront] = useState('');
    const [back, setBack] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        if (isOpen && topic) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = topic.text;
            setFront(tempDiv.textContent || tempDiv.innerText || '');
            setBack('');
        }
    }, [isOpen, topic]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!front.trim() || !back.trim()) {
            showNotification('Os campos "Frente" e "Verso" são obrigatórios.', 'error');
            return;
        }
        onSubmit({
            mapId,
            front,
            back,
            deck: 'Padrão'
        });
    };

    const handleGenerateWithAI = async () => {
        if (!topic || !topic.text) {
            showNotification('Tópico inválido para geração com IA.', 'error');
            return;
        }

        setIsGenerating(true);
        try {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = topic.text;
            const topicText = tempDiv.textContent || tempDiv.innerText || '';

            const response = await fetchWithAuth(`${API_URL}/ai/generate-flashcard`, {
                method: 'POST',
                body: JSON.stringify({ topic: topicText }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'Falha ao gerar com IA');
            }

            const data = await response.json();
            setFront(data.front);
            setBack(data.back);
            showNotification('Flashcard gerado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro na geração com IA:', error);
            showNotification(error.message, 'error');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Criar Flashcard">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-group">
                    <label htmlFor="flashcard-front" className="form-label">Frente</label>
                    <textarea
                        id="flashcard-front"
                        value={front}
                        onChange={(e) => setFront(e.target.value)}
                        className="form-input-settings"
                        rows="3"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="flashcard-back" className="form-label">Verso</label>
                    <textarea
                        id="flashcard-back"
                        value={back}
                        onChange={(e) => setBack(e.target.value)}
                        className="form-input-settings"
                        rows="4"
                        placeholder="Digite a resposta ou o conteúdo do verso..."
                        autoFocus
                    />
                </div>
                <div className="flex justify-end items-center flex-wrap gap-4 pt-2">
                    <button 
                        type="button" 
                        className="modal-button-ai"
                        onClick={handleGenerateWithAI}
                        disabled={isGenerating}
                    >
                        <span className="material-icons">{isGenerating ? 'hourglass_top' : 'auto_awesome'}</span>
                        {isGenerating ? 'Gerando...' : 'Gerar com IA'}
                    </button>
                    <div className="flex-grow"></div>
                    <button type="button" className="modal-button-secondary" onClick={onClose} disabled={isGenerating}>
                        Cancelar
                    </button>
                    <button type="submit" className="modal-button-primary" disabled={isGenerating}>
                        Salvar Flashcard
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default FlashcardModal;