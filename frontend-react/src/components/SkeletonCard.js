/*
  Arquivo: src/components/SkeletonCard.js
  Descrição: Novo componente que renderiza um placeholder visual de um card de mapa, utilizado para o efeito de skeleton loading.
*/
import React from 'react';
import './SkeletonCard.css';

const SkeletonCard = () => {
    return (
        <div className="skeleton-card">
            <div className="skeleton-card-content">
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-text"></div>
            </div>
            <div className="skeleton-card-footer">
                <div className="skeleton skeleton-button"></div>
                <div className="skeleton skeleton-button"></div>
                <div className="skeleton skeleton-button-primary"></div>
            </div>
        </div>
    );
};

export default SkeletonCard;