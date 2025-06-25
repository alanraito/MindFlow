/*
  Arquivo: /models/WordCloud.js
  Descrição: Novo schema Mongoose para armazenar os dados das nuvens de palavras geradas, associando-as a um usuário e a um mapa específico.
*/
import mongoose from 'mongoose';
const { Schema } = mongoose;

const WordSchema = new Schema({
    text: { type: String, required: true },
    value: { type: Number, required: true }
}, { _id: false });

const WordCloudSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    map: {
        type: Schema.Types.ObjectId,
        ref: 'Map',
        required: true
    },
    mapTitle: {
        type: String,
        required: true
    },
    words: {
        type: [WordSchema],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('WordCloud', WordCloudSchema);