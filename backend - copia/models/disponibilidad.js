const mongoose = require('mongoose');

const postSchemaDisponibilidad = mongoose.Schema({

  Cuarto: {type : String},
  Habitacion: {type : Number},
  Estatus: {type : Number},
  Dia:{type:Number},
  Mes:{type:Number},
  Ano:{type:Number}

},{ collection: 'Disponibilidad'});


module.exports=mongoose.model('Disponibilidad',postSchemaDisponibilidad);
