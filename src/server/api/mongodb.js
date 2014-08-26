// module
var github = require('../services/github');

function permission(user, uuid, done) {

    github.call({
        obj: 'repos',
        fun: 'one',
        arg: { id: uuid },
        token: user.token
    }, function(err, repo) {

        done(repo && repo.permissions && repo.permissions.pull);

    });

}

module.exports = {

    /************************************************************************************************************

    @github

    + <req.obj>.<req.fun>

    ************************************************************************************************************/

    findAll: function(req, done) {

        permission(req.user, req.args.arg.repo, function(okay) {
            if(okay) {
                var model = require('mongoose').model(req.args.obj);

                model.find(req.args.arg, function(err, model) {
                    done(err, model.filter(function(model) {
                        return model.repo == req.args.arg.repo;
                    }));
                });
            }
        });

    },

    findOne: function(req, done) {

        permission(req.user, req.args.arg.repo, function(okay) {
            if(okay) {
                var model = require('mongoose').model(req.args.obj);

                model.findOne(req.args.arg, function(err, model) {
                    done(err, model.repo == req.args.arg.repo ? model: null);
                });

            }
        });
    }

};