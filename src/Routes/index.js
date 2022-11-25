const express = require('express');
const {loginUser, getUserData, withdrawChange} = require("../Controllers");

const router = express.Router();

router.post('/login', loginUser);
router.post("/menu", getUserData);
router.put("/withdraw", withdrawChange);

module.exports = {
  router
}