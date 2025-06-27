/*
  Arquivo: /routes/wordclouds.js
  Descrição: Modificada a rota POST para aceitar e salvar o `imageData` da nuvem de palavras, em vez da lista de palavras.
*/
import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import WordCloud from '../models/WordCloud.js';
import Map from '../models/Map.js';

const router = express.Router();

// @route   POST /api/wordclouds
// @desc    Salvar uma nova nuvem de palavras (como imagem)
router.post('/', authMiddleware, async (req, res) => {
    const { mapId, mapTitle, imageData } = req.body;

    if (!mapId || !mapTitle || !imageData) {
        return res.status(400).json({ msg: 'Dados incompletos para salvar a nuvem de palavras.' });
    }

    try {
        const map = await Map.findById(mapId);
        if (!map || map.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Ação não autorizada.' });
        }

        const newWordCloud = new WordCloud({
            user: req.user.id,
            map: mapId,
            mapTitle,
            imageData
        });

        const savedWordCloud = await newWordCloud.save();
        res.status(201).json(savedWordCloud);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
});

// @route   GET /api/wordclouds/map/:mapId
// @desc    Buscar todas as nuvens de palavras de um mapa específico
router.get('/map/:mapId', authMiddleware, async (req, res) => {
    try {
        const wordClouds = await WordCloud.find({ map: req.params.mapId, user: req.user.id })
                                          .sort({ createdAt: -1 });
        res.json(wordClouds);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
});

// @route   DELETE /api/wordclouds/:id
// @desc    Deletar uma nuvem de palavras
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const wordCloud = await WordCloud.findById(req.params.id);

        if (!wordCloud) {
            return res.status(404).json({ msg: 'Nuvem de palavras não encontrada.' });
        }

        if (wordCloud.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Ação não autorizada.' });
        }

        await wordCloud.deleteOne();
        res.json({ msg: 'Nuvem de palavras removida.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
});

export default router;