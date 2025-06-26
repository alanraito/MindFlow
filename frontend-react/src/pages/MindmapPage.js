/*
  Arquivo: src/pages/MindmapPage.js
  Descrição: Corrigido o erro de compilação 'setIsWordCloudModalOpen is not defined' e ajustada a lógica para que o modal da nuvem de palavras abra imediatamente com o estado de carregamento.
*/
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
    ReactFlowProvider,
    useNodesState,
    useEdgesState,
    applyNodeChanges,
    applyEdgeChanges,
    MiniMap,
    Controls,
    Background,
    useReactFlow,
} from 'reactflow';
import io from 'socket.io-client';
import { useMapsAPI } from '../context/MapProvider';
import { useFlashcards } from '../context/FlashcardProvider';
import { useNotifications } from '../hooks/useNotifications';
import { useTheme } from '../hooks/useTheme';
import { API_BASE_URL } from '../api';
import CustomNode from '../components/Mindmap/CustomNode';
import LinkModal from '../components/LinkModal';
import ShareModal from '../components/ShareModal';
import FlashcardModal from '../components/FlashcardModal';
import WordCloudModal from '../components/WordCloudModal';
import { processTextForWordCloud } from '../utils/wordCloudProcessor';

let nodeIdCounter = 1;

const MindmapFlow = () => {
    const { mapId } = useParams();
    const navigate = useNavigate();
    const { getMapById, saveMap, loading: mapsLoading, getPermissionForMap } = useMapsAPI();
    const { createFlashcard } = useFlashcards();
    const { showNotification } = useNotifications();
    const { 
        nodeColor, fontColor, mapBgColor, 
        lineThickness, setLineThickness, 
        borderStyle, setBorderStyle
    } = useTheme();

    const [socket, setSocket] = useState(null);
    const [mapTitle, setMapTitle] = useState('Novo Mapa Mental');
    const [currentMap, setCurrentMap] = useState(null);
    const [permission, setPermission] = useState(null);
    const [isTitleEditing, setIsTitleEditing] = useState(false);
    const [nodes, setNodes, onNodesChangeInternal] = useNodesState([]);
    const [edges, setEdges, onEdgesChangeInternal] = useEdgesState([]);
    const { screenToFlowPosition } = useReactFlow();
    
    const [nodeMenu, setNodeMenu] = useState(null);
    const [edgeMenu, setEdgeMenu] = useState(null);
    const [isLinkModalOpen, setLinkModalOpen] = useState(false);
    const [isShareModalOpen, setShareModalOpen] = useState(false);
    const [isFlashcardModalOpen, setFlashcardModalOpen] = useState(false);
    const [isWordCloudModalOpen, setWordCloudModalOpen] = useState(false);
    const [isWordCloudLoading, setIsWordCloudLoading] = useState(false);
    const [wordCloudData, setWordCloudData] = useState([]);
    const [activeTopic, setActiveTopic] = useState(null);
    const [activeFlashcardTopic, setActiveFlashcardTopic] = useState(null);

    const isReadOnly = permission !== 'owner' && permission !== 'editor';
    const canContribute = permission === 'contributor';

    const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

    const closeAllMenus = useCallback(() => {
        setNodeMenu(null);
        setEdgeMenu(null);
    }, []);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('Autenticação necessária. Faça login novamente.', 'error');
            return;
        }

        const newSocket = io(API_BASE_URL, {
            auth: { token }
        });
        setSocket(newSocket);

        newSocket.on('connect_error', (err) => {
            showNotification(`Erro de conexão com o servidor: ${err.message}`, 'error');
        });
        
        newSocket.on('map:error', (errorMessage) => {
            showNotification(errorMessage, 'error');
            navigate('/app/dashboard');
        });
        
        newSocket.on('map:joined_successfully', () => {
            console.log('Conectado à sessão de edição em tempo real.');
        });

        const handleNodesUpdated = (changes) => setNodes((nds) => applyNodeChanges(changes, nds));
        const handleEdgesUpdated = (changes) => setEdges((eds) => applyEdgeChanges(changes, eds));

        newSocket.on('nodes:updated', handleNodesUpdated);
        newSocket.on('edges:updated', handleEdgesUpdated);

        return () => {
            newSocket.disconnect();
        };
    }, [navigate, showNotification, setNodes, setEdges]);

    useEffect(() => {
        if (socket && mapId) {
            socket.emit('map:join', mapId);
        }
        return () => {
            if (socket && mapId) {
                socket.emit('map:leave', mapId);
            }
        };
    }, [socket, mapId]);
    
    useEffect(() => {
        setNodes((nds) =>
            nds.map((node) => ({
                ...node,
                data: { ...node.data, nodeColor, fontColor, borderStyle },
            }))
        );
    }, [nodeColor, fontColor, borderStyle, setNodes]);

    useEffect(() => {
        setEdges((eds) => 
            eds.map((edge) => ({
                ...edge,
                style: { ...edge.style, strokeWidth: lineThickness }
            }))
        );
    }, [lineThickness, setEdges]);

    const onNodesChange = useCallback((changes) => {
        if (isReadOnly && !canContribute) return;
        onNodesChangeInternal(changes);
        if (socket && mapId) socket.emit('nodes:change', { mapId, changes });
    }, [socket, mapId, onNodesChangeInternal, isReadOnly, canContribute]);

    const onEdgesChange = useCallback((changes) => {
        if (isReadOnly) return;
        onEdgesChangeInternal(changes);
        if (socket && mapId) socket.emit('edges:change', { mapId, changes });
    }, [socket, mapId, onEdgesChangeInternal, isReadOnly]);

    const onConnect = useCallback((params) => {
        if (isReadOnly) return;
        const newEdge = { 
            id: `edge-${params.source}-${params.target}-${new Date().getTime()}`,
            ...params, 
            type: 'smoothstep', 
            animated: true,
            style: { strokeWidth: lineThickness }
        };
        onEdgesChange([{ item: newEdge, type: 'add' }]);
    }, [onEdgesChange, lineThickness, isReadOnly]);
    
    const handleTopicContextMenu = useCallback((event, nodeId, topicIndex) => {
        event.preventDefault();
        closeAllMenus();
        setNodeMenu({ nodeId, topicIndex, top: event.clientY, left: event.clientX });
    }, [closeAllMenus]);

    const onEdgeContextMenu = useCallback((event, edge) => {
        if (isReadOnly) return;
        event.preventDefault();
        closeAllMenus();
        setEdgeMenu({ id: edge.id, top: event.clientY, left: event.clientX });
    }, [closeAllMenus, isReadOnly]);
    
    const handleDeleteEdge = useCallback((edgeIdToDelete) => {
        if (isReadOnly) return;
        onEdgesChange([{ type: 'remove', id: edgeIdToDelete }]);
        closeAllMenus();
    }, [onEdgesChange, closeAllMenus, isReadOnly]);

    const updateNodeData = useCallback((nodeId, newTopics) => {
        setNodes((nds) =>
            nds.map((node) => (node.id === nodeId) ? { ...node, data: { ...node.data, topics: newTopics } } : node)
        );
    }, [setNodes]);

    const deleteNode = useCallback((nodeId) => {
        if (isReadOnly) return;
        onNodesChange([{ id: nodeId, type: 'remove' }]);
    }, [onNodesChange, isReadOnly]);
    
    const convertToFlowData = useCallback((initialMapData) => {
        if (!initialMapData) return;
        setLineThickness(initialMapData.lineThickness || 2);
        setBorderStyle(initialMapData.borderStyle || 'solid');
        const flowNodes = initialMapData.nodes.map(node => ({
            id: node.id, type: 'custom', position: { x: parseFloat(node.left), y: parseFloat(node.top) },
            data: { 
                topics: node.topics.map(t => ({...t, isEditing: false})),
                updateNodeData, 
                onShowContextMenu: handleTopicContextMenu, 
                onDeleteNode: deleteNode,
                borderStyle: initialMapData.borderStyle || 'solid'
            },
        }));
        setNodes(flowNodes);
        const flowEdges = initialMapData.connections.map((conn) => ({
            ...conn,
            type: 'smoothstep', animated: true, style: { strokeWidth: initialMapData.lineThickness || 2 }
        }));
        setEdges(flowEdges);
        const maxId = initialMapData.nodes.reduce((max, node) => {
            const num = parseInt(node.id.split('-')[1], 10);
            return isNaN(num) ? max : Math.max(max, num);
        }, 0);
        nodeIdCounter = maxId + 1;
    }, [setNodes, setEdges, updateNodeData, handleTopicContextMenu, deleteNode, setLineThickness, setBorderStyle]);
    
    useEffect(() => {
        const initializeMap = async () => {
            if (mapId) {
                const existingMap = getMapById(mapId);
                if (existingMap) {
                    setCurrentMap(existingMap);
                    setMapTitle(existingMap.title);
                    convertToFlowData(existingMap);
                    const userPermission = await getPermissionForMap(mapId);
                    setPermission(userPermission);
                } else if (!mapsLoading) {
                    navigate('/app/dashboard');
                }
            } else {
                setMapTitle('Novo Mapa Mental');
                setNodes([]);
                setEdges([]);
                setPermission('owner');
                setCurrentMap({ title: 'Novo Mapa Mental', nodes: [], connections: [] });
            }
        };
        initializeMap();
    }, [mapId, getMapById, navigate, mapsLoading, convertToFlowData, setNodes, setEdges, getPermissionForMap]);
    
    const handleSave = useCallback(async (nodesToSave = nodes) => {
        if (isReadOnly) {
            showNotification('Você não tem permissão para salvar este mapa.', 'error');
            return;
        }
        const apiNodes = nodesToSave.map(node => ({
            id: node.id, left: `${node.position.x}px`, top: `${node.position.y}px`,
            width: `${node.width}px`, height: `${node.height}px`,
            topics: node.data.topics.map(({ isEditing, ...rest }) => rest),
        }));

        const apiConnections = edges
            .filter(edge => edge && edge.id && edge.source && edge.target)
            .map(({ id, source, target }) => ({ id, source, target }));

        const mapToSave = { ...currentMap, _id: currentMap?._id, title: mapTitle, nodes: apiNodes, connections: apiConnections, lineThickness, borderStyle };
        const saved = await saveMap(mapToSave);
        if (saved && !mapId) { navigate(`/app/mindmap/${saved._id}`, { replace: true }); }
        else if (saved) { setCurrentMap(saved); }
    }, [nodes, edges, mapTitle, currentMap, saveMap, mapId, navigate, lineThickness, borderStyle, isReadOnly, showNotification]);

    const addNode = useCallback(() => {
        if (isReadOnly && !canContribute) return;
        const newId = `node-${nodeIdCounter++}`;
        const position = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
        const newNode = {
            id: newId, type: 'custom', position,
            data: {
                nodeColor,
                fontColor,
                borderStyle,
                topics: [{ text: 'Novo Tópico', links: [], isEditing: true }],
                updateNodeData, onShowContextMenu: handleTopicContextMenu, onDeleteNode: deleteNode,
            },
        };
        onNodesChange([{ item: newNode, type: 'add' }]);
    }, [screenToFlowPosition, onNodesChange, updateNodeData, handleTopicContextMenu, deleteNode, nodeColor, fontColor, borderStyle, isReadOnly, canContribute]);
    
    const handleMenuAction = async (action) => {
        if (!nodeMenu) return;
        const { nodeId, topicIndex } = nodeMenu;
        const node = nodes.find(n => n.id === nodeId);
        const topic = node?.data.topics[topicIndex];
        if (!topic) return;
        
        closeAllMenus();

        switch (action) {
            case 'edit':
                if(isReadOnly) return showNotification('Você não tem permissão para editar.', 'error');
                const newNodes = nodes.map(n => n.id === nodeId ? { ...n, data: { ...n.data, topics: n.data.topics.map((t, i) => i === topicIndex ? { ...t, isEditing: true } : { ...t, isEditing: false }) } } : n);
                setNodes(newNodes);
                break;
            case 'links': 
                setActiveTopic({ nodeId, topicIndex, ...topic }); 
                setLinkModalOpen(true); 
                break;
            case 'flashcard': 
                setActiveFlashcardTopic(topic);
                setFlashcardModalOpen(true);
                break;
            case 'wordcloud':
                setWordCloudData([]);
                setWordCloudModalOpen(true);
                setIsWordCloudLoading(true);
                try {
                    const words = await processTextForWordCloud(nodes);
                    if (words === null) {
                        showNotification('Adicione mais conteúdo ao mapa para gerar uma nuvem de palavras.', 'info');
                        setWordCloudModalOpen(false); // Corrigido o nome da função
                        return;
                    }
                    setWordCloudData(words);
                } catch (error) {
                    showNotification(error.message, 'error');
                    setWordCloudModalOpen(false); // Corrigido o nome da função
                } finally {
                    setIsWordCloudLoading(false);
                }
                break;
            default: 
                showNotification(`Funcionalidade "${action}" não implementada.`, 'error'); 
                break;
        }
    };

    const handleCreateFlashcard = async (flashcardData) => {
        try {
            await createFlashcard(flashcardData);
            showNotification('Flashcard criado com sucesso!', 'success');
            setFlashcardModalOpen(false);
        } catch (error) {
            showNotification(error.message || 'Erro ao criar o flashcard.', 'error');
        }
    };

    const handleSaveLinks = async (nodeId, topicIndex, newLinks) => {
        if(isReadOnly) return showNotification('Você não tem permissão para salvar links.', 'error');
        const newNodes = nodes.map(n => 
            n.id === nodeId 
                ? { ...n, data: { ...n.data, topics: n.data.topics.map((t, i) => i === topicIndex ? { ...t, links: newLinks } : t) } } 
                : n
        );
        setNodes(newNodes);
        await handleSave(newNodes);
        showNotification('Links atualizados e mapa salvo com sucesso!', 'success');
    };

    if (mapsLoading || permission === null) {
        return <div className="flex justify-center items-center h-full">Carregando...</div>;
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 bg-white rounded-t-xl shadow-sm flex justify-between items-center">
                <nav aria-label="breadcrumb">
                    <ol className="flex items-center text-lg sm:text-xl font-bold header-text">
                        <li><button onClick={() => navigate('/app/dashboard')} className="font-semibold secondary-text hover:text-accent">Dashboard</button></li>
                        <li><span className="mx-2 text-gray-400">/</span></li>
                        {isTitleEditing ? (
                            <input type="text" value={mapTitle} onChange={(e) => setMapTitle(e.target.value)} onBlur={() => setIsTitleEditing(false)} onKeyDown={(e) => e.key === 'Enter' && setIsTitleEditing(false)} className="font-bold bg-transparent outline-none ring-2 ring-accent rounded-md p-1" autoFocus readOnly={isReadOnly} />
                        ) : (
                            <li onClick={() => !isReadOnly && setIsTitleEditing(true)} className={`header-text ${!isReadOnly ? 'cursor-pointer hover:bg-gray-100' : ''} rounded-md p-1`} title="Clique para editar o título">{mapTitle}</li>
                        )}
                    </ol>
                </nav>
                {permission === 'owner' && (
                    <button onClick={() => mapId ? setShareModalOpen(true) : showNotification('Salve o mapa antes de compartilhar.', 'error')} className="button-primary font-semibold py-2 px-4 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center text-sm">
                        <span className="material-icons text-sm mr-2">group_add</span>
                        Compartilhar
                    </button>
                )}
            </div>
            <div className="flex-grow relative" style={{ height: '100%', backgroundColor: mapBgColor }}>
                <ReactFlow 
                    nodes={nodes} edges={edges} 
                    onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} 
                    nodeTypes={nodeTypes} onPaneClick={closeAllMenus} onNodeClick={closeAllMenus}
                    onEdgeContextMenu={onEdgeContextMenu}
                    fitView proOptions={{ hideAttribution: true }}
                    nodesDraggable={!isReadOnly}
                    nodesConnectable={!isReadOnly}
                    elementsSelectable={!isReadOnly}
                >
                    <Controls />
                    <MiniMap />
                    <Background variant="dots" gap={12} size={1} />
                    <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                        {(!isReadOnly || canContribute) && (
                            <button onClick={addNode} className="bg-white p-2.5 rounded-lg shadow-md hover:bg-gray-200 transition-colors" title="Adicionar novo card">
                                <span className="material-icons text-gray-700">add</span>
                            </button>
                        )}
                        {!isReadOnly && (
                            <button onClick={() => handleSave()} className="button-primary font-semibold py-2.5 px-5 rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center text-sm">
                                <span className="material-icons text-sm mr-2">save</span>
                                Salvar Mapa
                            </button>
                        )}
                    </div>
                </ReactFlow>
                {nodeMenu && (
                    <div style={{ top: nodeMenu.top, left: nodeMenu.left }} className="topic-context-menu">
                        <button onClick={() => handleMenuAction('edit')}><span className="material-icons">edit</span> Editar Tópico</button>
                        <button onClick={() => handleMenuAction('links')}><span className="material-icons">link</span> Gerenciar Links</button>
                        <div className="my-1 border-t border-gray-200 dark:border-gray-700"></div>
                        <button onClick={() => handleMenuAction('flashcard')}><span className="material-icons">style</span> Gerar Flashcard</button>
                        <button onClick={() => handleMenuAction('wordcloud')}><span className="material-icons">cloud</span> Nuvem de Palavras</button>
                    </div>
                )}
                {edgeMenu && (
                    <div style={{ top: edgeMenu.top, left: edgeMenu.left }} className="edge-delete-menu">
                        <button onClick={() => handleDeleteEdge(edgeMenu.id)} className="edge-delete-button" title="Deletar conexão">
                            &times;
                        </button>
                    </div>
                )}
                {activeTopic && (
                    <LinkModal 
                        isOpen={isLinkModalOpen} 
                        onClose={() => setLinkModalOpen(false)}
                        topic={activeTopic}
                        onSave={handleSaveLinks}
                        isReadOnly={isReadOnly}
                    />
                )}
                {activeFlashcardTopic && (
                    <FlashcardModal
                        isOpen={isFlashcardModalOpen}
                        onClose={() => setFlashcardModalOpen(false)}
                        topic={activeFlashcardTopic}
                        mapId={mapId}
                        onSubmit={handleCreateFlashcard}
                        showNotification={showNotification}
                    />
                )}
                {mapId && permission === 'owner' && (
                     <ShareModal
                        isOpen={isShareModalOpen}
                        onClose={() => setShareModalOpen(false)}
                        mapId={mapId}
                    />
                )}
                <WordCloudModal 
                    isOpen={isWordCloudModalOpen}
                    onClose={() => setWordCloudModalOpen(false)}
                    words={wordCloudData}
                    mapId={mapId}
                    mapTitle={mapTitle}
                    isLoading={isWordCloudLoading}
                />
            </div>
        </div>
    );
};

const MindmapPageWrapper = () => (<ReactFlowProvider> <MindmapFlow /> </ReactFlowProvider>);
export default MindmapPageWrapper;