/*
  Arquivo: /models/WordCloud.js
  Descrição: Schema Mongoose atualizado para armazenar a imagem da nuvem de palavras como um dataURL, em vez dos dados brutos das palavras, garantindo a visualização consistente.
*/
import mongoose from 'mongoose';
const { Schema } = mongoose;

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
    imageData: {
        type: String, // Armazena a imagem como um dataURL (Base64)
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model('WordCloud', WordCloudSchema);