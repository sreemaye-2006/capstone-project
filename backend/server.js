import exp from 'express'
import {config} from 'dotenv'
import {connect} from 'mongoose'
import { UserApp } from './APIs/UserAPI.js'
import { AuthorApp } from './APIs/AuthorAPI.js'
import { CommonApp } from './APIs/CommonAPI.js' 
import { AdminApp } from './APIs/AdminAPI.js'
import CookieParser from 'cookie-parser'
import cors from 'cors'

config()
const app=exp()
const port=process.env.PORT || 5000
app.use(exp.json())
app.use(CookieParser())
app.use(cors({
    origin:['http://localhost:5173', 'http://localhost:5176', 'http://localhost:5000'],
    credentials:true,
}))
app.use("/user-api",UserApp)
app.use("/common-api",CommonApp)
app.use("/admin-api",AdminApp)
app.use("/author-api",AuthorApp)
const connectDB=async()=>{
try{
    await connect(process.env.DB_URL)
    console.log("db connected");
    app.listen(port,()=>console.log(`server is started on ${port}`))
}catch(err){
    console.log("error");
}
}
connectDB()
//invalid path handling
app.use((req,res,next)=>{
    console.log(req.url);
    res.status(404).json({message:"invald path"})
})

//error handling
app.use((err,req,res,next)=>{
    //res.json({message:"error has occured",error:err.message}) this is very basic 
    console.log(err.name)
    console.log(err.message)
    
    //validation error
    if(err.name==='ValidationError'){
        return res.status(400).json({messsage:"the validations is failed "})
    }
     //casterror
      if(err.name==='CastError'){
        return res.status(400).json({messsage:"the validations is failed "})
    }
    //send server side errors
    res.status(500).json({message:"this is from server side"})
})
//error=>{name,message,callstack} contains these 
