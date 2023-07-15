const express = require('express')
const router = express.Router();
const FactController = require('../controllers/facts');

router.post('/',FactController.createFact);
router.get('/', FactController.getFact);

module.exports = router;