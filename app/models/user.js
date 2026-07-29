import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
      trim: true,
    },

    last_name: {
      type: String,
      required: true,
      trim: true,
    },

  

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      required: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone_no: {
     type: String,
    required: true,
    unique: true,
    trim: true,
    },
    fcm_token: {
    type: String,
    default: null,
    },
  profile_image: {
  type: String,
  default: null,
},
     role:{
      type:String,
      enum:["user","admin"],
      default:"user"
    },


  },
  
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;