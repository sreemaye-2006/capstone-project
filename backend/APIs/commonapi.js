import exp from "express";
import { UserModel } from "../models/usermodel.js";
import { hash, compare } from "bcryptjs";
import jwt from "jsonwebtoken";
import { verifytoken } from "../middleware/verifytoken.js";

export const commonApp = exp.Router();

const { sign } = jwt;

// REGISTER
commonApp.post("/common", async (req, res) => {
  try {
    let allowedRoles = ["USER", "AUTHOR", "ADMIN"];
    const newUser = req.body;

    if (!allowedRoles.includes(newUser.role)) {
      return res.status(400).json({ message: "invalid role" });
    }

    newUser.password = await hash(newUser.password, 12);

    const newUserDoc = new UserModel(newUser);
    await newUserDoc.save();

    res.status(201).json({ message: "user created" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LOGIN
commonApp.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await UserModel.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }

    let result = await compare(password, user.password);

    if (!result) {
      return res.status(400).json({ message: "password invalid" });
    }

    let signedtoken = sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.SECRET_KEY,
      { expiresIn: "2w" }
    );

    res.cookie("token", signedtoken, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    let userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      message: "login successful",
      payload: userObj,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LOGOUT
commonApp.get("/logout", async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "none",
    secure: true,
  });

  res.status(200).json({ message: "logout successful" });
});

// CHECK AUTH
commonApp.get("/check-auth", async (req, res) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(200).json({ message: "unauthenticated" });
  }

  try {
    let decoded = jwt.verify(token, process.env.SECRET_KEY);

    res.status(200).json({
      message: "authenticated",
      payload: decoded,
    });
  } catch (err) {
    res.status(200).json({ message: "unauthenticated" });
  }
});

// CHANGE PASSWORD
commonApp.put(
  "/password",
  verifytoken("USER", "AUTHOR", "ADMIN"),
  async (req, res) => {
    try {
      let { newpassword, email } = req.body;
      const user = req.user;

      if (user.email !== email) {
        return res.status(400).json({ message: "email mismatch" });
      }

      const userDB = await UserModel.findOne({ email });

      let result = await compare(newpassword, userDB.password);

      if (result) {
        return res.status(400).json({
          message: "current password and new password cannot be same",
        });
      }

      newpassword = await hash(newpassword, 12);

      await UserModel.findOneAndUpdate(
        { email },
        { password: newpassword }
      );

      res.status(200).json({
        message: "password updated successfully",
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);
