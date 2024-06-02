const express = require('express')
const route= express.Router()
const db= require('../models/index')
const Docteur = require("../models/docteur")
const { where } = require('sequelize')
const docteurController = require("../controlles/docteurController")


route .post('/createdocteur',(req,res,next)=>{
    db.Docteur.create({
        docteur_alias:req.body.docteur_alias,
        docteur_title:req.body.docteur_title,
        docteur_content:req.body.docteur_content,
        docteur_seotitle:req.body.docteur_seotitle,
        docteur_seodesc:req.body.docteur_seodesc,
        procedure_id:req.body.procedure_id,
        lang:req.body.lang
    }).then((response)=>res.status(200).send(response))
    .catch((err)=>res.status(400).send(err))
})


route.get('/docteur/:docteur_id', (req,res,next)=>{
    db.Docteur.findOne({where:{docteur_id:req.params.docteur_id}})
    .then((response)=>res.status(200).send(response))
    .catch((err)=>res.status(400).send(err))
})


route.get('/docteurs', (req,res,next)=>{
    db.Docteur.findAll()
    .then((response)=>res.status(200).send(response))
    .catch((err)=>res.status(400).send(err))
})

route.put('/docteur/:docteur_id', (req,res,next)=>{
    db.Docteur.update({
        docteur_alias:req.body.docteur_alias,
        docteur_title:req.body.docteur_title,
        docteur_content:req.body.docteur_content,
        docteur_seotitle:req.body.docteur_seotitle,
        docteur_seodesc:req.body.docteur_seodesc,
        procedure_id:req.body.procedure_id
    },{where:{docteur_id:req.params.docteur_id}})
    .then((response)=>res.status(200).send(response))
    .catch((err)=>res.status(400).send(err))
})

route.delete('/docteur/:docteur_id', (req,res,next)=>{
    db.Docteur.destroy({where:{docteur_id:req.params.docteur_id}})
    .then((response)=>res.status(200).send(response))
    .catch((err)=>res.status(400).send(err))
})
module.exports= route
