import mongoose from "mongoose";
import {User} from './User.js'

const MessageSchema = new mongoose.Schema(
  {
    sender:{
        type: mongoose.Schema.Types.ObjectId,
        ref:User
    },
    recipient:{
        type: mongoose.Schema.Types.ObjectId,
        ref:User
  },
  text:{
    type:String,
    required:true
  }
},
  { timestamps: true }
);

export const Message = mongoose.model("Message", MessageSchema);
