const express = require('express');
const {
  loginUser, 
  getUserData, 
  withdrawChange, 
  cardExists,
  transferFonds,
} = require("../Controllers");

const router = express.Router();

router.post('/login', loginUser);
router.post("/menu", getUserData);
router.put("/withdraw", withdrawChange);
router.post("/transfer", cardExists);
router.put("/transfer", transferFonds);

module.exports = {
  router
}