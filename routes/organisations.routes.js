const router = require('express').Router();

const { createOrg, createOrgUser } = require('../controllers/organisations.controller');

router.post('/', createOrg)
router.post('/:orgId/users', createOrgUser)


module.exports = router