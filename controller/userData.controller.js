const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { connectDB, closeConnection } = require("../db/connection");

/*User Registration*/
let userRegister = async (req, res) => {
  try {
    const db = await connectDB();
    const userEmail = await db
      .collection("user_data")
      .findOne({ email: req.body.email });

    if (!userEmail) {
      req.body.createdAt = new Date();

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(req.body.password, salt);
      req.body.password = hash;
      delete req.body.confirmpassword;

      const userData = await db.collection("user_data").insertOne(req.body);
      res.json({ message: `${req.body.role} Registered Successfully !` });

      await closeConnection();
    } else {
      res.status(401).json({ message: "This Email Id already Exists !" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error !" });
  }
};

/*User Login*/
let userLogin = async (req, res) => {
  try {
    const db = await connectDB();
    const userEmail = await db
      .collection("user_data")
      .findOne({ email: req.body.email });

    if (userEmail) {
      const compare = await bcrypt.compare(
        req.body.password,
        userEmail.password
      );
      if (compare) {
        const token = jwt.sign({ _id: userEmail._id }, process.env.JWT_SECRET, {
          expiresIn: "24h",
        });
        res.json({
          token: token,
          role: userEmail.role,
          uId: userEmail._id,
          uNm: userEmail.name,
        });
      } else {
        res.status(401).json({ message: "Invalid Email/Password" });
      }
    } else {
      res.status(401).json({ message: "Invalid Email/Password" });
    }
    await closeConnection();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error !" });
  }
};

module.exports = { userRegister,  userLogin};
