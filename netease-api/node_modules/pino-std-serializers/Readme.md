# pino-std-serializers&nbsp;&nbsp;[![CI](https://github.com/pinojs/pino-std-serializers/workflows/CI/badge.svg)](https://github.com/pinojs/pino-std-serializers/actions?query=workflow%3ACI)

This module provides a set of standard object serializers for the
[Pino](https://getpino.io) logger.

## Serializers

### `exports.err(error)`
Serializes an `Error` like object. Returns an object:

```js
{
  type: 'string', // The name of the object's constructor.
  message: 'string', // The supplied error message.
  stack: 'string', // The stack when the error was generated.
  raw: Error  // Non-enumerable, i.e. will not be in the output, original
              // Error object. This is available for subsequent serializers
              // to use.
}
```

Any other extra properties, e.g. `statusCode`, that have been attached to the
object will also be present on the serialized object.

### `exports.mapHttpResponse(response)`
Used internally by Pino for general response logging. Returns an object:

```js
{
  res: {}
}
```

Where `res` is the `response` as serialized by the standard response serializer.

### `exports.mapHttpRequest(request)`
Used internall by Pino for general request logging. Returns an object:

```js
{
  req: {}
}
```

Where `req` is the `request` as serialized by the standard request serializer.

### `exports.req(request)`
The default `request` serializer. Returns and object:

```js
{
  id: 'string', // Defaults to `undefined`, unless there is an `id` property 
                // already attached to the `request` object or to the `request.info`
                // object. Attach a synchronous function
                // to the `request.id` that returns an identifier to have
                // the value filled.
  method: 'string',
  url: 'string', // the request pathname (as per req.url in core HTTP)
  headers: Object, // a reference to the `headers` object from the request
                   // (as per req.headers in core HTTP)
  remoteAddress: 'string',
  remotePort: Number,
  raw: Object // Non-enumerable, i.e. will not be in the output, original
              // request object. This is available for subsequent serializers
              // to use. In cases where the `request` input already has 
              // a `raw` property this will replace the original `request.raw`
              // property
}
```

### `exports.res(response)`
The default `response` serializer. Returns an object:

```js
{
  statusCode: Number,
  headers: Object, // The headers to be sent in the response.
  raw: Object // Non-enumerable, i.e. will not be in the output, original
              // response object. This is available for subsequent serializers
              // to use.
}
```

### `exports.wrapErrorSerializer(customSerializer)`
A utility method for wrapping the default error serializer. This allows
custom serializers to work with the already serialized object.

The `customSerializer` accepts one parameter — the newly serialized error
object — and returns the new (or updated) error object.

### `exports.wrapRequestSerializer(customSerializer)`
A utility method for wrapping the default request serializer. This allows
custom serializers to work with the already serialized object.

The `customSerializer` accepts one parameter — the newly serialized request
object — and returns the new (or updated) request object.

### `exports.wrapResponseSerializer(customSerializer)`
A utility method for wrapping the default response serializer. This allows
custom serializers to work with the already serialized object.

The `customSerializer` accepts one parameter — the newly serialized response
object — and returns the new (or updated) response object.

## License

MIT License
