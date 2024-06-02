const express = require('express')
const route= express.Router()
const db= require('../models/index')
const Hopital_hotels = require("../models/hopital_hotels")
const { where } = require('sequelize')
//const { sequelize, dossier, client, dossier_rdv, Dossier_cliniques, hopital, ville, users } = require('../models'); // Assurez-vous que le chemin est correct
//const { dateToDbFormat } = require('../helpers/dateHelper');
const bodyParser = require('body-parser')

const hopital_hotelsController = require("../controlles/hopital_hotelsController")

route .post('/createhotel',(req,res,next)=>{
    db.Hopital_hotels.create({
        hotel_hopitalid:req.body.hotel_hopitalid,
        hotel_name:req.body.hotel_name,
        hotel_stars:req.body.hotel_stars,
        hotel_link:req.body.hotel_link,
        hotel_singleroom:req.body.hotel_singleroom,
        hotel_doubleroom:req.body.hotel_doubleroom,
        hotel_address:req.body.hotel_address
    }).then((response)=>res.status(200).send(response))
    .catch((err)=>res.status(400).send(err))
})


route.get('/hotel/:hotel_id', (req,res,next)=>{
    db.Hopital_hotels.findOne({where:{hotel_id:req.params.hotel_id}})
    .then((response)=>res.status(200).send(response))
    .catch((err)=>res.status(400).send(err))
})

/// valider
route.get('/hotels', (req,res,next)=>{
    db.Hopital_hotels.findAll()
    .then((response)=>res.status(200).send(response))
    .catch((err)=>res.status(400).send(err))
})

/// valider
route.put('/hotel/:hotel_id', (req,res,next)=>{
    db.Hopital_hotels.update({
        hotel_hopitalid:req.body.hotel_hopitalid,
        hotel_name:req.body.hotel_name,
        hotel_stars:req.body.hotel_stars,
        hotel_link:req.body.hotel_link,
        hotel_singleroom:req.body.hotel_singleroom,
        hotel_doubleroom:req.body.hotel_doubleroom,
        hotel_address:req.body.hotel_address
    },{where:{hotel_id:req.params.hotel_id}})
    .then((response)=>res.status(200).send(response))
    .catch((err)=>res.status(400).send(err))
})
///valider 
route.delete('/hotel/:hotel_id', (req,res,next)=>{
    db.Hopital_hotels.destroy({where:{hotel_id:req.params.hotel_id}})
    .then((response)=>res.status(200).send(response))
    .catch((err)=>res.status(400).send(err))
})

module.exports= route
