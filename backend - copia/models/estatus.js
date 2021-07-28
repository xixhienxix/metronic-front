const mongoose = require('mongoose');

const postSchemaEstatus = mongoose.Schema({

  id: {type : Number},
  estatus: {type : String}

},{ collection: 'Estatus'});


module.exports=mongoose.model('Estatus',postSchemaEstatus);
