const mongoose=require('mongoose')
const Schema=mongoose.Schema

const attachSchema=new Schema({
    originalname:{
        type:String
    },
    size:{
        type:String
    },
    mimetype:{
        type:String
    },
    fieldname:{
        type:String
    },
    destination:{
        type:String
    },
    filename:{
        type:String
    },
    path:{
        type:String
    },
    encoding:{
        type:String
    }
})
module.exports=mongoose.model("attachment",attachSchema)
