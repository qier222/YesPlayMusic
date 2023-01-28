
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  decompressFromBase64,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions
} = require('./runtime/index')


const Prisma = {}

exports.Prisma = Prisma

/**
 * Prisma Client JS version: 4.8.1
 * Query Engine version: d6e67a83f971b175a593ccc12e15c4a757f93ffe
 */
Prisma.prismaVersion = {
  client: "4.8.1",
  engine: "d6e67a83f971b175a593ccc12e15c4a757f93ffe"
}

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = () => (val) => val


/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}


  const path = require('path')

const { findSync } = require('./runtime')
const fs = require('fs')

// some frameworks or bundlers replace or totally remove __dirname
const hasDirname = typeof __dirname !== 'undefined' && __dirname !== '/'

// will work in most cases, ie. if the client has not been bundled
const regularDirname = hasDirname && fs.existsSync(path.join(__dirname, 'schema.prisma')) && __dirname

// if the client has been bundled, we need to look for the folders
const foundDirname = !regularDirname && findSync(process.cwd(), [
    "prisma/client",
    "client",
], ['d'], ['d'], 1)[0]

const dirname = regularDirname || foundDirname || __dirname

/**
 * Enums
 */
// Based on
// https://github.com/microsoft/TypeScript/issues/3192#issuecomment-261720275
function makeEnum(x) { return x; }

exports.Prisma.AccountDataScalarFieldEnum = makeEnum({
  id: 'id',
  json: 'json',
  updatedAt: 'updatedAt'
});

