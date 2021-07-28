const express = require('express');
const Bloqueo = require('../models/bloqueo');
const Disponibilidad = require('../models/disponibilidad');
const mongoose = require('mongoose');


exports.getBloqueos = (req,res,next) =>{
  Bloqueo.find(this).then((bloqueos) => {
  // console.log(huesped)
  res.status(200).send(bloqueos)
  });
  };


  exports.getBloqueosbyId = (req,res,next) =>{

    var id = req.params.id;

    Bloqueo.findById(id)
        .lean().exec(function (err, results) {
        if (err) return console.error(err)
        try {
            console.log(results)
        } catch (error) {
            console.log("errror getting results")
            console.log(error)
        }
    })

}


exports.deleteBloqueo = (req,res,next) =>{

  const bloqueoId = req.params.id;

    Bloqueo.deleteOne({
      _id: req.params.id
    }).then(result => {
      res.status(200).json({
        message: "Bloqueo deleted!",
        bloqueo:result
      });
    });

    // .then(result => console.log(`Deleted ${result.deletedCount} item.`))
    // .catch(err => console.error(`Delete failed with error: ${err}`))

  // Bloqueo.find({_id:bloqueoId}).deleteOne({}, (err, d) => {
  //   if (err) return res.status(400)
  //   if (d.acknowledged && d.deletedCount == 1)
  //       console.log("Deleted Successfully")    // Use your response code
  //   else
  //       console.log("Record doesn't exist or already deleted")    // Use your response code
  //  ).exec();
  //  res.status(200).json({message:"Deleted"})

}


exports.actualizaBloqueos = (req,res,next) =>{

  Bloqueo.updateOne({ _id: req.body._id },
    {
      $set:
      {
        fueraDeServicio:req.body.fueraDeServicio,
        sinSalidas:req.body.sinSalidas,
        sinLlegadas:req.body.sinLlegadas,
        Comentarios:req.body.Comentarios
      }
    }, (err, request) =>
    {
      if (err) {
        res.status(401).json({
          message: err
        });
        //console.log(err);
      }
  // Add else
  else{

      var respuesta = actualizaDisponibilidad(req.body.Desde,req.body.Hasta,req.body.Habitacion,req.body.Cuarto,req.body.sinLlegadas,req.body.sinSalidas,req.body.fueraDeServicio);

        res.status(200).json({
          respuesta
        });

        }
    }
  )}


exports.postBloqueos = async (req,res,next)=>{


  actualizaDisponibilidad(req.body.Desde,req.body.Hasta,req.body.Habitacion,req.body.Cuarto,req.body.sinLlegadas,req.body.sinSalidas,req.body.fueraDeServicio,0);

  var id = mongoose.Types.ObjectId();

  const post = new Bloqueo({
    _id:id,
    Habitacion:req.body.Habitacion,
    Cuarto:req.body.Cuarto,
    Desde:req.body.Desde,
    Hasta:req.body.Hasta,
    sinLlegadas:req.body.sinLlegadas,
    sinSalidas:req.body.sinSalidas,
    fueraDeServicio:req.body.fueraDeServicio,
    Comentarios:req.body.Comentarios,

  });


  var saved = post.save(
    (err, request) => {
    if (err) {
      res.status(401).json({
        message: err
      });
      console.log(err);
    }
// Add else
else{

      res.status(200).json({
        request
      });

}

});
}


exports.liberaBloqueos = async (req,res,next)=>{

  let liberaEstatus=1
  actualizaDisponibilidad(req.body.Desde,req.body.Hasta,req.body.Habitacion,req.body.Cuarto,req.body.sinLlegadas,req.body.sinSalidas,req.body.fueraDeServicio,liberaEstatus);

}



function actualizaDisponibilidad(desde,hasta,habitacion,numero,sinLlegadas,sinSalidas,fueraDeServicio,liberaEstatus)
{
  //Estatus:0=No Disponible (Ni Llegadas ni Salidas)
  //Estatus:1=Disponible
  //Estatus:2=No Llegadas
  //Estatus:3=No Salidas
  //Estatus:4=Fuera de Servicio
  const diaLlegada = desde.split("/")[0]
  const mesLlegada = desde.split("/")[1]
  const anoLlegada = desde.split("/")[2]
  const diaSalida = hasta.split("/")[0]
  const mesSalida = hasta.split("/")[1]
  const anoSalida = hasta.split("/")[2]

  let toDate =   new Date(Date.UTC(anoSalida, mesSalida, diaSalida));
  let fromDate = new Date(Date.UTC(anoLlegada, mesLlegada, diaLlegada))


  for (;fromDate <= toDate; fromDate.setUTCDate(fromDate.getUTCDate()+1))
  {
    for(let i=0;i<habitacion.length;i++)
    {
      for(let k=0; k<numero.length;k++)
      {
        var query = { Cuarto: habitacion[i],Habitacion:numero[k],Dia:fromDate.getUTCDate(),Mes:fromDate.getMonth(),Ano:fromDate.getFullYear() };

        let estatus;
        if(sinLlegadas&&!sinSalidas)
        {
          estatus=2
        }else if(sinSalidas&&!sinLlegadas)
        {
          estatus=3
        }else if(sinSalidas&&sinLlegadas)
        {
          estatus=4
        }else if(fueraDeServicio)
        {
          estatus=4
        }else if(!sinSalidas&&!sinLlegadas&&!fueraDeServicio)
        {
          estatus=liberaEstatus
        }

        Disponibilidad.updateOne(query, { Estatus: estatus })
        .exec((err, db_res)=>
         {
           if (err) {
             console.log("Error Al Actualizar Disponibilidad :",err.message)
            return err.message;
           }
           else {
             console.log("Updated Disponibilidad: ",db_res);
            return (db_res);
         }
         });

      }
    }
  }

}
