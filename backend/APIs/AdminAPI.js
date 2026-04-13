import exp from "express";
export const adminApp = exp.Router();

import { UserModel } from "../models/UserModel.js";

// GET ALL USERS & AUTHORS
adminApp.get("/users", async (req, res) => {
  try {
    const users = await UserModel.find();
    res.send({ message: "Users list", payload: users });
  } catch (err) {
    res.send({ message: "Error", payload: err.message });
  }
});

// BLOCK USER / AUTHOR
adminApp.put("/block/:id", async (req, res) => {
  try {
    const user = await UserModel.findByIdAndUpdate(
      req.params.id,
      { isUserActive: false },
      { new: true }
    );
    res.send({ message: "User blocked", payload: user });
  } catch (err) {
    res.send({ message: "Error blocking user", payload: err.message });
  }
});

// UNBLOCK USER / AUTHOR
adminApp.put("/unblock/:id", async (req, res) => {
  try {
    const user = await UserModel.findByIdAndUpdate(
      req.params.id,
      { isUserActive: true },
      { new: true }
    );
    res.send({ message: "User unblocked", payload: user });
  } catch (err) {
    res.send({ message: "Error unblocking user", payload: err.message });
  }
});
