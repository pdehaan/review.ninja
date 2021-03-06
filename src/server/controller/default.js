var express = require('express');

//////////////////////////////////////////////////////////////////////////////////////////////
// Default router
//////////////////////////////////////////////////////////////////////////////////////////////

var router = express.Router();

router.all('/*', function(req, res) {

    if (req.isAuthenticated()) {
        return res.sendfile('home.html', {root: __dirname + './../../client'});
    }

    // enterprise marketing page
    if (config.server.github.enterprise) {
        return res.sendfile('login.html', {root: __dirname + './../../client'});
    }

    // return res.redirect(config.server.marketingPage);
    return res.sendfile('login.html', {root: __dirname + './../../client'});
});

module.exports = router;
