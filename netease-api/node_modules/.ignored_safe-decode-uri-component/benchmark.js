const benchmark = require('benchmark');
const decode = require('./');


const suite = new benchmark.Suite();

const short = encodeURIComponent('tést💩🇺🇸');
const medium = short.repeat(500);
const long = medium.repeat(500);

// add tests
suite
.add('Short String (native)', function() {
  decodeURIComponent(short);
})
.add('Short String (safe)', function() {
  decode(short);
})

.add('Medium String (native)', function() {
  decodeURIComponent(medium);
})
.add('Medium String (safe)', function() {
  decode(medium);
})

.add('Long String (native)', function() {
  decodeURIComponent(long);
})
.add('Long String (safe)', function() {
  decode(long);
})

// add listeners
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').map('name'));
})
// run async
.run({ 'async': true });
