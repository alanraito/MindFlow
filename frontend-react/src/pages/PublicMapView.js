/*
  Arquivo: src/pages/PublicMapView.js
  Descrição: O componente foi ajustado para passar funções vazias e todas as propriedades de estilo para o CustomNode, garantindo que ele opere em modo de apenas leitura e seja renderizado corretamente.
*/
import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import ReactFlow, { MiniMap, Controls, Background } from 'reactflow';
import CustomNode from '../components/Mindmap/CustomNode';
import { API_URL } from '../api';
import 'reactflow/dist/style.css';

const PublicMapView = () => {
    const { shareId } = useParams();
    const [mapData, setMapData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const nodeTypes = useMemo(() => ({ custom: CustomNode }), []);

    useEffect(() => {
        const fetchPublicMap = async () => {
            try {
                setLoading(true);
                const res = await fetch(`${API_URL}/public/maps/${shareId}`);
                if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData.msg || 'Não foi possível carregar o mapa.');
                }
                const data = await res.json();
                
                const flowNodes = data.nodes.map(node => ({
                    id: node.id,
                    type: 'custom',
                    position: { x: parseFloat(node.left), y: parseFloat(node.top) },
                    data: { 
                        topics: node.topics,
                        // Garante que o nó seja somente de leitura, passando funções vazias
                        updateNodeData: () => {},
                        onShowContextMenu: () => {},
                        onDeleteNode: () => {},
                        // Passa as propriedades de estilo para consistência visual
                        nodeColor: data.nodeColor || '#ffffff',
                        fontColor: data.fontColor || '#1a202c',
                        borderStyle: data.borderStyle || 'solid',
                    },
                }));

                const flowEdges = data.connections.map((conn, i) => ({
                    id: `e${conn.from}-${conn.to}-${i}`,
                    source: conn.from,
                    target: conn.to,
                    type: 'smoothstep',
                    animated: true,
                    style: {
                        strokeWidth: data.lineThickness || 2,
                        strokeDasharray: data.lineStyle === 'dashed' ? '5 5' : null,
                    }
                }));

                setMapData({ title: data.title, nodes: flowNodes, edges: flowEdges });
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (shareId) {
            fetchPublicMap();
        }
    }, [shareId]);

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Carregando mapa...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;
    }

    return (
        <div className="w-full h-screen flex flex-col">
             <header className="p-4 border-b border-gray-200 bg-white shadow-sm text-center">
                 <h1 className="text-xl font-bold">{mapData?.title}</h1>
                 <p className="text-sm text-gray-500">Visualizando mapa compartilhado</p>
             </header>
             <div className="flex-grow">
                 <ReactFlow
                     nodes={mapData?.nodes}
                     edges={mapData?.edges}
                     nodeTypes={nodeTypes}
                     fitView
                     nodesDraggable={false}
                     nodesConnectable={false}
                     elementsSelectable={false}
                     proOptions={{ hideAttribution: true }}
                 >
                     <Controls showInteractive={false} />
                     <MiniMap pannable zoomable />
                     <Background variant="dots" gap={12} size={1} />
                 </ReactFlow>
             </div>
        </div>
    );
};

export default PublicMapView;