const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongodb = require("mongodb");
const { connectDB, closeConnection } = require("../db/connection");


/*Post project*/
let addProject = async (req, res) => {
  // Role based Authentication, only the client would post the project
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

/*View All of the Projects which created by the client*/
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
