const mongoose=require("mongoose")
const Schema=mongoose.Schema

const userSchema=new Schema({
    firstName:{
        type:String
    },
    lastName:{
        type:String
    },
    password:{
        type:String 
    },
    salt:{
        type:String 
    },
    email:{
        type:String
    },
    token:{
        type:String
    }
})
module.exports=mongoose.model("user",userSchema)
