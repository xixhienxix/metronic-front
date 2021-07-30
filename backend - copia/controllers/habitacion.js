const express = require('express');
const Habitacion = require('../models/habitacion');


exports.postEstatusHabitacion = (req,res,next) => {

      const query = Habitacion.findOneAndUpdate({Cuarto:req.params.id})
      .exec((err, db_res)=>
      {
        if (err) {
          throw err;
        }
        else {
          console.log("db_res",db_res);
      }
      }).then((estatus)=>{
        res.status(201).json({
          message:'Pre-Asignacion Realizada'
        });
      });
}


//getInfoHabitaciones

exports.getHabitacion = (req,res,next) =>{
  Habitacion.find(this).then((habitacion) => {
  res.status(200).send(habitacion)
  });
  };


//Tipos de Cuarto
  exports.getCodigoHabitacion = (req,res,next) =>{
    Habitacion.find(this).distinct("Codigo").then((habitacion) => {
    res.status(200).send(habitacion)
    });
    };


  exports.getHabitacionbyId = (req,res,next) =>{

    const query = Habitacion.find({ Codigo:{$regex: req.params.codigo + '.*', $options: 'i'},Estatus:1});
    // const query = Habitacion.find( {$text: { $search: "\""+req.params.codigo+"\"" }, $options: 'i',Estatus:1});

    query.then((doc)=> {
      res.status(200).send(doc)
    });
}

exports.getHabitacionbyNumber = async (req,res,next) =>{

  const query =await Habitacion.find({ Numero:req.params.numero});
  // const query = Habitacion.find( {$text: { $search: "\""+req.params.codigo+"\"" }, $options: 'i',Estatus:1});
  try {
          res.json(await Habitacion.find({ Numero:req.params.numero}));
      }
      catch (err) {
          res.send(err);
      }
  // query.then((doc)=> {
  //   res.status(200).send(doc)
  // });
}

exports.getInfoHabitaciones = (req,res,next) =>{

  const query = Habitacion.find({ Numero:req.query.numero,Codigo:req.query.tipo});
  console.log("Numero:req.query.numero",req.query.numero)
  console.log("Tipo:req.params.tipo",req.query.tipo)
  query.then((doc)=> {
    res.status(200).send(doc)
  });
}
