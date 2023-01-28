
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum
} = require('./runtime/index-browser')


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

Prisma.PrismaClientKnownRequestError = () => {
  throw new Error(`PrismaClientKnownRequestError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  throw new Error(`PrismaClientUnknownRequestError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.PrismaClientRustPanicError = () => {
  throw new Error(`PrismaClientRustPanicError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.PrismaClientInitializationError = () => {
  throw new Error(`PrismaClientInitializationError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.PrismaClientValidationError = () => {
  throw new Error(`PrismaClientValidationError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.NotFoundError = () => {
  throw new Error(`NotFoundError is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  throw new Error(`sqltag is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.empty = () => {
  throw new Error(`empty is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.join = () => {
  throw new Error(`join is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
Prisma.raw = () => {
  throw new Error(`raw is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
)}
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

/**
 * Create the Client
 */
class PrismaClient {
  constructor() {
    throw new Error(
      `PrismaClient is unable to be run in the browser.
In case this error is unexpected for you, please report it in https://github.com/prisma/prisma/issues`,
    )
  }
}
exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
