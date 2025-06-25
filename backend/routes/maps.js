/*
  Arquivo: routes/maps.js
  Descrição: As rotas de criação e atualização foram modificadas para incluir o processamento e salvamento da propriedade 'borderStyle'.
*/
import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import authMiddleware from '../middleware/authMiddleware.js';
import Map from '../models/Map.js';
import Permission from '../models/Permission.js';
import Flashcard from '../models/Flashcard.js';

const router = express.Router();

const enrichMapsWithFlashcardCount = async (maps) => {
    const enrichedMaps = await Promise.all(maps.map(async (map) => {
        const flashcardCount = await Flashcard.countDocuments({ map: map._id });
        return { ...map, flashcardCount };
    }));
    return enrichedMaps;
};

router.get('/', authMiddleware, async (req, res) => {
    try {
        const maps = await Map.find({ user: req.user.id })
            .populate('user')
            .sort({ updatedAt: -1 })
            .lean();
        const mapsWithCount = await enrichMapsWithFlashcardCount(maps);
        res.json(mapsWithCount);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro no servidor');
    }
});

router.get('/shared-with-me', authMiddleware, async (req, res) => {
    try {
        const permissions = await Permission.find({ user: req.user.id }).select('map');
        const mapIds = permissions.map(p => p.map);
        const maps = await Map.find({ _id: { $in: mapIds } })
            .populate('user')
            .sort({ updatedAt: -1 })
            .lean();
        const mapsWithCount = await enrichMapsWithFlashcardCount(maps);
        res.json(mapsWithCount);
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro no servidor');
    }
});

router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, nodes, connections, lineThickness, borderStyle } = req.body;
        const newMap = new Map({ title, user: req.user.id, nodes, connections, lineThickness, borderStyle });
        const map = await newMap.save();
        const mapWithOwner = await Map.findById(map._id).populate('user').lean();
        const responseMap = { ...mapWithOwner, flashcardCount: 0 };
        res.status(201).json(responseMap);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
});

router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { title, nodes, connections, lineThickness, borderStyle } = req.body;
        let map = await Map.findById(req.params.id);
        if (!map) return res.status(404).json({ msg: 'Mapa não encontrado' });
        
        const hasPermission = await Permission.findOne({ map: req.params.id, user: req.user.id, level: 'edit' });
        if (map.user.toString() !== req.user.id && !hasPermission) {
            return res.status(401).json({ msg: 'Ação não autorizada' });
        }
        map.title = title;
        map.nodes = nodes;
        map.connections = connections;
        map.lineThickness = lineThickness;
        map.borderStyle = borderStyle;
        map.updatedAt = Date.now();
        
        map.markModified('nodes');
        
        const savedMap = await map.save();
        const populatedMap = await Map.findById(savedMap._id).populate('user').lean();
        const responseMapArray = await enrichMapsWithFlashcardCount([populatedMap]);
        res.json(responseMapArray[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
});

router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const map = await Map.findById(req.params.id);
        if (!map) return res.status(404).json({ msg: 'Mapa não encontrado' });
        if (map.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Ação não autorizada' });
        }
        await Flashcard.deleteMany({ map: req.params.id });
        await Permission.deleteMany({ map: req.params.id });
        await map.deleteOne();
        res.json({ msg: 'Mapa removido' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
});

router.post('/:id/share', authMiddleware, async (req, res) => {
    try {
        const map = await Map.findById(req.params.id);
        if (!map) {
            return res.status(404).json({ msg: 'Mapa não encontrado.' });
        }
        if (map.user.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Ação não autorizada.' });
        }

        if (!map.shareId) {
            map.shareId = uuidv4();
        }
        map.isPublic = true;
        await map.save();

        res.json({ shareId: map.shareId });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro no servidor');
    }
});

export default router;