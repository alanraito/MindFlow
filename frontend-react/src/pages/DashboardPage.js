/*
  Arquivo: src/pages/DashboardPage.js
  Descrição: Integrado o novo componente SkeletonCard para exibir um estado de carregamento aprimorado enquanto os dados dos mapas são buscados.
*/
import React, { useEffect, useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMapsAPI } from '../context/MapProvider';
import { API_URL, fetchWithAuth } from '../api';
import SkeletonCard from '../components/SkeletonCard'; // Importa o novo componente

const MapCard = ({ map, onDelete }) => {
    const creationDate = new Date(map.createdAt).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric'
    });

    return (
        <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-lg transition-shadow duration-200 border border-gray-200 flex flex-col justify-between relative">
            <div>
                <h3 className="font-bold text-lg text-gray-800 truncate">{map.title}</h3>
                {map.user && (
                    <p className="text-xs text-gray-500 mt-1">
                        Criado por: {map.user.firstName} {map.user.lastName} em {creationDate}
                    </p>
                )}
            </div>
            <div className="mt-4 flex justify-end items-center gap-2">
                <Link 
                    to={`/app/map/${map._id}/study`} 
                    state={{ initialView: 'wordclouds' }}
                    className="button-secondary text-sm font-semibold py-2 px-4 rounded-full"
                >
                    Nuvens
                </Link>
                <Link 
                    to={`/app/map/${map._id}/study`} 
                    state={{ initialView: 'flashcards' }}
                    className="button-secondary text-sm font-semibold py-2 px-4 rounded-full"
                >
                    Flashcards
                </Link>
                <Link to={`/app/mindmap/${map._id}`} className="button-primary text-sm font-semibold py-2 px-4 rounded-full">
                    Abrir Mapa
                </Link>
            </div>
            {onDelete && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onDelete(map._id, map.title);
                    }}
                    className="absolute top-2 right-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    title="Excluir mapa"
                >
                    <span className="material-icons text-base text-gray-600 dark:text-gray-400">delete</span>
                </button>
            )}
        </div>
    );
};

const DashboardPage = () => {
    const { myMaps, sharedMaps, loading, fetchAllMaps } = useMapsAPI();

    useEffect(() => {
        fetchAllMaps();
    }, [fetchAllMaps]);

    const handleDelete = useCallback(async (mapId, mapTitle) => {
        if (window.confirm(`Tem certeza que deseja excluir o mapa "${mapTitle}"? Esta ação é irreversível.`)) {
            try {
                const response = await fetchWithAuth(`${API_URL}/maps/${mapId}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error('Falha ao excluir o mapa');
                }
                
                fetchAllMaps();
            } catch (error) {
                console.error("Erro ao excluir o mapa:", error);
                alert(error.message);
            }
        }
    }, [fetchAllMaps]);

    const renderSkeletonGrid = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
                <SkeletonCard key={index} />
            ))}
        </div>
    );

    return (
        <div className="app-view active">
            <div className="flex items-center mb-8">
                <span className="material-icons text-5xl text-accent mr-4">bubble_chart</span>
                <div>
                    <h1 className="text-3xl font-bold header-text">MindFlow</h1>
                    <p className="text-gray-500 dark:text-gray-400">Bem-vindo(a) de volta! Gerencie seus mapas mentais.</p>
                </div>
            </div>
            
            <section>
                <h2 className="text-2xl font-semibold main-content-text mb-4">Meus Mapas</h2>
                {loading ? renderSkeletonGrid() : (
                    <>
                        {!loading && myMaps.length === 0 && (
                            <div className="text-center py-10 bg-gray-100 dark:bg-gray-800 rounded-lg">
                                <p className="secondary-text mb-4">Você ainda não criou nenhum mapa.</p>
                                <Link to="/app/mindmap" className="button-primary font-semibold py-2 px-5 rounded-full shadow-md">
                                    Criar meu primeiro mapa
                                </Link>
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {myMaps.map(map => <MapCard key={map._id} map={map} onDelete={handleDelete} />)}
                        </div>
                    </>
                )}
            </section>

             <section className="mt-12">
                <h2 className="text-2xl font-semibold main-content-text mb-4">Compartilhados Comigo</h2>
                {loading ? renderSkeletonGrid() : (
                    <>
                        {!loading && sharedMaps.length === 0 && (
                            <p className="secondary-text">Nenhum mapa foi compartilhado com você ainda.</p>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {sharedMaps.map(map => <MapCard key={map._id} map={map} />)}
                        </div>
                    </>
                )}
            </section>
        </div>
    );
};

export default DashboardPage;