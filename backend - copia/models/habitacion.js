const mongoose = require('mongoose');

const postSchemaHabitacion = mongoose.Schema({

  Codigo: {type : String},
  Numero: {type : Number},
  Descripcion: {type : String},
  Estatus: {type : Number},
  Camas:{type:Number},
  Personas:{type:Number},
  Personas_Extra:{type:Number},
  Tarifa:{type:Number}


},{ collection: 'Habitaciones'});


module.exports=mongoose.model('Habitacion',postSchemaHabitacion);
