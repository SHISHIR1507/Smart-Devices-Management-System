import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["light", "ac", "tv", "fan", "speaker"], 
    },
    status: {
      type: String,
      default: "inactive",
      enum: ["active", "inactive"],
    },
    last_active_at: {
      type: Date,
      default: null,
    },
    owner_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },{ timestamps: true })


const Device = mongoose.model("Device", deviceSchema);

export default Device;
