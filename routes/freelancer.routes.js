var express = require('express');
const { freelancerRegister, allfreelancer, freelancerLogin, projects, viewProjects, applyProject } = require('../controller/freelancer.controller');
const { authenticate } = require('../lib/authentication');
var router = express.Router();

/* Freelancers Route. */
router.post('/register', freelancerRegister);

router.get("/", allfreelancer);

router.post("/login", freelancerLogin);

router.get("/projects/:fId",authenticate, projects);

router.get("/view_project/:fId/:pId",authenticate, viewProjects);

router.put("/apply_project/:fId/:pId",authenticate, applyProject);



module.exports = router;