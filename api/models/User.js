import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username:{
        type:String,
        required:true,
        unique:true // Define unique index on username field
    },
    password:{
        type:String,
        required:true
    }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);
