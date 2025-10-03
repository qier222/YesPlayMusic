# Pino Ecosystem

This is a list of ecosystem modules that integrate with `pino`.

Modules listed under [Core](#core) are maintained by the Pino team. Modules
listed under [Community](#community) are maintained by independent community
members.

Please send a PR to add new modules!

<a id="core"></a>
## Core

+ [`express-pino-logger`](https://github.com/pinojs/express-pino-logger): use
Pino to log requests within [express](https://expressjs.com/).
+ [`koa-pino-logger`](https://github.com/pinojs/koa-pino-logger): use Pino to
log requests within [Koa](https://koajs.com/).
+ [`pino-arborsculpture`](https://github.com/pinojs/pino-arborsculpture): change
log levels at runtime.
+ [`pino-caller`](https://github.com/pinojs/pino-caller): add callsite to the log line.
+ [`pino-clf`](https://github.com/pinojs/pino-clf): reformat Pino logs into
Common Log Format.
+ [`pino-debug`](https://github.com/pinojs/pino-debug): use Pino to interpret
[`debug`](https://npm.im/debug) logs.
+ [`pino-elasticsearch`](https://github.com/pinojs/pino-elasticsearch): send
Pino logs to an Elasticsearch instance.
+ [`pino-eventhub`](https://github.com/pinojs/pino-eventhub): send Pino logs
to an [Event Hub](https://docs.microsoft.com/en-us/azure/event-hubs/event-hubs-what-is-event-hubs).
+ [`pino-filter`](https://github.com/pinojs/pino-filter): filter Pino logs in
the same fashion as the [`debug`](https://npm.im/debug) module.
+ [`pino-gelf`](https://github.com/pinojs/pino-gelf): reformat Pino logs into
GELF format for Graylog.
+ [`pino-hapi`](https://github.com/pinojs/hapi-pino): use Pino as the logger
for [Hapi](https://hapijs.com/).
+ [`pino-http`](https://github.com/pinojs/pino-http): easily use Pino to log
requests with the core `http` module.
+ [`pino-http-print`](https://github.com/pinojs/pino-http-print): reformat Pino
logs into traditional [HTTPD](https://httpd.apache.org/) style request logs.
+ [`pino-multi-stream`](https://github.com/pinojs/pino-multi-stream): send
logs to multiple destination streams (slow!).
+ [`pino-mongodb`](https://github.com/pinojs/pino-mongodb): store Pino logs
in a MongoDB database.
+ [`pino-noir`](https://github.com/pinojs/pino-noir): redact sensitive information
in logs.
+ [`pino-pretty`](https://github.com/pinojs/pino-pretty): basic prettifier to
make log lines human readable.
+ [`pino-socket`](https://github.com/pinojs/pino-socket): send logs to TCP or UDP
destinations.
+ [`pino-std-serializers`](https://github.com/pinojs/pino-std-serializers): the
core object serializers used within Pino.
+ [`pino-syslog`](https://github.com/pinojs/pino-syslog): reformat Pino logs
to standard syslog format.
+ [`pino-tee`](https://github.com/pinojs/pino-tee): pipe Pino logs into files
based upon log levels.
+ [`pino-toke`](https://github.com/pinojs/pino-toke): reformat Pino logs
according to a given format string.
+ [`restify-pino-logger`](https://github.com/pinojs/restify-pino-logger): use
Pino to log requests within [restify](http://restify.com/).
+ [`rill-pino-logger`](https://github.com/pinojs/rill-pino-logger): use Pino as
the logger for the [Rill framework](https://rill.site/).

<a id="community"></a>
## Community

+ [`pino-colada`](https://github.com/lrlna/pino-colada): cute ndjson formatter for pino.
+ [`pino-fluentd`](https://github.com/davidedantonio/pino-fluentd): send Pino logs to Elasticsearch, 
MongoDB and many [others](https://www.fluentd.org/dataoutputs) via Fluentd.
+ [`pino-pretty-min`](https://github.com/unjello/pino-pretty-min): a minimal
prettifier inspired by the [logrus](https://github.com/sirupsen/logrus) logger.
+ [`pino-rotating-file`](https://github.com/homeaway/pino-rotating-file): a hapi-pino log transport for splitting logs into separate, automatically rotating files.
+ [`cls-proxify`](https://github.com/keenondrums/cls-proxify): integration of pino and [CLS](https://github.com/jeff-lewis/cls-hooked). Useful for creating dynamically configured child loggers (e.g. with added trace ID) for each request. 
+ [`pino-tiny`](https://github.com/holmok/pino-tiny): a tiny (and exentsible?) little log formatter for pino.
+ [`pino-dev`](https://github.com/dnjstrom/pino-dev): simple prettifier for pino with built-in support for common ecosystem packages.
