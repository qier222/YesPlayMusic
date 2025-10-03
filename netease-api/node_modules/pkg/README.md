**Disclaimer: `pkg` was created for use within containers and is not intended for use in serverless environments. For those using Vercel, this means that there is no requirement to use `pkg` in your projects as the benefits it provides are not applicable to the platform.**

![](https://res.cloudinary.com/zeit-inc/image/upload/v1509936789/repositories/pkg/pkg-repo-banner-new.png)

[![Build Status](https://github.com/vercel/pkg/actions/workflows/ci.yml/badge.svg)](https://github.com/vercel/pkg/actions/workflows/ci.yml)

This command line interface enables you to package your Node.js project into an executable that can be run even on devices without Node.js installed.

## Use Cases

- Make a commercial version of your application without sources
- Make a demo/evaluation/trial version of your app without sources
- Instantly make executables for other platforms (cross-compilation)
- Make some kind of self-extracting archive or installer
- No need to install Node.js and npm to run the packaged application
- No need to download hundreds of files via `npm install` to deploy
  your application. Deploy it as a single file
- Put your assets inside the executable to make it even more portable
- Test your app against new Node.js version without installing it

## Usage

```sh
npm install -g pkg
```

After installing it, run `pkg --help` without arguments to see list of options:

```console
pkg [options] <input>

  Options:

    -h, --help           output usage information
    -v, --version        output pkg version
    -t, --targets        comma-separated list of targets (see examples)
    -c, --config         package.json or any json file with top-level config
    --options            bake v8 options into executable to run with them on
    -o, --output         output file name or template for several files
    --out-path           path to save output one or more executables
    -d, --debug          show more information during packaging process [off]
    -b, --build          don't download prebuilt base binaries, build them
    --public             speed up and disclose the sources of top-level project
    --public-packages    force specified packages to be considered public
    --no-bytecode        skip bytecode generation and include source files as plain js
    --no-native-build    skip native addons build
    --no-dict            comma-separated list of packages names to ignore dictionaries. Use --no-dict * to disable all dictionaries
    -C, --compress       [default=None] compression algorithm = Brotli or GZip

  Examples:

  – Makes executables for Linux, macOS and Windows
    $ pkg index.js
  – Takes package.json from cwd and follows 'bin' entry
    $ pkg .
  – Makes executable for particular target machine
    $ pkg -t node14-win-arm64 index.js
  – Makes executables for target machines of your choice
    $ pkg -t node12-linux,node14-linux,node14-win index.js
  – Bakes '--expose-gc' and '--max-heap-size=34' into executable
    $ pkg --options "expose-gc,max-heap-size=34" index.js
  – Consider packageA and packageB to be public
    $ pkg --public-packages "packageA,packageB" index.js
  – Consider all packages to be public
    $ pkg --public-packages "*" index.js
  – Bakes '--expose-gc' into executable
    $ pkg --options expose-gc index.js
  – reduce size of the data packed inside the executable with GZip
    $ pkg --compress GZip index.js
```

The entrypoint of your project is a mandatory CLI argument. It may be:

- Path to entry file. Suppose it is `/path/app.js`, then
  packaged app will work the same way as `node /path/app.js`
- Path to `package.json`. `Pkg` will follow `bin` property of
  the specified `package.json` and use it as entry file.
- Path to directory. `Pkg` will look for `package.json` in
  the specified directory. See above.

### Targets

`pkg` can generate executables for several target machines at a
time. You can specify a comma-separated list of targets via `--targets`
option. A canonical target consists of 3 elements, separated by
dashes, for example `node12-macos-x64` or `node14-linux-arm64`:

- **nodeRange** (node8), node10, node12, node14, node16 or latest
- **platform** alpine, linux, linuxstatic, win, macos, (freebsd)
- **arch** x64, arm64, (armv6, armv7)

(element) is unsupported, but you may try to compile yourself.

You may omit any element (and specify just `node14` for example).
The omitted elements will be taken from current platform or
system-wide Node.js installation (its version and arch).
There is also an alias `host`, that means that all 3 elements
are taken from current platform/Node.js. By default targets are
`linux,macos,win` for current Node.js version and arch.

If you want to generate executable for different architectures,
note that by default `pkg` has to run the executable of the
**target** arch to generate bytecodes:

- Linux: configure binfmt with [QEMU](https://wiki.debian.org/QemuUserEmulation).
- macOS: possible to build `x64` on `arm64` with `Rosetta 2` but not opposite.
- Windows: possible to build `x64` on `arm64` with `x64 emulation` but not opposite.
- or, disable bytecode generation with `--no-bytecode --public-packages "*" --public`.

`macos-arm64` is experimental. Be careful about the [mandatory code signing requirement](https://developer.apple.com/documentation/macos-release-notes/macos-big-sur-11_0_1-universal-apps-release-notes).
The final executable has to be signed (ad-hoc signature is sufficient) with `codesign`
utility of macOS (or `ldid` utility on Linux). Otherwise, the executable will be killed
by kernel and the end-user has no way to permit it to run at all. `pkg` tries to ad-hoc
sign the final executable. If necessary, you can replace this signature with your own
trusted Apple Developer ID.

To be able to generate executables for all supported architectures and platforms, run
`pkg` on a Linux host with binfmt (`QEMU` emulation) configured and `ldid` installed.

### Config

During packaging process `pkg` parses your sources, detects
calls to `require`, traverses the dependencies of your project
and includes them into executable. In most cases you
don't need to specify anything manually.

However your code may have `require(variable)` calls (so called non-literal
argument to `require`) or use non-javascript files (for
example views, css, images etc).

```js
require('./build/' + cmd + '.js');
path.join(__dirname, 'views/' + viewName);
```

Such cases are not handled by `pkg`. So you must specify the
files - scripts and assets - manually in `pkg` property of
your `package.json` file.

```json
  "pkg": {
    "scripts": "build/**/*.js",
    "assets": "views/**/*",
    "targets": [ "node14-linux-arm64" ],
    "outputPath": "dist"
  }
```

The above example will include everything in `assets/` and
every .js file in `build/`, build only for `node14-linux-arm64`,
and place the executable inside `dist/`.

You may also specify arrays of globs:

```
    "assets": [ "assets/**/*", "images/**/*" ]
```

Just be sure to call `pkg package.json` or `pkg .` to make
use of `package.json` configuration.

### Scripts

`scripts` is a [glob](https://github.com/sindresorhus/globby)
or list of globs. Files specified as `scripts` will be compiled
using `v8::ScriptCompiler` and placed into executable without
sources. They must conform to the JS standards of those Node.js versions
you target (see [Targets](#targets)), i.e. be already transpiled.

### Assets

`assets` is a [glob](https://github.com/sindresorhus/globby)
or list of globs. Files specified as `assets` will be packaged
into executable as raw content without modifications. Javascript
files may also be specified as `assets`. Their sources will
not be stripped as it improves execution performance of the
files and simplifies debugging.

See also
[Detecting assets in source code](#detecting-assets-in-source-code) and
[Snapshot filesystem](#snapshot-filesystem).

### Options

Node.js application can be called with runtime options
(belonging to Node.js or V8). To list them type `node --help` or `node --v8-options`.

You can "bake" these runtime options into packaged application. The app will always run with the options
turned on. Just remove `--` from option name.

You can specify multiple options by joining them in a single string, comma (`,`) separated:

```sh
pkg app.js --options expose-gc
pkg app.js --options max_old_space_size=4096
pkg app.js --options max-old-space-size=1024,tls-min-v1.0,expose-gc
```

### Output

You may specify `--output` if you create only one executable
or `--out-path` to place executables for multiple targets.

### Debug

Pass `--debug` to `pkg` to get a log of packaging process.
If you have issues with some particular file (seems not packaged
into executable), it may be useful to look through the log.

### Bytecode (reproducibility)

By default, your source code is precompiled to v8 bytecode before being written
to the output file. To disable this feature, pass `--no-bytecode` to `pkg`.

#### Why would you want to do this?

If you need a reproducible build
process where your executable hashes (e.g. md5, sha1, sha256, etc.) are the
same value between builds. Because compiling bytecode is not deterministic
(see [here](https://ui.adsabs.harvard.edu/abs/2019arXiv191003478C/abstract) or
[here](https://medium.com/dailyjs/understanding-v8s-bytecode-317d46c94775)) it
results in executables with differing hashed values. Disabling bytecode
compilation allows a given input to always have the same output.

#### Why would you NOT want to do this?

While compiling to bytecode does not make your source code 100% secure, it does
add a small layer of security/privacy/obscurity to your source code. Turning
off bytecode compilation causes the raw source code to be written directly to
the executable file. If you're on \*nix machine and would like an example, run
`pkg` with the `--no-bytecode` flag, and use the GNU strings tool on the
output. You then should be able to grep your source code.

#### Other considerations

Specifying `--no-bytecode` will fail if there are any packages in your project that aren't explicitly marked
as public by the `license` in their `package.json`.
By default, `pkg` will check the license of each package and make sure that stuff that isn't meant for the public will
only be included as bytecode.

If you do require building pkg binaries for other architectures and/or depend on a package with a broken
`license` in its `package.json`, you can override this behaviour by either explicitly whitelisting packages to be public
using `--public-packages "packageA,packageB"` or setting all packages to public using `--public-packages "*"`

### Build

`pkg` has so called "base binaries" - they are actually same
`node` executables but with some patches applied. They are
used as a base for every executable `pkg` creates. `pkg`
downloads precompiled base binaries before packaging your
application. If you prefer to compile base binaries from
source instead of downloading them, you may pass `--build`
option to `pkg`. First ensure your computer meets the
requirements to compile original Node.js:
[BUILDING.md](https://github.com/nodejs/node/blob/HEAD/BUILDING.md)

See [pkg-fetch](https://github.com/vercel/pkg-fetch) for more info.

### Compression

Pass `--compress Brotli` or `--compress GZip` to `pkg` to compress further the content of the files store in the exectable.

This option can reduce the size of the embedded file system by up to 60%.

The startup time of the application might be reduced slightly.

`-C` can be used as a shortcut for `--compress `.

### Environment

| Var            | Description                                                                               |
| -------------- | ----------------------------------------------------------------------------------------- |
| PKG_CACHE_PATH | Used to specify a custom path for node binaries cache folder. Default is `~/.pkg-cache`   |
| PKG_IGNORE_TAG | Allows to ignore additional folder created on `PKG_CACHE_PATH` matching pkg-fetch version |
| MAKE_JOB_COUNT | Allow configuring number of processes used for compiling                                  |

Examples

```bash
# 1 - Using export
export PKG_CACHE_PATH=/my/cache
pkg app.js

# 2 - Passing it before the script
PKG_CACHE_PATH=/my/cache pkg app.js
```

## Usage of packaged app

Command line call to packaged app `./app a b` is equivalent
to `node app.js a b`

## Snapshot filesystem

During packaging process `pkg` collects project files and places
them into executable. It is called a snapshot. At run time the
packaged application has access to snapshot filesystem where all
that files reside.

Packaged files have `/snapshot/` prefix in their paths (or
`C:\snapshot\` in Windows). If you used `pkg /path/app.js` command line,
then `__filename` value will be likely `/snapshot/path/app.js`
at run time. `__dirname` will be `/snapshot/path` as well. Here is
the comparison table of path-related values:

| value                         | with `node`     | packaged                 | comments                       |
| ----------------------------- | --------------- | ------------------------ | ------------------------------ |
| \_\_filename                  | /project/app.js | /snapshot/project/app.js |
| \_\_dirname                   | /project        | /snapshot/project        |
| process.cwd()                 | /project        | /deploy                  | suppose the app is called ...  |
| process.execPath              | /usr/bin/nodejs | /deploy/app-x64          | `app-x64` and run in `/deploy` |
| process.argv[0]               | /usr/bin/nodejs | /deploy/app-x64          |
| process.argv[1]               | /project/app.js | /snapshot/project/app.js |
| process.pkg.entrypoint        | undefined       | /snapshot/project/app.js |
| process.pkg.defaultEntrypoint | undefined       | /snapshot/project/app.js |
| require.main.filename         | /project/app.js | /snapshot/project/app.js |

Hence, in order to make use of a file collected at packaging
time (`require` a javascript file or serve an asset) you should
take `__filename`, `__dirname`, `process.pkg.defaultEntrypoint`
or `require.main.filename` as a base for your path calculations.
For javascript files you can just `require` or `require.resolve`
because they use current `__dirname` by default. For assets use
`path.join(__dirname, '../path/to/asset')`. Learn more about
`path.join` in
[Detecting assets in source code](#detecting-assets-in-source-code).

On the other hand, in order to access real file system at run time
(pick up a user's external javascript plugin, json configuration or
even get a list of user's directory) you should take `process.cwd()`
or `path.dirname(process.execPath)`.

## Detecting assets in source code

When `pkg` encounters `path.join(__dirname, '../path/to/asset')`,
it automatically packages the file specified as an asset. See
[Assets](#assets). Pay attention that `path.join` must have two
arguments and the last one must be a string literal.

This way you may even avoid creating `pkg` config for your project.

## Native addons

Native addons (`.node` files) use is supported. When `pkg` encounters
a `.node` file in a `require` call, it will package this like an asset.
In some cases (like with the `bindings` package), the module path is generated
dynamicaly and `pkg` won't be able to detect it. In this case, you should
add the `.node` file directly in the `assets` field in `package.json`.

The way Node.js requires native addon is different from a classic JS
file. It needs to have a file on disk to load it, but `pkg` only generates
one file. To circumvent this, `pkg` will create a temporary file on the
disk. These files will stay on the disk after the process has exited
and will be used again on the next process launch.

When a package, that contains a native module, is being installed,
the native module is compiled against current system-wide Node.js
version. Then, when you compile your project with `pkg`, pay attention
to `--target` option. You should specify the same Node.js version
as your system-wide Node.js to make compiled executable compatible
with `.node` files.

Note that fully static Node binaries are not capable of loading native
bindings, so you may not use Node bindings with `linuxstatic`.

## API

`const { exec } = require('pkg')`

`exec(args)` takes an array of command line arguments and returns
a promise. For example:

```js
await exec(['app.js', '--target', 'host', '--output', 'app.exe']);
// do something with app.exe, run, test, upload, deploy, etc
```

## Troubleshooting

### Error: ENOENT: no such file or directory, uv_chdir

This error can be caused by deleting the directory the application is
run from. Or, generally, deleting `process.cwd()` directory when the
application is running.

### Error: ERR_INSPECTOR_NOT_AVAILABLE

This error can be caused by using `NODE_OPTIONS` variable to force to
run `node` with the debug mode enabled. Debugging options are disallowed
, as **pkg** executables are usually used for production environments.
If you do need to use inspector, you can [build a debuggable Node.js](https://github.com/vercel/pkg/issues/93#issuecomment-301210543) yourself.

### Error: require(...).internalModuleStat is not a function

This error can be caused by using `NODE_OPTIONS` variable with some
bootstrap or `node` options causing conflicts with **pkg**. Some
IDEs, such as **VS Code**, may add this env variable automatically.

You could check on **Unix systems** (Linux/macOS) in `bash`:

```bash
$ printenv | grep NODE
```

## Advanced

### exploring virtual file system embedded in debug mode

When you are using the `--debug` flag when building your executable,
`pkg` add the ability to display the content of the virtual file system
and the symlink table on the console, when the application starts,
providing that the environement variable DEBUG_PKG is set.
This feature can be useful to inspect if symlinks are correctly handled,
and check that all the required files for your application are properly
incorporated to the final executable.

    $ pkg --debug app.js -o output
    $ DEBUG_PKG=1 output

or

    C:\> pkg --debug app.js -o output.exe
    C:\> set DEBUG_PKG=1
    C:\> output.exe

Note: make sure not to use --debug flag in production.
