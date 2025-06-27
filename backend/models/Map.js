/*
  Arquivo: /models/Map.js
  Descrição: Schema atualizado para incluir as propriedades de estilo de cores (nodeColor, fontColor, mapBgColor), permitindo que o tema visual de cada mapa seja salvo.
*/
import mongoose from 'mongoose';
const { Schema } = mongoose;

const LinkSchema = new Schema({
    title: { type: String, required: true },
    url: { type: String, required: true }
}, { _id: false });

const TopicSchema = new Schema({
    text: { type: String, required: true },
    links: { type: [LinkSchema], default: [] }
}, { _id: false });

const NodeSchema = new Schema({
    id: { type: String, required: true },
    left: { type: String, required: true },
    top: { type: String, required: true },
    width: { type: String },
    height: { type: String },
    topics: { type: [TopicSchema], default: [] }
}, { _id: false });

const ConnectionSchema = new Schema({
    id: { type: String, required: true },
    source: { type: String, required: true },
    target: { type: String, required: true }
}, { _id: false });

const MapSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        default: 'Mapa Mental Sem Título'
    },
    nodes: {
        type: [NodeSchema],
        default: []
    },
    connections: {
        type: [ConnectionSchema],
        default: []
    },
    lineThickness: {
        type: Number,
        default: 2
    },
    borderStyle: {
        type: String,
        default: 'solid'
    },
    nodeColor: {
        type: String,
        default: '#ffffff'
    },
    fontColor: {
        type: String,
        default: '#1a202c'
    },
    mapBgColor: {
        type: String,
        default: '#f3f4f6'
    },
    isPublic: {
        type: Boolean,
        default: false
    },
    shareId: {
        type: String,
        unique: true,
        sparse: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('Map', MapSchema);