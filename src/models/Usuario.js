const mongoose = require('../database/index');

const UsuarioSchema = mongoose.Schema({
    nome: {
        type: String,
        require: false
    },
    email:{
        type: String,
        require: '{PATH} é obrigatório',
        unique: true,
        lowercase: true
    },
    idFirebase:{
        type: String
    },
    tamanhoCamisa:{
        type: String
    },
    tamanhoCalca:{
        type: String
    },
    tamanhoSapato:{
        type: Number
    },
    hobby:{
        type: String
    }
});

const Usuario = mongoose.model('Usuario', UsuarioSchema);

module.exports = Usuario;