import exp from "express";
import { UserModel } from "../models/usermodel.js";
import { ArticleModel } from "../models/articlemodel.js";
import { verifytoken } from "../middleware/verifytoken.js";
export const authorApp=exp.Router()

//write article(protected)
authorApp.post("/article", verifytoken("AUTHOR"), async(req,res)=>{
    //get article obj from client
    const articleObj=req.body   
    //get user from decode token 
    let user=req.user
    console.log(user)
    let author=await UserModel.findById(articleObj.author)
    if(!author){
        return res.status(404).json({message:"Author Not Found"})
    }
    //check if emails are same
     if(author.email!== user.email){
         return res.status(403).json({message:"you are unauthorized"})
    }
    //check role
     if(author.role !== "AUTHOR"){
         return res.status(403).json({message:"Only author can publish"})
    }
    // creating doc
    const articleObjDoc= new ArticleModel(articleObj)
    //saving the doc
    await articleObjDoc.save()
    res.status(201).json({message:"article created"})
})
//read own articles 
authorApp.get("/articles/:_id",verifytoken("AUTHOR"),async(req,res)=>{
    let idoftoken=req.user?.id
          let articleslist = await ArticleModel.find({ author: idoftoken });
    res.status(200).json({message:"articles of author",payload:articleslist})
})
//edit article
authorApp.put("/article",verifytoken("AUTHOR"),async(req,res)=>{
    //get author id
    const authortoken = req.user?.id
    //get modified article
    const {articleId,title,category,content} = req.body
    const modified = await ArticleModel.findOneAndUpdate(
        {_id:articleId, author:authortoken},
        {$set:{title,category,content}},
        {new:true}
    )
    if(!modified){
        return res.status(403).json({message:"not authorized to edit"})
    }
    res.status(200).json({message:"Article modified",payload:modified})
})

//delete article by Article ID (soft delete)
authorApp.patch("/articles",verifytoken("AUTHOR"),async(req,res)=>{
    //get author id
    const authortoken = req.user?.id
    //get modified article
    const {isArticleActive, articleId} = req.body
    //get article by id
    const articleDB=await ArticleModel.findOne({_id:articleId,author:authortoken})
    //check status
    if(isArticleActive===articleDB.isArticleActive){
        return res.status(200).json({message:"Article already in same state"})
    }
    articleDB.isArticleActive=isArticleActive
    await articleDB.save()
    res.status(200).json({message:"article modified",payload:articleDB})
})