exports.Prisma.AlbumScalarFieldEnum = makeEnum({
  id: 'id',
  json: 'json',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

exports.Prisma.AppDataScalarFieldEnum = makeEnum({
  id: 'id',
  value: 'value'
});

exports.Prisma.AppleMusicAlbumScalarFieldEnum = makeEnum({
  id: 'id',
  json: 'json',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

exports.Prisma.AppleMusicArtistScalarFieldEnum = makeEnum({
  id: 'id',
  json: 'json',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

exports.Prisma.ArtistAlbumScalarFieldEnum = makeEnum({
  id: 'id',
  hotAlbums: 'hotAlbums',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

exports.Prisma.ArtistScalarFieldEnum = makeEnum({
  id: 'id',
  json: 'json',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

exports.Prisma.AudioScalarFieldEnum = makeEnum({
  id: 'id',
  bitRate: 'bitRate',
  format: 'format',
  source: 'source',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  queriedAt: 'queriedAt'
});

exports.Prisma.LyricsScalarFieldEnum = makeEnum({
  id: 'id',
  json: 'json',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

exports.Prisma.PlaylistScalarFieldEnum = makeEnum({
  id: 'id',
  json: 'json',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

exports.Prisma.SortOrder = makeEnum({
  asc: 'asc',
  desc: 'desc'
});

exports.Prisma.TrackScalarFieldEnum = makeEnum({
  id: 'id',
  json: 'json',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  Serializable: 'Serializable'
});


exports.Prisma.ModelName = makeEnum({
  AccountData: 'AccountData',
  AppData: 'AppData',
  Track: 'Track',
  Album: 'Album',
  Artist: 'Artist',
  ArtistAlbum: 'ArtistAlbum',
  Playlist: 'Playlist',
  Audio: 'Audio',
  Lyrics: 'Lyrics',
  AppleMusicAlbum: 'AppleMusicAlbum',
  AppleMusicArtist: 'AppleMusicArtist'
});

const dmmfString = "{\"datamodel\":{\"enums\":[],\"models\":[{\"name\":\"AccountData\",\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"json\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},{\"name\":\"AppData\",\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"value\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},{\"name\":\"Track\",\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"json\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},{\"name\":\"Album\",\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"json\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},{\"name\":\"Artist\",\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"json\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},{\"name\":\"ArtistAlbum\",\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"hotAlbums\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},{\"name\":\"Playlist\",\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"json\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},{\"name\":\"Audio\",\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bitRate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"format\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"source\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"queriedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},{\"name\":\"Lyrics\",\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"json\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},{\"name\":\"AppleMusicAlbum\",\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"json\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},{\"name\":\"AppleMusicArtist\",\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":true,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"json\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}],\"types\":[]},\"mappings\":{\"modelOperations\":[{\"model\":\"AccountData\",\"plural\":\"accountData\",\"findUnique\":\"findUniqueAccountData\",\"findUniqueOrThrow\":\"findUniqueAccountDataOrThrow\",\"findFirst\":\"findFirstAccountData\",\"findFirstOrThrow\":\"findFirstAccountDataOrThrow\",\"findMany\":\"findManyAccountData\",\"create\":\"createOneAccountData\",\"delete\":\"deleteOneAccountData\",\"update\":\"updateOneAccountData\",\"deleteMany\":\"deleteManyAccountData\",\"updateMany\":\"updateManyAccountData\",\"upsert\":\"upsertOneAccountData\",\"aggregate\":\"aggregateAccountData\",\"groupBy\":\"groupByAccountData\"},{\"model\":\"AppData\",\"plural\":\"appData\",\"findUnique\":\"findUniqueAppData\",\"findUniqueOrThrow\":\"findUniqueAppDataOrThrow\",\"findFirst\":\"findFirstAppData\",\"findFirstOrThrow\":\"findFirstAppDataOrThrow\",\"findMany\":\"findManyAppData\",\"create\":\"createOneAppData\",\"delete\":\"deleteOneAppData\",\"update\":\"updateOneAppData\",\"deleteMany\":\"deleteManyAppData\",\"updateMany\":\"updateManyAppData\",\"upsert\":\"upsertOneAppData\",\"aggregate\":\"aggregateAppData\",\"groupBy\":\"groupByAppData\"},{\"model\":\"Track\",\"plural\":\"tracks\",\"findUnique\":\"findUniqueTrack\",\"findUniqueOrThrow\":\"findUniqueTrackOrThrow\",\"findFirst\":\"findFirstTrack\",\"findFirstOrThrow\":\"findFirstTrackOrThrow\",\"findMany\":\"findManyTrack\",\"create\":\"createOneTrack\",\"delete\":\"deleteOneTrack\",\"update\":\"updateOneTrack\",\"deleteMany\":\"deleteManyTrack\",\"updateMany\":\"updateManyTrack\",\"upsert\":\"upsertOneTrack\",\"aggregate\":\"aggregateTrack\",\"groupBy\":\"groupByTrack\"},{\"model\":\"Album\",\"plural\":\"albums\",\"findUnique\":\"findUniqueAlbum\",\"findUniqueOrThrow\":\"findUniqueAlbumOrThrow\",\"findFirst\":\"findFirstAlbum\",\"findFirstOrThrow\":\"findFirstAlbumOrThrow\",\"findMany\":\"findManyAlbum\",\"create\":\"createOneAlbum\",\"delete\":\"deleteOneAlbum\",\"update\":\"updateOneAlbum\",\"deleteMany\":\"deleteManyAlbum\",\"updateMany\":\"updateManyAlbum\",\"upsert\":\"upsertOneAlbum\",\"aggregate\":\"aggregateAlbum\",\"groupBy\":\"groupByAlbum\"},{\"model\":\"Artist\",\"plural\":\"artists\",\"findUnique\":\"findUniqueArtist\",\"findUniqueOrThrow\":\"findUniqueArtistOrThrow\",\"findFirst\":\"findFirstArtist\",\"findFirstOrThrow\":\"findFirstArtistOrThrow\",\"findMany\":\"findManyArtist\",\"create\":\"createOneArtist\",\"delete\":\"deleteOneArtist\",\"update\":\"updateOneArtist\",\"deleteMany\":\"deleteManyArtist\",\"updateMany\":\"updateManyArtist\",\"upsert\":\"upsertOneArtist\",\"aggregate\":\"aggregateArtist\",\"groupBy\":\"groupByArtist\"},{\"model\":\"ArtistAlbum\",\"plural\":\"artistAlbums\",\"findUnique\":\"findUniqueArtistAlbum\",\"findUniqueOrThrow\":\"findUniqueArtistAlbumOrThrow\",\"findFirst\":\"findFirstArtistAlbum\",\"findFirstOrThrow\":\"findFirstArtistAlbumOrThrow\",\"findMany\":\"findManyArtistAlbum\",\"create\":\"createOneArtistAlbum\",\"delete\":\"deleteOneArtistAlbum\",\"update\":\"updateOneArtistAlbum\",\"deleteMany\":\"deleteManyArtistAlbum\",\"updateMany\":\"updateManyArtistAlbum\",\"upsert\":\"upsertOneArtistAlbum\",\"aggregate\":\"aggregateArtistAlbum\",\"groupBy\":\"groupByArtistAlbum\"},{\"model\":\"Playlist\",\"plural\":\"playlists\",\"findUnique\":\"findUniquePlaylist\",\"findUniqueOrThrow\":\"findUniquePlaylistOrThrow\",\"findFirst\":\"findFirstPlaylist\",\"findFirstOrThrow\":\"findFirstPlaylistOrThrow\",\"findMany\":\"findManyPlaylist\",\"create\":\"createOnePlaylist\",\"delete\":\"deleteOnePlaylist\",\"update\":\"updateOnePlaylist\",\"deleteMany\":\"deleteManyPlaylist\",\"updateMany\":\"updateManyPlaylist\",\"upsert\":\"upsertOnePlaylist\",\"aggregate\":\"aggregatePlaylist\",\"groupBy\":\"groupByPlaylist\"},{\"model\":\"Audio\",\"plural\":\"audio\",\"findUnique\":\"findUniqueAudio\",\"findUniqueOrThrow\":\"findUniqueAudioOrThrow\",\"findFirst\":\"findFirstAudio\",\"findFirstOrThrow\":\"findFirstAudioOrThrow\",\"findMany\":\"findManyAudio\",\"create\":\"createOneAudio\",\"delete\":\"deleteOneAudio\",\"update\":\"updateOneAudio\",\"deleteMany\":\"deleteManyAudio\",\"updateMany\":\"updateManyAudio\",\"upsert\":\"upsertOneAudio\",\"aggregate\":\"aggregateAudio\",\"groupBy\":\"groupByAudio\"},{\"model\":\"Lyrics\",\"plural\":\"lyrics\",\"findUnique\":\"findUniqueLyrics\",\"findUniqueOrThrow\":\"findUniqueLyricsOrThrow\",\"findFirst\":\"findFirstLyrics\",\"findFirstOrThrow\":\"findFirstLyricsOrThrow\",\"findMany\":\"findManyLyrics\",\"create\":\"createOneLyrics\",\"delete\":\"deleteOneLyrics\",\"update\":\"updateOneLyrics\",\"deleteMany\":\"deleteManyLyrics\",\"updateMany\":\"updateManyLyrics\",\"upsert\":\"upsertOneLyrics\",\"aggregate\":\"aggregateLyrics\",\"groupBy\":\"groupByLyrics\"},{\"model\":\"AppleMusicAlbum\",\"plural\":\"appleMusicAlbums\",\"findUnique\":\"findUniqueAppleMusicAlbum\",\"findUniqueOrThrow\":\"findUniqueAppleMusicAlbumOrThrow\",\"findFirst\":\"findFirstAppleMusicAlbum\",\"findFirstOrThrow\":\"findFirstAppleMusicAlbumOrThrow\",\"findMany\":\"findManyAppleMusicAlbum\",\"create\":\"createOneAppleMusicAlbum\",\"delete\":\"deleteOneAppleMusicAlbum\",\"update\":\"updateOneAppleMusicAlbum\",\"deleteMany\":\"deleteManyAppleMusicAlbum\",\"updateMany\":\"updateManyAppleMusicAlbum\",\"upsert\":\"upsertOneAppleMusicAlbum\",\"aggregate\":\"aggregateAppleMusicAlbum\",\"groupBy\":\"groupByAppleMusicAlbum\"},{\"model\":\"AppleMusicArtist\",\"plural\":\"appleMusicArtists\",\"findUnique\":\"findUniqueAppleMusicArtist\",\"findUniqueOrThrow\":\"findUniqueAppleMusicArtistOrThrow\",\"findFirst\":\"findFirstAppleMusicArtist\",\"findFirstOrThrow\":\"findFirstAppleMusicArtistOrThrow\",\"findMany\":\"findManyAppleMusicArtist\",\"create\":\"createOneAppleMusicArtist\",\"delete\":\"deleteOneAppleMusicArtist\",\"update\":\"updateOneAppleMusicArtist\",\"deleteMany\":\"deleteManyAppleMusicArtist\",\"updateMany\":\"updateManyAppleMusicArtist\",\"upsert\":\"upsertOneAppleMusicArtist\",\"aggregate\":\"aggregateAppleMusicArtist\",\"groupBy\":\"groupByAppleMusicArtist\"}],\"otherOperations\":{\"read\":[],\"write\":[\"executeRaw\",\"queryRaw\"]}}}"
const dmmf = JSON.parse(dmmfString)
exports.Prisma.dmmf = JSON.parse(dmmfString)

/**
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "/Users/max/Developer/GitHub/replay/packages/desktop/prisma/client",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "darwin-arm64"
      },
      {
        "fromEnvVar": null,
        "value": "darwin"
      },
      {
        "fromEnvVar": null,
        "value": "darwin-arm64"
      }
    ],
    "previewFeatures": [],
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": "../../.env",
    "schemaEnvPath": "../../.env"
  },
  "relativePath": "..",
  "clientVersion": "4.8.1",
  "engineVersion": "d6e67a83f971b175a593ccc12e15c4a757f93ffe",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "sqlite",
  "dataProxy": false
}
config.document = dmmf
config.dirname = dirname




const { warnEnvConflicts } = require('./runtime/index')

warnEnvConflicts({
    rootEnvPath: config.relativeEnvPaths.rootEnvPath && path.resolve(dirname, config.relativeEnvPaths.rootEnvPath),
    schemaEnvPath: config.relativeEnvPaths.schemaEnvPath && path.resolve(dirname, config.relativeEnvPaths.schemaEnvPath)
})

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

path.join(__dirname, "libquery_engine-darwin-arm64.dylib.node");
path.join(process.cwd(), "prisma/client/libquery_engine-darwin-arm64.dylib.node")

path.join(__dirname, "libquery_engine-darwin.dylib.node");
path.join(process.cwd(), "prisma/client/libquery_engine-darwin.dylib.node")
path.join(__dirname, "schema.prisma");
path.join(process.cwd(), "prisma/client/schema.prisma")
