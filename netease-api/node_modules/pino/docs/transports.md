# Transports

A "transport" for Pino is a supplementary tool which consumes Pino logs.

Consider the following example:

```js
const split = require('split2')
const pump = require('pump')
const through = require('through2')

const myTransport = through.obj(function (chunk, enc, cb) {
  // do the necessary
  console.log(chunk)
  cb()
})

pump(process.stdin, split(JSON.parse), myTransport)
```

The above defines our "transport" as the file `my-transport-process.js`.

Logs can now be consumed using shell piping:

```sh
node my-app-which-logs-stuff-to-stdout.js | node my-transport-process.js
```

Ideally, a transport should consume logs in a separate process to the application,
Using transports in the same process causes unnecessary load and slows down
Node's single threaded event loop.

## In-process transports

> **Pino *does not* natively support in-process transports.**

Pino does not support in-process transports because Node processes are
single threaded processes (ignoring some technical details). Given this
restriction, one of the methods Pino employs to achieve its speed is to
purposefully offload the handling of logs, and their ultimate destination, to
external processes so that the threading capabilities of the OS can be
used (or other CPUs).

One consequence of this methodology is that "error" logs do not get written to
`stderr`. However, since Pino logs are in a parsable format, it is possible to
use tools like [pino-tee][pino-tee] or [jq][jq] to work with the logs. For
example, to view only logs marked as "error" logs:

```
$ node an-app.js | jq 'select(.level == 50)'
```

In short, the way Pino generates logs:

1. Reduces the impact of logging on an application to the absolute minimum.
2. Gives greater flexibility in how logs are processed and stored.

Given all of the above, Pino recommends out-of-process log processing.

However, it is possible to wrap Pino and perform processing in-process.
For an example of this, see [pino-multi-stream][pinoms].

[pino-tee]: https://npm.im/pino-tee
[jq]: https://stedolan.github.io/jq/
[pinoms]: https://npm.im/pino-multi-stream

## Known Transports

PR's to this document are welcome for any new transports!

