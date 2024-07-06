const router = require('express').Router();
const { createUser, userLogin, getUserById, getUserOrgById, getUserOrg } = require('../controllers/users.controller.js')

router.post('/auth/register', createUser).get('/auth/login', userLogin)
router.get('/api/users/:id', getUserById).get('/api/organisations', getUserOrg).get('/api/organisation/:orgId', getUserOrgById)



module.exports = router
