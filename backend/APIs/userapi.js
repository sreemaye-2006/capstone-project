
import exp from 'express';
import { verifytoken } from '../middleware/verifytoken.js';
import { ArticleModel } from '../models/articlemodel.js';
import jwt from 'jsonwebtoken';

export const userApp = exp.Router();

//read articles of all authors
//view articles
userApp.get("/articles", verifytoken("USER"), async (req, res) => {
  try {
    //get all active articles WITH populated users
    const articles = await ArticleModel
      .find({ isArticleActive: true })
      .populate("comments.user");   

    res.status(200).json({
      message: "Articles fetched successfully",
      payload: articles
    });
  } catch (err) {
    res.status(500).json({
      message: "Error fetching articles",
      error: err.message
    });
  }
});


//write comments
userApp.put("/comment", verifytoken("USER"), async (req, res) => {
  try {
    //get body from req
    const { articleId, comment } = req.body;

    //check if article is present
    const articleDocument = await ArticleModel.findOne({
      _id: articleId,
      isArticleActive: true
    });

    if (!articleDocument) {
      return res.status(404).json({ message: "Article not found" });
    }

    //get userId from token
    const userId = req.user?.id || req.user?._id;

    //add comment
    articleDocument.comments.push({
      user: userId,
      comment: comment
    });

    await articleDocument.save();

    // 🔥 RE-FETCH WITH POPULATE (IMPORTANT FIX)
    const updatedArticle = await ArticleModel
      .findById(articleId)
      .populate("comments.user");

    res.status(200).json({
      message: "Comment added successfully",
      payload: updatedArticle
    });

  } catch (err) {
    res.status(500).json({
      message: "Error adding comment",
      error: err.message
    });
  }
});
