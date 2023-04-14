const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongodb = require("mongodb");
const { connectDB, closeConnection } = require("../db/connection");

/*Client Registration*/
// let clientRegister = async (req, res) => {
//   try {
//     const db = await connectDB();
//     const clientEmail = await db
//       .collection("clients")
//       .findOne({ email: req.body.email });

//     if (!clientEmail) {
//       req.body.createdAt = new Date();
//       req.body.role = (req.body.role).toUpperCase();

//       const salt = await bcrypt.genSalt(10);
//       const hash = await bcrypt.hash(req.body.password, salt);
//       req.body.password = hash;
//       delete req.body.confirmpassword;

//       const userData = await db.collection("clients").insertOne(req.body);
//       res.json({ message: "Client Registered Successfully !" });

//       await closeConnection();
//     } else {
//       res.status(401).json({ message: "This Email Id already Exists !" });
//     }
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Internal server error !" });
//   }
// };

/*All Clients*/
// let allClients = async (req, res) => {
//   try {
//     let db = await connectDB();
//     let userData = await db.collection("clients").find().toArray();
//     if (!userData || userData.length == 0) {
//       res.status(404).json({ message: "No Client Data Found !" });
//     } else {
//       res.json(userData);
//     }

//     await closeConnection();
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Internal server error !" });
//   }
// };

/*Client Login*/
// let clientLogin = async (req, res) => {
//   try {
//     const db = await connectDB();
//     const clientEmail = await db
//       .collection("clients")
//       .findOne({ email: req.body.email });

//     if (clientEmail) {
//       const compare = await bcrypt.compare(
//         req.body.password,
//         clientEmail.password
//       );
//       if (compare) {
//         const token = jwt.sign(
//           { _id: clientEmail._id },
//           process.env.JWT_SECRET,
//           {
//             expiresIn: "24h",
//           }
//         );
//         res.json({
//           token: token,
//           role: clientEmail.role,
//           cId: clientEmail._id,
//           cNm: clientEmail.cName,
//         });
//       } else {
//         res.status(401).json({ message: "Invalid Email/Password" });
//       }
//     } else {
//       res.status(401).json({ message: "Invalid Email/Password" });
//     }
//     await closeConnection();
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Internal server error !" });
//   }
// };

/*Post project*/
let addProject = async (req, res) => {
  // Role based Authentication, only the client would post project
  try {
    if (req.userId === req.params.cId) {
      const db = await connectDB();
      req.body.createdAt = new Date();
      req.body.freelancer = [];

      const project = await db
        .collection("projects")
        .insertOne({ cId: new mongodb.ObjectId(req.params.cId), ...req.body });
      await closeConnection();
      res.json({
        message: "Project Posted Successfully !",
      });
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error !" });
  }
};

/*All Projects*/
let allProject = async (req, res) => {
  try {
    if (req.userId === req.params.cId) {
      const db = await connectDB();
      const projectData = await db
        .collection("projects")
        .find({ cId: new mongodb.ObjectId(req.params.cId) })
        .toArray();
      let result = projectData.reverse();

      await closeConnection();
      res.json(result);
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error !" });
  }
};

/*View Freelancers*/
let viewProject = async (req, res) => {
  try {
    if (req.userId === req.params.cId) {
      const db = await connectDB();
      const projectData = await db
        .collection("projects")
        // .find({
        //   $and: [
        //     { _id: new mongodb.ObjectId(req.params._id) },
        //     { cId: new mongodb.ObjectId(req.params.cId) },
        //   ],
        // })
        .aggregate([
          {
            $match: {
              $and: [
                {
                  _id: new mongodb.ObjectId(req.params._id),
                },
                {
                  cId: new mongodb.ObjectId(req.params.cId),
                },
              ],
            },
          },
          {
            $unwind: "$freelancer",
          },
          {
            $addFields: {
              userObjectId: {
                $toObjectId: "$freelancer.fId",
              },
            },
          },
          {
            $lookup: {
              from: "user_data",
              localField: "userObjectId",
              foreignField: "_id",
              as: "result",
            },
          },
          {
            $unwind: "$result",
          },
          {
            $group: {
              _id: "$_id",
              freelancer: {
                $addToSet: "$result",
              },
            },
          },
        ])
        .toArray();
      await closeConnection();
      // console.log(projectData);
      if (projectData) {
        res.json(projectData);
      } else {
        res.status(404).json({ message: "Freelancers Not Found!" });
      }
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error !" });
  }
};

module.exports = { addProject, allProject, viewProject };
