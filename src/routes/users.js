const express = require("express");
const router = express.Router();

const UserController = require("../controllers/users");

router.post("/register", UserController.registerUser);
router.post("/login", UserController.loginUser);
router.put("/purchase/coin/:userId", UserController.purchaseCoin);
router.put("/purchase/seedbag/:userId", UserController.purchaseSeedBag);
router.put("/purchase/manurebag/:userId", UserController.purchaseManureBag);
router.put("/friend/:friendUserId/:userId", UserController.addFriend);

module.exports = router;
