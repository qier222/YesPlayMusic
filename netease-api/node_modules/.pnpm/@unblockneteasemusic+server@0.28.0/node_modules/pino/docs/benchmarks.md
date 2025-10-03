# Benchmarks

The following values show the time spent to call each function 100000 times. 

`pino.info('hello world')`:

```
BASIC benchmark averages
Bunyan average: 662.904ms
Winston average: 564.752ms
Bole average: 301.894ms
Debug average: 361.052ms
LogLevel average: 330.394ms
Pino average: 246.336ms
PinoAsync average: 129.507ms
PinoNodeStream average: 276.479ms
```

`pino.info({'hello': 'world'})`:

```
OBJECT benchmark averages
BunyanObj average: 678.477ms
WinstonObj average: 563.154ms
BoleObj average: 364.748ms
LogLevelObject average: 627.196ms
PinoObj average: 237.543ms
PinoAsyncObj average: 125.532ms
PinoNodeStreamObj average: 310.614ms
```

`pino.info(aBigDeeplyNestedObject)`:

```
DEEPOBJECT benchmark averages
BunyanDeepObj average: 1838.970ms
WinstonDeepObj average: 3173.947ms
BoleDeepObj average: 2888.894ms
LogLevelDeepObj average: 7426.592ms
PinoDeepObj average: 3074.177ms
PinoAsyncDeepObj average: 2987.925ms
PinoNodeStreamDeepObj average: 3459.883ms
```

`pino.info('hello %s %j %d', 'world', {obj: true}, 4, {another: 'obj'})`:

```
BunyanInterpolateExtra average: 971.019ms
WinstonInterpolateExtra average: 535.009ms
BoleInterpolateExtra average: 575.668ms
PinoInterpolateExtra average: 332.099ms
PinoAsyncInterpolateExtra average: 209.552ms
PinoNodeStreamInterpolateExtra average: 413.195ms
```

For a fair comparison, [LogLevel](https://npm.im/loglevel) was extended
to include a timestamp and [bole](https://npm.im/bole) had
`fastTime` mode switched on.
