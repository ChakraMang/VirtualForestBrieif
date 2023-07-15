const Fact = require('../models/fact');

// create a fact
exports.createFact = async (req, res) => {
    try {
        const { message } = req.body;
        const factNumber = await Fact.count() + 1;
        const fact = await Fact.create({factNumber: factNumber, factText: message});
        res.status(201).json(fact);
    } catch (err) {
        res.status(500).json({ error: 'Failed to store the Fact'});
    }
}

// get a random fact
exports.getFact = async (req, res) => {
    try {
        const totalFacts = await Fact.count();
        const factNumber = Math.ceil(Math.random()*totalFacts);
        const fact = await Fact.find({ factNumber });

        res.status(200).json(fact);
    } catch (err) {
        res.status(500).json({ message: 'Unable to get the fact, please try again!'})
    }
}