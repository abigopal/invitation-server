var redis = require('redis');
var client = redis.createClient();

exports.guestlist = function(req, res) {
  var url = req.params.id;
};

exports.accept = function(req, res) {
  addPersonToSet(req, res, 'invitation_attending', function() {
    res.redirect('/invite/' + req.params.id);
  });
};

exports.decline = function(req, res) {
  addPersonToSet(req, res, 'invitation_declined', function() {
    res.redirect('/invite/' + req.params.id);  
  });
};

exports.invite = function(req, res) {
  client.smembers('invitation_attending', function(e1, attending) {
    client.smembers('invitation_declined', function(e2, declined) {
      client.smembers('invitation_awaiting', function(e3, awaiting) {
        res.render('invite', { 'id': req.params.id, 'attending': attending, 'declined': declined, 'awaiting': awaiting});
      });
    }); 
  });
};

function addPersonToSet(req, res, set, cb) {
  var id = req.params.id;
  client.get('invitation_id_' + id, function(e1, email) {
    if (e1 || email == null)
      res.redirect('/invite/' + id);  
    else {
      client.get('invitation_email_' + email, function(e2, name) {
        client.sadd(set, name, function(e3) {
          client.del('invitation_id_' + id, function(e4) {
            client.srem('invitation_awaiting', name, function(e5) {
             cb(); 
            });
          });
        });
      });
    } 
  });   
};
