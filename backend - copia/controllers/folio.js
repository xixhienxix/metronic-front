const express = require('express');
const Foliador = require('../models/folios')

// exports.getFolios= (req,res,next) =>{
//   Foliador.find(this).then((folios) => {
//   res.status(200).json(folios)
//   });
//   }

exports.getFoliosbyLetra = (req,res,next) =>{

  const query = Foliador.findOne({ Letra: req.params.letra });

  query.then((doc)=> {
    res.status(200).send(doc)
    console.log("FOLIOS FLITRADOS",doc)
  });

}

exports.updateFolio = (req,res,next) =>{

  if(req.body.id==1)
  {
    const query = Foliador.findOneAndUpdate({Letra:'W'},{ $inc: { Folio: 1} },{new:true},

    ).exec((err, db_res)=>
    {
      if (err) {
        throw err;
      }
      else {
        console.log("db_res",db_res);
    }
    });
  } else

  if(req.body.id==6 || req.body.id==5 || req.body.id==7 || req.body.id==2)
  {
    const query = Foliador.findOneAndUpdate({Letra:'R'},{ $inc: { Folio: 1} },{new:true},
    ).exec((err, db_res)=>
    {
      if (err) {
        throw err;
      }
      else {
        console.log("db_res",db_res);
    }
    });
  }
  else
  {
    console.log("Estatus no valido Foliador no Actualizado",req.body.estatus)
  }
}

exports.getFolios = (req,res,next) =>{
   Foliador.find().then((doc)=>{
    res.status(200).send(doc)
     console.log("FOLIOS ",doc)
  });
}
