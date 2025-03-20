//instalimi i moduleve

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require ('jsonwebtoken')

const app = express();
app.use(express.json()); //lejimi i jsonit

mongoose
.connect(process.env.MONGO_URI || "mongodb://localhost:27017/authDB")
.then(()=>console.log('Database is connected'))
.catch((err)=> console.log(`Database cannot connect because of ${err}`))

//user schema dhe modeli

const UserSchema = new mongoose.Schema ({
    username: String,
    email:  String,
    password : String
})

const User = mongoose.model("User", UserSchema)

//login API



//signup API


app.post('/signup', async (req,res)=>{
    try {
        const {username, email, password} = req.body;

        const userExists = await User.findOne({email})

        if (userExists) {
            return res.status(400).json({message:"User already exists"})
        }

      const  hashedPassword = await bcrypt.hash(password, 10)

        const newUser = new User({username,email, password: hashedPassword});
        await newUser.save()

        res.status(201).json({message: "User created", user: newUser});
    } catch (error) {
        res.status(400).json({error:error.message})
    }
})

app.post("/login", async (req,res)=>{
    try{
        const {email, password} = req.body;
        //check if user exists
        const user = await User.findOne({email});

        if (!user) return res.status(400).json({message: "Email or pass is wrong"});


        //compare pass
        const isMatch = await bcrypt.compare(password, user.password );
        if(!isMatch) return res.status(400).json({message:"Passi gabim"})

        //json webtoken 
        //3 sene duhesh mi dit: qysh me dit kujt me ja jep token, ni pass, ni dat
        const token = jwt.sign({id:user._id}, "SECRET_KEY", {expiresIn:"1h"});

        res.json({message:"Je kyq:", token})
    } 
    catch(err){
        res.status(400).json({error:error.message});
    }
})

app.listen(3000, ()=>console.log('nrregull'))