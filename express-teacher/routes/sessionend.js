var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('<p style="text-align: center;">Session was end.</p>');
});

module.exports = router;
