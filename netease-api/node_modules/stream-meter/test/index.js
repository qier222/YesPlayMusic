var test = require("tape").test
var spigot = require("stream-spigot")
var concat = require("concat-stream")

var meter

// Stats
test("load", function (t) {
  t.plan(1)

  meter = require("../")
  t.ok(meter, "loaded module")
})

test("no max (passthrough)", function (t) {
  t.plan(2)

  var m = meter()

  var content = "ABCD1234"

  function match(d) {
    t.equals(d.toString(), content)
    t.equals(m.bytes, 8)
  }

  spigot([content]).pipe(m).pipe(concat(match))
})

test("under max", function (t) {
  t.plan(2)

  var m = meter(100)

  var content = "ABCD1234"

  function match(d) {
    t.equals(d.toString(), content)
    t.equals(m.bytes, 8)
  }

  spigot([content]).pipe(m).pipe(concat(match))
})

test("stops at meter", function (t) {
  t.plan(3)

  var chunks = 0

  function match(d) {
    t.fail()
  }

  var c = concat(match)

  var m = meter(10)
  m.on("error", function (e) {
    t.ok(e.message, "Stream exceeded specified max of 10 bytes.")
    // 12 because read frame is 4, so the 3rd read will put it over the max at 12 bytes
    t.equals(c.getBody().toString(), "ABCDEFGHIJKL")
    t.equals(m.bytes, 12)
  })

  spigot(["ABCD", "EFGH", "IJKL", "MNOP", "QRST", "UVWX", "YZ"]).pipe(m).pipe(c)
})
