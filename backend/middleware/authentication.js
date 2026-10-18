const { JsonWebTokenError, TokenExpiredError } = require("jsonwebtoken");
const { NotFoundError, UnauthorizedError } = require("../helper/customErrors");
const { jwtVerify } = require("../helper/jwt");
const { User } = require("../models");

const verifyToken = async (req, res, next) => {
  try {
    const { headers } = req;
    if (!headers.authorization) return next();

    const parts = headers.authorization.trim().split(/\s+/);
    const [scheme, token] = parts;
    if (parts.length !== 2 || scheme !== "Token" || !token)
      throw new UnauthorizedError("Token missing or malformed");

    const userVerified = await jwtVerify(token);
    if (!userVerified) throw new Error("Invalid Token");

    req.loggedUser = await User.findOne({
      attributes: { exclude: ["email"] },
      where: { email: userVerified.email },
    });

    if (!req.loggedUser) throw new NotFoundError("User");

    headers.email = userVerified.email;
    req.loggedUser.dataValues.token = token;

    next();
  } catch (error) {
    // TokenExpiredError extends JsonWebTokenError, so check it first
    if (error instanceof TokenExpiredError)
      return next(new UnauthorizedError("Token expired, please login again"));
    if (error instanceof JsonWebTokenError) {
      const message =
        error.message === "jwt malformed"
          ? "Token missing or malformed"
          : "Invalid token";
      return next(new UnauthorizedError(message));
    }
    next(error);
  }
};

module.exports = verifyToken;
