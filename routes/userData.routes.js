var express = require('express');
const { userLogin, userRegister } = require('../controller/userData.controller');
var router = express.Router();

/* All User Route. */
router.post('/register', userRegister);

router.post("/login", userLogin);


module.exports = router;