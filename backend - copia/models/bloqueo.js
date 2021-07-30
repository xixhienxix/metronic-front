const mongoose = require('mongoose');

const postSchemaBloqueo = mongoose.Schema({
  _id:{type:String},
  Habitacion: {type : Array},
  Cuarto: {type : Array},
  Desde: {type : String},
  Hasta: {type : String},
  sinLlegadas: {type:Boolean},
  sinSalidas:{type:Boolean},
  fueraDeServicio:{type:Boolean},
  Comentarios: {type : String},

},{ collection: 'Bloqueo'});


module.exports=mongoose.model('Bloqueo',postSchemaBloqueo);
