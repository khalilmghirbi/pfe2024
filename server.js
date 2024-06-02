const express= require("express")
const app = express()
/////////
const bodyParser = require('body-parser')
//////////////////
const db = require('./models/index')
const userRoutes=require("./routers/user-routes")
const docteurRoutes=require("./routers/docteur-routes")
const hopital_hotelsRoutes=require("./routers/hopital_hotels-routes")
const dossierRoutes=require("./routers/dossier-routes")
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use('/',userRoutes)
app.use('/',docteurRoutes)
app.use('/',hopital_hotelsRoutes)
app.use('/', dossierRoutes);
//lorsque on va utiliser Front :angular 
app.use((req,res,next)=>{
  res.setHeader('Access-Control-Allow-Origin','*')
  res.setHeader('Access-Control-Request-Methods','*')
  res.setHeader('Access-Control-Allow-Headers','*')
  res.setHeader('Access-Control-Allow-Methods','*')
  next()
})
//app.use(bodyParser.urlencoded({ extended: true }));
db.sequelize.sync().then(()=>{
    app.listen(4000,()=>console.log("server listening in port 4000"))
})

/*const express = require('express');
const Sequelize = require('sequelize');
const sequelizeConfig = require('./config/config.json');

const app = express();
const sequelize = new Sequelize(sequelizeConfig);

sequelize.authenticate()
    .then(() => {
        console.log('Connexion à la base de données réussie.');
    })
    .catch(err => {
        console.error('Erreur de connexion à la base de données:', err);
    });

// Autres configurations Express...

app.listen(3000, () => {
    console.log('Serveur démarré sur le port 3000');
});*/
/*const express = require('express');
const Sequelize = require('sequelize');
const sequelizeConfig = require('./config/config.json');

const app = express();*/
/*const sequelize = new Sequelize(sequelizeConfig.database, sequelizeConfig.username, sequelizeConfig.password, {
  host: sequelizeConfig.host,
  dialect:mariadb // Spécifiez le dialecte ici
});*/

/*
const sequelize = new  Sequelize('hopitaldb','root','',{
    dialect: 'mariadb'});
sequelize.authenticate()
  .then(() => {
    console.log('Connexion à la base de données réussie.');
  })
  .catch(err => {
    console.error('Erreur de connexion à la base de données:', err);
  });

// Autres configurations Express...

app.listen(4000, () => {
  console.log('Serveur démarré sur le port 3000');
});
*/