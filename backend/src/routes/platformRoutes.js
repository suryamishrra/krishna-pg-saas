const express = require('express');
const tenantController = require('../modules/tenant/tenant.controller');

const router = express.Router();

router.post('/tenants', tenantController.createTenant);
router.get('/tenants', tenantController.listTenants);

module.exports = router;
