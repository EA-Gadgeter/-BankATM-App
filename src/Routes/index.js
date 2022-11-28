const express = require('express');
const {
  loginUser, 
  getUserData, 
  withdrawChange, 
  cardExists,
  transferFonds,
  depPayFonds,
  blockCard,
  newTransaction
} = require("../Controllers");

const router = express.Router();

router.post('/login', loginUser);
router.put('/login', blockCard);
router.post("/menu", getUserData);
router.put("/withdraw", withdrawChange);
router.post("/transfer", cardExists);
router.put("/transfer", transferFonds);
router.put("/dep-fonds", depPayFonds);
router.post("/transaction", newTransaction);

module.exports = {
  router
}