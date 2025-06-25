/*
  Arquivo: routes/ai.js
  Descrição: Adicionada a nova rota POST /process-wordcloud para acionar a análise de texto pela IA e gerar os dados para a nuvem de palavras.
*/
import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { generateFlashcardFromTopic, generateWordCloudFromText } from '../services/aiService.js';

const router = express.Router();

router.post('/generate-flashcard', authMiddleware, async (req, res) => {
    const { topic } = req.body;

    if (!topic || typeof topic !== 'string' || topic.trim() === '') {
        return res.status(400).json({ msg: 'O tópico é obrigatório para a geração.' });
    }

    try {
        const generatedContent = await generateFlashcardFromTopic(topic);
        res.json(generatedContent);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
});

router.post('/process-wordcloud', authMiddleware, async (req, res) => {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || text.trim() === '') {
        return res.status(400).json({ msg: 'O texto é obrigatório para a geração da nuvem de palavras.' });
    }

    try {
        const wordCloudData = await generateWordCloudFromText(text);
        res.json(wordCloudData);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
});

export default router;