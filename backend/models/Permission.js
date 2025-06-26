/*
  Arquivo: models/Permission.js
  Descrição: O schema foi atualizado para usar o campo 'role' com permissões granulares (editor, contributor, viewer), substituindo o antigo 'permissionLevel'.
*/
import mongoose from 'mongoose';
const { Schema } = mongoose;

const PermissionSchema = new Schema({
    map: {
        type: Schema.Types.ObjectId,
        ref: 'Map',
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    grantedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        enum: ['editor', 'contributor', 'viewer'],
        default: 'viewer'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Índice para garantir que um usuário não seja convidado para o mesmo mapa duas vezes.
PermissionSchema.index({ map: 1, user: 1 }, { unique: true });

export default mongoose.model('Permission', PermissionSchema);