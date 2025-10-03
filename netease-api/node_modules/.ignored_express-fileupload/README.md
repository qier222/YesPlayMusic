# express-fileupload
Simple express middleware for uploading files.

[![npm](https://img.shields.io/npm/v/express-fileupload.svg)](https://www.npmjs.org/package/express-fileupload)
[![downloads per month](http://img.shields.io/npm/dm/express-fileupload.svg)](https://www.npmjs.org/package/express-fileupload)
[![CircleCI](https://circleci.com/gh/richardgirges/express-fileupload/tree/master.svg?style=svg)](https://circleci.com/gh/richardgirges/express-fileupload/tree/master)
[![Coverage Status](https://img.shields.io/coveralls/richardgirges/express-fileupload.svg)](https://coveralls.io/r/richardgirges/express-fileupload)

# Help us Improve express-fileupload
This package is still very much supported and maintained. But the more help the better. If you're interested any of the following:
* Ticket and PR triage
* Feature scoping and implementation
* Maintenance (upgrading packages, fixing security vulnerabilities, etc)

...please contact richardgirges '-at-' gmail.com

# Install
```bash
# With NPM
npm i express-fileupload

# With Yarn
yarn add express-fileupload
```

# Usage
When you upload a file, the file will be accessible from `req.files`.

Example:
* You're uploading a file called **car.jpg**
* Your input's name field is **foo**: `<input name="foo" type="file" />`
* In your express server request, you can access your uploaded file from `req.files.foo`:
```javascript
app.post('/upload', function(req, res) {
  console.log(req.files.foo); // the uploaded file object
});
```

The **req.files.foo** object will contain the following:
* `req.files.foo.name`: "car.jpg"
* `req.files.foo.mv`: A function to move the file elsewhere on your server. Can take a callback or return a promise.
* `req.files.foo.mimetype`: The mimetype of your file
* `req.files.foo.data`: A buffer representation of your file, returns empty buffer in case useTempFiles option was set to true.
* `req.files.foo.tempFilePath`: A path to the temporary file in case useTempFiles option was set to true.
* `req.files.foo.truncated`: A boolean that represents if the file is over the size limit
* `req.files.foo.size`: Uploaded size in bytes
* `req.files.foo.md5`: MD5 checksum of the uploaded file

**Notes about breaking changes with MD5 handling:**

* Before 1.0.0, `md5` is an MD5 checksum of the uploaded file.
* From 1.0.0 until 1.1.1, `md5` is a function to compute an MD5 hash ([Read about it here.](https://github.com/richardgirges/express-fileupload/releases/tag/v1.0.0-alpha.1)).
* From 1.1.1 until 1.5.1, `md5` is reverted back to MD5 checksum value and also added full MD5 support in case you are using temporary files.
* From 1.5.1 onward, `md5` still holds the checksum value, but the checksum is generated with the provided `hashAlgorithm` option. The property name remains `md5` for backwards compatibility.


### Examples
* [Example Project](https://github.com/richardgirges/express-fileupload/tree/master/example)
* [Basic File Upload](https://github.com/richardgirges/express-fileupload/tree/master/example#basic-file-upload)
* [Multi-File Upload](https://github.com/richardgirges/express-fileupload/tree/master/example#multi-file-upload)

### Using Busboy Options
Pass in Busboy options directly to the express-fileupload middleware. [Check out the Busboy documentation here](https://github.com/mscdex/busboy#api).

```javascript
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
}));
```

### Using useTempFile Options
Use temp files instead of memory for managing the upload process.

```javascript
// Note that this option available for versions 1.0.0 and newer. 
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));
```

### Using debug option

You can set `debug` option to `true` to see some logging about upload process.
In this case middleware uses `console.log` and adds `Express-file-upload` prefix for outputs.
You can set a custom logger having `.log()` method to the `logger` option.

It will show you whether the request is invalid and also common events triggered during upload.
That can be really useful for troubleshooting and ***we recommend attaching debug output to each issue on Github***.

***Output example:***

```
Express-file-upload: Temporary file path is /node/express-fileupload/test/temp/tmp-16-1570084843942
Express-file-upload: New upload started testFile->car.png, bytes:0
Express-file-upload: Uploading testFile->car.png, bytes:21232...
Express-file-upload: Uploading testFile->car.png, bytes:86768...
Express-file-upload: Upload timeout testFile->car.png, bytes:86768
Express-file-upload: Cleaning up temporary file /node/express-fileupload/test/temp/tmp-16-1570084843942...
```

***Description:***

* `Temporary file path is...` says that `useTempfiles` was set to true and also shows you temp file name and path.
* `New upload started testFile->car.png` says that new upload started with field `testFile` and file name `car.png`.
* `Uploading testFile->car.png, bytes:21232...` shows current progress for each new data chunk.
* `Upload timeout` means that no data came during `uploadTimeout`.
* `Cleaning up temporary file` Here finaly we see cleaning up of the temporary file because of upload timeout reached.

### Available Options
Pass in non-Busboy options directly to the middleware. These are express-fileupload specific options.

Option | Acceptable&nbsp;Values | Details
--- | --- | ---
createParentPath | <ul><li><code>false</code>&nbsp;**(default)**</li><li><code>true</code></ul> | Automatically creates the directory path specified in `.mv(filePathName)`
uriDecodeFileNames | <ul><li><code>false</code>&nbsp;**(default)**</li><li><code>true</code></ul> | Applies uri decoding to file names if set true.
safeFileNames | <ul><li><code>false</code>&nbsp;**(default)**</li><li><code>true</code></li><li>regex</li></ul> | Strips characters from the upload's filename. You can use custom regex to determine what to strip. If set to `true`, non-alphanumeric characters _except_ dashes and underscores will be stripped. This option is off by default.<br /><br />**Example #1 (strip slashes from file names):** `app.use(fileUpload({ safeFileNames: /\\/g }))`<br />**Example #2:** `app.use(fileUpload({ safeFileNames: true }))`
preserveExtension | <ul><li><code>false</code>&nbsp;**(default)**</li><li><code>true</code></li><li><code>*Number*</code></li></ul> | Preserves filename extension when using <code>safeFileNames</code> option. If set to <code>true</code>, will default to an extension length of 3. If set to <code>*Number*</code>, this will be the max allowable extension length. If an extension is smaller than the extension length, it remains untouched. If the extension is longer, it is shifted.<br /><br />**Example #1 (true):**<br /><code>app.use(fileUpload({ safeFileNames: true, preserveExtension: true }));</code><br />*myFileName.ext* --> *myFileName.ext*<br /><br />**Example #2 (max extension length 2, extension shifted):**<br /><code>app.use(fileUpload({ safeFileNames: true, preserveExtension: 2 }));</code><br />*myFileName.ext* --> *myFileNamee.xt*
abortOnLimit | <ul><li><code>false</code>&nbsp;**(default)**</li><li><code>true</code></ul> | Returns a HTTP 413 when the file is bigger than the size limit if true. Otherwise, it will add a <code>truncated = true</code> to the resulting file structure.
responseOnLimit | <ul><li><code>'File size limit has been reached'</code>&nbsp;**(default)**</li><li><code>*String*</code></ul> | Response which will be send to client if file size limit exceeded when abortOnLimit set to true.
limitHandler | <ul><li><code>false</code>&nbsp;**(default)**</li><li><code>function(req, res, next)</code></li></ul> | User defined limit handler which will be invoked if the file is bigger than configured limits.
useTempFiles | <ul><li><code>false</code>&nbsp;**(default)**</li><li><code>true</code></ul> | By default this module uploads files into RAM. Setting this option to True turns on using temporary files instead of utilising RAM. This avoids memory overflow issues when uploading large files or in case of uploading lots of files at same time.
tempFileDir | <ul><li><code>String</code>&nbsp;**(path)**</li></ul> | Path to store temporary files.<br />Used along with the <code>useTempFiles</code> option. By default this module uses 'tmp' folder in the current working directory.<br />You can use trailing slash, but it is not necessary.
tempFilePermissions | <ul><li>644&nbsp;**(default)**</li><li><code>Integer</code></li></ul> | Permissions applied to temporary files.<br />Used along with the <code>useTempFiles</code> option. By default this module uses '644' permissions.<br />You should use this option if using shared hosting - to protect user data from being accessed by other users on the server.
parseNested | <ul><li><code>false</code>&nbsp;**(default)**</li><li><code>true</code></li></ul> | By default, req.body and req.files are flattened like this: <code>{'name': 'John', 'hobbies[0]': 'Cinema', 'hobbies[1]': 'Bike'}</code><br /><br/>When this option is enabled they are parsed in order to be nested like this: <code>{'name': 'John', 'hobbies': ['Cinema', 'Bike']}</code>
debug | <ul><li><code>false</code>&nbsp;**(default)**</li><li><code>true</code></ul> | Turn on/off upload process logging. Can be useful for troubleshooting.
logger | <ul><li><code>console</code>&nbsp;**(default)**</li><li><code>{log: function(msg: string)}</code></li></ul> | Customizable logger to write debug messages to. Console is default.
uploadTimeout | <ul><li><code>60000</code>&nbsp;**(default)**</li><li><code>Integer</code></ul> | This defines how long to wait for data before aborting. Set to 0 if you want to turn off timeout checks.
hashAlgorithm | <ul><li><code>md5</code>&nbsp;**(default)**</li><li><code>String</code></li></ul> | Allows the usage of alternative hashing algorithms for file integrity checks. This option must be an algorithm that is supported on the running system's installed OpenSSL version. On recent releases of OpenSSL, <code>openssl list -digest-algorithms</code> will display the available digest algorithms.

# Help Wanted
Looking for additional maintainers. Please contact `richardgirges [ at ] gmail.com` if you're interested. Pull Requests are welcome! 

# Thanks & Credit
[Brian White](https://github.com/mscdex) for his stellar work on the [Busboy Package](https://github.com/mscdex/busboy) and the [connect-busboy Package](https://github.com/mscdex/connect-busboy)
