const express = require('express');
const Grupo = require('../models/Grupo');
const Usuario = require('../models/Usuario');
const transporter = require('../mailer/mailer');
const { admin } = require('../firebase/firebase');

const router = express.Router();

const port = 3000
const notification_options = {
    priority: "high",
    timeToLive: 60 * 60 * 24
  };

const subject = "Convite para amigo secreto";

router.post('/cadastro', async (req, res)=>{
    try{
        let body = req.body;
        let nome = body.nome;
        let dataEntrega = body.dataEntrega;
        let dataCriacao = new Date();
        let criadoPor = await Usuario.findById(body.usuario)
        
        const grupo = await Grupo.create({nome, dataEntrega, criadoPor, dataCriacao});
        return res.send({grupo})
    }catch(err){
        return res.status(400).send({error: "Falha ao cadastrar", err})
    }
});
router.get('/busca', async (req,res)=>{
    let id = req.query.id;
    if(id){
        let grupos = await Grupo.find({criadoPor: id}).populate('usuarios').populate('criadoPor').populate('sorteados.recebe')
        .populate({
            path: 'sorteados.entrega',
            match: {_id: id } ,
        }).exec();
        return res.json(grupos);
    }else{
        return res.status(400).json({error:'usuario nao enconstrado'})
    }
    
})
router.get('/buscaConvites', async (req,res) =>{
    let email = req.query.email;
    if(email){
        let grupos = await Grupo.find({aguardandoConfirm: email}).populate('usuarios').populate('criadoPor');

        return res.json(grupos)
    }else{
        return res.status(400).json({error:'usuario nao enconstrado'})
    }
})
router.get('/buscaAceites', async (req,res) =>{
    let id = req.query.id;
    if(id){
        let grupos = await Grupo.find({$or:[ {usuarios: id}, {'sorteados.entrega': id} ]})
        .populate('usuarios')
        .populate('sorteados.recebe')
        .populate({
            path: 'sorteados.entrega',
            match: {_id: id } ,
        }).exec();
        return res.json(grupos)
    }else{
        return res.status(400).json({error:'usuario nao enconstrado'})
    }
})

router.post('/addUsuario', async (req,res)=>{
    let {grupoId, email} = await req.body;
    let grupo = await Grupo.findById(grupoId).populate('usuarios').populate('criadoPor');
    grupo.aguardandoConfirm.push(email)
    await grupo.save()
    
    const mailOptions = {
        from: '"felipegabriel@mail.ee"', // sender address
        to: email, // list of receivers
        subject: subject, // Subject line
        text: `Olá, você foi convidado por ${grupo.criadoPor.nome} para participar do amigo secreto`, // plain text body
        html: `<p>Olá, você foi convidado por ${grupo.criadoPor.nome} para participar do amigo secreto</p>`, // html body
      }
      await transporter.sendMail(mailOptions, async (err, info)=>{
        if (err) {
            console.log(err);
          } else {
            let i = await info;
            console.log('mensagem: ' + i.mesageId);
            console.log('envelope: ' + i.envelope);
            console.log('accepted: ' + i.accepted);
            console.log('rejected: ' + i.rejected);
            console.log('pending: ' + i.pending);
          }
    })
    await transporter.close();
    return res.json(grupo)
})
router.post('/addConfirmacao', async (req,res)=>{
    let {grupoId, email} = await req.body;
    let usuario = await Usuario.findOne({email});
    let grupo = await Grupo.findById(grupoId).populate('usuarios').populate('criadoPor');
    grupo.usuarios.push(usuario)
    grupo.aguardandoConfirm.pull(email)
    const options =  notification_options
    await grupo.save()
    let message = `Seu amigo ${usuario.nome} acabou de aceitar o convite para o amigo secreto do grupo ${grupo.nome}`;
    const message_notification = {
        notification: {
           title: "Convite aceito",
           body: message
               }
        };
    admin.messaging().sendToDevice(grupo.criadoPor.idFirebase, message_notification, options).then( response => {
        console.log("push enviado ",response)
    })
    return res.json(grupo)
})
router.delete('/apaga', async (req,res) => {
    let grupoId = await req.body.grupoId;
    await Grupo.findOneAndDelete({_id: grupoId});
    return res.send({message: 'Apagado com sucesso'})
})
router.get('/sortear', async (req,res) =>{
    let grupoId = await req.query.grupoId;
    let grupo = await Grupo.findById(grupoId).populate('usuarios').populate('criadoPor');
    let lista = grupo.usuarios;
    // let keys = Object.keys(combinados);
    let entrega = grupo.criadoPor
    let recebe, sorteados;
    while(lista.length>0){
        indexSorteado = Math.floor(Math.random() * (lista.length - 1)); 
        recebe = lista[indexSorteado];
        lista.splice(indexSorteado, 1);
        sorteados = {
            entrega, 
            recebe
        }
        grupo.sorteados.push(sorteados)
        entrega = recebe;
        };
    sorteados = {
        entrega, 
        recebe: grupo.criadoPor
    }
    grupo.sorteados.push(sorteados)
    // for(let k in keys){
    //     let id = keys[k];
    //     if(id===grupo.criadoPor._id) entrega = grupo.criadoPor._id;
    //     else{
    //         entrega = grupo.usuarios.filter(usuario => {
    //             return usuario._id==id
    //         })[0]
    //     }
    //     if(combinados[id]===grupo.criadoPor._id) recebe = grupo.criadoPor._id;
    //         else{
    //             recebe = grupo.usuarios.filter(usuario => {
    //                 return usuario._id==combinados[id]
    //             })[0]
    //         }
    //         sorteados = {
    //             entrega, 
    //             recebe
    //         }
    //         grupo.sorteados.push(sorteados)
    //         entrega = sorteado;
    // }
    grupo.foiSorteado = true;
    await grupo.save();
    return res.json(grupo.populate('sorteados'))
})

module.exports = app => app.use('/grupo', router);