var express = require('express');
var router = express.Router();

/* GET sessionend. */
router.get('/', function(req, res, next) {
  res.send('<div style="height: 100%;display: flex;justify-content: center;align-items: center;"><p style="font-size: 24px;">Session was end.</p></div>');
});

module.exports = router;
