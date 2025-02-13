import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    age :{
        type: Number,
        required: true,
    },
    project : {
        type: Array,
        required: true,
    },
    parent_role : {
        type: Array,
        required: true,
    },
    contact : {
        type:Number,
        required: true,
    },

});

const User = mongoose.model("User", userSchema);

export default User;