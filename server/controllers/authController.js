const { oauth2client } = require("../utils/googleConfig");
const axios = require("axios");
const UserModel = require("../models/userModel");
const jwt = require("jsonwebtoken");

const googleLogin = async (req, res) => {
  try {
    const { code } = req.query;
    const googleRes = await oauth2client.getToken(code);
    oauth2client.setCredentials(googleRes.tokens);

    const userRes = await axios.get(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
    );
    const { email, name, picture } = userRes.data;

    let user = await UserModel.findOne({ email });
    const isExistingUser = !!user;
    
    if (!user) {
      user = await UserModel.create({
        name,
        email,
        image: picture,
      });
    }
    const { _id } = user;
    const token = jwt.sign({ _id, email }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_TIMEOUT,
    });
    return res.status(200).json({
        message: isExistingUser ? "Welcome back!" : "Account created successfully!",
        token,
        user,
        isExistingUser
    });
  } catch (err) {
    console.error("Authentication error:", err);
    res.status(500).json({
        message: "Internal server error",
        error: err.message
    });
  }
};

module.exports = { googleLogin };
