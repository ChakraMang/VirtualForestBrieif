const Tree = require('../models/tree')

exports.mintTree = async (req, res) => {
    try {
        const {treeId} = req.params;

        const tree = Tree.fiondById(treeId);
        if(!tree){
            res.status(404).json({message: 'Tree not found.'});
        }else {
            tree.isMinted = true;
            await tree.save();
            res.status(200).json({message: 'Tree minted succesfully.'})
        }
    } catch (error) {
        res.status(500).json({message: 'Unable to mint tree, try again later.'})
    }
}