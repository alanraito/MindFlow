/*
  Arquivo: src/components/Flashcard.js
  Descrição: Adicionada lógica com React Hooks (useState, useEffect, useRef) para medir o conteúdo e ajustar dinamicamente a altura do card, proporcionando uma melhor experiência de visualização.
*/
import React, { useState, useEffect, useRef } from 'react';
import './Flashcard.css';

const Flashcard = ({ card, onDelete, isFlipped, onFlip }) => {
    const [cardHeight, setCardHeight] = useState('auto');
    const frontEl = useRef();
    const backEl = useRef();

    useEffect(() => {
        if (frontEl.current && backEl.current) {
            const frontHeight = frontEl.current.scrollHeight;
            const backHeight = backEl.current.scrollHeight;
            // Define a altura do card como a altura do maior lado, com um mínimo de 350px
            setCardHeight(Math.max(frontHeight, backHeight, 350));
        }
    }, [card.front, card.back]); // Recalcula sempre que o conteúdo do card mudar

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        onDelete(card._id, card.front);
    };

    if (!card) return null;

    return (
        <div className="flashcard-container" style={{ height: `${cardHeight}px` }} onClick={onFlip}>
            <div className={`flashcard-flipper ${isFlipped ? 'is-flipped' : ''}`}>
                <div className="flashcard-face flashcard-face--front" ref={frontEl}>
                    <div className="flashcard-header">
                        <div className="deck-title"></div>
                        <button onClick={handleDeleteClick} className="flashcard-delete-btn" title="Deletar este flashcard">
                            <span className="material-icons">delete</span>
                        </button>
                    </div>
                    <div className="flashcard-content">
                        <p>{card.front}</p>
                    </div>
                </div>
                <div className="flashcard-face flashcard-face--back" ref={backEl}>
                    <div className="flashcard-header">
                        <div className="deck-title"></div>
                        <button onClick={handleDeleteClick} className="flashcard-delete-btn" title="Deletar este flashcard">
                            <span className="material-icons">delete</span>
                        </button>
                    </div>
                    <div className="flashcard-content">
                        <p>{card.back}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Flashcard;