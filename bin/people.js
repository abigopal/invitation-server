var fs = require('fs');
var crypto = require('crypto');
var redis = require('redis');
var config = require('../config');

var client = redis.createClient();

client.on("error", function (err) {
  console.log(err);
});

var raw_text = fs.readFileSync(config.guest_list).toString();
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

  var shasum = crypto.createHash('sha1');
  var hash = person.email + config.secret_salt;

  shasum.update(hash);

  var key = shasum.digest('hex');
  person.key = key;

  client.set('id_' + person.key, person.email);
  client.lpush('awaiting', person.first_name + ' ' + person.last_name);

  people.push(person);
}

fs.writeFileSync('../output.txt', JSON.stringify(people));

client.end();
