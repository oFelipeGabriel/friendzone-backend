const express = require('express');
const bodyParser = require('body-parser')
const Usuario = require('../models/Usuario');
const Grupo = require('../models/Grupo');
const jsonParser = bodyParser.json();
const router = express.Router();

router.post('/cadastro', async (req, res)=>{
    try{
        const usuario = await Usuario.create(req.body);
        return res.send({usuario})
    }catch(err){
        return res.status(400).send({error: "Falha ao cadastrar", err})
    }
});
router.post('/atualizaFirebase', async (req,res) =>{
    let {idUsuario, idFirebase} = req.body;
    await Usuario.findOneAndUpdate({_id:idUsuario}, {"idFirebase": idFirebase}, {upsert: true}, (err, result) => {
        if(err){
            res.send(err)
        }else{
            res.send(result)
        }
    })
})
router.get('/busca', jsonParser, async (req,res)=>{
    let email = await req.query.email;
    let users = await Usuario.find({email},(err, usuarios)=>{
        return usuarios
    })
    return res.send(users);
});
router.get('/buscaGrupo', async (req,res)=>{
    let email = await req.body.email;
    let grupos = await Grupo.find({aguardandoConfirm: email});
    return res.json(grupos)
})
router.delete('/deletar', async (req,res) =>{
    let user = req.body.id;
    await Usuario.findByIdAndDelete(user);
    res.send({message: 'Apagado com sucesso'})
})

module.exports = app => app.use('/usuario', router);