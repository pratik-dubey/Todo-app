const express = require('express')
const app = express()
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const JWT_SECRET = "Secriuekldjfgdflbkd"
mongoose.connect("mongodb+srv://srk566943:obDrsIU1P017jNs4@cluster0.vlt4j.mongodb.net/todo-app-database")
const { UserModel , TodosModel } = require("./db")

app.use(express.json())

app.post("/signup",async function(req,res){
    const {email , password , name} = req.body

   await UserModel.create({
    email : email,
    password : password,
    name : name,
   }) 

   res.json({
    msg : "Signed up successfully !"
   })
})
app.post("/signin",async function(req,res){
   const {email , password} = req.body

    const user = await UserModel.findOne({
        email : email,
        password : password,
    })

    if(user){
        const token = jwt.sign({
            id : user._id.toString()
        },JWT_SECRET)

        res.json({
            token : token
        })
    }
    else{
        res.status(401).json({
            msg : "Incorrect credentials"
        })
    }

})

function auth(req,res,next)
{
    const authHeader = req.headers.authorization
    if(!authHeader)
    {
        return res.status(401).send('Authorization header missing');
    }
    const token = authHeader.split(" ")[1]
    try {
        const decodedInfo = jwt.verify(token , JWT_SECRET)
        if(decodedInfo)
        {
            req.userId = decodedInfo.id
            next()
        }
    } catch (error) {
        res.status(401).send("Incorrect Credentials !")
    }
}

// app.post("/todo", auth ,async function(req,res){
//     const { title , done} = req.body
//     const userId = req.userId
//     await TodosModel.create({
//         userId,
//         title,
//         done
//     })
//     res.json({
//         userId : userId
//     })
// })

app.post("/todo", auth, async function (req, res) {
    const { title, done } = req.body; // Extract title and done from the request body
    const userId = req.userId;       // Get userId from the auth middleware

    // // Ensure `title` is provided
    // if (!title) {
    //     return res.status(400).json({ message: 'Title is required' });
    // }

    try {
        // Create a new Todo with userId from middleware and title from request body
        const todo = await TodosModel.create({
            userId,
            title,
            done: done || false, // Default `done` to false if not provided
        });

        res.status(201).json({
            message: 'Todo created successfully',
            todo,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating todo', error });
    }
});

app.get("/todos", auth ,function(req,res){
    const userId = req.userId

    res.json({
        userId : userId
    })
})

app.listen(4004)