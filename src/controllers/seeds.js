const moment = require("moment");
const Seed = require("../models/seed");
const User = require("../models/user");
const Tree = require("../models/tree");

const SeedStages = require("../constants/Seed.Stages");
const SeedStatus = require("../constants/Seed.Status");

// Plant a seed
exports.plantSeed = async (req, res) => {
  try {
    const { userId } = req.params;
    const { location } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    if (user.seedBag === 0) {
      return res.status(400).json({ error: "No seeds available." });
    }
    // Check location is available
    const isLocationAvailable = !(await Seed.count({
      location,
      status: { $ne: SeedStatus.DEAD },
    }));
    if (isLocationAvailable) {
      const seed = await Seed.create({ user: userId, location });
      user.seedBag--;
      await user.save();
      res.status(201).json(seed);
    } else {
      res.status(400).json({
        message: "Already seed is planted here, choose another location.",
      });
    }
  } catch (err) {
    console.error("Failed to plant seed:", err);
    res.status(500).json({ error: "Failed to plant seed" });
  }
};

// Water a seed
exports.waterSeed = async (req, res) => {
  try {
    const { userId, seedId } = req.params;

    const user = await User.findById(userId);
    const seed = await Seed.findById(seedId);
    if (!seed) {
      return res.status(404).json({ error: "Seed not found." });
    }
    if (
      seed.status === SeedStatus.DEAD ||
      seed.status === SeedStatus.FULLY_GROWN
    ) {
      return res.status(400).json({
        error: `Not able to water the ${seed.stage}, ${seed.stage} is ${seed.status}.`,
      });
    }

    const currentDate = moment(Date.now());

    if (seed.lastWateredAt) {
      if (currentDate.diff(moment(seed.lastWateredAt), "hours") < 24) {
        seed.lastWateredAt = Date.now();
        seed.growthDays++;
      } else {
        seed.status = "Dead";
        res.status(400).json({
          message: `Not able to water the ${seed.stage}, ${seed.stage} is ${seed.status}.`,
        });
      }
    } else if (currentDate.diff(moment(seed.plantingDate), "hours") < 24) {
      seed.lastWateredAt = Date.now();
      seed.growthDays++;
    } else {
      seed.status = "Dead";
      res.status(400).json({
        message: `Not able to water the ${seed.stage}, ${seed.stage} is ${seed.status}.`,
      });
    }

    if (seed.growthDays === 2) {
      seed.stage = SeedStages.SAPLING;
    } else if (seed.growthDays === 15) {
      seed.status = SeedStatus.FULLY_GROWN;
      seed.stage = SeedStages.TREE;
      const tree = {
        user: seed.user,
        location: seed.location,
        plantingDate: seed.plantingDate,
      };
      await Tree.create(tree);
    }

    if (userId !== seed.user) {
      user.credits++;
      await user.save();
    }
    await seed.save();
    res.status(200).json({ message: "Seed watered successfully." });
  } catch (err) {
    console.error("Failed to water seed:", err);
    res.status(500).json({ error: "Failed to water seed." });
  }
};

// manure seed
exports.manureSeed = async (req, res) => {
  try {
    const { userId, seedId } = req.params;

    const user = await User.findById(userId);
    const seed = await Seed.findById(seedId);
    if (!seed) {
      return res.status(404).json({ error: "Seed not found." });
    }
    if (
      seed.status === SeedStatus.DEAD ||
      seed.status === SeedStatus.FULLY_GROWN
    ) {
      return res.status(400).json({
        error: `Not able to manure the ${seed.stage}, ${seed.stage} is ${seed.status}.`,
      });
    }
    seed.growthDays++;
    user.manureBag--;

    if (seed.growthDays === 2) {
      seed.stage = SeedStages.SAPLING;
    } else if (seed.growthDays === 15) {
      seed.status = SeedStatus.FULLY_GROWN;
      seed.stage = SeedStages.TREE;
      const tree = {
        user: seed.user,
        location: seed.location,
        plantingDate: seed.plantingDate,
      };
      await Tree.create(tree);
    }
    await user.save();
    await seed.save();
    res.status(200).json({ message: `${seed.stage} Manured successfully.` });
  } catch (err) {
    res.status(500).json({ error: `Failed to water seed` });
  }
};

// get info by id
exports.getInfoById = async (req, res) => {
  try {
    const { seedId } = req.params;
    const seedInfo = await Seed.findById(seedId).populate("user");

    if (seedInfo.status === SeedStatus.DEAD) {
      res.status(400).json({
        message: `Failed to fetch the information, ${seedInfo.stage} is dead.`,
      });
    }
    res.status(200).json(seedInfo);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch information, Try again later." });
  }
};
