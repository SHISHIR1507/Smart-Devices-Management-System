import mongoose from "mongoose";

const logSchema = new  mongoose.Schema({

  device: {

    type: mongoose.Schema.Types.ObjectId,
    ref: "Device",
    required: true,
  },

  event: {

    type: String,
    required: true,
  },

  value: {

    type: Number,
    required: true,
  },

  timestamp: {

    type: Date,
    default: Date.now,
  },

});

const Log = mongoose.model("Log", logSchema);

export default Log;
