const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const User = require('./models/user')
const Attach = require("./models/attachment")
const { get, getOne } = require('./repository/user')
const mongoose = require('mongoose')
const crypto = require('crypto')
const { upload } = require('./commons/multer')
require('dotenv').config() //it is same as 
//const dotenvv = require('dotenv')
//dotenvv.config(z)
const fs = require('fs')

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
mongoose.connect("mongodb://127.0.0.1:27017/user", { useNewUrlParser: true })
app.listen(5000, () => {
    console.log("Server is up")
})
// const user1 = new User({ firstName: 'user1',lastName:'last',password:'abc', email: 'user1@example.com',token:'asdfgfdssoidfugh' });
// user1.save().then(()=>{
//     console.log(user1)
// }).catch((error)=>{
//     console.log("error",error)
// })


const setPassword = async (pwd) => {
    try {
        const salt = crypto.randomBytes(16).toString("hex")
        const pass = crypto.pbkdf2Sync(pwd, salt, 1000, 100, "sha512").toString("hex")
        console.log("password", pass)
        return { salt, pass }
    }
    catch (error) {
        console.log("error", error)
        throw error
    }

}
app.get("/users", async (req, res) => {
    const allusers = await User.find({})
    res.send(allusers)
})

app.post("/register", async (req, res) => {
    firstName = req.body.firstName
    lastName = req.body.lastName
    email = req.body.email
    password = req.body.password

    if (!(firstName && lastName && email && password)) {
        res.status(400).json({ message: "First Name/Last Name/Email/Password is required" })
    }
    else {
        console.log("ok")
        const user = await User.find({ email: email })
        if (user.length > 0) {
            console.log("user", user)
            return res.status(400).json({ message: "User already exists. Please Log-In" })
        }
        else {
            const { salt, pass } = await setPassword(password)
            const newUser = await User.create({
                firstName: firstName,
                lastName: lastName,
                email: email,
                password: pass,
                salt: salt
            })
            const token = jwt.sign({ "email": email }, "averyveryveryveryveryyyyyyyyyyyyyyyyyyysecret", { expiresIn: '8h' })
            console.log(token)
            newUser.token = token
            return res.status(200).json({ message: "Registered successfully. Please login" })

        }
        //res.status(200).send("ok")

    }
})

app.post("/fileUpload", upload, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Please upload a file" })
        }
        else {
            console.log(req.file)
            let attachment = Object.assign({}, {
                originalname: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
                fieldname:req.file.fieldname,
                encoding:req.file.encoding,
                destination:req.file.destination,
                filename:req.file.filename,
                path:req.file.path

            })
            await Attach.create(attachment, (err, doc) => {
                if (doc) return res.status(200).json({ message: "File uploaded successfully", data: doc._id })
            })

        }

    } catch (err) {
        console.log("err", err)
        throw err
    }
    finally {
        try {
            console.log("trying to delete file", req.file.path)
            fs.unlinkSync(req.file.path)
        }
        catch (err) {
            console.log("err", err)
            throw err
        }
    }



})

// app.get("/user/:email",async(req,res)=>{
//     email=req.query.email
//     const users=await get({email:email})
//     if(users){
//         res.send(`got ${users.length} records`)
//     }
//     else{
//         res.send("no records")
//     }
// })

const validatepass = async (pwd, hash, salt) => {
    try {
        const userpw = crypto.pbkdf2Sync(pwd, salt, 1000, 100, 'sha512').toString("hex")
        return userpw === hash

    }
    catch (error) {
        console.log("error", error)
        throw error
    }

}
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body
        if (!(email && password)) {
            return res.status(401).json({ message: "Please enter email or password" })
        }
        const existingUser = await User.findOne({ email })
        console.log(existingUser)
        if (existingUser) {
            const passmatch = await validatepass(password, existingUser.password, existingUser.salt)
            if (passmatch) {
                const token = jwt.sign({ "email": email }, "averyveryveryveryveryyyyyyyyyyyyyyyyyyysecret", { expiresIn: '8h' })
                return res.status(200).json({ message: "Logged in successfully", data: token })
            }
            else {
                return res.status(401).json({ message: "Invalid password" })
            }


        }
        else {
            return res.status(401).json({ message: "Email not found. Please register your account" })
        }

    }
    catch (error) {
        console.log("error", error)
        throw error
    }
})