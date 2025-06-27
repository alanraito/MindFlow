/*
  Arquivo: src/components/WordCloudModal.js
  Descrição: Modificado para salvar a nuvem de palavras como uma imagem estática (PNG) e para exibir essa imagem ao visualizar um item salvo, garantindo consistência visual.
*/
import React, { useEffect, useState, useRef, useCallback } from 'react';
import WordCloud from 'react-d3-cloud';
import { toPng } from 'html-to-image';
import { useWordCloudsAPI } from '../context/WordCloudProvider';
import { useNotifications } from '../hooks/useNotifications';
import './WordCloudModal.css';

const fontSizeMapper = (word) => Math.log2(word.value) * 10 + 16;
const rotate = () => 0;

const WordCloudModal = ({ isOpen, onClose, words, mapId, mapTitle, isLoading, isViewingSaved = false, imageData }) => {
    const containerRef = useRef(null);
    const wordCloudRef = useRef(null);
    const [size, setSize] = useState({ width: 0, height: 0 });
    const { saveWordCloud } = useWordCloudsAPI();
    const { showNotification } = useNotifications();
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const checkSize = () => {
            if (containerRef.current) {
                setSize({
                    width: containerRef.current.offsetWidth,
                    height: containerRef.current.offsetHeight,
                });
            }
        };
        
        if (isOpen) {
            setTimeout(checkSize, 50); 
            window.addEventListener('resize', checkSize);
        }

        return () => window.removeEventListener('resize', checkSize);
    }, [isOpen]);

    const handleDownload = useCallback(() => {
        // Se for uma imagem salva, o download é direto do dataURL
        if (isViewingSaved && imageData) {
            const link = document.createElement('a');
            link.download = `nuvem-de-palavras-${mapTitle.replace(/\s+/g, '-').toLowerCase()}.png`;
            link.href = imageData;
            link.click();
            return;
        }
        
        // Se for uma nuvem recém-gerada, cria a imagem para download
        if (!wordCloudRef.current) return;
        toPng(wordCloudRef.current, { cacheBust: true, backgroundColor: 'rgba(0,0,0,0)' })
          .then((dataUrl) => {
            const link = document.createElement('a');
            link.download = `nuvem-de-palavras-${mapTitle.replace(/\s+/g, '-').toLowerCase()}.png`;
            link.href = dataUrl;
            link.click();
            showNotification('Download iniciado!', 'success');
          })
          .catch((err) => {
            console.error(err);
            showNotification('Erro ao gerar a imagem para download.', 'error');
          });
    }, [mapTitle, showNotification, isViewingSaved, imageData]);

    const handleSave = useCallback(async () => {
        if (!wordCloudRef.current) {
            showNotification('Não é possível salvar uma nuvem de palavras vazia.', 'error');
            return;
        }
        setIsSaving(true);
        try {
            // Gera a imagem em base64 antes de enviar para a API
            const dataUrl = await toPng(wordCloudRef.current, { cacheBust: true, backgroundColor: 'rgba(0,0,0,0)' });
            await saveWordCloud({ mapId, mapTitle, imageData: dataUrl });
            // A notificação de sucesso já é mostrada pelo provider
        } catch (err) {
            console.error(err);
            showNotification('Erro ao salvar a imagem da nuvem de palavras.', 'error');
        } finally {
            setIsSaving(false);
        }
    }, [mapId, mapTitle, saveWordCloud, showNotification]);

    const renderContent = () => {
        // Se estiver visualizando um item salvo, exibe a imagem guardada
        if (isViewingSaved) {
            if (isLoading) {
                return <div className="loading-placeholder"><p>Carregando imagem...</p></div>;
            }
            if (imageData) {
                return <img src={imageData} alt={`Nuvem de palavras de ${mapTitle}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />;
            }
            return <div className="empty-cloud-placeholder"><p>Imagem não encontrada.</p></div>;
        }

        // Lógica para gerar uma nova nuvem de palavras
        if (isLoading) {
            return (
                <div className="loading-placeholder">
                    <span className="material-icons large-icon spin">hourglass_top</span>
                    <p>Analisando conteúdo para gerar a nuvem de palavras...</p>
                </div>
            );
        }
        if (words && words.length > 0 && size.width > 0) {
            return (
                <div ref={wordCloudRef} style={{ width: '100%', height: '100%' }}>
                    <WordCloud
                        data={words}
                        width={size.width}
                        height={size.height}
                        font="Poppins"
                        fontSize={fontSizeMapper}
                        rotate={rotate}
                        padding={2}
                    />
                </div>
            );
        }
        return (
            <div className="empty-cloud-placeholder">
                <span className="material-icons large-icon">cloud_off</span>
                <p>Não há texto suficiente no mapa para gerar uma nuvem de palavras.</p>
            </div>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay-dissipating" onClick={onClose}>
            <div className="modal-content-dissipating" onClick={(e) => e.stopPropagation()}>
                <div className="wordcloud-container-dissipating" ref={containerRef}>
                    {renderContent()}
                </div>
            </div>
            <div className="dissipating-modal-actions" onClick={(e) => e.stopPropagation()}>
                {!isViewingSaved && (
                    <button type="button" onClick={handleSave} className="action-button-sun" disabled={isLoading || isSaving} title="Salvar Nuvem">
                        <span className="material-icons">{isSaving ? 'sync' : 'save'}</span>
                    </button>
                )}
                
                <button type="button" onClick={handleDownload} className="action-button-sun" disabled={isLoading || (!imageData && words.length === 0)} title="Download como Imagem">
                    <span className="material-icons">download</span>
                </button>
                
                <button type="button" onClick={onClose} className="close-button-sun" title="Fechar">
                    <span className="material-icons">close</span>
                </button>
            </div>
        </div>
    );
};

export default WordCloudModal;