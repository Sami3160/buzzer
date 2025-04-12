const jwt = require("jsonwebtoken");
// const User = require('../models/User');
require("dotenv").config();
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log(req.headers.authorization);
      // console.log(process.env.JWT_SECRET);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.team = decoded.team;
      next();
      return;
    } catch (error) {
      console.log("token fail");

      console.log(error);

      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    return res.status(401).json({ message: "Not authorized, no token" });
  }
};

const isAdmin = (req, res, next) => {
  const { role } = req.body;
  if (!role)
    return res.status(403).json({ message: "Access denied: Admins only" });
  if (role == "technoutsav") next();
  else return res.status(401).json({ message: "Not an admin" });
};

module.exports = { protect, isAdmin };
