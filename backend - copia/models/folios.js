const mongoose = require('mongoose');

const postSchemaFolios = mongoose.Schema({

  Folio: {type : Number},
  Letra: {type : String}

},{ collection: 'Foliador'});


module.exports=mongoose.model('Foliador',postSchemaFolios);
