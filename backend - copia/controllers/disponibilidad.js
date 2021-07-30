const express = require('express');
const Disponibilidad = require('../models/disponibilidad');


exports.getDisponibilidadTodos = (req,res,next) =>{

  const query = Disponibilidad.find({ Dia: req.query.dia, Mes: req.query.mes, Ano: req.query.ano });
  console.log("Dia:",req.query.dia)
  console.log("Mes:",req.query.mes)
  console.log("Año:", req.query.ano)
  query.then((doc)=> {
    res.status(200).send(doc)
  });

}

  exports.getDisponibilidadXFecha = (req,res,next) =>{

    // var queryParameters = req.query
    // res.json(queryParameters)

    const query = Disponibilidad.find({ Dia: req.query.dia, Mes: req.query.mes, Ano: req.query.ano, Cuarto: req.query.cuarto });
    console.log("Dia:",req.query.dia)
    console.log("Mes:",req.query.mes)
    console.log("Año:", req.query.ano)
    console.log("Cuarto:",req.query.cuarto)
    query.then((doc)=> {
      res.status(200).send(doc)
    });

}
