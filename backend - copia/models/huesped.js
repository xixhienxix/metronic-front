const mongoose = require('mongoose');

const postSchema = mongoose.Schema({

  // id: {type : Number},
  folio:{type:Number},
  nombre: {type:String,require:true},
  adultos: {type : Number},
  ninos: {type : Number},
  estatus: {type:String}, // Huesped en Casa = 1 | Reserva Sin Pagar = 2 | Reserva Confirmada = 3 | Hizo Checkout = 4 | Uso Interno = 5 | Bloqueo = 6 | Reserva Temporal = 7
  llegada: {type:String},
  salida: {type:String},
  noches: {type:Number},
  tarifa:{type:Number},
  porPagar: {type:Number},
  pendiente: {type:Number},
  origen: {type:String},
  habitacion: {type:String},
  telefono: {type:String},
  email: {type:String},
  motivo: {type:String},
  numeroCuarto: {type:Number}
}

);

// Duplicate the ID field.
postSchema.virtual('id').get(function(){
  return this._id.toHexString();
});

postSchema.set('toJSON', {
  virtuals: true
});


module.exports=mongoose.model('Huesped',postSchema);
