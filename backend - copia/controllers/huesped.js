const express = require('express');
const Huesped = require('../models/huesped');
const Historico = require('../models/historico');
const Disponibilidad = require('../models/disponibilidad');
const Foliador = require('../models/folios')
const Estatus = require('../models/estatus');
const huesped = require('../models/huesped');



exports.getHuesped = (req,res,next) =>{
  Huesped.find(this).then((huesped) => {
  res.status(200).send(huesped)
  });
  };

  exports.getHuespedHistorico = (req,res,next) =>{
    Historico.find(this).then((historico) => {
    res.status(200).send(historico)
    });
    };


  exports.getHuespedbyId = (req,res,next) =>{

    const query = Huesped.findOne({ folio: req.params.id });

    query.then((doc)=> {
      res.status(200).send(doc)
    });

}

exports.postHuesped = async (req,res,next)=>{

  const diaLlegada = req.body.llegada.split("/")[0]
  const mesLlegada = req.body.llegada.split("/")[1]
  const anoLlegada = req.body.llegada.split("/")[2]
  const diaSalida = req.body.salida.split("/")[0]
  const mesSalida = req.body.salida.split("/")[1]
  const anoSalida = req.body.salida.split("/")[2]

  let toDate =   new Date(Date.UTC(anoSalida, mesSalida, diaSalida));
  let fromDate = new Date(Date.UTC(anoLlegada, mesLlegada, diaLlegada))


  for (;fromDate < toDate; fromDate.setUTCDate(fromDate.getUTCDate()+1))
  {
    var query = { Cuarto: req.body.habitacion,Habitacion:req.body.numeroCuarto,Dia:fromDate.getUTCDate(),Mes:fromDate.getMonth(),Ano:fromDate.getFullYear() };
    Disponibilidad.updateOne(query, { Estatus: 0 })
    .exec((err, db_res)=>
     {
       if (err) {
         throw err;
       }
       else {
         console.log("Updated Disponibilidad: ",db_res);
     }
     });
  }
  // var find  = await Huesped.findOne({llegada: req.body.llegada,salida:req.body.salida,habitacion:req.body.habitacion,numeroCuarto:req.body.numeroCuarto}).then(project => {
  //   // project will be the first entry of the Projects table with the title 'aProject' || null
  // });

    // const post = new Huesped({
    //   folio:req.body.folio,
    //   nombre:req.body.nombre,
    //   adultos:req.body.adultos,
    //   ninos:req.body.ninos,
    //   estatus:req.body.estatus,
    //   llegada:req.body.llegada,
    //   salida:req.body.salida,
    //   noches:req.body.noches,
    //   habitacion:req.body.habitacion,
    //   tarifa:req.body.tarifa,
    //   pendiente:req.body.porPagar,
    //   porPagar:req.body.pendiente,
    //   telefono:req.body.telefono,
    //   email:req.body.email,
    //   motivo:req.body.motivo,
    //   numeroCuarto:req.body.numeroCuarto,
    //   origen:req.body.origen
    // });

    var query = {llegada: req.body.llegada,salida:req.body.salida,habitacion:req.body.habitacion,numeroCuarto:req.body.numeroCuarto};

    Huesped.findOneAndUpdate(query, {
      folio:req.body.folio,
      nombre:req.body.nombre,
      adultos:req.body.adultos,
      ninos:req.body.ninos,
      estatus:req.body.estatus,
      llegada:req.body.llegada,
      salida:req.body.salida,
      noches:req.body.noches,
      habitacion:req.body.habitacion,
      tarifa:req.body.tarifa,
      pendiente:req.body.pendiente,
      porPagar:req.body.porPagar,
      telefono:req.body.telefono,
      email:req.body.email,
      motivo:req.body.motivo,
      numeroCuarto:req.body.numeroCuarto,
      origen:req.body.origen
      }, {upsert: true}, function(err, doc) {
        if (err) return res.send(500, {error: err});
        return  res.status(200).json({msg: "Succesfully saved"})//res.send('Succesfully saved.');
    });

    // var saved = await post.save((error)=>{
    //    if(error){
    //     // res.status(500).json({msg: "No se pudo guardar el cliente"})
    //     console.log(error)
    //    }else{
    //     //FOLIADOR UPDATE
    //     }
    // });
  }

exports.actualizaHuesped = async (req,res,next)=>{

        Huesped.updateOne({folio : req.body.folio}, {$set: { estatus : req.body.estatus}},
          function(err, doc) {
            if (err) return res.send(500, {error: err});
            return  res.status(200).json({msg: "Succesfully saved"})//res.send('Succesfully saved.');
        });
    // .exec((err, db_res)=>
    //  {
    //    if (err) {
    //      throw err;
    //    }
    //    else {
    //      console.log("Updated Disponibilidad: ",db_res);
    //  }
    //  });

}


