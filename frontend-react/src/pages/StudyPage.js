/*
  Arquivo: src/pages/StudyPage.js
  Descrição: A página foi reestruturada com um cabeçalho e uma barra de navegação para um layout mais limpo, resolvendo a sobreposição de elementos e melhorando a usabilidade.
*/
import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useFlashcards } from '../context/FlashcardProvider';
import { useWordCloudsAPI } from '../context/WordCloudProvider';
import Flashcard from '../components/Flashcard';
import WordCloudModal from '../components/WordCloudModal';
import './StudyPage.css'; // Importa a nova folha de estilos

const StudyPage = () => {
    const { mapId } = useParams();
    const location = useLocation();
    const { flashcards, loading: flashcardsLoading, getFlashcardsByMap, deleteFlashcard } = useFlashcards();
    const { wordClouds, loading: wordCloudsLoading, getWordCloudsByMap, deleteWordCloud } = useWordCloudsAPI();

    const [mainView, setMainView] = useState(location.state?.initialView || 'flashcards');
    const [studyMode, setStudyMode] = useState('focus');

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [animationClass, setAnimationClass] = useState('');
    
    const [selectedWordCloud, setSelectedWordCloud] = useState(null);

    useEffect(() => {
        if (mapId) {
            getFlashcardsByMap(mapId);
            getWordCloudsByMap(mapId);
        }
    }, [mapId, getFlashcardsByMap, getWordCloudsByMap]);

    const handleNext = () => {
        if (flashcards.length <= 1 || animationClass) return;
        setAnimationClass('fade-out');
        setTimeout(() => {
            const nextIndex = (currentIndex + 1) % flashcards.length;
            if (isFlipped) setIsFlipped(false);
            setCurrentIndex(nextIndex);
            setAnimationClass('fade-in');
            setTimeout(() => setAnimationClass(''), 200);
        }, 200);
    };

    const handlePrev = () => {
        if (flashcards.length <= 1 || animationClass) return;
        setAnimationClass('fade-out');
        setTimeout(() => {
            const prevIndex = (currentIndex - 1 + flashcards.length) % flashcards.length;
            if (isFlipped) setIsFlipped(false);
            setCurrentIndex(prevIndex);
            setAnimationClass('fade-in');
            setTimeout(() => setAnimationClass(''), 200);
        }, 200);
    };

    const handleDeleteFlashcard = async (id, front) => {
        if (!window.confirm(`Tem certeza que deseja deletar o flashcard "${front}"?`)) return;
        const success = await deleteFlashcard(id);
        if (success && flashcards.length - 1 > 0 && currentIndex >= flashcards.length - 1) {
            setCurrentIndex(prev => prev - 1);
        }
    };
    
    const handleDeleteWordCloud = async (id, title) => {
        if (!window.confirm(`Tem certeza que deseja deletar a nuvem de palavras do mapa "${title}"?`)) return;
        await deleteWordCloud(id);
    };
    
    const handleCardSelect = (index) => {
        setCurrentIndex(index);
        setStudyMode('focus');
    };

    useEffect(() => {
        if (!animationClass) {
            setIsFlipped(false);
        }
    }, [currentIndex, animationClass]);

    const currentCard = flashcards[currentIndex];
    const isLoading = flashcardsLoading || wordCloudsLoading;

    return (
        <div className="study-page-container">
            <header className="study-page-header">
                <h1>Área de Estudo</h1>
            </header>

            <div className="study-page-navigation">
                <div className="study-area-selector">
                    <button onClick={() => setMainView('flashcards')} className={mainView === 'flashcards' ? 'active' : ''}>Flashcards</button>
                    <button onClick={() => setMainView('wordclouds')} className={mainView === 'wordclouds' ? 'active' : ''}>Nuvens de Palavras</button>
                </div>
                 <Link to={`/app/mindmap/${mapId}`} className="back-to-map-button">
                    <span className="material-icons">arrow_back</span>
                    <span className="ml-2 hidden md:inline"></span>
                </Link>
            </div>

            {mainView === 'flashcards' && (
                <>
                    <div className="study-view-controls">
                        <button onClick={() => setStudyMode('focus')} className={studyMode === 'focus' ? 'active' : ''} title="Modo Foco"><span className="material-icons">view_carousel</span> Foco</button>
                        <button onClick={() => setStudyMode('grid')} className={studyMode === 'grid' ? 'active' : ''} title="Modo Grade"><span className="material-icons">view_module</span> Grade</button>
                    </div>
                    <main className="study-main-content">
                        {isLoading ? <h2 className="loading-text">Carregando...</h2> : !currentCard ? (
                            <div className="no-content-message">
                                <p className="text-2xl font-bold">Nenhum flashcard para este mapa.</p>
                                <p>Volte ao mapa e crie alguns para começar a estudar!</p>
                            </div>
                        ) : studyMode === 'focus' ? (
                            <>
                                <div className={`flashcard-focus-container ${animationClass}`}>
                                    {currentCard && <Flashcard card={currentCard} onDelete={handleDeleteFlashcard} isFlipped={isFlipped} onFlip={() => setIsFlipped(f => !f)} />}
                                </div>
                                <div className="study-navigation">
                                    <button onClick={handlePrev} className="nav-button" title="Anterior" disabled={flashcards.length <= 1}><span className="material-icons">chevron_left</span></button>
                                    <span className="page-indicator">{flashcards.length > 0 ? currentIndex + 1 : 0} / {flashcards.length}</span>
                                    <button onClick={handleNext} className="nav-button" title="Próximo" disabled={flashcards.length <= 1}><span className="material-icons">chevron_right</span></button>
                                </div>
                            </>
                        ) : (
                            <div className="flashcard-grid-container">
                                {flashcards.map((card, index) => (
                                    <div key={card._id} className="flashcard-preview-card" onClick={() => handleCardSelect(index)}>
                                        <div className="preview-front">{card.front}</div>
                                        <div className="preview-divider"></div>
                                        <div className="preview-back">{card.back}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </main>
                </>
            )}

            {mainView === 'wordclouds' && (
                <main className="study-main-content">
                     {isLoading ? <h2 className="loading-text">Carregando...</h2> : wordClouds.length === 0 ? (
                        <div className="no-content-message">
                            <p className="text-2xl font-bold">Nenhuma nuvem de palavras salva.</p>
                            <p>Gere e salve uma nuvem de palavras no seu mapa para vê-la aqui.</p>
                        </div>
                     ) : (
                        <div className="wordcloud-grid-container">
                            {wordClouds.map(wc => (
                                <div key={wc._id} className="wordcloud-preview-card">
                                    <div className="wordcloud-preview-info">
                                        <h3>{wc.mapTitle}</h3>
                                        <p>Salva em: {new Date(wc.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="wordcloud-preview-actions">
                                        <button onClick={() => setSelectedWordCloud(wc)} className="button-primary">Visualizar</button>
                                        <button onClick={() => handleDeleteWordCloud(wc._id, wc.mapTitle)} className="button-danger">Deletar</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                     )}
                </main>
            )}

            {selectedWordCloud && (
                 <WordCloudModal 
                    isOpen={!!selectedWordCloud}
                    onClose={() => setSelectedWordCloud(null)}
                    words={selectedWordCloud.words}
                    mapTitle={selectedWordCloud.mapTitle}
                    isViewingSaved={true}
                />
            )}
        </div>
    );
};

export default StudyPage;