/*
  Arquivo: src/utils/wordCloudProcessor.js
  Descrição: Adicionada uma validação no frontend para garantir que a chamada à IA só seja feita se houver um número mínimo de palavras, tornando o processo mais eficiente e robusto.
*/
import { fetchWithAuth, API_URL } from '../api';

export const processTextForWordCloud = async (nodes) => {
  // 1. Extrai todo o texto bruto dos tópicos.
  const allText = nodes
    .flatMap(node => node.data.topics)
    .map(topic => topic.text.replace(/<[^>]*>/g, ' ')) // Remove tags HTML antes de enviar
    .join(' ');

  // 2. Validação de conteúdo mínimo no frontend
  const wordCount = allText.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount < 5) {
    // Retorna null para indicar que não há conteúdo suficiente, permitindo que a UI mostre uma notificação.
    return null;
  }
  
  // 3. Faz a chamada para o backend para processamento com IA.
  try {
    const response = await fetchWithAuth(`${API_URL}/ai/process-wordcloud`, {
      method: 'POST',
      body: JSON.stringify({ text: allText }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.msg || 'Falha ao processar a nuvem de palavras.');
    }

    const wordCloudData = await response.json();
    return wordCloudData;
  } catch (error) {
    console.error("Erro no processador da nuvem de palavras:", error);
    // Retorna o erro para que a UI possa exibi-lo
    throw error; 
  }
};