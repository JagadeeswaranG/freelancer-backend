const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongodb = require("mongodb");
const { connectDB, closeConnection } = require("../db/connection");

/*Freelancer Registration*/
let freelancerRegister = async (req, res) => {
  try {
    const db = await connectDB();
    const freelancerEmail = await db
      .collection("freelancers")
      .findOne({ email: req.body.email });

    if (!freelancerEmail) {
      req.body.createdAt = new Date();
      req.body.role = req.body.role.toUpperCase();

      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(req.body.password, salt);
      req.body.password = hash;
      delete req.body.confirmpassword;

      const userData = await db.collection("freelancers").insertOne(req.body);
      res.json({ message: "Freelancer Registered Successfully !" });

      await closeConnection();
    } else {
      res.status(401).json({ message: "This Email Id already Exists !" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error !" });
  }
};

/*All Freelancer*/
let allfreelancer = async (req, res) => {
  try {
    let db = await connectDB();
    let userData = await db.collection("freelancers").find().toArray();
    if (!userData || userData.length == 0) {
      res.status(404).json({ message: "No freelancer Data Found !" });
    } else {
      res.json(userData);
    }

    await closeConnection();
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error !" });
  }
};

/*Freelancer Login*/
let freelancerLogin = async (req, res) => {
  try {
    const db = await connectDB();
    const freelancerEmail = await db
      .collection("freelancers")
      .findOne({ email: req.body.email });

    if (freelancerEmail) {
      const compare = await bcrypt.compare(
        req.body.password,
        freelancerEmail.password
      );
      if (compare) {
        const token = jwt.sign(
          { _id: freelancerEmail._id },
          process.env.JWT_SECRET,
          {
            expiresIn: "24h",
          }
        );
        res.json({
          token: token,
          role: freelancerEmail.role,
          fId: freelancerEmail._id,
          fNm: freelancerEmail.fName,
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
        // if (findData.freelancer) {
          const applyProject = await db
            .collection("projects")
            .updateOne(
              { _id: new mongodb.ObjectId(req.params.pId) },
              { $push: {freelancer: req.body} }
            );
          await closeConnection();
          res.json(applyProject);
        // } else {
        //   const applyProject = await db
        //     .collection("projects")
        //     .updateOne(
        //       { _id: new mongodb.ObjectId(req.params.pId) },
        //       { $set: req.body }
        //     );
        //   await closeConnection();
        //   res.json(applyProject);
        // }
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
  freelancerRegister,
  allfreelancer,
  freelancerLogin,
  projects,
  viewProjects,
  applyProject,
};
