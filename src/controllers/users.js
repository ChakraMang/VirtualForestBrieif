const User = require('../models/user');
const Seed = require('../models/seed');

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.count(email);
    
    if(existingUser) {
      res.status(400).json({message: 'Acoount exists, please try login'})
    } else{
      // Create a new user document in MongoDB
      const user = await User.create({ username, email, password });
      res.status(201).json(user);
    }
  } catch (err) {
    console.error('Failed to register user:', err);
    res.status(500).json({ error: 'Failed to register user' });
  }
}

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Find the user by email and password
    const user = await User.findOne({ email, password });
    if (user) {
      const currentDate = moment(Date.now());
      const newSeedCredited = currentDate.diff(moment(user.lastSeedCredited), 'days');

      user.lastSeedCredited = moment(user.lastSeedCredited).add(newSeedCredited, 'days');
      user.seedBag += newSeedCredited;
      await user.save();

      res.status(200).json({ message: `Login successful, ${newSeedCredited} new seeds credit in your seed bag`, user });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
    
  } catch (err) {
    console.error('Failed to login user:', err);
    res.status(500).json({ error: 'Failed to login user' });
  }
}

// Get user details through world map
exports.getuserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);

    const seeds = await Seed.find(userId);
    const userInfo = {user, seeds};
    console.log(userInfo);
    res.stauts(200).json({ message: 'Succesfully fetched', userInfo});

  } catch (err) {
    res.status(500).json({ error: 'Unable to get user info.'});
  }
}

// Purchase coins [call after financial transaction succesfful]
exports.purchaseCoin = async (req, res) =>  {
  try {
    const { userId } = req.params;
    const { coinPurchased } = req.body;
    const user  = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.coins += coinPurchased;
    await user.save();

    res.status(200).json({ message: `${coinPurchased} coins added to wallet.`})


  } catch (err) {
    res.status(500).json({ error: 'Failed to purchase coins.'})
  }
}


// Purchase seed bag
exports.purchaseSeedBag = async (req, res) => {
  try {
    const { userId } = req.params;
    const {seedBagNumber } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Assuming seed bag costs 10 coins
    if (user.coins < seedBagNumber*10) {
      return res.status(400).json({ error: 'Insufficient coins' });
    }
    user.seedBag+= seedBagNumber;
    user.coins -= seedBagNumber*10;
    await user.save();
    res.status(200).json({ message: `${seedBagNumber} Seed bag purchased successfully` });
  } catch (err) {
    console.error('Failed to purchase seed bag:', err);
    res.status(500).json({ error: 'Failed to purchase seed bag' });
  }
}

// Purchase manure bag
exports.purchaseManureBag = async (req, res) =>  {
  try {
    const { userId } = req.params;
    const {manureNumber} = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Assuming manure bag costs 50 coins
    if (user.coins < manureNumber*50) {
      return res.status(400).json({ error: 'Insufficient coins' });
    }
    user.manureBag+= manureNumber;
    user.coins -= manureNumber*50;
    await user.save();
    res.status(200).json({ message: `${manureNumber} Manure bag purchased successfully` });
  } catch (err) {
    console.error('Failed to purchase manure bag:', err);
    res.status(500).json({ error: 'Failed to purchase manure bag' });
  }
}