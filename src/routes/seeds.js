const express = require("express");
const router = express.Router();
const SeedController = require("../controllers/seeds");

router.post("/plant/:userId", SeedController.plantSeed);
router.put("/water/:userId/:seedId", SeedController.waterSeed);
router.put("/manure/:seedId", SeedController.manureSeed);
router.get("/:seedId", SeedController.getInfoById);

module.exports = router;
