/*
  Arquivo: src/components/WordCloudModal.js
  Descrição: Ajustada a lógica de exibição dos botões para que a opção de Download esteja sempre disponível, mesmo ao visualizar uma nuvem de palavras já salva.
*/
import React, { useEffect, useState, useRef, useCallback } from 'react';
import WordCloud from 'react-d3-cloud';
import { toPng } from 'html-to-image';
import { useWordCloudsAPI } from '../context/WordCloudProvider';
import { useNotifications } from '../hooks/useNotifications';
import './WordCloudModal.css';

const fontSizeMapper = (word) => Math.log2(word.value) * 10 + 16;
const rotate = () => 0;

const WordCloudModal = ({ isOpen, onClose, words, mapId, mapTitle, isLoading, isViewingSaved = false }) => {
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
  }, [mapTitle, showNotification]);

  const handleSave = useCallback(async () => {
    if (!words || words.length === 0) {
      showNotification('Não há dados na nuvem de palavras para salvar.', 'error');
      return;
    }
    setIsSaving(true);
    await saveWordCloud({ mapId, mapTitle, words });
    setIsSaving(false);
  }, [words, mapId, mapTitle, saveWordCloud, showNotification]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="loading-placeholder">
          <span className="material-icons large-icon spin">hourglass_top</span>
          <p>Analisando conteúdo para gerar a nuvem de palavras...</p>
        </div>
      );
    }
    if (words.length > 0 && size.width > 0) {
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
        {/* O botão Salvar só aparece se NÃO for uma visualização de item salvo */}
        {!isViewingSaved && (
          <button type="button" onClick={handleSave} className="action-button-sun" disabled={isLoading || isSaving} title="Salvar Nuvem">
            <span className="material-icons">{isSaving ? 'sync' : 'save'}</span>
          </button>
        )}
        
        {/* O botão Download aparece em ambos os casos (novo ou salvo), exceto no carregamento */}
        <button type="button" onClick={handleDownload} className="action-button-sun" disabled={isLoading} title="Download como Imagem">
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