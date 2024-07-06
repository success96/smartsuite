const router = require('express').Router();
const { createUser, getUser, getUsers } = require('../controllers/users.controller.js')

router.get('/', getUsers).post('/', createUser);
router.get('/:userId', getUser);



module.exports = router
