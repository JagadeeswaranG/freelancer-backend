const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongodb = require("mongodb");
const { connectDB, closeConnection } = require("../db/connection");


/*View all projects*/
let projects = async (req, res) => {
  try {
    if (req.userId === req.params.fId) {
      const db = await connectDB();
      const projectData = await db.collection("projects").find({}).toArray();
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

/*View the project in details*/
let viewProjects = async (req, res) => {
  try {
    if (req.userId === req.params.fId) {
      const db = await connectDB();
      // Aggregate to combined data with required format from different documents of this collection
      const projectData = await db
        .collection("projects")

        .aggregate([
          {
            $match: {
              _id: new mongodb.ObjectId(req.params.pId),
            },
          },
          {
            $lookup: {
              from: "user_data",
              localField: "cId",
              foreignField: "_id",
              as: "result",
            },
          },
          {
            $unwind: "$result",
          },
          {
            $project: {
              _id: "$_id",
              cId: "$cId",
              projectName: "$projectName",
              type: "$type",
              prg_language: "$prg_language",
              about: "$about",
              duration: "$duration",
              c_name: "$result.name",
              c_email: "$result.email",
            },
          },
        ])
        .toArray();
      res.json(projectData);
      await closeConnection();
    } else {
      res.status(401).json({ message: "Unauthorized to get data" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error !" });
  }
};

/*Apply to the project*/
let applyProject = async (req, res) => {
  try {
    if (req.userId === req.params.fId) {
      const db = await connectDB();
      const findData = await db
        .collection("projects")
        .findOne({ _id: new mongodb.ObjectId(req.params.pId) });
      if (findData) {
          const applyProject = await db
            .collection("projects")
            .updateOne(
              { _id: new mongodb.ObjectId(req.params.pId) },
              { $push: {freelancer: req.body} }
            );
          await closeConnection();
          res.json(applyProject);
      } else {
        res.status(404).json({ message: "Data not Found!" });
      }
    } else {
      res.status(401).json({ message: "Unauthorized to do" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error !" });
  }
};

module.exports = {
  projects,
  viewProjects,
  applyProject,
};