+ [pino-applicationinsights](#pino-applicationinsights)
+ [pino-azuretable](#pino-azuretable)
+ [pino-cloudwatch](#pino-cloudwatch)
+ [pino-couch](#pino-couch)
+ [pino-datadog](#pino-datadog)
+ [pino-elasticsearch](#pino-elasticsearch)
+ [pino-gelf](#pino-gelf)
+ [pino-http-send](#pino-http-send)
+ [pino-kafka](#pino-kafka)
+ [pino-logdna](#pino-logdna)
+ [pino-logflare](#pino-logflare)
+ [pino-mq](#pino-mq)
+ [pino-mysql](#pino-mysql)
+ [pino-papertrail](#pino-papertrail)
+ [pino-pg](#pino-pg)
+ [pino-redis](#pino-redis)
+ [pino-sentry](#pino-sentry)
+ [pino-seq](#pino-seq)
+ [pino-socket](#pino-socket)
+ [pino-stackdriver](#pino-stackdriver)
+ [pino-syslog](#pino-syslog)
+ [pino-websocket](#pino-websocket)



<a id="pino-applicationinsights"></a>
### pino-applicationinsights
The [pino-applicationinsights](https://www.npmjs.com/package/pino-applicationinsights) module is a transport that will forward logs to [Azure Application Insights](https://docs.microsoft.com/en-us/azure/azure-monitor/app/app-insights-overview).

Given an application `foo` that logs via pino, you would use `pino-applicationinsights` like so:

``` sh
$ node foo | pino-applicationinsights --key blablabla
```

For full documentation of command line switches read [readme](https://github.com/ovhemert/pino-applicationinsights#readme)

<a id="pino-azuretable"></a>
### pino-azuretable
The [pino-azuretable](https://www.npmjs.com/package/pino-azuretable) module is a transport that will forward logs to the [Azure Table Storage](https://azure.microsoft.com/en-us/services/storage/tables/).

Given an application `foo` that logs via pino, you would use `pino-azuretable` like so:

``` sh
$ node foo | pino-azuretable --account storageaccount --key blablabla
```

For full documentation of command line switches read [readme](https://github.com/ovhemert/pino-azuretable#readme)

<a id="pino-cloudwatch"></a>
### pino-cloudwatch

[pino-cloudwatch][pino-cloudwatch] is a transport that buffers and forwards logs to [Amazon CloudWatch][].

```sh
$ node app.js | pino-cloudwatch --group my-log-group
```

[pino-cloudwatch]: https://github.com/dbhowell/pino-cloudwatch
[Amazon CloudWatch]: https://aws.amazon.com/cloudwatch/

<a id="pino-couch"></a>
### pino-couch

[pino-couch][pino-couch] uploads each log line as a [CouchDB][CouchDB] document.

```sh
$ node app.js | pino-couch -U https://couch-server -d mylogs
```

[pino-couch]: https://github.com/IBM/pino-couch
[CouchDB]: https://couchdb.apache.org

<a id="pino-datadog"></a>
### pino-datadog
The [pino-datadog](https://www.npmjs.com/package/pino-datadog) module is a transport that will forward logs to [DataDog](https://www.datadoghq.com/) through it's API.

Given an application `foo` that logs via pino, you would use `pino-datadog` like so:

``` sh
$ node foo | pino-datadog --key blablabla
```

For full documentation of command line switches read [readme](https://github.com/ovhemert/pino-datadog#readme)

<a id="pino-elasticsearch"></a>
### pino-elasticsearch

[pino-elasticsearch][pino-elasticsearch] uploads the log lines in bulk
to [Elasticsearch][elasticsearch], to be displayed in [Kibana][kibana].

It is extremely simple to use and setup

```sh
$ node app.js | pino-elasticsearch
```

Assuming Elasticsearch is running on localhost.

To connect to an external elasticsearch instance (recommended for production):

* Check that `network.host` is defined in the `elasticsearch.yml` configuration file. See [elasticsearch Network Settings documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/modules-network.html#common-network-settings) for more details.
* Launch:

```sh
$ node app.js | pino-elasticsearch --node http://192.168.1.42:9200
```

Assuming Elasticsearch is running on `192.168.1.42`.

To connect to AWS Elasticsearch:

```sh
$ node app.js | pino-elasticsearch --node https://es-url.us-east-1.es.amazonaws.com --es-version 6
```

Then [create an index pattern](https://www.elastic.co/guide/en/kibana/current/setup.html) on `'pino'` (the default index key for `pino-elasticsearch`) on the Kibana instance.

[pino-elasticsearch]: https://github.com/pinojs/pino-elasticsearch
[elasticsearch]: https://www.elastic.co/products/elasticsearch
[kibana]: https://www.elastic.co/products/kibana

<a id="pino-gelf"></a>
### pino-gelf

Pino GELF ([pino-gelf]) is a transport for the Pino logger. Pino GELF receives Pino logs from stdin and transforms them into [GELF format][gelf] before sending them to a remote [Graylog server][graylog] via UDP.

```sh
$ node your-app.js | pino-gelf log
```

[pino-gelf]: https://github.com/pinojs/pino-gelf
[gelf]: https://docs.graylog.org/en/2.1/pages/gelf.html
[graylog]: https://www.graylog.org/

<a id="pino-http-send"></a>
### pino-http-send

[pino-http-send](https://npmjs.com/package/pino-http-send) is a configurable and low overhead
transport that will batch logs and send to a specified URL.

```console
$ node app.js | pino-http-send -u http://localhost:8080/logs
```

<a id="pino-kafka"></a>
### pino-kafka

[pino-kafka](https://github.com/ayZagen/pino-kafka) transport to send logs to [Apache Kafka](https://kafka.apache.org/).

```sh
$ node index.js | pino-kafka -b 10.10.10.5:9200 -d mytopic
```

<a id="pino-logdna"></a>
### pino-logdna

[pino-logdna](https://github.com/logdna/pino-logdna) transport to send logs to [LogDNA](https://logdna.com).

```sh
$ node index.js | pino-logdna --key YOUR_INGESTION_KEY
```

Tags and other metadata can be included using the available command line options. See the [pino-logdna readme](https://github.com/logdna/pino-logdna#options) for a full list.

<a id="pino-logflare"></a>
### pino-logflare

[pino-logflare](https://github.com/Logflare/pino-logflare) transport to send logs to a [Logflare](https://logflare.app) `source`.

```sh
$ node index.js | pino-logflare --key YOUR_KEY --source YOUR_SOURCE
```

<a id="pino-mq"></a>
### pino-mq

The `pino-mq` transport will take all messages received on `process.stdin` and send them over a message bus using JSON serialization.

This useful for:

* moving backpressure from application to broker
* transforming messages pressure to another component

```
node app.js | pino-mq -u "amqp://guest:guest@localhost/" -q "pino-logs"
```

Alternatively a configuration file can be used:

```
node app.js | pino-mq -c pino-mq.json
```

A base configuration file can be initialized with:

```
pino-mq -g
```

For full documentation of command line switches and configuration see [the `pino-mq` readme](https://github.com/itavy/pino-mq#readme)

<a id="pino-papertrail"></a>
### pino-papertrail
pino-papertrail is a transport that will forward logs to the [papertrail](https://papertrailapp.com) log service through an UDPv4 socket.

Given an application `foo` that logs via pino, and a papertrail destination that collects logs on port UDP `12345` on address `bar.papertrailapp.com`, you would use `pino-papertrail`
like so:

```
node yourapp.js | pino-papertrail --host bar.papertrailapp.com --port 12345 --appname foo
```


for full documentation of command line switches read [readme](https://github.com/ovhemert/pino-papertrail#readme)

<a id="pino-pg"></a>
### pino-pg
[pino-pg](https://www.npmjs.com/package/pino-pg) stores logs into PostgreSQL.
Full documentation in the [readme](https://github.com/Xstoudi/pino-pg).

<a id="pino-mysql"></a>
### pino-mysql

[pino-mysql][pino-mysql] loads pino logs into [MySQL][MySQL] and [MariaDB][MariaDB].

```sh
$ node app.js | pino-mysql -c db-configuration.json
```

`pino-mysql` can extract and save log fields into corresponding database field
and/or save the entire log stream as a [JSON Data Type][JSONDT].

For full documentation and command line switches read the [readme][pino-mysql].

[pino-mysql]: https://www.npmjs.com/package/pino-mysql
[MySQL]: https://www.mysql.com/
[MariaDB]: https://mariadb.org/
[JSONDT]: https://dev.mysql.com/doc/refman/8.0/en/json.html

<a id="pino-redis"></a>
### pino-redis

[pino-redis][pino-redis] loads pino logs into [Redis][Redis].

```sh
$ node app.js | pino-redis -U redis://username:password@localhost:6379
```

[pino-redis]: https://github.com/buianhthang/pino-redis
[Redis]: https://redis.io/

<a id="pino-sentry"></a>
### pino-sentry

[pino-sentry][pino-sentry] loads pino logs into [Sentry][Sentry].

```sh
$ node app.js | pino-sentry --dsn=https://******@sentry.io/12345
```

For full documentation of command line switches see the [pino-sentry readme](https://github.com/aandrewww/pino-sentry/blob/master/README.md)

[pino-sentry]: https://www.npmjs.com/package/pino-sentry
[Sentry]: https://sentry.io/


<a id="pino-seq"></a>
### pino-seq

[pino-seq][pino-seq] supports both out-of-process and in-process log forwarding to [Seq][Seq].

```sh
$ node app.js | pino-seq --serverUrl http://localhost:5341 --apiKey 1234567890 --property applicationName=MyNodeApp
```

[pino-seq]: https://www.npmjs.com/package/pino-seq
[Seq]: https://datalust.co/seq

<a id="pino-socket"></a>
### pino-socket

[pino-socket][pino-socket] is a transport that will forward logs to a IPv4
UDP or TCP socket.

As an example, use `socat` to fake a listener:

```sh
$ socat -v udp4-recvfrom:6000,fork exec:'/bin/cat'
```

Then run an application that uses `pino` for logging:

```sh
$ node app.js | pino-socket -p 6000
```

Logs from the application should be observed on both consoles.

[pino-socket]: https://www.npmjs.com/package/pino-socket

#### Logstash

The [pino-socket][pino-socket] module can also be used to upload logs to
[Logstash][logstash] via:

```
$ node app.js | pino-socket -a 127.0.0.1 -p 5000 -m tcp
```

Assuming logstash is running on the same host and configured as
follows:

```
input {
  tcp {
    port => 5000
  }
}

filter {
  json {
    source => "message"
  }
}

output {
  elasticsearch {
    hosts => "127.0.0.1:9200"
  }
}
```

See <https://www.elastic.co/guide/en/kibana/current/setup.html> to learn
how to setup [Kibana][kibana].

For Docker users, see
https://github.com/deviantony/docker-elk to setup an ELK stack.

<a id="pino-stackdriver"></a>
### pino-stackdriver
The [pino-stackdriver](https://www.npmjs.com/package/pino-stackdriver) module is a transport that will forward logs to the [Google Stackdriver](https://cloud.google.com/logging/) log service through it's API.

Given an application `foo` that logs via pino, a stackdriver log project `bar` and credentials in the file `/credentials.json`, you would use `pino-stackdriver`
like so:

``` sh
$ node foo | pino-stackdriver --project bar --credentials /credentials.json
```

For full documentation of command line switches read [readme](https://github.com/ovhemert/pino-stackdriver#readme)

<a id="pino-syslog"></a>
### pino-syslog

[pino-syslog][pino-syslog] is a transforming transport that converts
`pino` NDJSON logs to [RFC3164][rfc3164] compatible log messages. The `pino-syslog` module does not
forward the logs anywhere, it merely re-writes the messages to `stdout`. But
when used in combination with `pino-socket` the log messages can be relayed to a syslog server:

```sh
$ node app.js | pino-syslog | pino-socket -a syslog.example.com
```

Example output for the "hello world" log:

```
<134>Apr  1 16:44:58 MacBook-Pro-3 none[94473]: {"pid":94473,"hostname":"MacBook-Pro-3","level":30,"msg":"hello world","time":1459529098958}
```

[pino-syslog]: https://www.npmjs.com/package/pino-syslog
[rfc3164]: https://tools.ietf.org/html/rfc3164
[logstash]: https://www.elastic.co/products/logstash


<a id="pino-websocket"></a>
### pino-websocket

[pino-websocket](https://www.npmjs.com/package/@abeai/pino-websocket) is a transport that will forward each log line to a websocket server.

```sh
$ node app.js | pino-websocket -a my-websocket-server.example.com -p 3004
```

For full documentation of command line switches read the [README](https://github.com/abeai/pino-websocket#readme).
