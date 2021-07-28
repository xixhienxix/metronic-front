const express = require('express');
const Estatus = require('../models/estatus');


exports.getEstatus = (req,res,next) =>{
  Estatus.find(this).then((estatus) => {
  // console.log(huesped)
  res.status(200).send(estatus)
  });
  };


  exports.getEstatusbyId = (req,res,next) =>{

    const query = Estatus.findOne({ id: req.params.id });

    query.then((doc)=> {
      res.status(200).send(doc)
    });

}


exports.updateEstatus = (req,res,next) =>{

  let estatus = req.body.estatus

  if(estatus=="Reserva Confirmada"){
    const query = Estatus.findOneAndUpdate({ estatus: req.params.estatus },{estatus:"Reserva Sin Pago"});
  }else if(estatus=="Reserva Sin Pago"){
    const query = Estatus.findOneAndUpdate({ estatus: req.params.estatus },{estatus:"Reserva Confirmada"});
  }

  query.then((doc)=> {
    res.status(200).send(doc)
  });

}
