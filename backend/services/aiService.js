/*
  Arquivo: services/aiService.js
  Descrição: O prompt da IA foi aprimorado com uma nova regra para retornar um array vazio caso o texto seja insuficiente para análise, tornando a função mais robusta.
*/
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

// Validação da chave de API
if (!process.env.GEMINI_API_KEY) {
    throw new Error("A variável de ambiente GEMINI_API_KEY não está definida.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({ 
    model: "gemini-1.5-flash",
    generationConfig: {
        responseMimeType: "application/json",
    }
});

export const generateFlashcardFromTopic = async (topic) => {
    const prompt = `
        Baseado no seguinte tópico de um mapa mental: "${topic}", crie um flashcard conciso e eficaz.
        O flashcard deve ajudar a solidificar o conhecimento sobre o tópico.
        Retorne sua resposta em um formato JSON com duas chaves: "front" e "back".
        - "front": Deve conter uma pergunta clara e direta ou um termo chave sobre o tópico.
        - "back": Deve conter a resposta completa e informativa. A resposta deve ser um resumo eficaz e ter no máximo 500 caracteres.

        Exemplo de tópico: "Ciclo da Água: Evaporação"
        Exemplo de resposta JSON:
        {
            "front": "O que é evaporação no ciclo da água?",
            "back": "É o processo pelo qual a água líquida de rios, lagos e oceanos se transforma em vapor de água (gás) e sobe para a atmosfera, impulsionada pela energia solar."
        }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        return JSON.parse(text);
    } catch (error) {
        console.error("Erro ao gerar flashcard com IA:", error);
        throw new Error("Não foi possível gerar o conteúdo com a IA. Verifique a chave de API e a formatação da resposta.");
    }
};

/**
 * Analisa um texto usando a IA do Gemini para extrair palavras-chave relevantes para uma nuvem de palavras.
 * @param {string} mapText O conteúdo textual completo do mapa mental.
 * @returns {Promise<Array<{text: string, value: number}>>} Uma promisse que resolve para um array de palavras com seus pesos.
 */
export const generateWordCloudFromText = async (mapText) => {
    const prompt = `
      Aja como um especialista em Processamento de Linguagem Natural e análise de conteúdo.
      Sua tarefa é analisar o seguinte texto, extraído de um mapa mental, para identificar os conceitos-chave e atribuir um "Índice de Relevância Contextual" de 1 a 100 para cada um.

      REGRAS FUNDAMENTAIS:
      1.  **FOCO NA RELEVÂNCIA, NÃO NA FREQUÊNCIA:** A pontuação deve refletir a importância do conceito para o entendimento do tema central. Um termo pode ser muito relevante mesmo que apareça poucas vezes.
      2.  **LEMATIZAÇÃO E AGRUPAMENTO:** Agrupe sinônimos e variações de uma palavra sob um único conceito principal. Por exemplo, "legislativo", "legislação", e "legislador" devem ser agrupados no conceito "Lei". "constitucional" e "constituição" devem ser agrupados no conceito "Constituição".
      3.  **IDENTIFIQUE CONCEITOS COMPOSTOS:** Dê maior peso a bigramas ou trigramas que representam um conceito único e importante (ex: "Controle Difuso", "Supremo Tribunal Federal", "Ação Direta de Inconstitucionalidade").
      4.  **RESPOSTA PARA CONTEÚDO INSUFICIENTE:** Se o texto fornecido for muito curto ou não tiver substância para uma análise significativa, retorne um array vazio: [].
      5.  **SAÍDA ESTRITA:** Retorne o resultado exclusivamente como um array de objetos JSON, com no máximo 50 itens, ordenados do mais relevante para o menos relevante. Não inclua nenhuma outra explicação ou texto antes ou depois do array.

      TEXTO PARA ANÁLISE:
      "${mapText}"

      FORMATO OBRIGATÓRIO DA RESPOSTA:
      [
          { "text": "Conceito Principal", "value": 98 },
          { "text": "Termo Relevante", "value": 95 },
          { "text": "Conceito Secundário", "value": 87 }
      ]
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        
        const parsedResult = JSON.parse(text);
        if (Array.isArray(parsedResult)) {
            return parsedResult;
        }

        // Fallback caso a IA encapsule o array em um objeto
        const arrayKey = Object.keys(parsedResult).find(key => Array.isArray(parsedResult[key]));
        if(arrayKey) return parsedResult[arrayKey];

        throw new Error("A resposta da IA não continha um array no formato esperado.");

    } catch (error) {
        console.error("Erro ao gerar nuvem de palavras com IA:", error);
        throw new Error("Não foi possível gerar a nuvem de palavras com a IA.");
    }
};