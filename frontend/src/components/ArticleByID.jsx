
import { useParams, useLocation, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import axios from "../axiosConfig";
import { useAuth } from "../store/authStore";

import {
  articlePageWrapper,
  articleHeader,
  articleCategory,
  articleMainTitle,
  articleAuthorRow,
  authorInfo,
  articleContent,
  articleFooter,
  articleActions,
  editBtn,
  deleteBtn,
  loadingClass,
  errorClass,
  inputClass,
  commentsWrapper,
  commentCard,
  commentHeader,
  commentUserRow,
  avatar,
  commentUser,
  commentTime,
  commentText,
} from "../styles/common.js";
import { useForm } from "react-hook-form";

function ArticleByID() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();

  const user = useAuth((state) => state.currentUser);

  const [article, setArticle] = useState(location.state || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (article) return;

    const getArticle = async () => {
      setLoading(true);

      try {
        const res = await axios.get(
          `https://blog-2-p13k.onrender.com/user-api/article/${id}`,
          { withCredentials: true }
        );

        setArticle(res.data.payload);
      } catch (err) {
        setError(err.response?.data?.error);
      } finally {
        setLoading(false);
      }
    };

    getArticle();
  }, [id]);

  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // delete & restore article
  const toggleArticleStatus = async () => {
    const newStatus = !article.isArticleActive;

    const confirmMsg = newStatus
      ? "Restore this article?"
      : "Delete this article?";
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await axios.patch(
        "https://blog-2-p13k.onrender.com/author-api/articles",
        { articleId: article._id, isArticleActive: newStatus },
        { withCredentials: true }
      );

      console.log("SUCCESS:", res.data);

      setArticle(res.data.payload);

      // toast.success(res.data.message);
    } catch (err) {
      console.log("ERROR:", err.response || err);

      const msg = err.response?.data?.message;

      if (err.response?.status === 400) {
        // toast(msg);
      } else {
        setError(msg || "Operation failed");
      }
    }
  };

  //edit article
  const editArticle = (articleObj) => {
    navigate("/edit-article", { state: articleObj });
  };

  //post comment by user
  const addComment = async (commentObj) => {
    commentObj.articleId = article._id;
    console.log(commentObj);

    let res = await axios.put(
      "https://blog-2-p13k.onrender.com/user-api/comment/",
      commentObj,
      { withCredentials: true }
    );

    if (res.status === 200) {
      // toast.success(res.data.message);
      setArticle(res.data.payload);
    }
  };

  if (loading) return <p className={loadingClass}>Loading article...</p>;
  if (error) return <p className={errorClass}>{error}</p>;
  if (!article) return null;

  return (
    <div className={articlePageWrapper}>
      <div className={articleHeader}>
        <span className={articleCategory}>{article.category}</span>

        <h1 className={`${articleMainTitle} uppercase`}>
          {article.title}
        </h1>

        <div className={articleAuthorRow}>
          <div className={authorInfo}>
            ✍️ {article.author?.firstName || "Author"}
          </div>

          <div>{formatDate(article.createdAt)}</div>
        </div>
      </div>

      <div className={articleContent}>{article.content}</div>

      {user?.role === "AUTHOR" && (
        <div className={articleActions}>
          <button
            className={editBtn}
            onClick={() => editArticle(article)}
          >
            Edit
          </button>

          <button
            className={deleteBtn}
            onClick={toggleArticleStatus}
          >
            {article.isArticleActive ? "Delete" : "Restore"}
          </button>
        </div>
      )}

      {user?.role === "USER" && (
        <div className={articleActions}>
          <form onSubmit={handleSubmit(addComment)}>
            <input
              type="text"
              {...register("comment")}
              className={inputClass}
              placeholder="Write your comment here..."
            />
            <button
              type="submit"
              className="bg-amber-600 text-white px-5 py-2 rounded-2xl mt-5"
            >
              Add comment
            </button>
          </form>
        </div>
      )}

      <div className={commentsWrapper}>
        {article.comments?.length === 0 && (
          <p className="text-[#a1a1a6] text-sm text-center">
            No comments yet
          </p>
        )}

        {article.comments?.map((commentObj, index) => {
          const name = commentObj.user?.email || "User";
          const firstLetter = name.charAt(0).toUpperCase();

          return (
            <div key={index} className={commentCard}>
              <div className={commentHeader}>
                <div className={commentUserRow}>
                  <div className={avatar}>{firstLetter}</div>

                  <div>
                    <p className={commentUser}>{name}</p>
                    <p className={commentTime}>
                      {formatDate(commentObj.createdAt || new Date())}
                    </p>
                  </div>
                </div>
              </div>

              <p className={commentText}>
                {commentObj.comment}
              </p>
            </div>
          );
        })}
      </div>

      <div className={articleFooter}>
        Last updated: {formatDate(article.updatedAt)}
      </div>
    </div>
  );
}

export default ArticleByID;
