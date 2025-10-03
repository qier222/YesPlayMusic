![Node.js CI](https://github.com/Borewit/music-metadata/workflows/Node.js%20CI/badge.svg)
[![Build status](https://ci.appveyor.com/api/projects/status/tgtqynlon8t99qq5/branch/commonjs?svg=true)](https://ci.appveyor.com/project/Borewit/music-metadata/branch/commonjs)
[![NPM version](https://img.shields.io/npm/v/music-metadata.svg)](https://npmjs.org/package/music-metadata)
[![npm downloads](http://img.shields.io/npm/dm/music-metadata.svg)](https://npmcharts.com/compare/music-metadata,jsmediatags,musicmetadata,node-id3,mp3-parser,id3-parser,wav-file-info?start=600)
[![Coverage Status](https://coveralls.io/repos/github/Borewit/music-metadata/badge.svg?branch=commonjs)](https://coveralls.io/github/Borewit/music-metadata?branch=commonjs)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/57d731b05c9e41889a2a17cb4b0384d7)](https://app.codacy.com/app/Borewit/music-metadata?utm_source=github.com&utm_medium=referral&utm_content=Borewit/music-metadata&utm_campaign=Badge_Grade_Dashboard)
[![CodeQL](https://github.com/Borewit/music-metadata/actions/workflows/codeql-analysis.yml/badge.svg?branch=commonjs)](https://github.com/Borewit/music-metadata/actions/workflows/codeql-analysis.yml)
[![DeepScan grade](https://deepscan.io/api/teams/5165/projects/6938/branches/61821/badge/grade.svg)](https://deepscan.io/dashboard#view=project&tid=5165&pid=6938&bid=61821)
[![Known Vulnerabilities](https://snyk.io/test/github/Borewit/music-metadata/badge.svg?targetFile=package.json)](https://snyk.io/test/github/Borewit/music-metadata?targetFile=package.json)
[![Discord](https://img.shields.io/discord/460524735235883049.svg)](https://discord.gg/KyBr6sb)

# music-metadata

Stream and file based music metadata parser for [node.js](https://nodejs.org/).
Supports any common audio and tagging format.
[TypeScript](https://www.typescriptlang.org/) definitions are included.

## Features

### Support for audio file types

| Audio format  | Description                     | Wiki                                                               |                                                                                                                                               |
| ------------- |---------------------------------| -------------------------------------------------------------------|:---------------------------------------------------------------------------------------------------------------------------------------------:|
| AIFF / AIFF-C | Audio Interchange File Format   | [:link:](https://wikipedia.org/wiki/Audio_Interchange_File_Format) | <img src="https://upload.wikimedia.org/wikipedia/commons/8/84/Apple_Computer_Logo_rainbow.svg" width="40" alt="Apple rainbow logo">           |
| AAC           | ADTS / Advanced Audio Coding    | [:link:](https://en.wikipedia.org/wiki/Advanced_Audio_Coding)      | <img src="https://svgshare.com/i/UT8.svg" width="40" alt="AAC logo">                                                                          |
| APE           | Monkey's Audio                  | [:link:](https://wikipedia.org/wiki/Monkey's_Audio)                | <img src="https://foreverhits.files.wordpress.com/2015/05/ape_audio.jpg" width="40" alt="Monkey's Audio logo">                                |
| ASF           | Advanced Systems Format         | [:link:](https://wikipedia.org/wiki/Advanced_Systems_Format)       |                                                                                                                                               |
| BWF           | Broadcast Wave Format           | [:link:](https://en.wikipedia.org/wiki/Broadcast_Wave_Format)      |                                                                                                                                               |  
| DSDIFF        | Philips DSDIFF                  | [:link:](https://wikipedia.org/wiki/Direct_Stream_Digital)         | <img src="https://upload.wikimedia.org/wikipedia/commons/b/bc/DSDlogo.svg" width="80" alt="DSD logo">                                         |
| DSF           | Sony's DSD Stream File          | [:link:](https://wikipedia.org/wiki/Direct_Stream_Digital)         | <img src="https://upload.wikimedia.org/wikipedia/commons/b/bc/DSDlogo.svg" width="80" alt="DSD logo">                                         |
| FLAC          | Free Lossless Audio Codec       | [:link:](https://wikipedia.org/wiki/FLAC)                          | <img src="https://upload.wikimedia.org/wikipedia/commons/a/a2/FLAC_logo_vector.svg" width="80" alt="FLAC logo">                               |
| MP2           | MPEG-1 Audio Layer II           | [:link:](https://wikipedia.org/wiki/MPEG-1_Audio_Layer_II)         |                                                                                                                                               |
| Matroska      | Matroska (EBML), mka, mkv       | [:link:](https://wikipedia.org/wiki/Matroska)                      | <img src="https://upload.wikimedia.org/wikipedia/commons/1/1a/Matroska_2010.svg" width="80" alt="Matroska logo">                              |                                                                                      
| MP3           | MPEG-1 / MPEG-2 Audio Layer III | [:link:](https://wikipedia.org/wiki/MP3)                           | <img src="https://upload.wikimedia.org/wikipedia/commons/e/ea/Mp3.svg" width="80" alt="MP3 logo">                                             |
| MPC           | Musepack SV7                    | [:link:](https://wikipedia.org/wiki/Musepack)                      | <img src="https://www.musepack.net/pictures/musepack_logo.png" width="80" alt="musepack logo">                                                |
| MPEG 4        | mp4, m4a, m4v                   | [:link:](https://wikipedia.org/wiki/MPEG-4)                        | <img src="https://svgshare.com/i/UU3.svg" width="80" alt="mpeg 4 logo">                                                                       |
| Ogg           | Open container format           | [:link:](https://en.wikipedia.org/wiki/Ogg)                        | <img src="https://upload.wikimedia.org/wikipedia/commons/a/a1/Ogg_Logo.svg" width="80" alt="Ogg logo">                                        |
| Opus          |                                 | [:link:](https://wikipedia.org/wiki/Opus_(audio_format))           | <img src="https://upload.wikimedia.org/wikipedia/commons/0/02/Opus_logo2.svg" width="80" alt="Opus logo">                                     |
| Speex         |                                 | [:link:](https://wikipedia.org/wiki/Speex)                         | <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/Speex_logo_2006.svg" width="80" alt="Speex logo">                               |
| Theora        |                                 | [:link:](https://en.wikipedia.org/wiki/Theora)                     | <img src="https://upload.wikimedia.org/wikipedia/commons/5/57/Theora_logo_2007.svg" width="70" alt="Theora logo">                             |
| Vorbis        | Vorbis audio compression        | [:link:](https://wikipedia.org/wiki/Ogg_Vorbis)                    | <img src="https://upload.wikimedia.org/wikipedia/commons/8/8d/Xiph.Org_logo_square.svg" width="70" alt="Vorbis logo">                         |
| WAV           | RIFF WAVE                       | [:link:](https://wikipedia.org/wiki/WAV)                           |                                                                                                                                               |
| WebM          | webm                            | [:link:](https://wikipedia.org/wiki/WebM)                          | <img src="https://upload.wikimedia.org/wikipedia/commons/3/34/WebM_logo.svg" width="80" alt="Matroska logo">                                  |                                                                                      
| WV            | WavPack                         | [:link:](https://wikipedia.org/wiki/WavPack)                       | <img src="http://www.wavpack.com/wavpacklogo.svg" width="60" alt="WavPack logo">                                                              |
| WMA           | Windows Media Audio             | [:link:](https://wikipedia.org/wiki/Windows_Media_Audio)           | <img src="https://upload.wikimedia.org/wikipedia/commons/7/76/Windows_Media_Player_simplified_logo.svg" width="40" alt="Windows Media logo">  |

### Supported tag headers

Following tag header formats are supported:
*   [APE](https://wikipedia.org/wiki/APE_tag)
*   [ASF](https://wikipedia.org/wiki/Advanced_Systems_Format)
*   EXIF 2.3
*   [ID3](https://wikipedia.org/wiki/ID3): ID3v1, ID3v1.1, ID3v2.2, [ID3v2.3](http://id3.org/id3v2.3.0) & [ID3v2.4](http://id3.org/id3v2.4.0-frames)
*   [iTunes](https://github.com/sergiomb2/libmp4v2/wiki/iTunesMetadata)
*   [RIFF](https://wikipedia.org/wiki/Resource_Interchange_File_Format)/INFO
*   [Vorbis comment](https://wikipedia.org/wiki/Vorbis_comment)
*   [AIFF](https://wikipedia.org/wiki/Audio_Interchange_File_Format)

It allows many tags to be accessed in audio format, and tag format independent way.

Support for [MusicBrainz](https://musicbrainz.org/) tags as written by [Picard](https://picard.musicbrainz.org/).
[ReplayGain](https://wiki.hydrogenaud.io/index.php?title=ReplayGain) tags are supported.

### Audio format & encoding details

Support for encoding / format details:
*   [Bit rate](https://wikipedia.org/wiki/Bit_rate)
*   [Audio bit depth](https://wikipedia.org/wiki/Audio_bit_depth)
*   Duration
*   Encoding profile (e.g. [CBR](https://en.wikipedia.org/wiki/Constant_bitrate), V0, V2)
  

## Online demo's
*   [<img src="https://raw.githubusercontent.com/Borewit/audio-tag-analyzer/master/src/assets/icon/audio-tag-analyzer.svg" width="40">Audio Tag Analyzer](https://audio-tag-analyzer.netlify.com/)
*   [<img src="https://cdn.sanity.io/images/3do82whm/next/ba8c847f13a5fa39d88f8bc9b7846b7886531b18-2500x2500.svg" width="40"> Webamp](https://webamp.org/)


## Compatibility

The JavaScript in runtime is compliant with [ECMAScript 2017 (ES8)](https://en.wikipedia.org/wiki/ECMAScript#8th_Edition_-_ECMAScript_2017).
Requires [Node.js®](https://nodejs.org/) version 6 or higher.

### Browser Support

Although music-metadata is designed to run the node.js. [music-metadata-browser](https://github.com/Borewit/music-metadata-browser) can be used on the browser side. 

To avoid Node `fs` dependency inclusion, you may use a sub-module inclusion:
```js
import * as mm from 'music-metadata/lib/core';
```

| function                                             | `music-metadata`           | `music-metadata/lib/core`  |
|------------------------------------------------------| ---------------------------|----------------------------|
| [`parseBuffer`](#parsebuffer-function)               | ✓                          | ✓                          |
| [`parseStream`](#parsestream-function) *             | ✓                          | ✓                          |
| [`parseFromTokenizer`](#parsefromtokenizer-function) | ✓                          | ✓                          |
| [`parseFile`](#parsefile-function)                   | ✓                          |                            |

### Sponsor
[Become a sponsor to Borewit](https://github.com/sponsors/Borewit)

## Usage

### Installation
Install using [npm](http://npmjs.org/):

```bash
npm install music-metadata
```
or using [yarn](https://yarnpkg.com/):
```bash
yarn add music-metadata
```

### Import music-metadata

Import music-metadata in JavaScript:
```JavaScript
const mm = require('music-metadata');
```

This is how it's done in TypeScript:
```ts
import * as mm from 'music-metadata';
```

### Module Functions

There are two ways to parse (read) audio tracks:
1) Audio (music) files can be parsed using direct file access using the [parseFile function](#parsefile)
2) Using [Node.js streams](https://nodejs.org/api/stream.html) using the [parseStream function](#parseStream).

Direct file access tends to be a little faster, because it can 'jump' to various parts in the file without being obliged to read intermediate data.

#### parseFile function

Parses the specified file (`filePath`) and returns a promise with the metadata result (`IAudioMetadata`).

```
parseFile(filePath: string, opts: IOptions = {}): Promise<IAudioMetadata>`
```

Example:
```js
const mm = require('music-metadata');
const util = require('util');

(async () => {
  try {
    const metadata = await mm.parseFile('../music-metadata/test/samples/MusicBrainz - Beth Hart - Sinner\'s Prayer [id3v2.3].V2.mp3');
    console.log(util.inspect(metadata, { showHidden: false, depth: null }));
  } catch (error) {
    console.error(error.message);
  }
})();
```

#### parseStream function

Parses the provided audio stream for metadata.
It is recommended to provide the corresponding [MIME-type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types). 
An extension (e.g.: `.mp3`), filename or path will also work.
If the MIME-type or filename (via `fileInfo.path`) is not provided, or not understood, music-metadata will try to derive the type from the content.

```ts
parseStream(stream: Stream.Readable, fileInfo?: IFileInfo | string, opts?: IOptions = {}): Promise<IAudioMetadata>`
```

Example:
```js
const mm = require('music-metadata');

(async () => {
  try {
    const metadata = await mm.parseStream(someReadStream, {mimeType: 'audio/mpeg', size: 26838});
    console.log(metadata);
  } catch (error) {
    console.error(error.message);
  }
})();
```

#### parseBuffer function

Parse metadata from an audio file, where the audio file is held in a [Buffer](https://nodejs.org/api/buffer.html).

```ts
parseBuffer(buffer: Buffer, fileInfo?: IFileInfo | string, opts?: IOptions = {}): Promise<IAudioMetadata>
```

Example:
```js
(async () => {
  try {
    const metadata = mm.parseBuffer(someBuffer, 'audio/mpeg');
    console.log(metadata);
  } catch (error) {
    console.error(error.message);
  }
})();
```

#### parseFromTokenizer function
This is a low level function, reading from a [strtok3](https://github.com/Borewit/strtok3) ITokenizer interface.
[music-metadata-browser](https://github.com/Borewit/music-metadata-browser) is depended on this function.

This also enables special read modules like:
*   [streaming-http-token-reader](https://github.com/Borewit/streaming-http-token-reader) for chunked HTTP(S) reading, using [HTTP range requests](https://developer.mozilla.org/en-US/docs/Web/HTTP/Range_requests).

#### orderTags function

Utility to Converts the native tags to a dictionary index on the tag identifier

```ts
orderTags(nativeTags: ITag[]): [tagId: string]: any[]
```

#### ratingToStars function
   
   Can be used to convert the normalized rating value to the 0..5 stars, where 0 an undefined rating, 1 the star the lowest rating and 5 the highest rating.
   
   ```ts
   ratingToStars(rating: number): number
   ```
#### selectCover function

Select cover image based on image type field, otherwise the first picture in file.

```ts
export function selectCover(pictures?: IPicture[]): IPicture | null
```

```js
import * as mm from 'music-metadata';

(async () => {
  const {common} = await mm.parseFile(filePath);
  const cover = mm.selectCover(common.picture); // pick the cover image
}
)();
 ```

### Options
*   `duration`: default: `false`, if set to `true`, it will parse the whole media file if required to determine the duration.
*   `observer: (update: MetadataEvent) => void;`: Will be called after each change to `common` (generic) tag, or `format` properties.
*   `skipCovers`: default: `false`, if set to `true`, it will not return embedded cover-art (images).
*   `skipPostHeaders? boolean` default: `false`, if set to `true`, it will not search all the entire track for additional headers. Only recommenced to use in combination with streams.
*   `includeChapters` default: `false`, if set to `true`, it will parse chapters (currently only MP4 files). _experimental functionality_

Although in most cases duration is included, in some cases it requires `music-metadata` parsing the entire file.
To enforce parsing the entire file if needed you should set `duration` to `true`.
    
### Metadata result

If the returned promise resolves, the metadata (TypeScript `IAudioMetadata` interface) contains:
*   [`metadata.format`](#metadataformat) Audio format information
*   [`metadata.common`](#metadatacommon) Is a generic (abstract) way of reading metadata information. 
*   [`metadata.trackInfo`](#metadatatrackInfo) Is a generic (abstract) way of reading metadata information. 
*   `metadata.native` List of native (original) tags found in the parsed audio file.
  
#### `metadata.format`

The questionmark `?` indicates the property is optional. 
  
Audio format information. Defined in the TypeScript `IFormat` interface:
*   `format.container?: string` Audio encoding format. e.g.: 'flac'
*   `format.codec?` Name of the codec (algorithm used for the audio compression)
*   `format.codecProfile?: string` Codec profile / settings
*   `format.tagTypes?: TagType[]`  List of tagging formats found in parsed audio file
*   `format.duration?: number` Duration in seconds
*   `format.bitrate?: number` Number bits per second of encoded audio file
*   `format.sampleRate?: number` Sampling rate in Samples per second (S/s)
*   `format.bitsPerSample?: number` Audio bit depth
*   `format.lossless?: boolean` True if lossless,  false for lossy encoding
*   `format.numberOfChannels?: number` Number of audio channels
*   `format.creationTime?: Date` Track creation time
*   `format.modificationTime?: Date` Track modification / tag update time
*   `format.trackGain?: number` Track gain in dB
*   `format.albumGain?: number` Album gain in dB

#### `metadata.trackInfo`

To support advanced containers like [Matroska](https://wikipedia.org/wiki/Matroska) or [MPEG-4](https://en.wikipedia.org/wiki/MPEG-4), which may contain multiple audio and video tracks, the **experimental** `metadata.trackInfo` has been added,
    
`metadata.trackInfo` is either `undefined` or has an **array** of [trackInfo](#trackinfo)
  
##### trackInfo
  
Audio format information. Defined in the TypeScript `IFormat` interface:
*   `trackInfo.type?: TrackType` Track type
*   `trackInfo.codecName?: string` Codec name
*   `trackInfo.codecSettings?: string` Codec settings
*   `trackInfo.flagEnabled?: boolean` Set if the track is usable, default: `true`
*   `trackInfo.flagDefault?: boolean` Set if that track (audio, video or subs) SHOULD be active if no language found matches the user preference.
*   `trackInfo.flagLacing?: boolean` Set if the track **may** contain blocks using lacing
*   `trackInfo.name?: string` A human-readable track name.
*   `trackInfo.language?: string` Specifies the language of the track
*   `trackInfo.audio?: IAudioTrack`, see [`trackInfo.audioTrack`](#trackinfoaudiotrack)
*   `trackInfo.video?: IVideoTrack`, see [`trackInfo.videoTrack`](#trackinfovideotrack)

##### `trackInfo.audioTrack`

*   `audioTrack.samplingFrequency?: number`
*   `audioTrack.outputSamplingFrequency?: number`
*   `audioTrack.channels?: number`
*   `audioTrack.channelPositions?: Buffer`
*   `audioTrack.bitDepth?: number`

##### `trackInfo.videoTrack`

*   `videoTrack.flagInterlaced?: boolean`
*   `videoTrack.stereoMode?: number`
*   `videoTrack.pixelWidth?: number`
*   `videoTrack.pixelHeight?: number`
*   `videoTrack.displayWidth?: number`
*   `videoTrack.displayHeight?: number`
*   `videoTrack.displayUnit?: number`
*   `videoTrack.aspectRatioType?: number`
*   `videoTrack.colourSpace?: Buffer`
*   `videoTrack.gammaValue?: number`
  
#### `metadata.common`

[Common tag documentation](doc/common_metadata.md) is automatically generated.

## Examples

In order to read the duration of a stream (with the exception of file streams), in some cases you should pass the size of the file in bytes.
```js
mm.parseStream(someReadStream, {mimeType: 'audio/mpeg', size: 26838}, {duration: true})
  .then( function (metadata) {
     console.log(util.inspect(metadata, {showHidden: false, depth: null}));
     someReadStream.close();
   });
```

### Access cover art

Via `metadata.common.picture` you can access an array of cover art if present.
Each picture has this interface:

```ts
/**
 * Attached picture, typically used for cover art
 */
export interface IPicture {
  /**
   * Image mime type
   */
  format: string;
  /**
   * Image data
   */
  data: Buffer;
  /**
   * Optional description
   */
  description?: string;
  /**
   * Picture type
   */
  type?: string;
}
```

To assign `img` HTML-object you can do something like:
```js
img.src = `data:${picture.format};base64,${picture.data.toString('base64')}`;
```

## Frequently Asked Questions

1.  How can I traverse (a long) list of files?

    What is important that file parsing should be done in a sequential manner.
    In a plain loop, due to the asynchronous character (like most JavaScript functions), it would cause all the files to run in parallel which is will cause your application to hang in no time.
    There are multiple ways of achieving this:

    1.  Using recursion

        ```js
        const mm = require('music-metadata')
        
        function parseFiles(audioFiles) {
          
          const audioFile = audioFiles.shift();
          
          if (audioFile) {
            return mm.parseFile(audioFile).then(metadata => {
              // Do great things with the metadata
              return parseFiles(audioFiles); // process rest of the files AFTER we are finished
            })
          }
          
          return Promise.resolve();
        }
        
        ```

    2.  Use async/await
        
        Use [async/await](https://javascript.info/async-await)
        
        ```js
        const mm = require('music-metadata');
        
        // it is required to declare the function 'async' to allow the use of await
        async function parseFiles(audioFiles) {
        
            for (const audioFile of audioFiles) {
            
                // await will ensure the metadata parsing is completed before we move on to the next file
                const metadata = await mm.parseFile(audioFile);
                // Do great things with the metadata
            }
        }
        ```

    3.  Use a specialized module to traverse files

        There are specialized modules to traversing (walking) files and directory,
        like [walk](https://www.npmjs.com/package/walk).

## Licence

The MIT License (MIT)

Copyright © 2022 Borewit

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
