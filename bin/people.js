var fs = require('fs');
var crypto = require('crypto');
var config = require('../config');
var redis = require('redis');

var client = redis.createClient();

client.on("error", function (err) {
  console.log(err);
});

var raw_text = fs.readFileSync(config.guest_list).toString();

var previous_output = [];

try {
  previous_output = JSON.parse(fs.readFileSync('../output.json').toString());
}
catch(err) {
}

var people_list = raw_text.split('\n');
var people = [];

for (var i in people_list) {
  var person_data = people_list[i].split(' ');
  if (person_data.length != 3)
    continue;
  var person = {
    first_name: person_data[0],
    last_name: person_data[1],
    email: person_data[2],
  };
  
  if (alreadyInvited(person.email))
    continue; 

  var shasum = crypto.createHash('sha1');
  var hash = person.email + config.secret_salt;

  shasum.update(hash);

  var key = shasum.digest('hex');
  person.key = key;

  var name = person.first_name + ' ' + person.last_name;

  client.set('invitation_id_' + person.key, person.email);
  client.set('invitation_email_' + person.email, name);
  client.sadd('invitation_awaiting', name);

  people.push(person);
}

fs.writeFileSync('../output.json', JSON.stringify(previous_output.concat(people)));

client.quit();

function alreadyInvited(email) {
  for (var i in previous_output) {
    if (previous_output[i].email == email)
      return true;
  }
  return false;
}
