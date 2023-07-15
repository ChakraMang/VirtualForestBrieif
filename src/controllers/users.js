const User = require("../models/user");
const Seed = require("../models/seed");
const Tree = require("../models/tree");

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log(req.body);

    const existingUsername = await User.count({ username });

    if (existingUsername) {
      res
        .status(400)
        .json({ message: "Username already exist, try a different one." });
    } else {
      const existingUser = await User.count({ email });
      if (existingUser) {
        res.status(400).json({ message: "Acoount exists, please try login." });
      } else {
        // Create a new user document in MongoDB
        const user = await User.create({ username, email, password });
        res.status(201).json(user);
      }
    }
  } catch (err) {
    console.error("Failed to register user:", err);
    res.status(500).json({ error: "Failed to register user." });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find the user by email and password
    const user = await User.findOne({ email, password });
    if (user) {
      const currentDate = moment(Date.now());
      const newSeedCredited = currentDate.diff(
        moment(user.lastSeedCredited),
        "days"
      );

      user.lastSeedCredited = moment(user.lastSeedCredited).add(
        newSeedCredited,
        "days"
      );
      user.seedBag += newSeedCredited;
      await user.save();

      res.status(200).json({
        message: `Login successful, ${newSeedCredited} new seeds credit in your seed bag.`,
        user,
      });
    } else {
      res.status(401).json({ error: "Invalid credentials." });
    }
  } catch (err) {
    console.error("Failed to login user:", err);
    res.status(500).json({ error: "Failed to login user." });
  }
};

// Get user details through world map
exports.getuserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    const seeds = await Seed.find({ user: userId });
    const trees = await Tree.find({ user: userId });
    const userInfo = { user, seeds, trees };

    res.stauts(200).json({ message: "Succesfully fetched", userInfo });
  } catch (err) {
    res.status(500).json({ error: "Unable to get user info." });
  }
};

// Update user details

exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    const updates = req.body;

    if (!user) {
      res.status(400).json({ message: "User not exist." });
    } else {
      if (updates.email || updates.username) {
        res.status(400).json({
          message: "Contact support team to change Email or Username.",
        });
      } else {
        // Update user properties
        user.level = updates.level || user.level;
        user.badges = updates.badges ?? user.badges.push(...updates.badges);
        user.walletAddress = updates.walletAddress || user.walletAddress;
        user.backgrounds =
          updates.backgrounds ?? user.backgrounds.push(...updates.backgrounds);
        user.friends = updates.friends ?? user.friends.push(...updates.friends);
        user.stage = updates.stage || user.stage;
        user.seedBag = updates.seedBag || user.seedBag;
        user.manureBag = updates.manureBag || user.manureBag;
        user.credits = updates.credits || user.credits;
        user.coins = updates.coins || user.coins;
        user.lastSeedCredited =
          updates.lastSeedCredited || user.lastSeedCredited;
        user.updatedAt = new Date();

        await user.save();
        res.status(200).json({ message: "Updated Succesffuly." });
      }
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Unable to update user details now, try again later." });
  }
};
// Purchase coins [call after financial transaction succesfful]
exports.purchaseCoin = async (req, res) => {
  try {
    const { userId } = req.params;
    const { coinPurchased } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    user.coins += coinPurchased;
    await user.save();

    res
      .status(200)
      .json({ message: `${coinPurchased} coins added to wallet.` });
  } catch (err) {
    res.status(500).json({ error: "Failed to purchase coins." });
  }
};

// Purchase seed bag
exports.purchaseSeedBag = async (req, res) => {
  try {
    const { userId } = req.params;
    const { seedBagNumber } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    // Assuming seed bag costs 10 coins
    if (user.coins < seedBagNumber * 10) {
      return res.status(400).json({ error: "Insufficient coins." });
    }
    user.seedBag += seedBagNumber;
    user.coins -= seedBagNumber * 10;
    await user.save();
    res
      .status(200)
      .json({ message: `${seedBagNumber} Seed bag purchased successfully.` });
  } catch (err) {
    console.error("Failed to purchase seed bag:", err);
    res.status(500).json({ error: "Failed to purchase seed bag." });
  }
};

// Purchase manure bag
exports.purchaseManureBag = async (req, res) => {
  try {
    const { userId } = req.params;
    const { manureNumber } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    // Assuming manure bag costs 50 coins
    if (user.coins < manureNumber * 50) {
      return res.status(400).json({ error: "Insufficient coins." });
    }
    user.manureBag += manureNumber;
    user.coins -= manureNumber * 50;
    await user.save();
    res
      .status(200)
      .json({ message: `${manureNumber} Manure bag purchased successfully.` });
  } catch (err) {
    console.error("Failed to purchase manure bag:", err);
    res.status(500).json({ error: "Failed to purchase manure bag." });
  }
};

// add a friend
exports.addFriend = async (req, res) => {
  try {
    const { friendUserId, userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found." });
    }
    console.log(1);
    const friend = await User.findById(friendUserId);
    if (!friend) {
      res.status(404).json({ message: "Friend not found." });
    }
    console.log(2);
    user.friends.push(friendUserId);
    console.log(user, friend);
    friend.friends.push(userId);
    await user.save();
    await friend.save();
    res.status(200).json({ message: "Friend added succesfully." });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Unable to add friend now, try after sometime." });
  }
};
