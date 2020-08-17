const mongoose = require('../database/index');

const GrupoSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: '{PATH} é obrigatório'
    },
    dataCriacao:{
        type: Date
    },
    dataEntrega:{
        type: Date
    },
    criadoPor:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Usuario',
        required: '{PATH} é obrigatório'
    },
    usuarios:[
        {type: mongoose.Schema.Types.ObjectId, ref: 'Usuario'}
    ],
    aguardandoConfirm:[
        {type: String}
    ],
    foiSorteado:{
        type: Boolean,
        default: false
    },
    sorteados:[
        {
            entrega:{
                type: mongoose.Schema.ObjectId,
                ref: 'Usuario',
                required: '{PATH} é obrigatório'
            },
            recebe:{
                type: mongoose.Schema.ObjectId,
                ref: 'Usuario',
                required: '{PATH} é obrigatório'
            }
        }
    ]
});

module.exports = mongoose.model('Grupo', GrupoSchema);