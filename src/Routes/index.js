const express = require('express');
const {loginUser, getUserData} = require("../Controllers");

const router = express.Router();

router.post('/login', loginUser);
router.post("/menu", getUserData);

module.exports = {
  router
}