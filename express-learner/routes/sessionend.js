var express = require('express');
var router = express.Router();

/* GET sessionend. */
router.get('/', function(req, res, next) {
  res.send('<p style="text-align: center;">会话已经结束。</p>');
});

module.exports = router;
