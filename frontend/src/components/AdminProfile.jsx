
import { useAuth } from "../store/authStore";
import axios from "../axiosConfig";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import {
  pageWrapper,
  secondaryBtn,
  primaryBtn,
  ghostBtn,
  articleGrid,
  articleCardClass,
  articleTitle,
  timestampClass,
  errorClass,
  loadingClass,
  divider,
  mutedText,
} from "../styles/common";

function AdminProfile() {
  const currentUser = useAuth((state) => state.currentUser);
  const logout = useAuth((state) => state.logout);
  const navigate = useNavigate();

  const [view, setView] = useState("users");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [articles, setArticles] = useState([]);
  const [updatingUserId, setUpdatingUserId] = useState(null);

  const onLogout = async () => {
    await logout();
    navigate("/login");
  };

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, articlesRes] = await Promise.all([
        axios.get("https://blog-2-p13k.onrender.com/admin-api/users", { withCredentials: true }),
        axios.get("https://blog-2-p13k.onrender.com/admin-api/articles", { withCredentials: true }),
      ]);

      setUsers(usersRes.data.payload || []);
      setArticles(articlesRes.data.payload || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const formatDateIST = (date) =>
    new Date(date).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });

  const toggleUserStatus = async (user) => {
    setUpdatingUserId(user._id);
    try {
      await axios.patch(
        "https://blog-2-p13k.onrender.com/admin-api/users",
        { userId: user._id, isActive: !user.isActive },
        { withCredentials: true }
      );

      setUsers((prev) =>
        prev.map((u) =>
          u._id === user._id ? { ...u, isActive: !u.isActive } : u
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update user status");
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className={pageWrapper}>
      {error && <p className={errorClass}>{error}</p>}

      <div className="bg-white border border-[#e8e8ed] rounded-3xl p-6 mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm text-[#6e6e73]">Admin Dashboard</p>
            <h1 className="text-3xl font-semibold text-[#1d1d1f]">
              Welcome, {currentUser?.firstName}
            </h1>
            <p className={mutedText}>
              Manage users, review articles and control user access.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              className={view === "users" ? primaryBtn : secondaryBtn}
              onClick={() => setView("users")}
            >
              Users
            </button>

            <button
              className={view === "articles" ? primaryBtn : secondaryBtn}
              onClick={() => setView("articles")}
            >
              Articles
            </button>

            <button
              className="bg-[#ff3b30] text-white text-sm px-5 py-2 rounded-full hover:bg-[#d62c23] transition"
              onClick={onLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className={divider}></div>

      {loading ? (
        <p className={loadingClass}>Loading admin data...</p>
      ) : view === "users" ? (
        <div>
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-6">
            All Users
          </h2>

          {users.length === 0 ? (
            <p className={mutedText}>No users found.</p>
          ) : (
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="bg-[#f5f5f7] rounded-3xl p-5 border border-[#e8e8ed] flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                >
                  <div>
                    <p className="text-base font-semibold text-[#1d1d1f]">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className={mutedText}>{user.email}</p>
                    <p className="text-sm text-[#6e6e73] mt-1">
                      Role: {user.role}
                    </p>
                    <p className="text-sm mt-1">
                      Status:{" "}
                      <span
                        className={
                          user.isActive
                            ? "text-[#248a3d]"
                            : "text-[#cc2f26]"
                        }
                      >
                        {user.isActive ? "Active" : "Blocked"}
                      </span>
                    </p>
                  </div>

                  <button
                    className={ghostBtn}
                    onClick={() => toggleUserStatus(user)}
                    disabled={updatingUserId === user._id}
                  >
                    {updatingUserId === user._id
                      ? "Updating..."
                      : user.isActive
                      ? "Block user"
                      : "Activate user"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold text-[#1d1d1f] mb-6">
            All Articles
          </h2>

          {articles.length === 0 ? (
            <p className={mutedText}>No articles found.</p>
          ) : (
            <div className={articleGrid}>
              {articles.map((article) => (
                <div className={articleCardClass} key={article._id}>
                  <div>
                    <p className={articleTitle}>{article.title}</p>
                    <p className="text-sm text-[#6e6e73] mt-2">
                      {article.content.slice(0, 100)}...
                    </p>
                  </div>

                  <div className="mt-4 text-sm text-[#6e6e73]">
                    <p>Category: {article.category}</p>
                    <p className="mt-2">
                      Status:{" "}
                      {article.isArticleActive ? "Published" : "Inactive"}
                    </p>
                    <p className={`${timestampClass} mt-3`}>
                      {formatDateIST(article.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminProfile;
