var express = require('express');
const { addProject, allProject, viewProject } = require('../controller/clients.controller');
const { authenticate } = require('../lib/authentication');
var router = express.Router();

/* Clients Route. */
// router.post('/register', clientRegister);

// router.get("/", allClients);

// router.post("/login", clientLogin);

router.post("/post_project/:cId", authenticate, addProject);

router.get("/all_projects/:cId", authenticate, allProject);

router.get("/view_project/:cId/:_id", authenticate, viewProject);


module.exports = router;