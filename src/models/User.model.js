import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    fullName:{

        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password:{
        type: String,
        required: true,
        minlength: 6,

    },
    role:{
        type: String,
        enum: ['admin', 'user'],
        default: 'user',
    },
    devices:[
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Device",   // links to Device.model.js
      
      },
    ],
},{ timestamps: true })

    
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(14);
        this.password = await bcrypt.hash(this.password, salt);
        next();
        
    } catch (error) {
        next(error);
    }
})
userSchema.methods.isPasswordCorrect= async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}




const User = mongoose.model("User", userSchema);
export default User;