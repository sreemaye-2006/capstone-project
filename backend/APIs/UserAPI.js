import exp from "express";
import { verifyToken } from "../middlewares/VerifyToken.js";
import { ArticleModel } from "../models/ArticleModel.js";

export const userApp = exp.Router();

//Read articles of all authors
userApp.get("/articles", verifyToken("USER"), async (req, res) => {

  // 🔥 BLOCK CHECK
  if (req.user?.isUserActive === false) {
    return res.status(403).json({ message: "You are blocked by admin" });
  }

  const articlesList = await ArticleModel.find({ isArticleActive: true });

  res.status(200).json({ message: "articles", payload: articlesList });
});

//Add comment to an article
userApp.put("/articles", verifyToken("USER"), async (req, res) => {

  // 🔥 BLOCK CHECK
  if (req.user?.isUserActive === false) {
    return res.status(403).json({ message: "You are blocked by admin" });
  }

  const { articleId, comment } = req.body;

  const articleDocument = await ArticleModel
    .findOne({ _id: articleId, isArticleActive: true })
    .populate("comments.user");

  if (!articleDocument) {
    return res.status(404).json({ message: "Article not found" });
  }

  const userId = req.user?.id;

  articleDocument.comments.push({ user: userId, comment: comment });

  await articleDocument.save();

  res.status(200).json({
    message: "Comment added successfully",
    payload: articleDocument
  });
});
