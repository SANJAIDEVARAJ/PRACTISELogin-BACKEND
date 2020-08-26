const express = require('express')
const bodyParser = require('body-parser')
require("dotenv").config();
const mongodb = require("mongodb");
const cors = require("cors");
const bcrypt = require("bcrypt");
var jwt = require('jsonwebtoken');
const app = express();
app.use(cors());
app.use(bodyParser.json());


app.post('/login', async (req,res) => {
    var user = req.body;
    try {
        const client = await mongodb.connect(process.env.DB);
        const db = client.db("task1");
        var data = await db.collection("users").findOne({email : user.email })
        if(data === null) {
            res.status(404).json({ message: "User does not exists" });
            return;
        }
        const result = await bcrypt.compare(user.password,data.password)
        if(result){
            delete data.password
            let jwtToken = jwt.sign({user : data} , process.env.JWT )
            res.json({message : "success" , user : data , jwtToken : jwtToken })
        }
        else{
            res.json({message : "Password not matching"})
        }

    } catch (err) {
        console.log(err);
        res.json({ message: "failed" });
        return;
    }
})


app.post('/register', async (req,res)=>{
    var user = req.body;
  

   var hash = await bcrypt.hash(user.password, 10);
    user.password = hash;
    try {
      const client = await mongodb.connect(process.env.DB);
      const db = client.db("task1");
      const data = await db.collection("users").insertOne(user);
      await client.close();
      res.json({ message: "success" });
    } catch (err) {
      console.log(err);
      res.json({ message: "failed" });
    }
})

function authorize (req , res , next){
    try{
    if(req.headers.auth !== undefined){
        let jwtmessage = jwt.verify(req.headers.auth , process.env.JWT)
        res.locals.user = jwtmessage.user
        next()
    }else{
        res.status(404).json({ message: "authorization failed" });
    }
}
catch(err){
    console.log(err)
    res.status(404).json({ message: "authorization failed" });
}
}

app.get('/dashboard' ,[authorize] ,async (req,res) => {
    var user = req.body;
    try {
        
        const client = await mongodb.connect(process.env.DB);
        const db = client.db("task1");
       
        console.log("authorisation")


        res.json({message : 'success' })
    } catch (err) {
        
    }
})


app.listen(process.env.PORT || 4000, () => {
    console.log("Im Listening .... ");
  });