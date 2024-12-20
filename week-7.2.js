const express = require('express')
const app = express()
const {z} = require('zod') // zod for Schema validation 
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const JWT_SECRET = "Secriuekldjfgdflbkd"
mongoose.connect("mongodb+srv://srk566943:obDrsIU1P017jNs4@cluster0.vlt4j.mongodb.net/todo-app-database")
const { UserModel , TodosModel } = require("./db")

app.use(express.json())

let errorThrown = false
app.post("/signup",async function(req,res){
    const requiredBody = z.object({
        email : z.string().min(15 , {message : "Email Must be 15 or more characters long"}).max(50).email({ message: "Invalid email address" }),
        password : z.string().min(20).max(30)
        .refine(val => /[a-z]/.test(val),{
            message: "Password must contain at least one lowercase letter",
          })
          .refine(val => /[!@#$%^&*(),.?":{}|<>]/.test(val), {
            message: "Password must contain at least one special character",
          })
          .refine(val => (val.match(/[A-Z]/g) || []).length >= 3 , {
            message : "Password must contain atleast 3 uppercase characters"
          }),
        name : z.string()
    })

    const parsedDataWithSuccess = requiredBody.safeParse(req.body)

    if(!parsedDataWithSuccess.success){
        res.json({
            msg : "Incorrect Format",
            error : parsedDataWithSuccess.error
        })
        return
    }

    const {email , password , name} = req.body
    // Input Validation
    // if(typeof email != "string" || email.length <= 4 || !email.includes("@"))
    // {
    //     res.json({
    //         msg : "Invalid Email !"
    //     })
    // }

    try {
        const hashedPassword = await bcrypt.hash(password , 10)
        console.log(hashedPassword)
       await UserModel.create({
        email : email,
        password : hashedPassword,
        name : name,
       }) 
    } catch (error) {
        res.json({
            msg : "User already Exists !"
        })
        errorThrown = true
    }

    if(!errorThrown)
    {
        res.json({
            msg : "Signed up successfully !"
           })
    }
})
app.post("/signin",async function(req,res){
   const {email , password} = req.body

    const user = await UserModel.findOne({
        email : email,
    })

    if(!user)
    {
        res.status(403).json({
            msg : "User does not exists !"
        })
    }

    const passwordMatch = await bcrypt.compare(password,user.password)
    // here we awaited the passwordMatch because compare is a promise and if(promise) is always true and will accept any random password while signing in !

    if(passwordMatch){
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

app.post("/todo", auth, async function (req, res) {
    const { title, done } = req.body; // Extract title and done from the request body
    const userId = req.userId;       // Get userId from the auth middleware

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