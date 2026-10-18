const jwt = require("jsonwebtoken");
const privateKey = process.env.JWT_KEY;
const expiresIn = process.env.JWT_EXPIRES_IN || "7d";

module.exports.jwtSign = async (payload) => {
  return jwt.sign(
    { username: payload.username, email: payload.email },
    privateKey,
    { expiresIn },
  );
};

module.exports.jwtVerify = async (token) => {
  return jwt.verify(token, privateKey);
};
