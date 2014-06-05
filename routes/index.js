var redis = require('redis');
var client = redis.createClient();

exports.guestlist = function(req, res) {
  var url = req.params.id;
};

exports.join = function(req, res) {
  addPersonToSet(req, res, 'invitation_attending');
};

exports.decline = function(req, res) {
  addPersonToSet(req, res, 'invitation_declined');
};

exports.invite = function(req, res) {
  res.render('invite.ejs', { 'id': req.params.id });
};

function addPersonToSet(req, res, set) {
  var id = req.body.id;
  client.get('invitation_id_' + id, function(e1, email) {
    if (err || email == null)
      res.redirect('/');  
    else {
      client.get('invitation_email_' + email, function(e2, name) {
        client.sadd(set, name, function(e3) {
          client.del('invitation_id_' + id);
        });
      });
    } 
  });   
};
