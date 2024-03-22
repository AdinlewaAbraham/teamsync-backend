const mongoose = require("mongoose");

function isDocIDValid(docId) {
  return mongoose.Types.ObjectId.isValid(docId);
}

module.exports = { isDocIDValid };
