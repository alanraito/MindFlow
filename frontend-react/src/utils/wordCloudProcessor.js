/*
  Arquivo: src/utils/wordCloudProcessor.js
  Descrição: Refatorado para fazer uma chamada de API ao backend, que agora utiliza a IA do Gemini para processar o texto, em vez de fazer o cálculo localmente.
*/
import { fetchWithAuth, API_URL } from '../api'; // Supondo que fetchWithAuth esteja em api.js

export const processTextForWordCloud = async (nodes) => {
  // 1. Extrai todo o texto bruto dos tópicos.
  const allText = nodes
    .flatMap(node => node.data.topics)
    .map(topic => topic.text.replace(/<[^>]*>/g, ' ')) // Remove tags HTML antes de enviar
    .join(' ');

  if (!allText.trim()) {
    return [];
  }
  
  // 2. Faz a chamada para o backend para processamento com IA.
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