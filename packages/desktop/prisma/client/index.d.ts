
/**
 * Client
**/

import * as runtime from './runtime/index';
declare const prisma: unique symbol
export type PrismaPromise<A> = Promise<A> & {[prisma]: true}
type UnwrapPromise<P extends any> = P extends Promise<infer R> ? R : P
type UnwrapTuple<Tuple extends readonly unknown[]> = {
  [K in keyof Tuple]: K extends `${number}` ? Tuple[K] extends PrismaPromise<infer X> ? X : UnwrapPromise<Tuple[K]> : UnwrapPromise<Tuple[K]>
};


/**
 * Model AccountData
 * 
 */
export type AccountData = {
  id: string
  json: string
  updatedAt: Date
}

/**
 * Model AppData
 * 
 */
export type AppData = {
  id: string
  value: string
}

/**
 * Model Track
 * 
 */
export type Track = {
  id: number
  json: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Model Album
 * 
 */
export type Album = {
  id: number
  json: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Model Artist
 * 
 */
export type Artist = {
  id: number
  json: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Model ArtistAlbum
 * 
 */
export type ArtistAlbum = {
  id: number
  hotAlbums: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Model Playlist
 * 
 */
export type Playlist = {
  id: number
  json: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Model Audio
 * 
 */
export type Audio = {
  id: number
  bitRate: number
  format: string
  source: string
  createdAt: Date
  updatedAt: Date
  queriedAt: Date
}

/**
 * Model Lyrics
 * 
 */
export type Lyrics = {
  id: number
  json: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Model AppleMusicAlbum
 * 
 */
export type AppleMusicAlbum = {
  id: number
  json: string
  createdAt: Date
  updatedAt: Date
}

/**
 * Model AppleMusicArtist
 * 
 */
export type AppleMusicArtist = {
  id: number
  json: string
  createdAt: Date
  updatedAt: Date
}


/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more AccountData
 * const accountData = await prisma.accountData.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  T extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof T ? T['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<T['log']> : never : never,
  GlobalReject extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined = 'rejectOnNotFound' extends keyof T
    ? T['rejectOnNotFound']
    : false
      > {
    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more AccountData
   * const accountData = await prisma.accountData.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<T, Prisma.PrismaClientOptions>);
  $on<V extends (U | 'beforeExit')>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : V extends 'beforeExit' ? () => Promise<void> : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): Promise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): Promise<void>;

  /**
   * Add a middleware
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): PrismaPromise<T>;

  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): Promise<UnwrapTuple<P>>;

  $transaction<R>(fn: (prisma: Prisma.TransactionClient) => Promise<R>, options?: {maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel}): Promise<R>;

      /**
   * `prisma.accountData`: Exposes CRUD operations for the **AccountData** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AccountData
    * const accountData = await prisma.accountData.findMany()
    * ```
    */
  get accountData(): Prisma.AccountDataDelegate<GlobalReject>;

  /**
   * `prisma.appData`: Exposes CRUD operations for the **AppData** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AppData
    * const appData = await prisma.appData.findMany()
    * ```
    */
  get appData(): Prisma.AppDataDelegate<GlobalReject>;

  /**
   * `prisma.track`: Exposes CRUD operations for the **Track** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Tracks
    * const tracks = await prisma.track.findMany()
    * ```
    */
  get track(): Prisma.TrackDelegate<GlobalReject>;

  /**
   * `prisma.album`: Exposes CRUD operations for the **Album** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Albums
    * const albums = await prisma.album.findMany()
    * ```
    */
  get album(): Prisma.AlbumDelegate<GlobalReject>;

  /**
   * `prisma.artist`: Exposes CRUD operations for the **Artist** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Artists
    * const artists = await prisma.artist.findMany()
    * ```
    */
  get artist(): Prisma.ArtistDelegate<GlobalReject>;

  /**
   * `prisma.artistAlbum`: Exposes CRUD operations for the **ArtistAlbum** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ArtistAlbums
    * const artistAlbums = await prisma.artistAlbum.findMany()
    * ```
    */
  get artistAlbum(): Prisma.ArtistAlbumDelegate<GlobalReject>;

  /**
   * `prisma.playlist`: Exposes CRUD operations for the **Playlist** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Playlists
    * const playlists = await prisma.playlist.findMany()
    * ```
    */
  get playlist(): Prisma.PlaylistDelegate<GlobalReject>;

  /**
   * `prisma.audio`: Exposes CRUD operations for the **Audio** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Audio
    * const audio = await prisma.audio.findMany()
    * ```
    */
  get audio(): Prisma.AudioDelegate<GlobalReject>;

  /**
   * `prisma.lyrics`: Exposes CRUD operations for the **Lyrics** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Lyrics
    * const lyrics = await prisma.lyrics.findMany()
    * ```
    */
  get lyrics(): Prisma.LyricsDelegate<GlobalReject>;

  /**
   * `prisma.appleMusicAlbum`: Exposes CRUD operations for the **AppleMusicAlbum** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AppleMusicAlbums
    * const appleMusicAlbums = await prisma.appleMusicAlbum.findMany()
    * ```
    */
  get appleMusicAlbum(): Prisma.AppleMusicAlbumDelegate<GlobalReject>;

  /**
   * `prisma.appleMusicArtist`: Exposes CRUD operations for the **AppleMusicArtist** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AppleMusicArtists
    * const appleMusicArtists = await prisma.appleMusicArtist.findMany()
    * ```
    */
  get appleMusicArtist(): Prisma.AppleMusicArtistDelegate<GlobalReject>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql

  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket


  /**
   * Prisma Client JS version: 4.8.1
   * Query Engine version: d6e67a83f971b175a593ccc12e15c4a757f93ffe
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches a JSON object.
   * This type can be useful to enforce some input to be JSON-compatible or as a super-type to be extended from. 
   */
  export type JsonObject = {[Key in string]?: JsonValue}

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches a JSON array.
   */
  export interface JsonArray extends Array<JsonValue> {}

  /**
   * From https://github.com/sindresorhus/type-fest/
   * Matches any valid JSON value.
   */
  export type JsonValue = string | number | boolean | JsonObject | JsonArray | null

  /**
   * Matches a JSON object.
   * Unlike `JsonObject`, this type allows undefined and read-only properties.
   */
  export type InputJsonObject = {readonly [Key in string]?: InputJsonValue | null}

  /**
   * Matches a JSON array.
   * Unlike `JsonArray`, readonly arrays are assignable to this type.
   */
  export interface InputJsonArray extends ReadonlyArray<InputJsonValue | null> {}

  /**
   * Matches any valid value that can be used as an input for operations like
   * create and update as the value of a JSON field. Unlike `JsonValue`, this
   * type allows read-only arrays and read-only object properties and disallows
   * `null` at the top level.
   *
   * `null` cannot be used as the value of a JSON field because its meaning
   * would be ambiguous. Use `Prisma.JsonNull` to store the JSON null value or
   * `Prisma.DbNull` to clear the JSON value and set the field to the database
   * NULL value instead.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-by-null-values
   */
  export type InputJsonValue = string | number | boolean | InputJsonObject | InputJsonArray

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }
  type HasSelect = {
    select: any
  }
  type HasInclude = {
    include: any
  }
  type CheckSelect<T, S, U> = T extends SelectAndInclude
    ? 'Please either choose `select` or `include`'
    : T extends HasSelect
    ? U
    : T extends HasInclude
    ? U
    : S

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => Promise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Exact<A, W = unknown> = 
  W extends unknown ? A extends Narrowable ? Cast<A, W> : Cast<
  {[K in keyof A]: K extends keyof W ? Exact<A[K], W[K]> : never},
  {[K in keyof W]: K extends keyof A ? Exact<A[K], W[K]> : W[K]}>
  : never;

  type Narrowable = string | number | boolean | bigint;

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;

  export function validator<V>(): <S>(select: Exact<S, V>) => S;

  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but with an array
   */
  type PickArray<T, K extends Array<keyof T>> = Prisma__Pick<T, TupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>

  class PrismaClientFetcher {
    private readonly prisma;
    private readonly debug;
    private readonly hooks?;
    constructor(prisma: PrismaClient<any, any>, debug?: boolean, hooks?: Hooks | undefined);
    request<T>(document: any, dataPath?: string[], rootField?: string, typeName?: string, isList?: boolean, callsite?: string): Promise<T>;
    sanitizeMessage(message: string): string;
    protected unpack(document: any, data: any, path: string[], rootField?: string, isList?: boolean): any;
  }

  export const ModelName: {
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
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  export type DefaultPrismaClient = PrismaClient
  export type RejectOnNotFound = boolean | ((error: Error) => Error)
  export type RejectPerModel = { [P in ModelName]?: RejectOnNotFound }
  export type RejectPerOperation =  { [P in "findUnique" | "findFirst"]?: RejectPerModel | RejectOnNotFound } 
  type IsReject<T> = T extends true ? True : T extends (err: Error) => Error ? True : False
  export type HasReject<
    GlobalRejectSettings extends Prisma.PrismaClientOptions['rejectOnNotFound'],
    LocalRejectSettings,
    Action extends PrismaAction,
    Model extends ModelName
  > = LocalRejectSettings extends RejectOnNotFound
    ? IsReject<LocalRejectSettings>
    : GlobalRejectSettings extends RejectPerOperation
    ? Action extends keyof GlobalRejectSettings
      ? GlobalRejectSettings[Action] extends RejectOnNotFound
        ? IsReject<GlobalRejectSettings[Action]>
        : GlobalRejectSettings[Action] extends RejectPerModel
        ? Model extends keyof GlobalRejectSettings[Action]
          ? IsReject<GlobalRejectSettings[Action][Model]>
          : False
        : False
      : False
    : IsReject<GlobalRejectSettings>
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'

  export interface PrismaClientOptions {
    /**
     * Configure findUnique/findFirst to throw an error if the query returns null. 
     * @deprecated since 4.0.0. Use `findUniqueOrThrow`/`findFirstOrThrow` methods instead.
     * @example
     * ```
     * // Reject on both findUnique/findFirst
     * rejectOnNotFound: true
     * // Reject only on findFirst with a custom error
     * rejectOnNotFound: { findFirst: (err) => new Error("Custom Error")}
     * // Reject on user.findUnique with a custom error
     * rejectOnNotFound: { findUnique: {User: (err) => new Error("User not found")}}
     * ```
     */
    rejectOnNotFound?: RejectOnNotFound | RejectPerOperation
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources

    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat

    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: Array<LogLevel | LogDefinition>
  }

  export type Hooks = {
    beforeRequest?: (options: { query: string, path: string[], rootField?: string, typeName?: string, document: any }) => any
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findMany'
    | 'findFirst'
    | 'create'
    | 'createMany'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => Promise<T>,
  ) => Promise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */



  /**
   * Models
   */

  /**
   * Model AccountData
   */


  export type AggregateAccountData = {
    _count: AccountDataCountAggregateOutputType | null
    _min: AccountDataMinAggregateOutputType | null
    _max: AccountDataMaxAggregateOutputType | null
  }

  export type AccountDataMinAggregateOutputType = {
    id: string | null
    json: string | null
    updatedAt: Date | null
  }

  export type AccountDataMaxAggregateOutputType = {
    id: string | null
    json: string | null
    updatedAt: Date | null
  }

  export type AccountDataCountAggregateOutputType = {
    id: number
    json: number
    updatedAt: number
    _all: number
  }


  export type AccountDataMinAggregateInputType = {
    id?: true
    json?: true
    updatedAt?: true
  }

  export type AccountDataMaxAggregateInputType = {
    id?: true
    json?: true
    updatedAt?: true
  }

  export type AccountDataCountAggregateInputType = {
    id?: true
    json?: true
    updatedAt?: true
    _all?: true
  }

  export type AccountDataAggregateArgs = {
    /**
     * Filter which AccountData to aggregate.
     * 
    **/
    where?: AccountDataWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AccountData to fetch.
     * 
    **/
    orderBy?: Enumerable<AccountDataOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     * 
    **/
    cursor?: AccountDataWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AccountData from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AccountData.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AccountData
    **/
    _count?: true | AccountDataCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AccountDataMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AccountDataMaxAggregateInputType
  }

  export type GetAccountDataAggregateType<T extends AccountDataAggregateArgs> = {
        [P in keyof T & keyof AggregateAccountData]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAccountData[P]>
      : GetScalarType<T[P], AggregateAccountData[P]>
  }




  export type AccountDataGroupByArgs = {
    where?: AccountDataWhereInput
    orderBy?: Enumerable<AccountDataOrderByWithAggregationInput>
    by: Array<AccountDataScalarFieldEnum>
    having?: AccountDataScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AccountDataCountAggregateInputType | true
    _min?: AccountDataMinAggregateInputType
    _max?: AccountDataMaxAggregateInputType
  }


  export type AccountDataGroupByOutputType = {
    id: string
    json: string
    updatedAt: Date
    _count: AccountDataCountAggregateOutputType | null
    _min: AccountDataMinAggregateOutputType | null
    _max: AccountDataMaxAggregateOutputType | null
  }

  type GetAccountDataGroupByPayload<T extends AccountDataGroupByArgs> = PrismaPromise<
    Array<
      PickArray<AccountDataGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AccountDataGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AccountDataGroupByOutputType[P]>
            : GetScalarType<T[P], AccountDataGroupByOutputType[P]>
        }
      >
    >


  export type AccountDataSelect = {
    id?: boolean
    json?: boolean
    updatedAt?: boolean
  }


  export type AccountDataGetPayload<S extends boolean | null | undefined | AccountDataArgs> =
    S extends { select: any, include: any } ? 'Please either choose `select` or `include`' :
    S extends true ? AccountData :
    S extends undefined ? never :
    S extends { include: any } & (AccountDataArgs | AccountDataFindManyArgs)
    ? AccountData 
    : S extends { select: any } & (AccountDataArgs | AccountDataFindManyArgs)
      ? {
    [P in TruthyKeys<S['select']>]:
    P extends keyof AccountData ? AccountData[P] : never
  } 
      : AccountData


  type AccountDataCountArgs = Merge<
    Omit<AccountDataFindManyArgs, 'select' | 'include'> & {
      select?: AccountDataCountAggregateInputType | true
    }
  >

  export interface AccountDataDelegate<GlobalRejectSettings extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined> {
    /**
     * Find zero or one AccountData that matches the filter.
     * @param {AccountDataFindUniqueArgs} args - Arguments to find a AccountData
     * @example
     * // Get one AccountData
     * const accountData = await prisma.accountData.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends AccountDataFindUniqueArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args: SelectSubset<T, AccountDataFindUniqueArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findUnique', 'AccountData'> extends True ? Prisma__AccountDataClient<AccountDataGetPayload<T>> : Prisma__AccountDataClient<AccountDataGetPayload<T> | null, null>

    /**
     * Find one AccountData that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {AccountDataFindUniqueOrThrowArgs} args - Arguments to find a AccountData
     * @example
     * // Get one AccountData
     * const accountData = await prisma.accountData.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends AccountDataFindUniqueOrThrowArgs>(
      args?: SelectSubset<T, AccountDataFindUniqueOrThrowArgs>
    ): Prisma__AccountDataClient<AccountDataGetPayload<T>>

    /**
     * Find the first AccountData that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountDataFindFirstArgs} args - Arguments to find a AccountData
     * @example
     * // Get one AccountData
     * const accountData = await prisma.accountData.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends AccountDataFindFirstArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args?: SelectSubset<T, AccountDataFindFirstArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findFirst', 'AccountData'> extends True ? Prisma__AccountDataClient<AccountDataGetPayload<T>> : Prisma__AccountDataClient<AccountDataGetPayload<T> | null, null>

    /**
     * Find the first AccountData that matches the filter or
     * throw `NotFoundError` if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountDataFindFirstOrThrowArgs} args - Arguments to find a AccountData
     * @example
     * // Get one AccountData
     * const accountData = await prisma.accountData.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends AccountDataFindFirstOrThrowArgs>(
      args?: SelectSubset<T, AccountDataFindFirstOrThrowArgs>
    ): Prisma__AccountDataClient<AccountDataGetPayload<T>>

    /**
     * Find zero or more AccountData that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountDataFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AccountData
     * const accountData = await prisma.accountData.findMany()
     * 
     * // Get first 10 AccountData
     * const accountData = await prisma.accountData.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const accountDataWithIdOnly = await prisma.accountData.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends AccountDataFindManyArgs>(
      args?: SelectSubset<T, AccountDataFindManyArgs>
    ): PrismaPromise<Array<AccountDataGetPayload<T>>>

    /**
     * Create a AccountData.
     * @param {AccountDataCreateArgs} args - Arguments to create a AccountData.
     * @example
     * // Create one AccountData
     * const AccountData = await prisma.accountData.create({
     *   data: {
     *     // ... data to create a AccountData
     *   }
     * })
     * 
    **/
    create<T extends AccountDataCreateArgs>(
      args: SelectSubset<T, AccountDataCreateArgs>
    ): Prisma__AccountDataClient<AccountDataGetPayload<T>>

    /**
     * Delete a AccountData.
     * @param {AccountDataDeleteArgs} args - Arguments to delete one AccountData.
     * @example
     * // Delete one AccountData
     * const AccountData = await prisma.accountData.delete({
     *   where: {
     *     // ... filter to delete one AccountData
     *   }
     * })
     * 
    **/
    delete<T extends AccountDataDeleteArgs>(
      args: SelectSubset<T, AccountDataDeleteArgs>
    ): Prisma__AccountDataClient<AccountDataGetPayload<T>>

    /**
     * Update one AccountData.
     * @param {AccountDataUpdateArgs} args - Arguments to update one AccountData.
     * @example
     * // Update one AccountData
     * const accountData = await prisma.accountData.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends AccountDataUpdateArgs>(
      args: SelectSubset<T, AccountDataUpdateArgs>
    ): Prisma__AccountDataClient<AccountDataGetPayload<T>>

    /**
     * Delete zero or more AccountData.
     * @param {AccountDataDeleteManyArgs} args - Arguments to filter AccountData to delete.
     * @example
     * // Delete a few AccountData
     * const { count } = await prisma.accountData.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends AccountDataDeleteManyArgs>(
      args?: SelectSubset<T, AccountDataDeleteManyArgs>
    ): PrismaPromise<BatchPayload>

    /**
     * Update zero or more AccountData.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountDataUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AccountData
     * const accountData = await prisma.accountData.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends AccountDataUpdateManyArgs>(
      args: SelectSubset<T, AccountDataUpdateManyArgs>
    ): PrismaPromise<BatchPayload>

    /**
     * Create or update one AccountData.
     * @param {AccountDataUpsertArgs} args - Arguments to update or create a AccountData.
     * @example
     * // Update or create a AccountData
     * const accountData = await prisma.accountData.upsert({
     *   create: {
     *     // ... data to create a AccountData
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AccountData we want to update
     *   }
     * })
    **/
    upsert<T extends AccountDataUpsertArgs>(
      args: SelectSubset<T, AccountDataUpsertArgs>
    ): Prisma__AccountDataClient<AccountDataGetPayload<T>>

    /**
     * Count the number of AccountData.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountDataCountArgs} args - Arguments to filter AccountData to count.
     * @example
     * // Count the number of AccountData
     * const count = await prisma.accountData.count({
     *   where: {
     *     // ... the filter for the AccountData we want to count
     *   }
     * })
    **/
    count<T extends AccountDataCountArgs>(
      args?: Subset<T, AccountDataCountArgs>,
    ): PrismaPromise<
      T extends _Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AccountDataCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AccountData.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountDataAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AccountDataAggregateArgs>(args: Subset<T, AccountDataAggregateArgs>): PrismaPromise<GetAccountDataAggregateType<T>>

    /**
     * Group by AccountData.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AccountDataGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AccountDataGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AccountDataGroupByArgs['orderBy'] }
        : { orderBy?: AccountDataGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends TupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AccountDataGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAccountDataGroupByPayload<T> : PrismaPromise<InputErrors>

  }

  /**
   * The delegate class that acts as a "Promise-like" for AccountData.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export class Prisma__AccountDataClient<T, Null = never> implements PrismaPromise<T> {
    [prisma]: true;
    private readonly _dmmf;
    private readonly _fetcher;
    private readonly _queryType;
    private readonly _rootField;
    private readonly _clientMethod;
    private readonly _args;
    private readonly _dataPath;
    private readonly _errorFormat;
    private readonly _measurePerformance?;
    private _isList;
    private _callsite;
    private _requestPromise?;
    constructor(_dmmf: runtime.DMMFClass, _fetcher: PrismaClientFetcher, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);
    readonly [Symbol.toStringTag]: 'PrismaClientPromise';


    private get _document();
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  }



  // Custom InputTypes

  /**
   * AccountData base type for findUnique actions
   */
  export type AccountDataFindUniqueArgsBase = {
    /**
     * Select specific fields to fetch from the AccountData
     * 
    **/
    select?: AccountDataSelect | null
    /**
     * Filter, which AccountData to fetch.
     * 
    **/
    where: AccountDataWhereUniqueInput
  }

  /**
   * AccountData findUnique
   */
  export interface AccountDataFindUniqueArgs extends AccountDataFindUniqueArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findUniqueOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * AccountData findUniqueOrThrow
   */
  export type AccountDataFindUniqueOrThrowArgs = {
    /**
     * Select specific fields to fetch from the AccountData
     * 
    **/
    select?: AccountDataSelect | null
    /**
     * Filter, which AccountData to fetch.
     * 
    **/
    where: AccountDataWhereUniqueInput
  }


  /**
   * AccountData base type for findFirst actions
   */
  export type AccountDataFindFirstArgsBase = {
    /**
     * Select specific fields to fetch from the AccountData
     * 
    **/
    select?: AccountDataSelect | null
    /**
     * Filter, which AccountData to fetch.
     * 
    **/
    where?: AccountDataWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AccountData to fetch.
     * 
    **/
    orderBy?: Enumerable<AccountDataOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AccountData.
     * 
    **/
    cursor?: AccountDataWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AccountData from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AccountData.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AccountData.
     * 
    **/
    distinct?: Enumerable<AccountDataScalarFieldEnum>
  }

  /**
   * AccountData findFirst
   */
  export interface AccountDataFindFirstArgs extends AccountDataFindFirstArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findFirstOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * AccountData findFirstOrThrow
   */
  export type AccountDataFindFirstOrThrowArgs = {
    /**
     * Select specific fields to fetch from the AccountData
     * 
    **/
    select?: AccountDataSelect | null
    /**
     * Filter, which AccountData to fetch.
     * 
    **/
    where?: AccountDataWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AccountData to fetch.
     * 
    **/
    orderBy?: Enumerable<AccountDataOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AccountData.
     * 
    **/
    cursor?: AccountDataWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AccountData from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AccountData.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AccountData.
     * 
    **/
    distinct?: Enumerable<AccountDataScalarFieldEnum>
  }


  /**
   * AccountData findMany
   */
  export type AccountDataFindManyArgs = {
    /**
     * Select specific fields to fetch from the AccountData
     * 
    **/
    select?: AccountDataSelect | null
    /**
     * Filter, which AccountData to fetch.
     * 
    **/
    where?: AccountDataWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AccountData to fetch.
     * 
    **/
    orderBy?: Enumerable<AccountDataOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AccountData.
     * 
    **/
    cursor?: AccountDataWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AccountData from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AccountData.
     * 
    **/
    skip?: number
    distinct?: Enumerable<AccountDataScalarFieldEnum>
  }


  /**
   * AccountData create
   */
  export type AccountDataCreateArgs = {
    /**
     * Select specific fields to fetch from the AccountData
     * 
    **/
    select?: AccountDataSelect | null
    /**
     * The data needed to create a AccountData.
     * 
    **/
    data: XOR<AccountDataCreateInput, AccountDataUncheckedCreateInput>
  }


  /**
   * AccountData update
   */
  export type AccountDataUpdateArgs = {
    /**
     * Select specific fields to fetch from the AccountData
     * 
    **/
    select?: AccountDataSelect | null
    /**
     * The data needed to update a AccountData.
     * 
    **/
    data: XOR<AccountDataUpdateInput, AccountDataUncheckedUpdateInput>
    /**
     * Choose, which AccountData to update.
     * 
    **/
    where: AccountDataWhereUniqueInput
  }


  /**
   * AccountData updateMany
   */
  export type AccountDataUpdateManyArgs = {
    /**
     * The data used to update AccountData.
     * 
    **/
    data: XOR<AccountDataUpdateManyMutationInput, AccountDataUncheckedUpdateManyInput>
    /**
     * Filter which AccountData to update
     * 
    **/
    where?: AccountDataWhereInput
  }


  /**
   * AccountData upsert
   */
  export type AccountDataUpsertArgs = {
    /**
     * Select specific fields to fetch from the AccountData
     * 
    **/
    select?: AccountDataSelect | null
    /**
     * The filter to search for the AccountData to update in case it exists.
     * 
    **/
    where: AccountDataWhereUniqueInput
    /**
     * In case the AccountData found by the `where` argument doesn't exist, create a new AccountData with this data.
     * 
    **/
    create: XOR<AccountDataCreateInput, AccountDataUncheckedCreateInput>
    /**
     * In case the AccountData was found with the provided `where` argument, update it with this data.
     * 
    **/
    update: XOR<AccountDataUpdateInput, AccountDataUncheckedUpdateInput>
  }


  /**
   * AccountData delete
   */
  export type AccountDataDeleteArgs = {
    /**
     * Select specific fields to fetch from the AccountData
     * 
    **/
    select?: AccountDataSelect | null
    /**
     * Filter which AccountData to delete.
     * 
    **/
    where: AccountDataWhereUniqueInput
  }


  /**
   * AccountData deleteMany
   */
  export type AccountDataDeleteManyArgs = {
    /**
     * Filter which AccountData to delete
     * 
    **/
    where?: AccountDataWhereInput
  }


  /**
   * AccountData without action
   */
  export type AccountDataArgs = {
    /**
     * Select specific fields to fetch from the AccountData
     * 
    **/
    select?: AccountDataSelect | null
  }



  /**
   * Model AppData
   */


  export type AggregateAppData = {
    _count: AppDataCountAggregateOutputType | null
    _min: AppDataMinAggregateOutputType | null
    _max: AppDataMaxAggregateOutputType | null
  }

  export type AppDataMinAggregateOutputType = {
    id: string | null
    value: string | null
  }

  export type AppDataMaxAggregateOutputType = {
    id: string | null
    value: string | null
  }

  export type AppDataCountAggregateOutputType = {
    id: number
    value: number
    _all: number
  }


  export type AppDataMinAggregateInputType = {
    id?: true
    value?: true
  }

  export type AppDataMaxAggregateInputType = {
    id?: true
    value?: true
  }

  export type AppDataCountAggregateInputType = {
    id?: true
    value?: true
    _all?: true
  }

  export type AppDataAggregateArgs = {
    /**
     * Filter which AppData to aggregate.
     * 
    **/
    where?: AppDataWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppData to fetch.
     * 
    **/
    orderBy?: Enumerable<AppDataOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     * 
    **/
    cursor?: AppDataWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppData from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppData.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AppData
    **/
    _count?: true | AppDataCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AppDataMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AppDataMaxAggregateInputType
  }

  export type GetAppDataAggregateType<T extends AppDataAggregateArgs> = {
        [P in keyof T & keyof AggregateAppData]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAppData[P]>
      : GetScalarType<T[P], AggregateAppData[P]>
  }




  export type AppDataGroupByArgs = {
    where?: AppDataWhereInput
    orderBy?: Enumerable<AppDataOrderByWithAggregationInput>
    by: Array<AppDataScalarFieldEnum>
    having?: AppDataScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AppDataCountAggregateInputType | true
    _min?: AppDataMinAggregateInputType
    _max?: AppDataMaxAggregateInputType
  }


  export type AppDataGroupByOutputType = {
    id: string
    value: string
    _count: AppDataCountAggregateOutputType | null
    _min: AppDataMinAggregateOutputType | null
    _max: AppDataMaxAggregateOutputType | null
  }

  type GetAppDataGroupByPayload<T extends AppDataGroupByArgs> = PrismaPromise<
    Array<
      PickArray<AppDataGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AppDataGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AppDataGroupByOutputType[P]>
            : GetScalarType<T[P], AppDataGroupByOutputType[P]>
        }
      >
    >


  export type AppDataSelect = {
    id?: boolean
    value?: boolean
  }


  export type AppDataGetPayload<S extends boolean | null | undefined | AppDataArgs> =
    S extends { select: any, include: any } ? 'Please either choose `select` or `include`' :
    S extends true ? AppData :
    S extends undefined ? never :
    S extends { include: any } & (AppDataArgs | AppDataFindManyArgs)
    ? AppData 
    : S extends { select: any } & (AppDataArgs | AppDataFindManyArgs)
      ? {
    [P in TruthyKeys<S['select']>]:
    P extends keyof AppData ? AppData[P] : never
  } 
      : AppData


  type AppDataCountArgs = Merge<
    Omit<AppDataFindManyArgs, 'select' | 'include'> & {
      select?: AppDataCountAggregateInputType | true
    }
  >

  export interface AppDataDelegate<GlobalRejectSettings extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined> {
    /**
     * Find zero or one AppData that matches the filter.
     * @param {AppDataFindUniqueArgs} args - Arguments to find a AppData
     * @example
     * // Get one AppData
     * const appData = await prisma.appData.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends AppDataFindUniqueArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args: SelectSubset<T, AppDataFindUniqueArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findUnique', 'AppData'> extends True ? Prisma__AppDataClient<AppDataGetPayload<T>> : Prisma__AppDataClient<AppDataGetPayload<T> | null, null>

    /**
     * Find one AppData that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {AppDataFindUniqueOrThrowArgs} args - Arguments to find a AppData
     * @example
     * // Get one AppData
     * const appData = await prisma.appData.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends AppDataFindUniqueOrThrowArgs>(
      args?: SelectSubset<T, AppDataFindUniqueOrThrowArgs>
    ): Prisma__AppDataClient<AppDataGetPayload<T>>

    /**
     * Find the first AppData that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppDataFindFirstArgs} args - Arguments to find a AppData
     * @example
     * // Get one AppData
     * const appData = await prisma.appData.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends AppDataFindFirstArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args?: SelectSubset<T, AppDataFindFirstArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findFirst', 'AppData'> extends True ? Prisma__AppDataClient<AppDataGetPayload<T>> : Prisma__AppDataClient<AppDataGetPayload<T> | null, null>

    /**
     * Find the first AppData that matches the filter or
     * throw `NotFoundError` if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppDataFindFirstOrThrowArgs} args - Arguments to find a AppData
     * @example
     * // Get one AppData
     * const appData = await prisma.appData.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends AppDataFindFirstOrThrowArgs>(
      args?: SelectSubset<T, AppDataFindFirstOrThrowArgs>
    ): Prisma__AppDataClient<AppDataGetPayload<T>>

    /**
     * Find zero or more AppData that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppDataFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AppData
     * const appData = await prisma.appData.findMany()
     * 
     * // Get first 10 AppData
     * const appData = await prisma.appData.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const appDataWithIdOnly = await prisma.appData.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends AppDataFindManyArgs>(
      args?: SelectSubset<T, AppDataFindManyArgs>
    ): PrismaPromise<Array<AppDataGetPayload<T>>>

    /**
     * Create a AppData.
     * @param {AppDataCreateArgs} args - Arguments to create a AppData.
     * @example
     * // Create one AppData
     * const AppData = await prisma.appData.create({
     *   data: {
     *     // ... data to create a AppData
     *   }
     * })
     * 
    **/
    create<T extends AppDataCreateArgs>(
      args: SelectSubset<T, AppDataCreateArgs>
    ): Prisma__AppDataClient<AppDataGetPayload<T>>

    /**
     * Delete a AppData.
     * @param {AppDataDeleteArgs} args - Arguments to delete one AppData.
     * @example
     * // Delete one AppData
     * const AppData = await prisma.appData.delete({
     *   where: {
     *     // ... filter to delete one AppData
     *   }
     * })
     * 
    **/
    delete<T extends AppDataDeleteArgs>(
      args: SelectSubset<T, AppDataDeleteArgs>
    ): Prisma__AppDataClient<AppDataGetPayload<T>>

    /**
     * Update one AppData.
     * @param {AppDataUpdateArgs} args - Arguments to update one AppData.
     * @example
     * // Update one AppData
     * const appData = await prisma.appData.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends AppDataUpdateArgs>(
      args: SelectSubset<T, AppDataUpdateArgs>
    ): Prisma__AppDataClient<AppDataGetPayload<T>>

    /**
     * Delete zero or more AppData.
     * @param {AppDataDeleteManyArgs} args - Arguments to filter AppData to delete.
     * @example
     * // Delete a few AppData
     * const { count } = await prisma.appData.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends AppDataDeleteManyArgs>(
      args?: SelectSubset<T, AppDataDeleteManyArgs>
    ): PrismaPromise<BatchPayload>

    /**
     * Update zero or more AppData.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppDataUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AppData
     * const appData = await prisma.appData.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends AppDataUpdateManyArgs>(
      args: SelectSubset<T, AppDataUpdateManyArgs>
    ): PrismaPromise<BatchPayload>

    /**
     * Create or update one AppData.
     * @param {AppDataUpsertArgs} args - Arguments to update or create a AppData.
     * @example
     * // Update or create a AppData
     * const appData = await prisma.appData.upsert({
     *   create: {
     *     // ... data to create a AppData
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AppData we want to update
     *   }
     * })
    **/
    upsert<T extends AppDataUpsertArgs>(
      args: SelectSubset<T, AppDataUpsertArgs>
    ): Prisma__AppDataClient<AppDataGetPayload<T>>

    /**
     * Count the number of AppData.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppDataCountArgs} args - Arguments to filter AppData to count.
     * @example
     * // Count the number of AppData
     * const count = await prisma.appData.count({
     *   where: {
     *     // ... the filter for the AppData we want to count
     *   }
     * })
    **/
    count<T extends AppDataCountArgs>(
      args?: Subset<T, AppDataCountArgs>,
    ): PrismaPromise<
      T extends _Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AppDataCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AppData.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppDataAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AppDataAggregateArgs>(args: Subset<T, AppDataAggregateArgs>): PrismaPromise<GetAppDataAggregateType<T>>

    /**
     * Group by AppData.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppDataGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AppDataGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AppDataGroupByArgs['orderBy'] }
        : { orderBy?: AppDataGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends TupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AppDataGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAppDataGroupByPayload<T> : PrismaPromise<InputErrors>

  }

  /**
   * The delegate class that acts as a "Promise-like" for AppData.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export class Prisma__AppDataClient<T, Null = never> implements PrismaPromise<T> {
    [prisma]: true;
    private readonly _dmmf;
    private readonly _fetcher;
    private readonly _queryType;
    private readonly _rootField;
    private readonly _clientMethod;
    private readonly _args;
    private readonly _dataPath;
    private readonly _errorFormat;
    private readonly _measurePerformance?;
    private _isList;
    private _callsite;
    private _requestPromise?;
    constructor(_dmmf: runtime.DMMFClass, _fetcher: PrismaClientFetcher, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);
    readonly [Symbol.toStringTag]: 'PrismaClientPromise';


    private get _document();
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  }



  // Custom InputTypes

  /**
   * AppData base type for findUnique actions
   */
  export type AppDataFindUniqueArgsBase = {
    /**
     * Select specific fields to fetch from the AppData
     * 
    **/
    select?: AppDataSelect | null
    /**
     * Filter, which AppData to fetch.
     * 
    **/
    where: AppDataWhereUniqueInput
  }

  /**
   * AppData findUnique
   */
  export interface AppDataFindUniqueArgs extends AppDataFindUniqueArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findUniqueOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * AppData findUniqueOrThrow
   */
  export type AppDataFindUniqueOrThrowArgs = {
    /**
     * Select specific fields to fetch from the AppData
     * 
    **/
    select?: AppDataSelect | null
    /**
     * Filter, which AppData to fetch.
     * 
    **/
    where: AppDataWhereUniqueInput
  }


  /**
   * AppData base type for findFirst actions
   */
  export type AppDataFindFirstArgsBase = {
    /**
     * Select specific fields to fetch from the AppData
     * 
    **/
    select?: AppDataSelect | null
    /**
     * Filter, which AppData to fetch.
     * 
    **/
    where?: AppDataWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppData to fetch.
     * 
    **/
    orderBy?: Enumerable<AppDataOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AppData.
     * 
    **/
    cursor?: AppDataWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppData from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppData.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AppData.
     * 
    **/
    distinct?: Enumerable<AppDataScalarFieldEnum>
  }

  /**
   * AppData findFirst
   */
  export interface AppDataFindFirstArgs extends AppDataFindFirstArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findFirstOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * AppData findFirstOrThrow
   */
  export type AppDataFindFirstOrThrowArgs = {
    /**
     * Select specific fields to fetch from the AppData
     * 
    **/
    select?: AppDataSelect | null
    /**
     * Filter, which AppData to fetch.
     * 
    **/
    where?: AppDataWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppData to fetch.
     * 
    **/
    orderBy?: Enumerable<AppDataOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AppData.
     * 
    **/
    cursor?: AppDataWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppData from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppData.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AppData.
     * 
    **/
    distinct?: Enumerable<AppDataScalarFieldEnum>
  }


  /**
   * AppData findMany
   */
  export type AppDataFindManyArgs = {
    /**
     * Select specific fields to fetch from the AppData
     * 
    **/
    select?: AppDataSelect | null
    /**
     * Filter, which AppData to fetch.
     * 
    **/
    where?: AppDataWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppData to fetch.
     * 
    **/
    orderBy?: Enumerable<AppDataOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AppData.
     * 
    **/
    cursor?: AppDataWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppData from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppData.
     * 
    **/
    skip?: number
    distinct?: Enumerable<AppDataScalarFieldEnum>
  }


  /**
   * AppData create
   */
  export type AppDataCreateArgs = {
    /**
     * Select specific fields to fetch from the AppData
     * 
    **/
    select?: AppDataSelect | null
    /**
     * The data needed to create a AppData.
     * 
    **/
    data: XOR<AppDataCreateInput, AppDataUncheckedCreateInput>
  }


  /**
   * AppData update
   */
  export type AppDataUpdateArgs = {
    /**
     * Select specific fields to fetch from the AppData
     * 
    **/
    select?: AppDataSelect | null
    /**
     * The data needed to update a AppData.
     * 
    **/
    data: XOR<AppDataUpdateInput, AppDataUncheckedUpdateInput>
    /**
     * Choose, which AppData to update.
     * 
    **/
    where: AppDataWhereUniqueInput
  }


  /**
   * AppData updateMany
   */
  export type AppDataUpdateManyArgs = {
    /**
     * The data used to update AppData.
     * 
    **/
    data: XOR<AppDataUpdateManyMutationInput, AppDataUncheckedUpdateManyInput>
    /**
     * Filter which AppData to update
     * 
    **/
    where?: AppDataWhereInput
  }


  /**
   * AppData upsert
   */
  export type AppDataUpsertArgs = {
    /**
     * Select specific fields to fetch from the AppData
     * 
    **/
    select?: AppDataSelect | null
    /**
     * The filter to search for the AppData to update in case it exists.
     * 
    **/
    where: AppDataWhereUniqueInput
    /**
     * In case the AppData found by the `where` argument doesn't exist, create a new AppData with this data.
     * 
    **/
    create: XOR<AppDataCreateInput, AppDataUncheckedCreateInput>
    /**
     * In case the AppData was found with the provided `where` argument, update it with this data.
     * 
    **/
    update: XOR<AppDataUpdateInput, AppDataUncheckedUpdateInput>
  }


  /**
   * AppData delete
   */
  export type AppDataDeleteArgs = {
    /**
     * Select specific fields to fetch from the AppData
     * 
    **/
    select?: AppDataSelect | null
    /**
     * Filter which AppData to delete.
     * 
    **/
    where: AppDataWhereUniqueInput
  }


  /**
   * AppData deleteMany
   */
  export type AppDataDeleteManyArgs = {
    /**
     * Filter which AppData to delete
     * 
    **/
    where?: AppDataWhereInput
  }


  /**
   * AppData without action
   */
  export type AppDataArgs = {
    /**
     * Select specific fields to fetch from the AppData
     * 
    **/
    select?: AppDataSelect | null
  }



  /**
   * Model Track
   */


  export type AggregateTrack = {
    _count: TrackCountAggregateOutputType | null
    _avg: TrackAvgAggregateOutputType | null
    _sum: TrackSumAggregateOutputType | null
    _min: TrackMinAggregateOutputType | null
    _max: TrackMaxAggregateOutputType | null
  }

  export type TrackAvgAggregateOutputType = {
    id: number | null
  }

  export type TrackSumAggregateOutputType = {
    id: number | null
  }

  export type TrackMinAggregateOutputType = {
    id: number | null
    json: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TrackMaxAggregateOutputType = {
    id: number | null
    json: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type TrackCountAggregateOutputType = {
    id: number
    json: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type TrackAvgAggregateInputType = {
    id?: true
  }

  export type TrackSumAggregateInputType = {
    id?: true
  }

  export type TrackMinAggregateInputType = {
    id?: true
    json?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TrackMaxAggregateInputType = {
    id?: true
    json?: true
    createdAt?: true
    updatedAt?: true
  }

  export type TrackCountAggregateInputType = {
    id?: true
    json?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type TrackAggregateArgs = {
    /**
     * Filter which Track to aggregate.
     * 
    **/
    where?: TrackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tracks to fetch.
     * 
    **/
    orderBy?: Enumerable<TrackOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     * 
    **/
    cursor?: TrackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tracks from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tracks.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Tracks
    **/
    _count?: true | TrackCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: TrackAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: TrackSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: TrackMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: TrackMaxAggregateInputType
  }

  export type GetTrackAggregateType<T extends TrackAggregateArgs> = {
        [P in keyof T & keyof AggregateTrack]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateTrack[P]>
      : GetScalarType<T[P], AggregateTrack[P]>
  }




  export type TrackGroupByArgs = {
    where?: TrackWhereInput
    orderBy?: Enumerable<TrackOrderByWithAggregationInput>
    by: Array<TrackScalarFieldEnum>
    having?: TrackScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: TrackCountAggregateInputType | true
    _avg?: TrackAvgAggregateInputType
    _sum?: TrackSumAggregateInputType
    _min?: TrackMinAggregateInputType
    _max?: TrackMaxAggregateInputType
  }


  export type TrackGroupByOutputType = {
    id: number
    json: string
    createdAt: Date
    updatedAt: Date
    _count: TrackCountAggregateOutputType | null
    _avg: TrackAvgAggregateOutputType | null
    _sum: TrackSumAggregateOutputType | null
    _min: TrackMinAggregateOutputType | null
    _max: TrackMaxAggregateOutputType | null
  }

  type GetTrackGroupByPayload<T extends TrackGroupByArgs> = PrismaPromise<
    Array<
      PickArray<TrackGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof TrackGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], TrackGroupByOutputType[P]>
            : GetScalarType<T[P], TrackGroupByOutputType[P]>
        }
      >
    >


  export type TrackSelect = {
    id?: boolean
    json?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type TrackGetPayload<S extends boolean | null | undefined | TrackArgs> =
    S extends { select: any, include: any } ? 'Please either choose `select` or `include`' :
    S extends true ? Track :
    S extends undefined ? never :
    S extends { include: any } & (TrackArgs | TrackFindManyArgs)
    ? Track 
    : S extends { select: any } & (TrackArgs | TrackFindManyArgs)
      ? {
    [P in TruthyKeys<S['select']>]:
    P extends keyof Track ? Track[P] : never
  } 
      : Track


  type TrackCountArgs = Merge<
    Omit<TrackFindManyArgs, 'select' | 'include'> & {
      select?: TrackCountAggregateInputType | true
    }
  >

  export interface TrackDelegate<GlobalRejectSettings extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined> {
    /**
     * Find zero or one Track that matches the filter.
     * @param {TrackFindUniqueArgs} args - Arguments to find a Track
     * @example
     * // Get one Track
     * const track = await prisma.track.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends TrackFindUniqueArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args: SelectSubset<T, TrackFindUniqueArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findUnique', 'Track'> extends True ? Prisma__TrackClient<TrackGetPayload<T>> : Prisma__TrackClient<TrackGetPayload<T> | null, null>

    /**
     * Find one Track that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {TrackFindUniqueOrThrowArgs} args - Arguments to find a Track
     * @example
     * // Get one Track
     * const track = await prisma.track.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends TrackFindUniqueOrThrowArgs>(
      args?: SelectSubset<T, TrackFindUniqueOrThrowArgs>
    ): Prisma__TrackClient<TrackGetPayload<T>>

    /**
     * Find the first Track that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackFindFirstArgs} args - Arguments to find a Track
     * @example
     * // Get one Track
     * const track = await prisma.track.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends TrackFindFirstArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args?: SelectSubset<T, TrackFindFirstArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findFirst', 'Track'> extends True ? Prisma__TrackClient<TrackGetPayload<T>> : Prisma__TrackClient<TrackGetPayload<T> | null, null>

    /**
     * Find the first Track that matches the filter or
     * throw `NotFoundError` if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackFindFirstOrThrowArgs} args - Arguments to find a Track
     * @example
     * // Get one Track
     * const track = await prisma.track.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends TrackFindFirstOrThrowArgs>(
      args?: SelectSubset<T, TrackFindFirstOrThrowArgs>
    ): Prisma__TrackClient<TrackGetPayload<T>>

    /**
     * Find zero or more Tracks that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Tracks
     * const tracks = await prisma.track.findMany()
     * 
     * // Get first 10 Tracks
     * const tracks = await prisma.track.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const trackWithIdOnly = await prisma.track.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends TrackFindManyArgs>(
      args?: SelectSubset<T, TrackFindManyArgs>
    ): PrismaPromise<Array<TrackGetPayload<T>>>

    /**
     * Create a Track.
     * @param {TrackCreateArgs} args - Arguments to create a Track.
     * @example
     * // Create one Track
     * const Track = await prisma.track.create({
     *   data: {
     *     // ... data to create a Track
     *   }
     * })
     * 
    **/
    create<T extends TrackCreateArgs>(
      args: SelectSubset<T, TrackCreateArgs>
    ): Prisma__TrackClient<TrackGetPayload<T>>

    /**
     * Delete a Track.
     * @param {TrackDeleteArgs} args - Arguments to delete one Track.
     * @example
     * // Delete one Track
     * const Track = await prisma.track.delete({
     *   where: {
     *     // ... filter to delete one Track
     *   }
     * })
     * 
    **/
    delete<T extends TrackDeleteArgs>(
      args: SelectSubset<T, TrackDeleteArgs>
    ): Prisma__TrackClient<TrackGetPayload<T>>

    /**
     * Update one Track.
     * @param {TrackUpdateArgs} args - Arguments to update one Track.
     * @example
     * // Update one Track
     * const track = await prisma.track.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends TrackUpdateArgs>(
      args: SelectSubset<T, TrackUpdateArgs>
    ): Prisma__TrackClient<TrackGetPayload<T>>

    /**
     * Delete zero or more Tracks.
     * @param {TrackDeleteManyArgs} args - Arguments to filter Tracks to delete.
     * @example
     * // Delete a few Tracks
     * const { count } = await prisma.track.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends TrackDeleteManyArgs>(
      args?: SelectSubset<T, TrackDeleteManyArgs>
    ): PrismaPromise<BatchPayload>

    /**
     * Update zero or more Tracks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Tracks
     * const track = await prisma.track.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends TrackUpdateManyArgs>(
      args: SelectSubset<T, TrackUpdateManyArgs>
    ): PrismaPromise<BatchPayload>

    /**
     * Create or update one Track.
     * @param {TrackUpsertArgs} args - Arguments to update or create a Track.
     * @example
     * // Update or create a Track
     * const track = await prisma.track.upsert({
     *   create: {
     *     // ... data to create a Track
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Track we want to update
     *   }
     * })
    **/
    upsert<T extends TrackUpsertArgs>(
      args: SelectSubset<T, TrackUpsertArgs>
    ): Prisma__TrackClient<TrackGetPayload<T>>

    /**
     * Count the number of Tracks.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackCountArgs} args - Arguments to filter Tracks to count.
     * @example
     * // Count the number of Tracks
     * const count = await prisma.track.count({
     *   where: {
     *     // ... the filter for the Tracks we want to count
     *   }
     * })
    **/
    count<T extends TrackCountArgs>(
      args?: Subset<T, TrackCountArgs>,
    ): PrismaPromise<
      T extends _Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], TrackCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Track.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends TrackAggregateArgs>(args: Subset<T, TrackAggregateArgs>): PrismaPromise<GetTrackAggregateType<T>>

    /**
     * Group by Track.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {TrackGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends TrackGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: TrackGroupByArgs['orderBy'] }
        : { orderBy?: TrackGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends TupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, TrackGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTrackGroupByPayload<T> : PrismaPromise<InputErrors>

  }

  /**
   * The delegate class that acts as a "Promise-like" for Track.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export class Prisma__TrackClient<T, Null = never> implements PrismaPromise<T> {
    [prisma]: true;
    private readonly _dmmf;
    private readonly _fetcher;
    private readonly _queryType;
    private readonly _rootField;
    private readonly _clientMethod;
    private readonly _args;
    private readonly _dataPath;
    private readonly _errorFormat;
    private readonly _measurePerformance?;
    private _isList;
    private _callsite;
    private _requestPromise?;
    constructor(_dmmf: runtime.DMMFClass, _fetcher: PrismaClientFetcher, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);
    readonly [Symbol.toStringTag]: 'PrismaClientPromise';


    private get _document();
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  }



  // Custom InputTypes

  /**
   * Track base type for findUnique actions
   */
  export type TrackFindUniqueArgsBase = {
    /**
     * Select specific fields to fetch from the Track
     * 
    **/
    select?: TrackSelect | null
    /**
     * Filter, which Track to fetch.
     * 
    **/
    where: TrackWhereUniqueInput
  }

  /**
   * Track findUnique
   */
  export interface TrackFindUniqueArgs extends TrackFindUniqueArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findUniqueOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Track findUniqueOrThrow
   */
  export type TrackFindUniqueOrThrowArgs = {
    /**
     * Select specific fields to fetch from the Track
     * 
    **/
    select?: TrackSelect | null
    /**
     * Filter, which Track to fetch.
     * 
    **/
    where: TrackWhereUniqueInput
  }


  /**
   * Track base type for findFirst actions
   */
  export type TrackFindFirstArgsBase = {
    /**
     * Select specific fields to fetch from the Track
     * 
    **/
    select?: TrackSelect | null
    /**
     * Filter, which Track to fetch.
     * 
    **/
    where?: TrackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tracks to fetch.
     * 
    **/
    orderBy?: Enumerable<TrackOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tracks.
     * 
    **/
    cursor?: TrackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tracks from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tracks.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tracks.
     * 
    **/
    distinct?: Enumerable<TrackScalarFieldEnum>
  }

  /**
   * Track findFirst
   */
  export interface TrackFindFirstArgs extends TrackFindFirstArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findFirstOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Track findFirstOrThrow
   */
  export type TrackFindFirstOrThrowArgs = {
    /**
     * Select specific fields to fetch from the Track
     * 
    **/
    select?: TrackSelect | null
    /**
     * Filter, which Track to fetch.
     * 
    **/
    where?: TrackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tracks to fetch.
     * 
    **/
    orderBy?: Enumerable<TrackOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Tracks.
     * 
    **/
    cursor?: TrackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tracks from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tracks.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Tracks.
     * 
    **/
    distinct?: Enumerable<TrackScalarFieldEnum>
  }


  /**
   * Track findMany
   */
  export type TrackFindManyArgs = {
    /**
     * Select specific fields to fetch from the Track
     * 
    **/
    select?: TrackSelect | null
    /**
     * Filter, which Tracks to fetch.
     * 
    **/
    where?: TrackWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Tracks to fetch.
     * 
    **/
    orderBy?: Enumerable<TrackOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Tracks.
     * 
    **/
    cursor?: TrackWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Tracks from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Tracks.
     * 
    **/
    skip?: number
    distinct?: Enumerable<TrackScalarFieldEnum>
  }


  /**
   * Track create
   */
  export type TrackCreateArgs = {
    /**
     * Select specific fields to fetch from the Track
     * 
    **/
    select?: TrackSelect | null
    /**
     * The data needed to create a Track.
     * 
    **/
    data: XOR<TrackCreateInput, TrackUncheckedCreateInput>
  }


  /**
   * Track update
   */
  export type TrackUpdateArgs = {
    /**
     * Select specific fields to fetch from the Track
     * 
    **/
    select?: TrackSelect | null
    /**
     * The data needed to update a Track.
     * 
    **/
    data: XOR<TrackUpdateInput, TrackUncheckedUpdateInput>
    /**
     * Choose, which Track to update.
     * 
    **/
    where: TrackWhereUniqueInput
  }


  /**
   * Track updateMany
   */
  export type TrackUpdateManyArgs = {
    /**
     * The data used to update Tracks.
     * 
    **/
    data: XOR<TrackUpdateManyMutationInput, TrackUncheckedUpdateManyInput>
    /**
     * Filter which Tracks to update
     * 
    **/
    where?: TrackWhereInput
  }


  /**
   * Track upsert
   */
  export type TrackUpsertArgs = {
    /**
     * Select specific fields to fetch from the Track
     * 
    **/
    select?: TrackSelect | null
    /**
     * The filter to search for the Track to update in case it exists.
     * 
    **/
    where: TrackWhereUniqueInput
    /**
     * In case the Track found by the `where` argument doesn't exist, create a new Track with this data.
     * 
    **/
    create: XOR<TrackCreateInput, TrackUncheckedCreateInput>
    /**
     * In case the Track was found with the provided `where` argument, update it with this data.
     * 
    **/
    update: XOR<TrackUpdateInput, TrackUncheckedUpdateInput>
  }


  /**
   * Track delete
   */
  export type TrackDeleteArgs = {
    /**
     * Select specific fields to fetch from the Track
     * 
    **/
    select?: TrackSelect | null
    /**
     * Filter which Track to delete.
     * 
    **/
    where: TrackWhereUniqueInput
  }


  /**
   * Track deleteMany
   */
  export type TrackDeleteManyArgs = {
    /**
     * Filter which Tracks to delete
     * 
    **/
    where?: TrackWhereInput
  }


  /**
   * Track without action
   */
  export type TrackArgs = {
    /**
     * Select specific fields to fetch from the Track
     * 
    **/
    select?: TrackSelect | null
  }



  /**
   * Model Album
   */


  export type AggregateAlbum = {
    _count: AlbumCountAggregateOutputType | null
    _avg: AlbumAvgAggregateOutputType | null
    _sum: AlbumSumAggregateOutputType | null
    _min: AlbumMinAggregateOutputType | null
    _max: AlbumMaxAggregateOutputType | null
  }

  export type AlbumAvgAggregateOutputType = {
    id: number | null
  }

  export type AlbumSumAggregateOutputType = {
    id: number | null
  }

  export type AlbumMinAggregateOutputType = {
    id: number | null
    json: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AlbumMaxAggregateOutputType = {
    id: number | null
    json: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AlbumCountAggregateOutputType = {
    id: number
    json: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AlbumAvgAggregateInputType = {
    id?: true
  }

  export type AlbumSumAggregateInputType = {
    id?: true
  }

  export type AlbumMinAggregateInputType = {
    id?: true
    json?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AlbumMaxAggregateInputType = {
    id?: true
    json?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AlbumCountAggregateInputType = {
    id?: true
    json?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AlbumAggregateArgs = {
    /**
     * Filter which Album to aggregate.
     * 
    **/
    where?: AlbumWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Albums to fetch.
     * 
    **/
    orderBy?: Enumerable<AlbumOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     * 
    **/
    cursor?: AlbumWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Albums from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Albums.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Albums
    **/
    _count?: true | AlbumCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AlbumAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AlbumSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AlbumMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AlbumMaxAggregateInputType
  }

  export type GetAlbumAggregateType<T extends AlbumAggregateArgs> = {
        [P in keyof T & keyof AggregateAlbum]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAlbum[P]>
      : GetScalarType<T[P], AggregateAlbum[P]>
  }




  export type AlbumGroupByArgs = {
    where?: AlbumWhereInput
    orderBy?: Enumerable<AlbumOrderByWithAggregationInput>
    by: Array<AlbumScalarFieldEnum>
    having?: AlbumScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AlbumCountAggregateInputType | true
    _avg?: AlbumAvgAggregateInputType
    _sum?: AlbumSumAggregateInputType
    _min?: AlbumMinAggregateInputType
    _max?: AlbumMaxAggregateInputType
  }


  export type AlbumGroupByOutputType = {
    id: number
    json: string
    createdAt: Date
    updatedAt: Date
    _count: AlbumCountAggregateOutputType | null
    _avg: AlbumAvgAggregateOutputType | null
    _sum: AlbumSumAggregateOutputType | null
    _min: AlbumMinAggregateOutputType | null
    _max: AlbumMaxAggregateOutputType | null
  }

  type GetAlbumGroupByPayload<T extends AlbumGroupByArgs> = PrismaPromise<
    Array<
      PickArray<AlbumGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AlbumGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AlbumGroupByOutputType[P]>
            : GetScalarType<T[P], AlbumGroupByOutputType[P]>
        }
      >
    >


  export type AlbumSelect = {
    id?: boolean
    json?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type AlbumGetPayload<S extends boolean | null | undefined | AlbumArgs> =
    S extends { select: any, include: any } ? 'Please either choose `select` or `include`' :
    S extends true ? Album :
    S extends undefined ? never :
    S extends { include: any } & (AlbumArgs | AlbumFindManyArgs)
    ? Album 
    : S extends { select: any } & (AlbumArgs | AlbumFindManyArgs)
      ? {
    [P in TruthyKeys<S['select']>]:
    P extends keyof Album ? Album[P] : never
  } 
      : Album


  type AlbumCountArgs = Merge<
    Omit<AlbumFindManyArgs, 'select' | 'include'> & {
      select?: AlbumCountAggregateInputType | true
    }
  >

  export interface AlbumDelegate<GlobalRejectSettings extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined> {
    /**
     * Find zero or one Album that matches the filter.
     * @param {AlbumFindUniqueArgs} args - Arguments to find a Album
     * @example
     * // Get one Album
     * const album = await prisma.album.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends AlbumFindUniqueArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args: SelectSubset<T, AlbumFindUniqueArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findUnique', 'Album'> extends True ? Prisma__AlbumClient<AlbumGetPayload<T>> : Prisma__AlbumClient<AlbumGetPayload<T> | null, null>

    /**
     * Find one Album that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {AlbumFindUniqueOrThrowArgs} args - Arguments to find a Album
     * @example
     * // Get one Album
     * const album = await prisma.album.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends AlbumFindUniqueOrThrowArgs>(
      args?: SelectSubset<T, AlbumFindUniqueOrThrowArgs>
    ): Prisma__AlbumClient<AlbumGetPayload<T>>

    /**
     * Find the first Album that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlbumFindFirstArgs} args - Arguments to find a Album
     * @example
     * // Get one Album
     * const album = await prisma.album.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends AlbumFindFirstArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args?: SelectSubset<T, AlbumFindFirstArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findFirst', 'Album'> extends True ? Prisma__AlbumClient<AlbumGetPayload<T>> : Prisma__AlbumClient<AlbumGetPayload<T> | null, null>

    /**
     * Find the first Album that matches the filter or
     * throw `NotFoundError` if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlbumFindFirstOrThrowArgs} args - Arguments to find a Album
     * @example
     * // Get one Album
     * const album = await prisma.album.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends AlbumFindFirstOrThrowArgs>(
      args?: SelectSubset<T, AlbumFindFirstOrThrowArgs>
    ): Prisma__AlbumClient<AlbumGetPayload<T>>

    /**
     * Find zero or more Albums that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlbumFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Albums
     * const albums = await prisma.album.findMany()
     * 
     * // Get first 10 Albums
     * const albums = await prisma.album.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const albumWithIdOnly = await prisma.album.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends AlbumFindManyArgs>(
      args?: SelectSubset<T, AlbumFindManyArgs>
    ): PrismaPromise<Array<AlbumGetPayload<T>>>

    /**
     * Create a Album.
     * @param {AlbumCreateArgs} args - Arguments to create a Album.
     * @example
     * // Create one Album
     * const Album = await prisma.album.create({
     *   data: {
     *     // ... data to create a Album
     *   }
     * })
     * 
    **/
    create<T extends AlbumCreateArgs>(
      args: SelectSubset<T, AlbumCreateArgs>
    ): Prisma__AlbumClient<AlbumGetPayload<T>>

    /**
     * Delete a Album.
     * @param {AlbumDeleteArgs} args - Arguments to delete one Album.
     * @example
     * // Delete one Album
     * const Album = await prisma.album.delete({
     *   where: {
     *     // ... filter to delete one Album
     *   }
     * })
     * 
    **/
    delete<T extends AlbumDeleteArgs>(
      args: SelectSubset<T, AlbumDeleteArgs>
    ): Prisma__AlbumClient<AlbumGetPayload<T>>

    /**
     * Update one Album.
     * @param {AlbumUpdateArgs} args - Arguments to update one Album.
     * @example
     * // Update one Album
     * const album = await prisma.album.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends AlbumUpdateArgs>(
      args: SelectSubset<T, AlbumUpdateArgs>
    ): Prisma__AlbumClient<AlbumGetPayload<T>>

    /**
     * Delete zero or more Albums.
     * @param {AlbumDeleteManyArgs} args - Arguments to filter Albums to delete.
     * @example
     * // Delete a few Albums
     * const { count } = await prisma.album.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends AlbumDeleteManyArgs>(
      args?: SelectSubset<T, AlbumDeleteManyArgs>
    ): PrismaPromise<BatchPayload>

    /**
     * Update zero or more Albums.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlbumUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Albums
     * const album = await prisma.album.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends AlbumUpdateManyArgs>(
      args: SelectSubset<T, AlbumUpdateManyArgs>
    ): PrismaPromise<BatchPayload>

    /**
     * Create or update one Album.
     * @param {AlbumUpsertArgs} args - Arguments to update or create a Album.
     * @example
     * // Update or create a Album
     * const album = await prisma.album.upsert({
     *   create: {
     *     // ... data to create a Album
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Album we want to update
     *   }
     * })
    **/
    upsert<T extends AlbumUpsertArgs>(
      args: SelectSubset<T, AlbumUpsertArgs>
    ): Prisma__AlbumClient<AlbumGetPayload<T>>

    /**
     * Count the number of Albums.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlbumCountArgs} args - Arguments to filter Albums to count.
     * @example
     * // Count the number of Albums
     * const count = await prisma.album.count({
     *   where: {
     *     // ... the filter for the Albums we want to count
     *   }
     * })
    **/
    count<T extends AlbumCountArgs>(
      args?: Subset<T, AlbumCountArgs>,
    ): PrismaPromise<
      T extends _Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AlbumCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Album.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlbumAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AlbumAggregateArgs>(args: Subset<T, AlbumAggregateArgs>): PrismaPromise<GetAlbumAggregateType<T>>

    /**
     * Group by Album.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AlbumGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AlbumGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AlbumGroupByArgs['orderBy'] }
        : { orderBy?: AlbumGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends TupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AlbumGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAlbumGroupByPayload<T> : PrismaPromise<InputErrors>

  }

  /**
   * The delegate class that acts as a "Promise-like" for Album.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export class Prisma__AlbumClient<T, Null = never> implements PrismaPromise<T> {
    [prisma]: true;
    private readonly _dmmf;
    private readonly _fetcher;
    private readonly _queryType;
    private readonly _rootField;
    private readonly _clientMethod;
    private readonly _args;
    private readonly _dataPath;
    private readonly _errorFormat;
    private readonly _measurePerformance?;
    private _isList;
    private _callsite;
    private _requestPromise?;
    constructor(_dmmf: runtime.DMMFClass, _fetcher: PrismaClientFetcher, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);
    readonly [Symbol.toStringTag]: 'PrismaClientPromise';


    private get _document();
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  }



  // Custom InputTypes

  /**
   * Album base type for findUnique actions
   */
  export type AlbumFindUniqueArgsBase = {
    /**
     * Select specific fields to fetch from the Album
     * 
    **/
    select?: AlbumSelect | null
    /**
     * Filter, which Album to fetch.
     * 
    **/
    where: AlbumWhereUniqueInput
  }

  /**
   * Album findUnique
   */
  export interface AlbumFindUniqueArgs extends AlbumFindUniqueArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findUniqueOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Album findUniqueOrThrow
   */
  export type AlbumFindUniqueOrThrowArgs = {
    /**
     * Select specific fields to fetch from the Album
     * 
    **/
    select?: AlbumSelect | null
    /**
     * Filter, which Album to fetch.
     * 
    **/
    where: AlbumWhereUniqueInput
  }


  /**
   * Album base type for findFirst actions
   */
  export type AlbumFindFirstArgsBase = {
    /**
     * Select specific fields to fetch from the Album
     * 
    **/
    select?: AlbumSelect | null
    /**
     * Filter, which Album to fetch.
     * 
    **/
    where?: AlbumWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Albums to fetch.
     * 
    **/
    orderBy?: Enumerable<AlbumOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Albums.
     * 
    **/
    cursor?: AlbumWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Albums from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Albums.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Albums.
     * 
    **/
    distinct?: Enumerable<AlbumScalarFieldEnum>
  }

  /**
   * Album findFirst
   */
  export interface AlbumFindFirstArgs extends AlbumFindFirstArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findFirstOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Album findFirstOrThrow
   */
  export type AlbumFindFirstOrThrowArgs = {
    /**
     * Select specific fields to fetch from the Album
     * 
    **/
    select?: AlbumSelect | null
    /**
     * Filter, which Album to fetch.
     * 
    **/
    where?: AlbumWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Albums to fetch.
     * 
    **/
    orderBy?: Enumerable<AlbumOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Albums.
     * 
    **/
    cursor?: AlbumWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Albums from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Albums.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Albums.
     * 
    **/
    distinct?: Enumerable<AlbumScalarFieldEnum>
  }


  /**
   * Album findMany
   */
  export type AlbumFindManyArgs = {
    /**
     * Select specific fields to fetch from the Album
     * 
    **/
    select?: AlbumSelect | null
    /**
     * Filter, which Albums to fetch.
     * 
    **/
    where?: AlbumWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Albums to fetch.
     * 
    **/
    orderBy?: Enumerable<AlbumOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Albums.
     * 
    **/
    cursor?: AlbumWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Albums from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Albums.
     * 
    **/
    skip?: number
    distinct?: Enumerable<AlbumScalarFieldEnum>
  }


  /**
   * Album create
   */
  export type AlbumCreateArgs = {
    /**
     * Select specific fields to fetch from the Album
     * 
    **/
    select?: AlbumSelect | null
    /**
     * The data needed to create a Album.
     * 
    **/
    data: XOR<AlbumCreateInput, AlbumUncheckedCreateInput>
  }


  /**
   * Album update
   */
  export type AlbumUpdateArgs = {
    /**
     * Select specific fields to fetch from the Album
     * 
    **/
    select?: AlbumSelect | null
    /**
     * The data needed to update a Album.
     * 
    **/
    data: XOR<AlbumUpdateInput, AlbumUncheckedUpdateInput>
    /**
     * Choose, which Album to update.
     * 
    **/
    where: AlbumWhereUniqueInput
  }


  /**
   * Album updateMany
   */
  export type AlbumUpdateManyArgs = {
    /**
     * The data used to update Albums.
     * 
    **/
    data: XOR<AlbumUpdateManyMutationInput, AlbumUncheckedUpdateManyInput>
    /**
     * Filter which Albums to update
     * 
    **/
    where?: AlbumWhereInput
  }


  /**
   * Album upsert
   */
  export type AlbumUpsertArgs = {
    /**
     * Select specific fields to fetch from the Album
     * 
    **/
    select?: AlbumSelect | null
    /**
     * The filter to search for the Album to update in case it exists.
     * 
    **/
    where: AlbumWhereUniqueInput
    /**
     * In case the Album found by the `where` argument doesn't exist, create a new Album with this data.
     * 
    **/
    create: XOR<AlbumCreateInput, AlbumUncheckedCreateInput>
    /**
     * In case the Album was found with the provided `where` argument, update it with this data.
     * 
    **/
    update: XOR<AlbumUpdateInput, AlbumUncheckedUpdateInput>
  }


  /**
   * Album delete
   */
  export type AlbumDeleteArgs = {
    /**
     * Select specific fields to fetch from the Album
     * 
    **/
    select?: AlbumSelect | null
    /**
     * Filter which Album to delete.
     * 
    **/
    where: AlbumWhereUniqueInput
  }


  /**
   * Album deleteMany
   */
  export type AlbumDeleteManyArgs = {
    /**
     * Filter which Albums to delete
     * 
    **/
    where?: AlbumWhereInput
  }


  /**
   * Album without action
   */
  export type AlbumArgs = {
    /**
     * Select specific fields to fetch from the Album
     * 
    **/
    select?: AlbumSelect | null
  }



  /**
   * Model Artist
   */


  export type AggregateArtist = {
    _count: ArtistCountAggregateOutputType | null
    _avg: ArtistAvgAggregateOutputType | null
    _sum: ArtistSumAggregateOutputType | null
    _min: ArtistMinAggregateOutputType | null
    _max: ArtistMaxAggregateOutputType | null
  }

  export type ArtistAvgAggregateOutputType = {
    id: number | null
  }

  export type ArtistSumAggregateOutputType = {
    id: number | null
  }

  export type ArtistMinAggregateOutputType = {
    id: number | null
    json: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ArtistMaxAggregateOutputType = {
    id: number | null
    json: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ArtistCountAggregateOutputType = {
    id: number
    json: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ArtistAvgAggregateInputType = {
    id?: true
  }

  export type ArtistSumAggregateInputType = {
    id?: true
  }

  export type ArtistMinAggregateInputType = {
    id?: true
    json?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ArtistMaxAggregateInputType = {
    id?: true
    json?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ArtistCountAggregateInputType = {
    id?: true
    json?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ArtistAggregateArgs = {
    /**
     * Filter which Artist to aggregate.
     * 
    **/
    where?: ArtistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Artists to fetch.
     * 
    **/
    orderBy?: Enumerable<ArtistOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     * 
    **/
    cursor?: ArtistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Artists from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Artists.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Artists
    **/
    _count?: true | ArtistCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ArtistAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ArtistSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ArtistMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ArtistMaxAggregateInputType
  }

  export type GetArtistAggregateType<T extends ArtistAggregateArgs> = {
        [P in keyof T & keyof AggregateArtist]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateArtist[P]>
      : GetScalarType<T[P], AggregateArtist[P]>
  }




  export type ArtistGroupByArgs = {
    where?: ArtistWhereInput
    orderBy?: Enumerable<ArtistOrderByWithAggregationInput>
    by: Array<ArtistScalarFieldEnum>
    having?: ArtistScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ArtistCountAggregateInputType | true
    _avg?: ArtistAvgAggregateInputType
    _sum?: ArtistSumAggregateInputType
    _min?: ArtistMinAggregateInputType
    _max?: ArtistMaxAggregateInputType
  }


  export type ArtistGroupByOutputType = {
    id: number
    json: string
    createdAt: Date
    updatedAt: Date
    _count: ArtistCountAggregateOutputType | null
    _avg: ArtistAvgAggregateOutputType | null
    _sum: ArtistSumAggregateOutputType | null
    _min: ArtistMinAggregateOutputType | null
    _max: ArtistMaxAggregateOutputType | null
  }

  type GetArtistGroupByPayload<T extends ArtistGroupByArgs> = PrismaPromise<
    Array<
      PickArray<ArtistGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ArtistGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ArtistGroupByOutputType[P]>
            : GetScalarType<T[P], ArtistGroupByOutputType[P]>
        }
      >
    >


  export type ArtistSelect = {
    id?: boolean
    json?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type ArtistGetPayload<S extends boolean | null | undefined | ArtistArgs> =
    S extends { select: any, include: any } ? 'Please either choose `select` or `include`' :
    S extends true ? Artist :
    S extends undefined ? never :
    S extends { include: any } & (ArtistArgs | ArtistFindManyArgs)
    ? Artist 
    : S extends { select: any } & (ArtistArgs | ArtistFindManyArgs)
      ? {
    [P in TruthyKeys<S['select']>]:
    P extends keyof Artist ? Artist[P] : never
  } 
      : Artist


  type ArtistCountArgs = Merge<
    Omit<ArtistFindManyArgs, 'select' | 'include'> & {
      select?: ArtistCountAggregateInputType | true
    }
  >

  export interface ArtistDelegate<GlobalRejectSettings extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined> {
    /**
     * Find zero or one Artist that matches the filter.
     * @param {ArtistFindUniqueArgs} args - Arguments to find a Artist
     * @example
     * // Get one Artist
     * const artist = await prisma.artist.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends ArtistFindUniqueArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args: SelectSubset<T, ArtistFindUniqueArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findUnique', 'Artist'> extends True ? Prisma__ArtistClient<ArtistGetPayload<T>> : Prisma__ArtistClient<ArtistGetPayload<T> | null, null>

    /**
     * Find one Artist that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {ArtistFindUniqueOrThrowArgs} args - Arguments to find a Artist
     * @example
     * // Get one Artist
     * const artist = await prisma.artist.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends ArtistFindUniqueOrThrowArgs>(
      args?: SelectSubset<T, ArtistFindUniqueOrThrowArgs>
    ): Prisma__ArtistClient<ArtistGetPayload<T>>

    /**
     * Find the first Artist that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ArtistFindFirstArgs} args - Arguments to find a Artist
     * @example
     * // Get one Artist
     * const artist = await prisma.artist.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends ArtistFindFirstArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args?: SelectSubset<T, ArtistFindFirstArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findFirst', 'Artist'> extends True ? Prisma__ArtistClient<ArtistGetPayload<T>> : Prisma__ArtistClient<ArtistGetPayload<T> | null, null>

    /**
     * Find the first Artist that matches the filter or
     * throw `NotFoundError` if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ArtistFindFirstOrThrowArgs} args - Arguments to find a Artist
     * @example
     * // Get one Artist
     * const artist = await prisma.artist.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends ArtistFindFirstOrThrowArgs>(
      args?: SelectSubset<T, ArtistFindFirstOrThrowArgs>
    ): Prisma__ArtistClient<ArtistGetPayload<T>>

    /**
     * Find zero or more Artists that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ArtistFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Artists
     * const artists = await prisma.artist.findMany()
     * 
     * // Get first 10 Artists
     * const artists = await prisma.artist.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const artistWithIdOnly = await prisma.artist.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends ArtistFindManyArgs>(
      args?: SelectSubset<T, ArtistFindManyArgs>
    ): PrismaPromise<Array<ArtistGetPayload<T>>>

    /**
     * Create a Artist.
     * @param {ArtistCreateArgs} args - Arguments to create a Artist.
     * @example
     * // Create one Artist
     * const Artist = await prisma.artist.create({
     *   data: {
     *     // ... data to create a Artist
     *   }
     * })
     * 
    **/
    create<T extends ArtistCreateArgs>(
      args: SelectSubset<T, ArtistCreateArgs>
    ): Prisma__ArtistClient<ArtistGetPayload<T>>

    /**
     * Delete a Artist.
     * @param {ArtistDeleteArgs} args - Arguments to delete one Artist.
     * @example
     * // Delete one Artist
     * const Artist = await prisma.artist.delete({
     *   where: {
     *     // ... filter to delete one Artist
     *   }
     * })
     * 
    **/
    delete<T extends ArtistDeleteArgs>(
      args: SelectSubset<T, ArtistDeleteArgs>
    ): Prisma__ArtistClient<ArtistGetPayload<T>>

    /**
     * Update one Artist.
     * @param {ArtistUpdateArgs} args - Arguments to update one Artist.
     * @example
     * // Update one Artist
     * const artist = await prisma.artist.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends ArtistUpdateArgs>(
      args: SelectSubset<T, ArtistUpdateArgs>
    ): Prisma__ArtistClient<ArtistGetPayload<T>>

    /**
     * Delete zero or more Artists.
     * @param {ArtistDeleteManyArgs} args - Arguments to filter Artists to delete.
     * @example
     * // Delete a few Artists
     * const { count } = await prisma.artist.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends ArtistDeleteManyArgs>(
      args?: SelectSubset<T, ArtistDeleteManyArgs>
    ): PrismaPromise<BatchPayload>

    /**
     * Update zero or more Artists.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ArtistUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Artists
     * const artist = await prisma.artist.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends ArtistUpdateManyArgs>(
      args: SelectSubset<T, ArtistUpdateManyArgs>
    ): PrismaPromise<BatchPayload>

    /**
     * Create or update one Artist.
     * @param {ArtistUpsertArgs} args - Arguments to update or create a Artist.
     * @example
     * // Update or create a Artist
     * const artist = await prisma.artist.upsert({
     *   create: {
     *     // ... data to create a Artist
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Artist we want to update
     *   }
     * })
    **/
    upsert<T extends ArtistUpsertArgs>(
      args: SelectSubset<T, ArtistUpsertArgs>
    ): Prisma__ArtistClient<ArtistGetPayload<T>>

    /**
     * Count the number of Artists.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ArtistCountArgs} args - Arguments to filter Artists to count.
     * @example
     * // Count the number of Artists
     * const count = await prisma.artist.count({
     *   where: {
     *     // ... the filter for the Artists we want to count
     *   }
     * })
    **/
    count<T extends ArtistCountArgs>(
      args?: Subset<T, ArtistCountArgs>,
    ): PrismaPromise<
      T extends _Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ArtistCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Artist.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ArtistAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ArtistAggregateArgs>(args: Subset<T, ArtistAggregateArgs>): PrismaPromise<GetArtistAggregateType<T>>

    /**
     * Group by Artist.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ArtistGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ArtistGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ArtistGroupByArgs['orderBy'] }
        : { orderBy?: ArtistGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends TupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ArtistGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetArtistGroupByPayload<T> : PrismaPromise<InputErrors>

  }

  /**
   * The delegate class that acts as a "Promise-like" for Artist.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export class Prisma__ArtistClient<T, Null = never> implements PrismaPromise<T> {
    [prisma]: true;
    private readonly _dmmf;
    private readonly _fetcher;
    private readonly _queryType;
    private readonly _rootField;
    private readonly _clientMethod;
    private readonly _args;
    private readonly _dataPath;
    private readonly _errorFormat;
    private readonly _measurePerformance?;
    private _isList;
    private _callsite;
    private _requestPromise?;
    constructor(_dmmf: runtime.DMMFClass, _fetcher: PrismaClientFetcher, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);
    readonly [Symbol.toStringTag]: 'PrismaClientPromise';


    private get _document();
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  }



  // Custom InputTypes

  /**
   * Artist base type for findUnique actions
   */
  export type ArtistFindUniqueArgsBase = {
    /**
     * Select specific fields to fetch from the Artist
     * 
    **/
    select?: ArtistSelect | null
    /**
     * Filter, which Artist to fetch.
     * 
    **/
    where: ArtistWhereUniqueInput
  }

  /**
   * Artist findUnique
   */
  export interface ArtistFindUniqueArgs extends ArtistFindUniqueArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findUniqueOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Artist findUniqueOrThrow
   */
  export type ArtistFindUniqueOrThrowArgs = {
    /**
     * Select specific fields to fetch from the Artist
     * 
    **/
    select?: ArtistSelect | null
    /**
     * Filter, which Artist to fetch.
     * 
    **/
    where: ArtistWhereUniqueInput
  }


  /**
   * Artist base type for findFirst actions
   */
  export type ArtistFindFirstArgsBase = {
    /**
     * Select specific fields to fetch from the Artist
     * 
    **/
    select?: ArtistSelect | null
    /**
     * Filter, which Artist to fetch.
     * 
    **/
    where?: ArtistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Artists to fetch.
     * 
    **/
    orderBy?: Enumerable<ArtistOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Artists.
     * 
    **/
    cursor?: ArtistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Artists from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Artists.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Artists.
     * 
    **/
    distinct?: Enumerable<ArtistScalarFieldEnum>
  }

  /**
   * Artist findFirst
   */
  export interface ArtistFindFirstArgs extends ArtistFindFirstArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findFirstOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Artist findFirstOrThrow
   */
  export type ArtistFindFirstOrThrowArgs = {
    /**
     * Select specific fields to fetch from the Artist
     * 
    **/
    select?: ArtistSelect | null
    /**
     * Filter, which Artist to fetch.
     * 
    **/
    where?: ArtistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Artists to fetch.
     * 
    **/
    orderBy?: Enumerable<ArtistOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Artists.
     * 
    **/
    cursor?: ArtistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Artists from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Artists.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Artists.
     * 
    **/
    distinct?: Enumerable<ArtistScalarFieldEnum>
  }


  /**
   * Artist findMany
   */
  export type ArtistFindManyArgs = {
    /**
     * Select specific fields to fetch from the Artist
     * 
    **/
    select?: ArtistSelect | null
    /**
     * Filter, which Artists to fetch.
     * 
    **/
    where?: ArtistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Artists to fetch.
     * 
    **/
    orderBy?: Enumerable<ArtistOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Artists.
     * 
    **/
    cursor?: ArtistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Artists from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Artists.
     * 
    **/
    skip?: number
    distinct?: Enumerable<ArtistScalarFieldEnum>
  }


  /**
   * Artist create
   */
  export type ArtistCreateArgs = {
    /**
     * Select specific fields to fetch from the Artist
     * 
    **/
    select?: ArtistSelect | null
    /**
     * The data needed to create a Artist.
     * 
    **/
    data: XOR<ArtistCreateInput, ArtistUncheckedCreateInput>
  }


  /**
   * Artist update
   */
  export type ArtistUpdateArgs = {
    /**
     * Select specific fields to fetch from the Artist
     * 
    **/
    select?: ArtistSelect | null
    /**
     * The data needed to update a Artist.
     * 
    **/
    data: XOR<ArtistUpdateInput, ArtistUncheckedUpdateInput>
    /**
     * Choose, which Artist to update.
     * 
    **/
    where: ArtistWhereUniqueInput
  }


  /**
   * Artist updateMany
   */
  export type ArtistUpdateManyArgs = {
    /**
     * The data used to update Artists.
     * 
    **/
    data: XOR<ArtistUpdateManyMutationInput, ArtistUncheckedUpdateManyInput>
    /**
     * Filter which Artists to update
     * 
    **/
    where?: ArtistWhereInput
  }


  /**
   * Artist upsert
   */
  export type ArtistUpsertArgs = {
    /**
     * Select specific fields to fetch from the Artist
     * 
    **/
    select?: ArtistSelect | null
    /**
     * The filter to search for the Artist to update in case it exists.
     * 
    **/
    where: ArtistWhereUniqueInput
    /**
     * In case the Artist found by the `where` argument doesn't exist, create a new Artist with this data.
     * 
    **/
    create: XOR<ArtistCreateInput, ArtistUncheckedCreateInput>
    /**
     * In case the Artist was found with the provided `where` argument, update it with this data.
     * 
    **/
    update: XOR<ArtistUpdateInput, ArtistUncheckedUpdateInput>
  }


  /**
   * Artist delete
   */
  export type ArtistDeleteArgs = {
    /**
     * Select specific fields to fetch from the Artist
     * 
    **/
    select?: ArtistSelect | null
    /**
     * Filter which Artist to delete.
     * 
    **/
    where: ArtistWhereUniqueInput
  }


  /**
   * Artist deleteMany
   */
  export type ArtistDeleteManyArgs = {
    /**
     * Filter which Artists to delete
     * 
    **/
    where?: ArtistWhereInput
  }


  /**
   * Artist without action
   */
  export type ArtistArgs = {
    /**
     * Select specific fields to fetch from the Artist
     * 
    **/
    select?: ArtistSelect | null
  }



  /**
   * Model ArtistAlbum
   */


  export type AggregateArtistAlbum = {
    _count: ArtistAlbumCountAggregateOutputType | null
    _avg: ArtistAlbumAvgAggregateOutputType | null
    _sum: ArtistAlbumSumAggregateOutputType | null
    _min: ArtistAlbumMinAggregateOutputType | null
    _max: ArtistAlbumMaxAggregateOutputType | null
  }

  export type ArtistAlbumAvgAggregateOutputType = {
    id: number | null
  }

  export type ArtistAlbumSumAggregateOutputType = {
    id: number | null
  }

  export type ArtistAlbumMinAggregateOutputType = {
    id: number | null
    hotAlbums: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ArtistAlbumMaxAggregateOutputType = {
    id: number | null
    hotAlbums: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ArtistAlbumCountAggregateOutputType = {
    id: number
    hotAlbums: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ArtistAlbumAvgAggregateInputType = {
    id?: true
  }

  export type ArtistAlbumSumAggregateInputType = {
    id?: true
  }

  export type ArtistAlbumMinAggregateInputType = {
    id?: true
    hotAlbums?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ArtistAlbumMaxAggregateInputType = {
    id?: true
    hotAlbums?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ArtistAlbumCountAggregateInputType = {
    id?: true
    hotAlbums?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ArtistAlbumAggregateArgs = {
    /**
     * Filter which ArtistAlbum to aggregate.
     * 
    **/
    where?: ArtistAlbumWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ArtistAlbums to fetch.
     * 
    **/
    orderBy?: Enumerable<ArtistAlbumOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     * 
    **/
    cursor?: ArtistAlbumWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ArtistAlbums from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ArtistAlbums.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ArtistAlbums
    **/
    _count?: true | ArtistAlbumCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ArtistAlbumAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ArtistAlbumSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ArtistAlbumMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ArtistAlbumMaxAggregateInputType
  }

  export type GetArtistAlbumAggregateType<T extends ArtistAlbumAggregateArgs> = {
        [P in keyof T & keyof AggregateArtistAlbum]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateArtistAlbum[P]>
      : GetScalarType<T[P], AggregateArtistAlbum[P]>
  }




  export type ArtistAlbumGroupByArgs = {
    where?: ArtistAlbumWhereInput
    orderBy?: Enumerable<ArtistAlbumOrderByWithAggregationInput>
    by: Array<ArtistAlbumScalarFieldEnum>
    having?: ArtistAlbumScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ArtistAlbumCountAggregateInputType | true
    _avg?: ArtistAlbumAvgAggregateInputType
    _sum?: ArtistAlbumSumAggregateInputType
    _min?: ArtistAlbumMinAggregateInputType
    _max?: ArtistAlbumMaxAggregateInputType
  }


  export type ArtistAlbumGroupByOutputType = {
    id: number
    hotAlbums: string
    createdAt: Date
    updatedAt: Date
    _count: ArtistAlbumCountAggregateOutputType | null
    _avg: ArtistAlbumAvgAggregateOutputType | null
    _sum: ArtistAlbumSumAggregateOutputType | null
    _min: ArtistAlbumMinAggregateOutputType | null
    _max: ArtistAlbumMaxAggregateOutputType | null
  }

  type GetArtistAlbumGroupByPayload<T extends ArtistAlbumGroupByArgs> = PrismaPromise<
    Array<
      PickArray<ArtistAlbumGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ArtistAlbumGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ArtistAlbumGroupByOutputType[P]>
            : GetScalarType<T[P], ArtistAlbumGroupByOutputType[P]>
        }
      >
    >


  export type ArtistAlbumSelect = {
    id?: boolean
    hotAlbums?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type ArtistAlbumGetPayload<S extends boolean | null | undefined | ArtistAlbumArgs> =
    S extends { select: any, include: any } ? 'Please either choose `select` or `include`' :
    S extends true ? ArtistAlbum :
    S extends undefined ? never :
    S extends { include: any } & (ArtistAlbumArgs | ArtistAlbumFindManyArgs)
    ? ArtistAlbum 
    : S extends { select: any } & (ArtistAlbumArgs | ArtistAlbumFindManyArgs)
      ? {
    [P in TruthyKeys<S['select']>]:
    P extends keyof ArtistAlbum ? ArtistAlbum[P] : never
  } 
      : ArtistAlbum


  type ArtistAlbumCountArgs = Merge<
    Omit<ArtistAlbumFindManyArgs, 'select' | 'include'> & {
      select?: ArtistAlbumCountAggregateInputType | true
    }
  >

  export interface ArtistAlbumDelegate<GlobalRejectSettings extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined> {
    /**
     * Find zero or one ArtistAlbum that matches the filter.
     * @param {ArtistAlbumFindUniqueArgs} args - Arguments to find a ArtistAlbum
     * @example
     * // Get one ArtistAlbum
     * const artistAlbum = await prisma.artistAlbum.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends ArtistAlbumFindUniqueArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args: SelectSubset<T, ArtistAlbumFindUniqueArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findUnique', 'ArtistAlbum'> extends True ? Prisma__ArtistAlbumClient<ArtistAlbumGetPayload<T>> : Prisma__ArtistAlbumClient<ArtistAlbumGetPayload<T> | null, null>

    /**
     * Find one ArtistAlbum that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {ArtistAlbumFindUniqueOrThrowArgs} args - Arguments to find a ArtistAlbum
     * @example
     * // Get one ArtistAlbum
     * const artistAlbum = await prisma.artistAlbum.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends ArtistAlbumFindUniqueOrThrowArgs>(
      args?: SelectSubset<T, ArtistAlbumFindUniqueOrThrowArgs>
    ): Prisma__ArtistAlbumClient<ArtistAlbumGetPayload<T>>

    /**
     * Find the first ArtistAlbum that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ArtistAlbumFindFirstArgs} args - Arguments to find a ArtistAlbum
     * @example
     * // Get one ArtistAlbum
     * const artistAlbum = await prisma.artistAlbum.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends ArtistAlbumFindFirstArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args?: SelectSubset<T, ArtistAlbumFindFirstArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findFirst', 'ArtistAlbum'> extends True ? Prisma__ArtistAlbumClient<ArtistAlbumGetPayload<T>> : Prisma__ArtistAlbumClient<ArtistAlbumGetPayload<T> | null, null>

    /**
     * Find the first ArtistAlbum that matches the filter or
     * throw `NotFoundError` if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ArtistAlbumFindFirstOrThrowArgs} args - Arguments to find a ArtistAlbum
     * @example
     * // Get one ArtistAlbum
     * const artistAlbum = await prisma.artistAlbum.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends ArtistAlbumFindFirstOrThrowArgs>(
      args?: SelectSubset<T, ArtistAlbumFindFirstOrThrowArgs>
    ): Prisma__ArtistAlbumClient<ArtistAlbumGetPayload<T>>

    /**
     * Find zero or more ArtistAlbums that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ArtistAlbumFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ArtistAlbums
     * const artistAlbums = await prisma.artistAlbum.findMany()
     * 
     * // Get first 10 ArtistAlbums
     * const artistAlbums = await prisma.artistAlbum.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const artistAlbumWithIdOnly = await prisma.artistAlbum.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends ArtistAlbumFindManyArgs>(
      args?: SelectSubset<T, ArtistAlbumFindManyArgs>
    ): PrismaPromise<Array<ArtistAlbumGetPayload<T>>>

    /**
     * Create a ArtistAlbum.
     * @param {ArtistAlbumCreateArgs} args - Arguments to create a ArtistAlbum.
     * @example
     * // Create one ArtistAlbum
     * const ArtistAlbum = await prisma.artistAlbum.create({
     *   data: {
     *     // ... data to create a ArtistAlbum
     *   }
     * })
     * 
    **/
    create<T extends ArtistAlbumCreateArgs>(
      args: SelectSubset<T, ArtistAlbumCreateArgs>
    ): Prisma__ArtistAlbumClient<ArtistAlbumGetPayload<T>>

    /**
     * Delete a ArtistAlbum.
     * @param {ArtistAlbumDeleteArgs} args - Arguments to delete one ArtistAlbum.
     * @example
     * // Delete one ArtistAlbum
     * const ArtistAlbum = await prisma.artistAlbum.delete({
     *   where: {
     *     // ... filter to delete one ArtistAlbum
     *   }
     * })
     * 
    **/
    delete<T extends ArtistAlbumDeleteArgs>(
      args: SelectSubset<T, ArtistAlbumDeleteArgs>
    ): Prisma__ArtistAlbumClient<ArtistAlbumGetPayload<T>>

    /**
     * Update one ArtistAlbum.
     * @param {ArtistAlbumUpdateArgs} args - Arguments to update one ArtistAlbum.
     * @example
     * // Update one ArtistAlbum
     * const artistAlbum = await prisma.artistAlbum.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends ArtistAlbumUpdateArgs>(
      args: SelectSubset<T, ArtistAlbumUpdateArgs>
    ): Prisma__ArtistAlbumClient<ArtistAlbumGetPayload<T>>

    /**
     * Delete zero or more ArtistAlbums.
     * @param {ArtistAlbumDeleteManyArgs} args - Arguments to filter ArtistAlbums to delete.
     * @example
     * // Delete a few ArtistAlbums
     * const { count } = await prisma.artistAlbum.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends ArtistAlbumDeleteManyArgs>(
      args?: SelectSubset<T, ArtistAlbumDeleteManyArgs>
    ): PrismaPromise<BatchPayload>

    /**
     * Update zero or more ArtistAlbums.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ArtistAlbumUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ArtistAlbums
     * const artistAlbum = await prisma.artistAlbum.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends ArtistAlbumUpdateManyArgs>(
      args: SelectSubset<T, ArtistAlbumUpdateManyArgs>
    ): PrismaPromise<BatchPayload>

    /**
     * Create or update one ArtistAlbum.
     * @param {ArtistAlbumUpsertArgs} args - Arguments to update or create a ArtistAlbum.
     * @example
     * // Update or create a ArtistAlbum
     * const artistAlbum = await prisma.artistAlbum.upsert({
     *   create: {
     *     // ... data to create a ArtistAlbum
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ArtistAlbum we want to update
     *   }
     * })
    **/
    upsert<T extends ArtistAlbumUpsertArgs>(
      args: SelectSubset<T, ArtistAlbumUpsertArgs>
    ): Prisma__ArtistAlbumClient<ArtistAlbumGetPayload<T>>

    /**
     * Count the number of ArtistAlbums.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ArtistAlbumCountArgs} args - Arguments to filter ArtistAlbums to count.
     * @example
     * // Count the number of ArtistAlbums
     * const count = await prisma.artistAlbum.count({
     *   where: {
     *     // ... the filter for the ArtistAlbums we want to count
     *   }
     * })
    **/
    count<T extends ArtistAlbumCountArgs>(
      args?: Subset<T, ArtistAlbumCountArgs>,
    ): PrismaPromise<
      T extends _Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ArtistAlbumCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ArtistAlbum.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ArtistAlbumAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ArtistAlbumAggregateArgs>(args: Subset<T, ArtistAlbumAggregateArgs>): PrismaPromise<GetArtistAlbumAggregateType<T>>

    /**
     * Group by ArtistAlbum.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ArtistAlbumGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ArtistAlbumGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ArtistAlbumGroupByArgs['orderBy'] }
        : { orderBy?: ArtistAlbumGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends TupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ArtistAlbumGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetArtistAlbumGroupByPayload<T> : PrismaPromise<InputErrors>

  }

  /**
   * The delegate class that acts as a "Promise-like" for ArtistAlbum.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export class Prisma__ArtistAlbumClient<T, Null = never> implements PrismaPromise<T> {
    [prisma]: true;
    private readonly _dmmf;
    private readonly _fetcher;
    private readonly _queryType;
    private readonly _rootField;
    private readonly _clientMethod;
    private readonly _args;
    private readonly _dataPath;
    private readonly _errorFormat;
    private readonly _measurePerformance?;
    private _isList;
    private _callsite;
    private _requestPromise?;
    constructor(_dmmf: runtime.DMMFClass, _fetcher: PrismaClientFetcher, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);
    readonly [Symbol.toStringTag]: 'PrismaClientPromise';


    private get _document();
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  }



  // Custom InputTypes

  /**
   * ArtistAlbum base type for findUnique actions
   */
  export type ArtistAlbumFindUniqueArgsBase = {
    /**
     * Select specific fields to fetch from the ArtistAlbum
     * 
    **/
    select?: ArtistAlbumSelect | null
    /**
     * Filter, which ArtistAlbum to fetch.
     * 
    **/
    where: ArtistAlbumWhereUniqueInput
  }

  /**
   * ArtistAlbum findUnique
   */
  export interface ArtistAlbumFindUniqueArgs extends ArtistAlbumFindUniqueArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findUniqueOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * ArtistAlbum findUniqueOrThrow
   */
  export type ArtistAlbumFindUniqueOrThrowArgs = {
    /**
     * Select specific fields to fetch from the ArtistAlbum
     * 
    **/
    select?: ArtistAlbumSelect | null
    /**
     * Filter, which ArtistAlbum to fetch.
     * 
    **/
    where: ArtistAlbumWhereUniqueInput
  }


  /**
   * ArtistAlbum base type for findFirst actions
   */
  export type ArtistAlbumFindFirstArgsBase = {
    /**
     * Select specific fields to fetch from the ArtistAlbum
     * 
    **/
    select?: ArtistAlbumSelect | null
    /**
     * Filter, which ArtistAlbum to fetch.
     * 
    **/
    where?: ArtistAlbumWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ArtistAlbums to fetch.
     * 
    **/
    orderBy?: Enumerable<ArtistAlbumOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ArtistAlbums.
     * 
    **/
    cursor?: ArtistAlbumWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ArtistAlbums from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ArtistAlbums.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ArtistAlbums.
     * 
    **/
    distinct?: Enumerable<ArtistAlbumScalarFieldEnum>
  }

  /**
   * ArtistAlbum findFirst
   */
  export interface ArtistAlbumFindFirstArgs extends ArtistAlbumFindFirstArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findFirstOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * ArtistAlbum findFirstOrThrow
   */
  export type ArtistAlbumFindFirstOrThrowArgs = {
    /**
     * Select specific fields to fetch from the ArtistAlbum
     * 
    **/
    select?: ArtistAlbumSelect | null
    /**
     * Filter, which ArtistAlbum to fetch.
     * 
    **/
    where?: ArtistAlbumWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ArtistAlbums to fetch.
     * 
    **/
    orderBy?: Enumerable<ArtistAlbumOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ArtistAlbums.
     * 
    **/
    cursor?: ArtistAlbumWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ArtistAlbums from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ArtistAlbums.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ArtistAlbums.
     * 
    **/
    distinct?: Enumerable<ArtistAlbumScalarFieldEnum>
  }


  /**
   * ArtistAlbum findMany
   */
  export type ArtistAlbumFindManyArgs = {
    /**
     * Select specific fields to fetch from the ArtistAlbum
     * 
    **/
    select?: ArtistAlbumSelect | null
    /**
     * Filter, which ArtistAlbums to fetch.
     * 
    **/
    where?: ArtistAlbumWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ArtistAlbums to fetch.
     * 
    **/
    orderBy?: Enumerable<ArtistAlbumOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ArtistAlbums.
     * 
    **/
    cursor?: ArtistAlbumWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ArtistAlbums from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ArtistAlbums.
     * 
    **/
    skip?: number
    distinct?: Enumerable<ArtistAlbumScalarFieldEnum>
  }


  /**
   * ArtistAlbum create
   */
  export type ArtistAlbumCreateArgs = {
    /**
     * Select specific fields to fetch from the ArtistAlbum
     * 
    **/
    select?: ArtistAlbumSelect | null
    /**
     * The data needed to create a ArtistAlbum.
     * 
    **/
    data: XOR<ArtistAlbumCreateInput, ArtistAlbumUncheckedCreateInput>
  }


  /**
   * ArtistAlbum update
   */
  export type ArtistAlbumUpdateArgs = {
    /**
     * Select specific fields to fetch from the ArtistAlbum
     * 
    **/
    select?: ArtistAlbumSelect | null
    /**
     * The data needed to update a ArtistAlbum.
     * 
    **/
    data: XOR<ArtistAlbumUpdateInput, ArtistAlbumUncheckedUpdateInput>
    /**
     * Choose, which ArtistAlbum to update.
     * 
    **/
    where: ArtistAlbumWhereUniqueInput
  }


  /**
   * ArtistAlbum updateMany
   */
  export type ArtistAlbumUpdateManyArgs = {
    /**
     * The data used to update ArtistAlbums.
     * 
    **/
    data: XOR<ArtistAlbumUpdateManyMutationInput, ArtistAlbumUncheckedUpdateManyInput>
    /**
     * Filter which ArtistAlbums to update
     * 
    **/
    where?: ArtistAlbumWhereInput
  }


  /**
   * ArtistAlbum upsert
   */
  export type ArtistAlbumUpsertArgs = {
    /**
     * Select specific fields to fetch from the ArtistAlbum
     * 
    **/
    select?: ArtistAlbumSelect | null
    /**
     * The filter to search for the ArtistAlbum to update in case it exists.
     * 
    **/
    where: ArtistAlbumWhereUniqueInput
    /**
     * In case the ArtistAlbum found by the `where` argument doesn't exist, create a new ArtistAlbum with this data.
     * 
    **/
    create: XOR<ArtistAlbumCreateInput, ArtistAlbumUncheckedCreateInput>
    /**
     * In case the ArtistAlbum was found with the provided `where` argument, update it with this data.
     * 
    **/
    update: XOR<ArtistAlbumUpdateInput, ArtistAlbumUncheckedUpdateInput>
  }


  /**
   * ArtistAlbum delete
   */
  export type ArtistAlbumDeleteArgs = {
    /**
     * Select specific fields to fetch from the ArtistAlbum
     * 
    **/
    select?: ArtistAlbumSelect | null
    /**
     * Filter which ArtistAlbum to delete.
     * 
    **/
    where: ArtistAlbumWhereUniqueInput
  }


  /**
   * ArtistAlbum deleteMany
   */
  export type ArtistAlbumDeleteManyArgs = {
    /**
     * Filter which ArtistAlbums to delete
     * 
    **/
    where?: ArtistAlbumWhereInput
  }


  /**
   * ArtistAlbum without action
   */
  export type ArtistAlbumArgs = {
    /**
     * Select specific fields to fetch from the ArtistAlbum
     * 
    **/
    select?: ArtistAlbumSelect | null
  }



  /**
   * Model Playlist
   */


  export type AggregatePlaylist = {
    _count: PlaylistCountAggregateOutputType | null
    _avg: PlaylistAvgAggregateOutputType | null
    _sum: PlaylistSumAggregateOutputType | null
    _min: PlaylistMinAggregateOutputType | null
    _max: PlaylistMaxAggregateOutputType | null
  }

  export type PlaylistAvgAggregateOutputType = {
    id: number | null
  }

  export type PlaylistSumAggregateOutputType = {
    id: number | null
  }

  export type PlaylistMinAggregateOutputType = {
    id: number | null
    json: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PlaylistMaxAggregateOutputType = {
    id: number | null
    json: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type PlaylistCountAggregateOutputType = {
    id: number
    json: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type PlaylistAvgAggregateInputType = {
    id?: true
  }

  export type PlaylistSumAggregateInputType = {
    id?: true
  }

  export type PlaylistMinAggregateInputType = {
    id?: true
    json?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PlaylistMaxAggregateInputType = {
    id?: true
    json?: true
    createdAt?: true
    updatedAt?: true
  }

  export type PlaylistCountAggregateInputType = {
    id?: true
    json?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type PlaylistAggregateArgs = {
    /**
     * Filter which Playlist to aggregate.
     * 
    **/
    where?: PlaylistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Playlists to fetch.
     * 
    **/
    orderBy?: Enumerable<PlaylistOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     * 
    **/
    cursor?: PlaylistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Playlists from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Playlists.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Playlists
    **/
    _count?: true | PlaylistCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PlaylistAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PlaylistSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PlaylistMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PlaylistMaxAggregateInputType
  }

  export type GetPlaylistAggregateType<T extends PlaylistAggregateArgs> = {
        [P in keyof T & keyof AggregatePlaylist]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePlaylist[P]>
      : GetScalarType<T[P], AggregatePlaylist[P]>
  }




  export type PlaylistGroupByArgs = {
    where?: PlaylistWhereInput
    orderBy?: Enumerable<PlaylistOrderByWithAggregationInput>
    by: Array<PlaylistScalarFieldEnum>
    having?: PlaylistScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PlaylistCountAggregateInputType | true
    _avg?: PlaylistAvgAggregateInputType
    _sum?: PlaylistSumAggregateInputType
    _min?: PlaylistMinAggregateInputType
    _max?: PlaylistMaxAggregateInputType
  }


  export type PlaylistGroupByOutputType = {
    id: number
    json: string
    createdAt: Date
    updatedAt: Date
    _count: PlaylistCountAggregateOutputType | null
    _avg: PlaylistAvgAggregateOutputType | null
    _sum: PlaylistSumAggregateOutputType | null
    _min: PlaylistMinAggregateOutputType | null
    _max: PlaylistMaxAggregateOutputType | null
  }

  type GetPlaylistGroupByPayload<T extends PlaylistGroupByArgs> = PrismaPromise<
    Array<
      PickArray<PlaylistGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PlaylistGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PlaylistGroupByOutputType[P]>
            : GetScalarType<T[P], PlaylistGroupByOutputType[P]>
        }
      >
    >


  export type PlaylistSelect = {
    id?: boolean
    json?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type PlaylistGetPayload<S extends boolean | null | undefined | PlaylistArgs> =
    S extends { select: any, include: any } ? 'Please either choose `select` or `include`' :
    S extends true ? Playlist :
    S extends undefined ? never :
    S extends { include: any } & (PlaylistArgs | PlaylistFindManyArgs)
    ? Playlist 
    : S extends { select: any } & (PlaylistArgs | PlaylistFindManyArgs)
      ? {
    [P in TruthyKeys<S['select']>]:
    P extends keyof Playlist ? Playlist[P] : never
  } 
      : Playlist


  type PlaylistCountArgs = Merge<
    Omit<PlaylistFindManyArgs, 'select' | 'include'> & {
      select?: PlaylistCountAggregateInputType | true
    }
  >

  export interface PlaylistDelegate<GlobalRejectSettings extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined> {
    /**
     * Find zero or one Playlist that matches the filter.
     * @param {PlaylistFindUniqueArgs} args - Arguments to find a Playlist
     * @example
     * // Get one Playlist
     * const playlist = await prisma.playlist.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends PlaylistFindUniqueArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args: SelectSubset<T, PlaylistFindUniqueArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findUnique', 'Playlist'> extends True ? Prisma__PlaylistClient<PlaylistGetPayload<T>> : Prisma__PlaylistClient<PlaylistGetPayload<T> | null, null>

    /**
     * Find one Playlist that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {PlaylistFindUniqueOrThrowArgs} args - Arguments to find a Playlist
     * @example
     * // Get one Playlist
     * const playlist = await prisma.playlist.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends PlaylistFindUniqueOrThrowArgs>(
      args?: SelectSubset<T, PlaylistFindUniqueOrThrowArgs>
    ): Prisma__PlaylistClient<PlaylistGetPayload<T>>

    /**
     * Find the first Playlist that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlaylistFindFirstArgs} args - Arguments to find a Playlist
     * @example
     * // Get one Playlist
     * const playlist = await prisma.playlist.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends PlaylistFindFirstArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args?: SelectSubset<T, PlaylistFindFirstArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findFirst', 'Playlist'> extends True ? Prisma__PlaylistClient<PlaylistGetPayload<T>> : Prisma__PlaylistClient<PlaylistGetPayload<T> | null, null>

    /**
     * Find the first Playlist that matches the filter or
     * throw `NotFoundError` if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlaylistFindFirstOrThrowArgs} args - Arguments to find a Playlist
     * @example
     * // Get one Playlist
     * const playlist = await prisma.playlist.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends PlaylistFindFirstOrThrowArgs>(
      args?: SelectSubset<T, PlaylistFindFirstOrThrowArgs>
    ): Prisma__PlaylistClient<PlaylistGetPayload<T>>

    /**
     * Find zero or more Playlists that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlaylistFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Playlists
     * const playlists = await prisma.playlist.findMany()
     * 
     * // Get first 10 Playlists
     * const playlists = await prisma.playlist.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const playlistWithIdOnly = await prisma.playlist.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends PlaylistFindManyArgs>(
      args?: SelectSubset<T, PlaylistFindManyArgs>
    ): PrismaPromise<Array<PlaylistGetPayload<T>>>

    /**
     * Create a Playlist.
     * @param {PlaylistCreateArgs} args - Arguments to create a Playlist.
     * @example
     * // Create one Playlist
     * const Playlist = await prisma.playlist.create({
     *   data: {
     *     // ... data to create a Playlist
     *   }
     * })
     * 
    **/
    create<T extends PlaylistCreateArgs>(
      args: SelectSubset<T, PlaylistCreateArgs>
    ): Prisma__PlaylistClient<PlaylistGetPayload<T>>

    /**
     * Delete a Playlist.
     * @param {PlaylistDeleteArgs} args - Arguments to delete one Playlist.
     * @example
     * // Delete one Playlist
     * const Playlist = await prisma.playlist.delete({
     *   where: {
     *     // ... filter to delete one Playlist
     *   }
     * })
     * 
    **/
    delete<T extends PlaylistDeleteArgs>(
      args: SelectSubset<T, PlaylistDeleteArgs>
    ): Prisma__PlaylistClient<PlaylistGetPayload<T>>

    /**
     * Update one Playlist.
     * @param {PlaylistUpdateArgs} args - Arguments to update one Playlist.
     * @example
     * // Update one Playlist
     * const playlist = await prisma.playlist.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends PlaylistUpdateArgs>(
      args: SelectSubset<T, PlaylistUpdateArgs>
    ): Prisma__PlaylistClient<PlaylistGetPayload<T>>

    /**
     * Delete zero or more Playlists.
     * @param {PlaylistDeleteManyArgs} args - Arguments to filter Playlists to delete.
     * @example
     * // Delete a few Playlists
     * const { count } = await prisma.playlist.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends PlaylistDeleteManyArgs>(
      args?: SelectSubset<T, PlaylistDeleteManyArgs>
    ): PrismaPromise<BatchPayload>

    /**
     * Update zero or more Playlists.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlaylistUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Playlists
     * const playlist = await prisma.playlist.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends PlaylistUpdateManyArgs>(
      args: SelectSubset<T, PlaylistUpdateManyArgs>
    ): PrismaPromise<BatchPayload>

    /**
     * Create or update one Playlist.
     * @param {PlaylistUpsertArgs} args - Arguments to update or create a Playlist.
     * @example
     * // Update or create a Playlist
     * const playlist = await prisma.playlist.upsert({
     *   create: {
     *     // ... data to create a Playlist
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Playlist we want to update
     *   }
     * })
    **/
    upsert<T extends PlaylistUpsertArgs>(
      args: SelectSubset<T, PlaylistUpsertArgs>
    ): Prisma__PlaylistClient<PlaylistGetPayload<T>>

    /**
     * Count the number of Playlists.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlaylistCountArgs} args - Arguments to filter Playlists to count.
     * @example
     * // Count the number of Playlists
     * const count = await prisma.playlist.count({
     *   where: {
     *     // ... the filter for the Playlists we want to count
     *   }
     * })
    **/
    count<T extends PlaylistCountArgs>(
      args?: Subset<T, PlaylistCountArgs>,
    ): PrismaPromise<
      T extends _Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PlaylistCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Playlist.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlaylistAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PlaylistAggregateArgs>(args: Subset<T, PlaylistAggregateArgs>): PrismaPromise<GetPlaylistAggregateType<T>>

    /**
     * Group by Playlist.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PlaylistGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PlaylistGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PlaylistGroupByArgs['orderBy'] }
        : { orderBy?: PlaylistGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends TupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PlaylistGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPlaylistGroupByPayload<T> : PrismaPromise<InputErrors>

  }

  /**
   * The delegate class that acts as a "Promise-like" for Playlist.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export class Prisma__PlaylistClient<T, Null = never> implements PrismaPromise<T> {
    [prisma]: true;
    private readonly _dmmf;
    private readonly _fetcher;
    private readonly _queryType;
    private readonly _rootField;
    private readonly _clientMethod;
    private readonly _args;
    private readonly _dataPath;
    private readonly _errorFormat;
    private readonly _measurePerformance?;
    private _isList;
    private _callsite;
    private _requestPromise?;
    constructor(_dmmf: runtime.DMMFClass, _fetcher: PrismaClientFetcher, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);
    readonly [Symbol.toStringTag]: 'PrismaClientPromise';


    private get _document();
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  }



  // Custom InputTypes

  /**
   * Playlist base type for findUnique actions
   */
  export type PlaylistFindUniqueArgsBase = {
    /**
     * Select specific fields to fetch from the Playlist
     * 
    **/
    select?: PlaylistSelect | null
    /**
     * Filter, which Playlist to fetch.
     * 
    **/
    where: PlaylistWhereUniqueInput
  }

  /**
   * Playlist findUnique
   */
  export interface PlaylistFindUniqueArgs extends PlaylistFindUniqueArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findUniqueOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Playlist findUniqueOrThrow
   */
  export type PlaylistFindUniqueOrThrowArgs = {
    /**
     * Select specific fields to fetch from the Playlist
     * 
    **/
    select?: PlaylistSelect | null
    /**
     * Filter, which Playlist to fetch.
     * 
    **/
    where: PlaylistWhereUniqueInput
  }


  /**
   * Playlist base type for findFirst actions
   */
  export type PlaylistFindFirstArgsBase = {
    /**
     * Select specific fields to fetch from the Playlist
     * 
    **/
    select?: PlaylistSelect | null
    /**
     * Filter, which Playlist to fetch.
     * 
    **/
    where?: PlaylistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Playlists to fetch.
     * 
    **/
    orderBy?: Enumerable<PlaylistOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Playlists.
     * 
    **/
    cursor?: PlaylistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Playlists from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Playlists.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Playlists.
     * 
    **/
    distinct?: Enumerable<PlaylistScalarFieldEnum>
  }

  /**
   * Playlist findFirst
   */
  export interface PlaylistFindFirstArgs extends PlaylistFindFirstArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findFirstOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Playlist findFirstOrThrow
   */
  export type PlaylistFindFirstOrThrowArgs = {
    /**
     * Select specific fields to fetch from the Playlist
     * 
    **/
    select?: PlaylistSelect | null
    /**
     * Filter, which Playlist to fetch.
     * 
    **/
    where?: PlaylistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Playlists to fetch.
     * 
    **/
    orderBy?: Enumerable<PlaylistOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Playlists.
     * 
    **/
    cursor?: PlaylistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Playlists from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Playlists.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Playlists.
     * 
    **/
    distinct?: Enumerable<PlaylistScalarFieldEnum>
  }


  /**
   * Playlist findMany
   */
  export type PlaylistFindManyArgs = {
    /**
     * Select specific fields to fetch from the Playlist
     * 
    **/
    select?: PlaylistSelect | null
    /**
     * Filter, which Playlists to fetch.
     * 
    **/
    where?: PlaylistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Playlists to fetch.
     * 
    **/
    orderBy?: Enumerable<PlaylistOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Playlists.
     * 
    **/
    cursor?: PlaylistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Playlists from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Playlists.
     * 
    **/
    skip?: number
    distinct?: Enumerable<PlaylistScalarFieldEnum>
  }


  /**
   * Playlist create
   */
  export type PlaylistCreateArgs = {
    /**
     * Select specific fields to fetch from the Playlist
     * 
    **/
    select?: PlaylistSelect | null
    /**
     * The data needed to create a Playlist.
     * 
    **/
    data: XOR<PlaylistCreateInput, PlaylistUncheckedCreateInput>
  }


  /**
   * Playlist update
   */
  export type PlaylistUpdateArgs = {
    /**
     * Select specific fields to fetch from the Playlist
     * 
    **/
    select?: PlaylistSelect | null
    /**
     * The data needed to update a Playlist.
     * 
    **/
    data: XOR<PlaylistUpdateInput, PlaylistUncheckedUpdateInput>
    /**
     * Choose, which Playlist to update.
     * 
    **/
    where: PlaylistWhereUniqueInput
  }


  /**
   * Playlist updateMany
   */
  export type PlaylistUpdateManyArgs = {
    /**
     * The data used to update Playlists.
     * 
    **/
    data: XOR<PlaylistUpdateManyMutationInput, PlaylistUncheckedUpdateManyInput>
    /**
     * Filter which Playlists to update
     * 
    **/
    where?: PlaylistWhereInput
  }


  /**
   * Playlist upsert
   */
  export type PlaylistUpsertArgs = {
    /**
     * Select specific fields to fetch from the Playlist
     * 
    **/
    select?: PlaylistSelect | null
    /**
     * The filter to search for the Playlist to update in case it exists.
     * 
    **/
    where: PlaylistWhereUniqueInput
    /**
     * In case the Playlist found by the `where` argument doesn't exist, create a new Playlist with this data.
     * 
    **/
    create: XOR<PlaylistCreateInput, PlaylistUncheckedCreateInput>
    /**
     * In case the Playlist was found with the provided `where` argument, update it with this data.
     * 
    **/
    update: XOR<PlaylistUpdateInput, PlaylistUncheckedUpdateInput>
  }


  /**
   * Playlist delete
   */
  export type PlaylistDeleteArgs = {
    /**
     * Select specific fields to fetch from the Playlist
     * 
    **/
    select?: PlaylistSelect | null
    /**
     * Filter which Playlist to delete.
     * 
    **/
    where: PlaylistWhereUniqueInput
  }


  /**
   * Playlist deleteMany
   */
  export type PlaylistDeleteManyArgs = {
    /**
     * Filter which Playlists to delete
     * 
    **/
    where?: PlaylistWhereInput
  }


  /**
   * Playlist without action
   */
  export type PlaylistArgs = {
    /**
     * Select specific fields to fetch from the Playlist
     * 
    **/
    select?: PlaylistSelect | null
  }



  /**
   * Model Audio
   */


  export type AggregateAudio = {
    _count: AudioCountAggregateOutputType | null
    _avg: AudioAvgAggregateOutputType | null
    _sum: AudioSumAggregateOutputType | null
    _min: AudioMinAggregateOutputType | null
    _max: AudioMaxAggregateOutputType | null
  }

  export type AudioAvgAggregateOutputType = {
    id: number | null
    bitRate: number | null
  }

  export type AudioSumAggregateOutputType = {
    id: number | null
    bitRate: number | null
  }

  export type AudioMinAggregateOutputType = {
    id: number | null
    bitRate: number | null
    format: string | null
    source: string | null
    createdAt: Date | null
    updatedAt: Date | null
    queriedAt: Date | null
  }

  export type AudioMaxAggregateOutputType = {
    id: number | null
    bitRate: number | null
    format: string | null
    source: string | null
    createdAt: Date | null
    updatedAt: Date | null
    queriedAt: Date | null
  }

  export type AudioCountAggregateOutputType = {
    id: number
    bitRate: number
    format: number
    source: number
    createdAt: number
    updatedAt: number
    queriedAt: number
    _all: number
  }


  export type AudioAvgAggregateInputType = {
    id?: true
    bitRate?: true
  }

  export type AudioSumAggregateInputType = {
    id?: true
    bitRate?: true
  }

  export type AudioMinAggregateInputType = {
    id?: true
    bitRate?: true
    format?: true
    source?: true
    createdAt?: true
    updatedAt?: true
    queriedAt?: true
  }

  export type AudioMaxAggregateInputType = {
    id?: true
    bitRate?: true
    format?: true
    source?: true
    createdAt?: true
    updatedAt?: true
    queriedAt?: true
  }

  export type AudioCountAggregateInputType = {
    id?: true
    bitRate?: true
    format?: true
    source?: true
    createdAt?: true
    updatedAt?: true
    queriedAt?: true
    _all?: true
  }

  export type AudioAggregateArgs = {
    /**
     * Filter which Audio to aggregate.
     * 
    **/
    where?: AudioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Audio to fetch.
     * 
    **/
    orderBy?: Enumerable<AudioOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     * 
    **/
    cursor?: AudioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Audio from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Audio.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Audio
    **/
    _count?: true | AudioCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AudioAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AudioSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AudioMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AudioMaxAggregateInputType
  }

  export type GetAudioAggregateType<T extends AudioAggregateArgs> = {
        [P in keyof T & keyof AggregateAudio]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAudio[P]>
      : GetScalarType<T[P], AggregateAudio[P]>
  }




  export type AudioGroupByArgs = {
    where?: AudioWhereInput
    orderBy?: Enumerable<AudioOrderByWithAggregationInput>
    by: Array<AudioScalarFieldEnum>
    having?: AudioScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AudioCountAggregateInputType | true
    _avg?: AudioAvgAggregateInputType
    _sum?: AudioSumAggregateInputType
    _min?: AudioMinAggregateInputType
    _max?: AudioMaxAggregateInputType
  }


  export type AudioGroupByOutputType = {
    id: number
    bitRate: number
    format: string
    source: string
    createdAt: Date
    updatedAt: Date
    queriedAt: Date
    _count: AudioCountAggregateOutputType | null
    _avg: AudioAvgAggregateOutputType | null
    _sum: AudioSumAggregateOutputType | null
    _min: AudioMinAggregateOutputType | null
    _max: AudioMaxAggregateOutputType | null
  }

  type GetAudioGroupByPayload<T extends AudioGroupByArgs> = PrismaPromise<
    Array<
      PickArray<AudioGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AudioGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AudioGroupByOutputType[P]>
            : GetScalarType<T[P], AudioGroupByOutputType[P]>
        }
      >
    >


  export type AudioSelect = {
    id?: boolean
    bitRate?: boolean
    format?: boolean
    source?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    queriedAt?: boolean
  }


  export type AudioGetPayload<S extends boolean | null | undefined | AudioArgs> =
    S extends { select: any, include: any } ? 'Please either choose `select` or `include`' :
    S extends true ? Audio :
    S extends undefined ? never :
    S extends { include: any } & (AudioArgs | AudioFindManyArgs)
    ? Audio 
    : S extends { select: any } & (AudioArgs | AudioFindManyArgs)
      ? {
    [P in TruthyKeys<S['select']>]:
    P extends keyof Audio ? Audio[P] : never
  } 
      : Audio


  type AudioCountArgs = Merge<
    Omit<AudioFindManyArgs, 'select' | 'include'> & {
      select?: AudioCountAggregateInputType | true
    }
  >

  export interface AudioDelegate<GlobalRejectSettings extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined> {
    /**
     * Find zero or one Audio that matches the filter.
     * @param {AudioFindUniqueArgs} args - Arguments to find a Audio
     * @example
     * // Get one Audio
     * const audio = await prisma.audio.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends AudioFindUniqueArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args: SelectSubset<T, AudioFindUniqueArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findUnique', 'Audio'> extends True ? Prisma__AudioClient<AudioGetPayload<T>> : Prisma__AudioClient<AudioGetPayload<T> | null, null>

    /**
     * Find one Audio that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {AudioFindUniqueOrThrowArgs} args - Arguments to find a Audio
     * @example
     * // Get one Audio
     * const audio = await prisma.audio.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends AudioFindUniqueOrThrowArgs>(
      args?: SelectSubset<T, AudioFindUniqueOrThrowArgs>
    ): Prisma__AudioClient<AudioGetPayload<T>>

    /**
     * Find the first Audio that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AudioFindFirstArgs} args - Arguments to find a Audio
     * @example
     * // Get one Audio
     * const audio = await prisma.audio.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends AudioFindFirstArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args?: SelectSubset<T, AudioFindFirstArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findFirst', 'Audio'> extends True ? Prisma__AudioClient<AudioGetPayload<T>> : Prisma__AudioClient<AudioGetPayload<T> | null, null>

    /**
     * Find the first Audio that matches the filter or
     * throw `NotFoundError` if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AudioFindFirstOrThrowArgs} args - Arguments to find a Audio
     * @example
     * // Get one Audio
     * const audio = await prisma.audio.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends AudioFindFirstOrThrowArgs>(
      args?: SelectSubset<T, AudioFindFirstOrThrowArgs>
    ): Prisma__AudioClient<AudioGetPayload<T>>

    /**
     * Find zero or more Audio that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AudioFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Audio
     * const audio = await prisma.audio.findMany()
     * 
     * // Get first 10 Audio
     * const audio = await prisma.audio.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const audioWithIdOnly = await prisma.audio.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends AudioFindManyArgs>(
      args?: SelectSubset<T, AudioFindManyArgs>
    ): PrismaPromise<Array<AudioGetPayload<T>>>

    /**
     * Create a Audio.
     * @param {AudioCreateArgs} args - Arguments to create a Audio.
     * @example
     * // Create one Audio
     * const Audio = await prisma.audio.create({
     *   data: {
     *     // ... data to create a Audio
     *   }
     * })
     * 
    **/
    create<T extends AudioCreateArgs>(
      args: SelectSubset<T, AudioCreateArgs>
    ): Prisma__AudioClient<AudioGetPayload<T>>

    /**
     * Delete a Audio.
     * @param {AudioDeleteArgs} args - Arguments to delete one Audio.
     * @example
     * // Delete one Audio
     * const Audio = await prisma.audio.delete({
     *   where: {
     *     // ... filter to delete one Audio
     *   }
     * })
     * 
    **/
    delete<T extends AudioDeleteArgs>(
      args: SelectSubset<T, AudioDeleteArgs>
    ): Prisma__AudioClient<AudioGetPayload<T>>

    /**
     * Update one Audio.
     * @param {AudioUpdateArgs} args - Arguments to update one Audio.
     * @example
     * // Update one Audio
     * const audio = await prisma.audio.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends AudioUpdateArgs>(
      args: SelectSubset<T, AudioUpdateArgs>
    ): Prisma__AudioClient<AudioGetPayload<T>>

    /**
     * Delete zero or more Audio.
     * @param {AudioDeleteManyArgs} args - Arguments to filter Audio to delete.
     * @example
     * // Delete a few Audio
     * const { count } = await prisma.audio.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends AudioDeleteManyArgs>(
      args?: SelectSubset<T, AudioDeleteManyArgs>
    ): PrismaPromise<BatchPayload>

    /**
     * Update zero or more Audio.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AudioUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Audio
     * const audio = await prisma.audio.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends AudioUpdateManyArgs>(
      args: SelectSubset<T, AudioUpdateManyArgs>
    ): PrismaPromise<BatchPayload>

    /**
     * Create or update one Audio.
     * @param {AudioUpsertArgs} args - Arguments to update or create a Audio.
     * @example
     * // Update or create a Audio
     * const audio = await prisma.audio.upsert({
     *   create: {
     *     // ... data to create a Audio
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Audio we want to update
     *   }
     * })
    **/
    upsert<T extends AudioUpsertArgs>(
      args: SelectSubset<T, AudioUpsertArgs>
    ): Prisma__AudioClient<AudioGetPayload<T>>

    /**
     * Count the number of Audio.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AudioCountArgs} args - Arguments to filter Audio to count.
     * @example
     * // Count the number of Audio
     * const count = await prisma.audio.count({
     *   where: {
     *     // ... the filter for the Audio we want to count
     *   }
     * })
    **/
    count<T extends AudioCountArgs>(
      args?: Subset<T, AudioCountArgs>,
    ): PrismaPromise<
      T extends _Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AudioCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Audio.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AudioAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AudioAggregateArgs>(args: Subset<T, AudioAggregateArgs>): PrismaPromise<GetAudioAggregateType<T>>

    /**
     * Group by Audio.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AudioGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AudioGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AudioGroupByArgs['orderBy'] }
        : { orderBy?: AudioGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends TupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AudioGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAudioGroupByPayload<T> : PrismaPromise<InputErrors>

  }

  /**
   * The delegate class that acts as a "Promise-like" for Audio.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export class Prisma__AudioClient<T, Null = never> implements PrismaPromise<T> {
    [prisma]: true;
    private readonly _dmmf;
    private readonly _fetcher;
    private readonly _queryType;
    private readonly _rootField;
    private readonly _clientMethod;
    private readonly _args;
    private readonly _dataPath;
    private readonly _errorFormat;
    private readonly _measurePerformance?;
    private _isList;
    private _callsite;
    private _requestPromise?;
    constructor(_dmmf: runtime.DMMFClass, _fetcher: PrismaClientFetcher, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);
    readonly [Symbol.toStringTag]: 'PrismaClientPromise';


    private get _document();
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  }



  // Custom InputTypes

  /**
   * Audio base type for findUnique actions
   */
  export type AudioFindUniqueArgsBase = {
    /**
     * Select specific fields to fetch from the Audio
     * 
    **/
    select?: AudioSelect | null
    /**
     * Filter, which Audio to fetch.
     * 
    **/
    where: AudioWhereUniqueInput
  }

  /**
   * Audio findUnique
   */
  export interface AudioFindUniqueArgs extends AudioFindUniqueArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findUniqueOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Audio findUniqueOrThrow
   */
  export type AudioFindUniqueOrThrowArgs = {
    /**
     * Select specific fields to fetch from the Audio
     * 
    **/
    select?: AudioSelect | null
    /**
     * Filter, which Audio to fetch.
     * 
    **/
    where: AudioWhereUniqueInput
  }


  /**
   * Audio base type for findFirst actions
   */
  export type AudioFindFirstArgsBase = {
    /**
     * Select specific fields to fetch from the Audio
     * 
    **/
    select?: AudioSelect | null
    /**
     * Filter, which Audio to fetch.
     * 
    **/
    where?: AudioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Audio to fetch.
     * 
    **/
    orderBy?: Enumerable<AudioOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Audio.
     * 
    **/
    cursor?: AudioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Audio from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Audio.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Audio.
     * 
    **/
    distinct?: Enumerable<AudioScalarFieldEnum>
  }

  /**
   * Audio findFirst
   */
  export interface AudioFindFirstArgs extends AudioFindFirstArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findFirstOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Audio findFirstOrThrow
   */
  export type AudioFindFirstOrThrowArgs = {
    /**
     * Select specific fields to fetch from the Audio
     * 
    **/
    select?: AudioSelect | null
    /**
     * Filter, which Audio to fetch.
     * 
    **/
    where?: AudioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Audio to fetch.
     * 
    **/
    orderBy?: Enumerable<AudioOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Audio.
     * 
    **/
    cursor?: AudioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Audio from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Audio.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Audio.
     * 
    **/
    distinct?: Enumerable<AudioScalarFieldEnum>
  }


  /**
   * Audio findMany
   */
  export type AudioFindManyArgs = {
    /**
     * Select specific fields to fetch from the Audio
     * 
    **/
    select?: AudioSelect | null
    /**
     * Filter, which Audio to fetch.
     * 
    **/
    where?: AudioWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Audio to fetch.
     * 
    **/
    orderBy?: Enumerable<AudioOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Audio.
     * 
    **/
    cursor?: AudioWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Audio from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Audio.
     * 
    **/
    skip?: number
    distinct?: Enumerable<AudioScalarFieldEnum>
  }


  /**
   * Audio create
   */
  export type AudioCreateArgs = {
    /**
     * Select specific fields to fetch from the Audio
     * 
    **/
    select?: AudioSelect | null
    /**
     * The data needed to create a Audio.
     * 
    **/
    data: XOR<AudioCreateInput, AudioUncheckedCreateInput>
  }


  /**
   * Audio update
   */
  export type AudioUpdateArgs = {
    /**
     * Select specific fields to fetch from the Audio
     * 
    **/
    select?: AudioSelect | null
    /**
     * The data needed to update a Audio.
     * 
    **/
    data: XOR<AudioUpdateInput, AudioUncheckedUpdateInput>
    /**
     * Choose, which Audio to update.
     * 
    **/
    where: AudioWhereUniqueInput
  }


  /**
   * Audio updateMany
   */
  export type AudioUpdateManyArgs = {
    /**
     * The data used to update Audio.
     * 
    **/
    data: XOR<AudioUpdateManyMutationInput, AudioUncheckedUpdateManyInput>
    /**
     * Filter which Audio to update
     * 
    **/
    where?: AudioWhereInput
  }


  /**
   * Audio upsert
   */
  export type AudioUpsertArgs = {
    /**
     * Select specific fields to fetch from the Audio
     * 
    **/
    select?: AudioSelect | null
    /**
     * The filter to search for the Audio to update in case it exists.
     * 
    **/
    where: AudioWhereUniqueInput
    /**
     * In case the Audio found by the `where` argument doesn't exist, create a new Audio with this data.
     * 
    **/
    create: XOR<AudioCreateInput, AudioUncheckedCreateInput>
    /**
     * In case the Audio was found with the provided `where` argument, update it with this data.
     * 
    **/
    update: XOR<AudioUpdateInput, AudioUncheckedUpdateInput>
  }


  /**
   * Audio delete
   */
  export type AudioDeleteArgs = {
    /**
     * Select specific fields to fetch from the Audio
     * 
    **/
    select?: AudioSelect | null
    /**
     * Filter which Audio to delete.
     * 
    **/
    where: AudioWhereUniqueInput
  }


  /**
   * Audio deleteMany
   */
  export type AudioDeleteManyArgs = {
    /**
     * Filter which Audio to delete
     * 
    **/
    where?: AudioWhereInput
  }


  /**
   * Audio without action
   */
  export type AudioArgs = {
    /**
     * Select specific fields to fetch from the Audio
     * 
    **/
    select?: AudioSelect | null
  }



  /**
   * Model Lyrics
   */


  export type AggregateLyrics = {
    _count: LyricsCountAggregateOutputType | null
    _avg: LyricsAvgAggregateOutputType | null
    _sum: LyricsSumAggregateOutputType | null
    _min: LyricsMinAggregateOutputType | null
    _max: LyricsMaxAggregateOutputType | null
  }

  export type LyricsAvgAggregateOutputType = {
    id: number | null
  }

  export type LyricsSumAggregateOutputType = {
    id: number | null
  }

  export type LyricsMinAggregateOutputType = {
    id: number | null
    json: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type LyricsMaxAggregateOutputType = {
    id: number | null
    json: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type LyricsCountAggregateOutputType = {
    id: number
    json: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type LyricsAvgAggregateInputType = {
    id?: true
  }

  export type LyricsSumAggregateInputType = {
    id?: true
  }

  export type LyricsMinAggregateInputType = {
    id?: true
    json?: true
    createdAt?: true
    updatedAt?: true
  }

  export type LyricsMaxAggregateInputType = {
    id?: true
    json?: true
    createdAt?: true
    updatedAt?: true
  }

  export type LyricsCountAggregateInputType = {
    id?: true
    json?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type LyricsAggregateArgs = {
    /**
     * Filter which Lyrics to aggregate.
     * 
    **/
    where?: LyricsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Lyrics to fetch.
     * 
    **/
    orderBy?: Enumerable<LyricsOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     * 
    **/
    cursor?: LyricsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Lyrics from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Lyrics.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Lyrics
    **/
    _count?: true | LyricsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: LyricsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: LyricsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: LyricsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: LyricsMaxAggregateInputType
  }

  export type GetLyricsAggregateType<T extends LyricsAggregateArgs> = {
        [P in keyof T & keyof AggregateLyrics]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateLyrics[P]>
      : GetScalarType<T[P], AggregateLyrics[P]>
  }




  export type LyricsGroupByArgs = {
    where?: LyricsWhereInput
    orderBy?: Enumerable<LyricsOrderByWithAggregationInput>
    by: Array<LyricsScalarFieldEnum>
    having?: LyricsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: LyricsCountAggregateInputType | true
    _avg?: LyricsAvgAggregateInputType
    _sum?: LyricsSumAggregateInputType
    _min?: LyricsMinAggregateInputType
    _max?: LyricsMaxAggregateInputType
  }


  export type LyricsGroupByOutputType = {
    id: number
    json: string
    createdAt: Date
    updatedAt: Date
    _count: LyricsCountAggregateOutputType | null
    _avg: LyricsAvgAggregateOutputType | null
    _sum: LyricsSumAggregateOutputType | null
    _min: LyricsMinAggregateOutputType | null
    _max: LyricsMaxAggregateOutputType | null
  }

  type GetLyricsGroupByPayload<T extends LyricsGroupByArgs> = PrismaPromise<
    Array<
      PickArray<LyricsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof LyricsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], LyricsGroupByOutputType[P]>
            : GetScalarType<T[P], LyricsGroupByOutputType[P]>
        }
      >
    >


  export type LyricsSelect = {
    id?: boolean
    json?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type LyricsGetPayload<S extends boolean | null | undefined | LyricsArgs> =
    S extends { select: any, include: any } ? 'Please either choose `select` or `include`' :
    S extends true ? Lyrics :
    S extends undefined ? never :
    S extends { include: any } & (LyricsArgs | LyricsFindManyArgs)
    ? Lyrics 
    : S extends { select: any } & (LyricsArgs | LyricsFindManyArgs)
      ? {
    [P in TruthyKeys<S['select']>]:
    P extends keyof Lyrics ? Lyrics[P] : never
  } 
      : Lyrics


  type LyricsCountArgs = Merge<
    Omit<LyricsFindManyArgs, 'select' | 'include'> & {
      select?: LyricsCountAggregateInputType | true
    }
  >

  export interface LyricsDelegate<GlobalRejectSettings extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined> {
    /**
     * Find zero or one Lyrics that matches the filter.
     * @param {LyricsFindUniqueArgs} args - Arguments to find a Lyrics
     * @example
     * // Get one Lyrics
     * const lyrics = await prisma.lyrics.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends LyricsFindUniqueArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args: SelectSubset<T, LyricsFindUniqueArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findUnique', 'Lyrics'> extends True ? Prisma__LyricsClient<LyricsGetPayload<T>> : Prisma__LyricsClient<LyricsGetPayload<T> | null, null>

    /**
     * Find one Lyrics that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {LyricsFindUniqueOrThrowArgs} args - Arguments to find a Lyrics
     * @example
     * // Get one Lyrics
     * const lyrics = await prisma.lyrics.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends LyricsFindUniqueOrThrowArgs>(
      args?: SelectSubset<T, LyricsFindUniqueOrThrowArgs>
    ): Prisma__LyricsClient<LyricsGetPayload<T>>

    /**
     * Find the first Lyrics that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LyricsFindFirstArgs} args - Arguments to find a Lyrics
     * @example
     * // Get one Lyrics
     * const lyrics = await prisma.lyrics.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends LyricsFindFirstArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args?: SelectSubset<T, LyricsFindFirstArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findFirst', 'Lyrics'> extends True ? Prisma__LyricsClient<LyricsGetPayload<T>> : Prisma__LyricsClient<LyricsGetPayload<T> | null, null>

    /**
     * Find the first Lyrics that matches the filter or
     * throw `NotFoundError` if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LyricsFindFirstOrThrowArgs} args - Arguments to find a Lyrics
     * @example
     * // Get one Lyrics
     * const lyrics = await prisma.lyrics.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends LyricsFindFirstOrThrowArgs>(
      args?: SelectSubset<T, LyricsFindFirstOrThrowArgs>
    ): Prisma__LyricsClient<LyricsGetPayload<T>>

    /**
     * Find zero or more Lyrics that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LyricsFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Lyrics
     * const lyrics = await prisma.lyrics.findMany()
     * 
     * // Get first 10 Lyrics
     * const lyrics = await prisma.lyrics.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const lyricsWithIdOnly = await prisma.lyrics.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends LyricsFindManyArgs>(
      args?: SelectSubset<T, LyricsFindManyArgs>
    ): PrismaPromise<Array<LyricsGetPayload<T>>>

    /**
     * Create a Lyrics.
     * @param {LyricsCreateArgs} args - Arguments to create a Lyrics.
     * @example
     * // Create one Lyrics
     * const Lyrics = await prisma.lyrics.create({
     *   data: {
     *     // ... data to create a Lyrics
     *   }
     * })
     * 
    **/
    create<T extends LyricsCreateArgs>(
      args: SelectSubset<T, LyricsCreateArgs>
    ): Prisma__LyricsClient<LyricsGetPayload<T>>

    /**
     * Delete a Lyrics.
     * @param {LyricsDeleteArgs} args - Arguments to delete one Lyrics.
     * @example
     * // Delete one Lyrics
     * const Lyrics = await prisma.lyrics.delete({
     *   where: {
     *     // ... filter to delete one Lyrics
     *   }
     * })
     * 
    **/
    delete<T extends LyricsDeleteArgs>(
      args: SelectSubset<T, LyricsDeleteArgs>
    ): Prisma__LyricsClient<LyricsGetPayload<T>>

    /**
     * Update one Lyrics.
     * @param {LyricsUpdateArgs} args - Arguments to update one Lyrics.
     * @example
     * // Update one Lyrics
     * const lyrics = await prisma.lyrics.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends LyricsUpdateArgs>(
      args: SelectSubset<T, LyricsUpdateArgs>
    ): Prisma__LyricsClient<LyricsGetPayload<T>>

    /**
     * Delete zero or more Lyrics.
     * @param {LyricsDeleteManyArgs} args - Arguments to filter Lyrics to delete.
     * @example
     * // Delete a few Lyrics
     * const { count } = await prisma.lyrics.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends LyricsDeleteManyArgs>(
      args?: SelectSubset<T, LyricsDeleteManyArgs>
    ): PrismaPromise<BatchPayload>

    /**
     * Update zero or more Lyrics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LyricsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Lyrics
     * const lyrics = await prisma.lyrics.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends LyricsUpdateManyArgs>(
      args: SelectSubset<T, LyricsUpdateManyArgs>
    ): PrismaPromise<BatchPayload>

    /**
     * Create or update one Lyrics.
     * @param {LyricsUpsertArgs} args - Arguments to update or create a Lyrics.
     * @example
     * // Update or create a Lyrics
     * const lyrics = await prisma.lyrics.upsert({
     *   create: {
     *     // ... data to create a Lyrics
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Lyrics we want to update
     *   }
     * })
    **/
    upsert<T extends LyricsUpsertArgs>(
      args: SelectSubset<T, LyricsUpsertArgs>
    ): Prisma__LyricsClient<LyricsGetPayload<T>>

    /**
     * Count the number of Lyrics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LyricsCountArgs} args - Arguments to filter Lyrics to count.
     * @example
     * // Count the number of Lyrics
     * const count = await prisma.lyrics.count({
     *   where: {
     *     // ... the filter for the Lyrics we want to count
     *   }
     * })
    **/
    count<T extends LyricsCountArgs>(
      args?: Subset<T, LyricsCountArgs>,
    ): PrismaPromise<
      T extends _Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], LyricsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Lyrics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LyricsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends LyricsAggregateArgs>(args: Subset<T, LyricsAggregateArgs>): PrismaPromise<GetLyricsAggregateType<T>>

    /**
     * Group by Lyrics.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {LyricsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends LyricsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: LyricsGroupByArgs['orderBy'] }
        : { orderBy?: LyricsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends TupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, LyricsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetLyricsGroupByPayload<T> : PrismaPromise<InputErrors>

  }

  /**
   * The delegate class that acts as a "Promise-like" for Lyrics.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export class Prisma__LyricsClient<T, Null = never> implements PrismaPromise<T> {
    [prisma]: true;
    private readonly _dmmf;
    private readonly _fetcher;
    private readonly _queryType;
    private readonly _rootField;
    private readonly _clientMethod;
    private readonly _args;
    private readonly _dataPath;
    private readonly _errorFormat;
    private readonly _measurePerformance?;
    private _isList;
    private _callsite;
    private _requestPromise?;
    constructor(_dmmf: runtime.DMMFClass, _fetcher: PrismaClientFetcher, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);
    readonly [Symbol.toStringTag]: 'PrismaClientPromise';


    private get _document();
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  }



  // Custom InputTypes

  /**
   * Lyrics base type for findUnique actions
   */
  export type LyricsFindUniqueArgsBase = {
    /**
     * Select specific fields to fetch from the Lyrics
     * 
    **/
    select?: LyricsSelect | null
    /**
     * Filter, which Lyrics to fetch.
     * 
    **/
    where: LyricsWhereUniqueInput
  }

  /**
   * Lyrics findUnique
   */
  export interface LyricsFindUniqueArgs extends LyricsFindUniqueArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findUniqueOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Lyrics findUniqueOrThrow
   */
  export type LyricsFindUniqueOrThrowArgs = {
    /**
     * Select specific fields to fetch from the Lyrics
     * 
    **/
    select?: LyricsSelect | null
    /**
     * Filter, which Lyrics to fetch.
     * 
    **/
    where: LyricsWhereUniqueInput
  }


  /**
   * Lyrics base type for findFirst actions
   */
  export type LyricsFindFirstArgsBase = {
    /**
     * Select specific fields to fetch from the Lyrics
     * 
    **/
    select?: LyricsSelect | null
    /**
     * Filter, which Lyrics to fetch.
     * 
    **/
    where?: LyricsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Lyrics to fetch.
     * 
    **/
    orderBy?: Enumerable<LyricsOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Lyrics.
     * 
    **/
    cursor?: LyricsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Lyrics from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Lyrics.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Lyrics.
     * 
    **/
    distinct?: Enumerable<LyricsScalarFieldEnum>
  }

  /**
   * Lyrics findFirst
   */
  export interface LyricsFindFirstArgs extends LyricsFindFirstArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findFirstOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * Lyrics findFirstOrThrow
   */
  export type LyricsFindFirstOrThrowArgs = {
    /**
     * Select specific fields to fetch from the Lyrics
     * 
    **/
    select?: LyricsSelect | null
    /**
     * Filter, which Lyrics to fetch.
     * 
    **/
    where?: LyricsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Lyrics to fetch.
     * 
    **/
    orderBy?: Enumerable<LyricsOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Lyrics.
     * 
    **/
    cursor?: LyricsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Lyrics from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Lyrics.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Lyrics.
     * 
    **/
    distinct?: Enumerable<LyricsScalarFieldEnum>
  }


  /**
   * Lyrics findMany
   */
  export type LyricsFindManyArgs = {
    /**
     * Select specific fields to fetch from the Lyrics
     * 
    **/
    select?: LyricsSelect | null
    /**
     * Filter, which Lyrics to fetch.
     * 
    **/
    where?: LyricsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Lyrics to fetch.
     * 
    **/
    orderBy?: Enumerable<LyricsOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Lyrics.
     * 
    **/
    cursor?: LyricsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Lyrics from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Lyrics.
     * 
    **/
    skip?: number
    distinct?: Enumerable<LyricsScalarFieldEnum>
  }


  /**
   * Lyrics create
   */
  export type LyricsCreateArgs = {
    /**
     * Select specific fields to fetch from the Lyrics
     * 
    **/
    select?: LyricsSelect | null
    /**
     * The data needed to create a Lyrics.
     * 
    **/
    data: XOR<LyricsCreateInput, LyricsUncheckedCreateInput>
  }


  /**
   * Lyrics update
   */
  export type LyricsUpdateArgs = {
    /**
     * Select specific fields to fetch from the Lyrics
     * 
    **/
    select?: LyricsSelect | null
    /**
     * The data needed to update a Lyrics.
     * 
    **/
    data: XOR<LyricsUpdateInput, LyricsUncheckedUpdateInput>
    /**
     * Choose, which Lyrics to update.
     * 
    **/
    where: LyricsWhereUniqueInput
  }


  /**
   * Lyrics updateMany
   */
  export type LyricsUpdateManyArgs = {
    /**
     * The data used to update Lyrics.
     * 
    **/
    data: XOR<LyricsUpdateManyMutationInput, LyricsUncheckedUpdateManyInput>
    /**
     * Filter which Lyrics to update
     * 
    **/
    where?: LyricsWhereInput
  }


  /**
   * Lyrics upsert
   */
  export type LyricsUpsertArgs = {
    /**
     * Select specific fields to fetch from the Lyrics
     * 
    **/
    select?: LyricsSelect | null
    /**
     * The filter to search for the Lyrics to update in case it exists.
     * 
    **/
    where: LyricsWhereUniqueInput
    /**
     * In case the Lyrics found by the `where` argument doesn't exist, create a new Lyrics with this data.
     * 
    **/
    create: XOR<LyricsCreateInput, LyricsUncheckedCreateInput>
    /**
     * In case the Lyrics was found with the provided `where` argument, update it with this data.
     * 
    **/
    update: XOR<LyricsUpdateInput, LyricsUncheckedUpdateInput>
  }


  /**
   * Lyrics delete
   */
  export type LyricsDeleteArgs = {
    /**
     * Select specific fields to fetch from the Lyrics
     * 
    **/
    select?: LyricsSelect | null
    /**
     * Filter which Lyrics to delete.
     * 
    **/
    where: LyricsWhereUniqueInput
  }


  /**
   * Lyrics deleteMany
   */
  export type LyricsDeleteManyArgs = {
    /**
     * Filter which Lyrics to delete
     * 
    **/
    where?: LyricsWhereInput
  }


  /**
   * Lyrics without action
   */
  export type LyricsArgs = {
    /**
     * Select specific fields to fetch from the Lyrics
     * 
    **/
    select?: LyricsSelect | null
  }



  /**
   * Model AppleMusicAlbum
   */


  export type AggregateAppleMusicAlbum = {
    _count: AppleMusicAlbumCountAggregateOutputType | null
    _avg: AppleMusicAlbumAvgAggregateOutputType | null
    _sum: AppleMusicAlbumSumAggregateOutputType | null
    _min: AppleMusicAlbumMinAggregateOutputType | null
    _max: AppleMusicAlbumMaxAggregateOutputType | null
  }

  export type AppleMusicAlbumAvgAggregateOutputType = {
    id: number | null
  }

  export type AppleMusicAlbumSumAggregateOutputType = {
    id: number | null
  }

  export type AppleMusicAlbumMinAggregateOutputType = {
    id: number | null
    json: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AppleMusicAlbumMaxAggregateOutputType = {
    id: number | null
    json: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AppleMusicAlbumCountAggregateOutputType = {
    id: number
    json: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AppleMusicAlbumAvgAggregateInputType = {
    id?: true
  }

  export type AppleMusicAlbumSumAggregateInputType = {
    id?: true
  }

  export type AppleMusicAlbumMinAggregateInputType = {
    id?: true
    json?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AppleMusicAlbumMaxAggregateInputType = {
    id?: true
    json?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AppleMusicAlbumCountAggregateInputType = {
    id?: true
    json?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AppleMusicAlbumAggregateArgs = {
    /**
     * Filter which AppleMusicAlbum to aggregate.
     * 
    **/
    where?: AppleMusicAlbumWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppleMusicAlbums to fetch.
     * 
    **/
    orderBy?: Enumerable<AppleMusicAlbumOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     * 
    **/
    cursor?: AppleMusicAlbumWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppleMusicAlbums from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppleMusicAlbums.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AppleMusicAlbums
    **/
    _count?: true | AppleMusicAlbumCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AppleMusicAlbumAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AppleMusicAlbumSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AppleMusicAlbumMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AppleMusicAlbumMaxAggregateInputType
  }

  export type GetAppleMusicAlbumAggregateType<T extends AppleMusicAlbumAggregateArgs> = {
        [P in keyof T & keyof AggregateAppleMusicAlbum]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAppleMusicAlbum[P]>
      : GetScalarType<T[P], AggregateAppleMusicAlbum[P]>
  }




  export type AppleMusicAlbumGroupByArgs = {
    where?: AppleMusicAlbumWhereInput
    orderBy?: Enumerable<AppleMusicAlbumOrderByWithAggregationInput>
    by: Array<AppleMusicAlbumScalarFieldEnum>
    having?: AppleMusicAlbumScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AppleMusicAlbumCountAggregateInputType | true
    _avg?: AppleMusicAlbumAvgAggregateInputType
    _sum?: AppleMusicAlbumSumAggregateInputType
    _min?: AppleMusicAlbumMinAggregateInputType
    _max?: AppleMusicAlbumMaxAggregateInputType
  }


  export type AppleMusicAlbumGroupByOutputType = {
    id: number
    json: string
    createdAt: Date
    updatedAt: Date
    _count: AppleMusicAlbumCountAggregateOutputType | null
    _avg: AppleMusicAlbumAvgAggregateOutputType | null
    _sum: AppleMusicAlbumSumAggregateOutputType | null
    _min: AppleMusicAlbumMinAggregateOutputType | null
    _max: AppleMusicAlbumMaxAggregateOutputType | null
  }

  type GetAppleMusicAlbumGroupByPayload<T extends AppleMusicAlbumGroupByArgs> = PrismaPromise<
    Array<
      PickArray<AppleMusicAlbumGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AppleMusicAlbumGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AppleMusicAlbumGroupByOutputType[P]>
            : GetScalarType<T[P], AppleMusicAlbumGroupByOutputType[P]>
        }
      >
    >


  export type AppleMusicAlbumSelect = {
    id?: boolean
    json?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type AppleMusicAlbumGetPayload<S extends boolean | null | undefined | AppleMusicAlbumArgs> =
    S extends { select: any, include: any } ? 'Please either choose `select` or `include`' :
    S extends true ? AppleMusicAlbum :
    S extends undefined ? never :
    S extends { include: any } & (AppleMusicAlbumArgs | AppleMusicAlbumFindManyArgs)
    ? AppleMusicAlbum 
    : S extends { select: any } & (AppleMusicAlbumArgs | AppleMusicAlbumFindManyArgs)
      ? {
    [P in TruthyKeys<S['select']>]:
    P extends keyof AppleMusicAlbum ? AppleMusicAlbum[P] : never
  } 
      : AppleMusicAlbum


  type AppleMusicAlbumCountArgs = Merge<
    Omit<AppleMusicAlbumFindManyArgs, 'select' | 'include'> & {
      select?: AppleMusicAlbumCountAggregateInputType | true
    }
  >

  export interface AppleMusicAlbumDelegate<GlobalRejectSettings extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined> {
    /**
     * Find zero or one AppleMusicAlbum that matches the filter.
     * @param {AppleMusicAlbumFindUniqueArgs} args - Arguments to find a AppleMusicAlbum
     * @example
     * // Get one AppleMusicAlbum
     * const appleMusicAlbum = await prisma.appleMusicAlbum.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends AppleMusicAlbumFindUniqueArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args: SelectSubset<T, AppleMusicAlbumFindUniqueArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findUnique', 'AppleMusicAlbum'> extends True ? Prisma__AppleMusicAlbumClient<AppleMusicAlbumGetPayload<T>> : Prisma__AppleMusicAlbumClient<AppleMusicAlbumGetPayload<T> | null, null>

    /**
     * Find one AppleMusicAlbum that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {AppleMusicAlbumFindUniqueOrThrowArgs} args - Arguments to find a AppleMusicAlbum
     * @example
     * // Get one AppleMusicAlbum
     * const appleMusicAlbum = await prisma.appleMusicAlbum.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends AppleMusicAlbumFindUniqueOrThrowArgs>(
      args?: SelectSubset<T, AppleMusicAlbumFindUniqueOrThrowArgs>
    ): Prisma__AppleMusicAlbumClient<AppleMusicAlbumGetPayload<T>>

    /**
     * Find the first AppleMusicAlbum that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppleMusicAlbumFindFirstArgs} args - Arguments to find a AppleMusicAlbum
     * @example
     * // Get one AppleMusicAlbum
     * const appleMusicAlbum = await prisma.appleMusicAlbum.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends AppleMusicAlbumFindFirstArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args?: SelectSubset<T, AppleMusicAlbumFindFirstArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findFirst', 'AppleMusicAlbum'> extends True ? Prisma__AppleMusicAlbumClient<AppleMusicAlbumGetPayload<T>> : Prisma__AppleMusicAlbumClient<AppleMusicAlbumGetPayload<T> | null, null>

    /**
     * Find the first AppleMusicAlbum that matches the filter or
     * throw `NotFoundError` if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppleMusicAlbumFindFirstOrThrowArgs} args - Arguments to find a AppleMusicAlbum
     * @example
     * // Get one AppleMusicAlbum
     * const appleMusicAlbum = await prisma.appleMusicAlbum.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends AppleMusicAlbumFindFirstOrThrowArgs>(
      args?: SelectSubset<T, AppleMusicAlbumFindFirstOrThrowArgs>
    ): Prisma__AppleMusicAlbumClient<AppleMusicAlbumGetPayload<T>>

    /**
     * Find zero or more AppleMusicAlbums that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppleMusicAlbumFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AppleMusicAlbums
     * const appleMusicAlbums = await prisma.appleMusicAlbum.findMany()
     * 
     * // Get first 10 AppleMusicAlbums
     * const appleMusicAlbums = await prisma.appleMusicAlbum.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const appleMusicAlbumWithIdOnly = await prisma.appleMusicAlbum.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends AppleMusicAlbumFindManyArgs>(
      args?: SelectSubset<T, AppleMusicAlbumFindManyArgs>
    ): PrismaPromise<Array<AppleMusicAlbumGetPayload<T>>>

    /**
     * Create a AppleMusicAlbum.
     * @param {AppleMusicAlbumCreateArgs} args - Arguments to create a AppleMusicAlbum.
     * @example
     * // Create one AppleMusicAlbum
     * const AppleMusicAlbum = await prisma.appleMusicAlbum.create({
     *   data: {
     *     // ... data to create a AppleMusicAlbum
     *   }
     * })
     * 
    **/
    create<T extends AppleMusicAlbumCreateArgs>(
      args: SelectSubset<T, AppleMusicAlbumCreateArgs>
    ): Prisma__AppleMusicAlbumClient<AppleMusicAlbumGetPayload<T>>

    /**
     * Delete a AppleMusicAlbum.
     * @param {AppleMusicAlbumDeleteArgs} args - Arguments to delete one AppleMusicAlbum.
     * @example
     * // Delete one AppleMusicAlbum
     * const AppleMusicAlbum = await prisma.appleMusicAlbum.delete({
     *   where: {
     *     // ... filter to delete one AppleMusicAlbum
     *   }
     * })
     * 
    **/
    delete<T extends AppleMusicAlbumDeleteArgs>(
      args: SelectSubset<T, AppleMusicAlbumDeleteArgs>
    ): Prisma__AppleMusicAlbumClient<AppleMusicAlbumGetPayload<T>>

    /**
     * Update one AppleMusicAlbum.
     * @param {AppleMusicAlbumUpdateArgs} args - Arguments to update one AppleMusicAlbum.
     * @example
     * // Update one AppleMusicAlbum
     * const appleMusicAlbum = await prisma.appleMusicAlbum.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends AppleMusicAlbumUpdateArgs>(
      args: SelectSubset<T, AppleMusicAlbumUpdateArgs>
    ): Prisma__AppleMusicAlbumClient<AppleMusicAlbumGetPayload<T>>

    /**
     * Delete zero or more AppleMusicAlbums.
     * @param {AppleMusicAlbumDeleteManyArgs} args - Arguments to filter AppleMusicAlbums to delete.
     * @example
     * // Delete a few AppleMusicAlbums
     * const { count } = await prisma.appleMusicAlbum.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends AppleMusicAlbumDeleteManyArgs>(
      args?: SelectSubset<T, AppleMusicAlbumDeleteManyArgs>
    ): PrismaPromise<BatchPayload>

    /**
     * Update zero or more AppleMusicAlbums.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppleMusicAlbumUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AppleMusicAlbums
     * const appleMusicAlbum = await prisma.appleMusicAlbum.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends AppleMusicAlbumUpdateManyArgs>(
      args: SelectSubset<T, AppleMusicAlbumUpdateManyArgs>
    ): PrismaPromise<BatchPayload>

    /**
     * Create or update one AppleMusicAlbum.
     * @param {AppleMusicAlbumUpsertArgs} args - Arguments to update or create a AppleMusicAlbum.
     * @example
     * // Update or create a AppleMusicAlbum
     * const appleMusicAlbum = await prisma.appleMusicAlbum.upsert({
     *   create: {
     *     // ... data to create a AppleMusicAlbum
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AppleMusicAlbum we want to update
     *   }
     * })
    **/
    upsert<T extends AppleMusicAlbumUpsertArgs>(
      args: SelectSubset<T, AppleMusicAlbumUpsertArgs>
    ): Prisma__AppleMusicAlbumClient<AppleMusicAlbumGetPayload<T>>

    /**
     * Count the number of AppleMusicAlbums.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppleMusicAlbumCountArgs} args - Arguments to filter AppleMusicAlbums to count.
     * @example
     * // Count the number of AppleMusicAlbums
     * const count = await prisma.appleMusicAlbum.count({
     *   where: {
     *     // ... the filter for the AppleMusicAlbums we want to count
     *   }
     * })
    **/
    count<T extends AppleMusicAlbumCountArgs>(
      args?: Subset<T, AppleMusicAlbumCountArgs>,
    ): PrismaPromise<
      T extends _Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AppleMusicAlbumCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AppleMusicAlbum.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppleMusicAlbumAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AppleMusicAlbumAggregateArgs>(args: Subset<T, AppleMusicAlbumAggregateArgs>): PrismaPromise<GetAppleMusicAlbumAggregateType<T>>

    /**
     * Group by AppleMusicAlbum.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppleMusicAlbumGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AppleMusicAlbumGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AppleMusicAlbumGroupByArgs['orderBy'] }
        : { orderBy?: AppleMusicAlbumGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends TupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AppleMusicAlbumGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAppleMusicAlbumGroupByPayload<T> : PrismaPromise<InputErrors>

  }

  /**
   * The delegate class that acts as a "Promise-like" for AppleMusicAlbum.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export class Prisma__AppleMusicAlbumClient<T, Null = never> implements PrismaPromise<T> {
    [prisma]: true;
    private readonly _dmmf;
    private readonly _fetcher;
    private readonly _queryType;
    private readonly _rootField;
    private readonly _clientMethod;
    private readonly _args;
    private readonly _dataPath;
    private readonly _errorFormat;
    private readonly _measurePerformance?;
    private _isList;
    private _callsite;
    private _requestPromise?;
    constructor(_dmmf: runtime.DMMFClass, _fetcher: PrismaClientFetcher, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);
    readonly [Symbol.toStringTag]: 'PrismaClientPromise';


    private get _document();
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  }



  // Custom InputTypes

  /**
   * AppleMusicAlbum base type for findUnique actions
   */
  export type AppleMusicAlbumFindUniqueArgsBase = {
    /**
     * Select specific fields to fetch from the AppleMusicAlbum
     * 
    **/
    select?: AppleMusicAlbumSelect | null
    /**
     * Filter, which AppleMusicAlbum to fetch.
     * 
    **/
    where: AppleMusicAlbumWhereUniqueInput
  }

  /**
   * AppleMusicAlbum findUnique
   */
  export interface AppleMusicAlbumFindUniqueArgs extends AppleMusicAlbumFindUniqueArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findUniqueOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * AppleMusicAlbum findUniqueOrThrow
   */
  export type AppleMusicAlbumFindUniqueOrThrowArgs = {
    /**
     * Select specific fields to fetch from the AppleMusicAlbum
     * 
    **/
    select?: AppleMusicAlbumSelect | null
    /**
     * Filter, which AppleMusicAlbum to fetch.
     * 
    **/
    where: AppleMusicAlbumWhereUniqueInput
  }


  /**
   * AppleMusicAlbum base type for findFirst actions
   */
  export type AppleMusicAlbumFindFirstArgsBase = {
    /**
     * Select specific fields to fetch from the AppleMusicAlbum
     * 
    **/
    select?: AppleMusicAlbumSelect | null
    /**
     * Filter, which AppleMusicAlbum to fetch.
     * 
    **/
    where?: AppleMusicAlbumWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppleMusicAlbums to fetch.
     * 
    **/
    orderBy?: Enumerable<AppleMusicAlbumOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AppleMusicAlbums.
     * 
    **/
    cursor?: AppleMusicAlbumWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppleMusicAlbums from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppleMusicAlbums.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AppleMusicAlbums.
     * 
    **/
    distinct?: Enumerable<AppleMusicAlbumScalarFieldEnum>
  }

  /**
   * AppleMusicAlbum findFirst
   */
  export interface AppleMusicAlbumFindFirstArgs extends AppleMusicAlbumFindFirstArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findFirstOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * AppleMusicAlbum findFirstOrThrow
   */
  export type AppleMusicAlbumFindFirstOrThrowArgs = {
    /**
     * Select specific fields to fetch from the AppleMusicAlbum
     * 
    **/
    select?: AppleMusicAlbumSelect | null
    /**
     * Filter, which AppleMusicAlbum to fetch.
     * 
    **/
    where?: AppleMusicAlbumWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppleMusicAlbums to fetch.
     * 
    **/
    orderBy?: Enumerable<AppleMusicAlbumOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AppleMusicAlbums.
     * 
    **/
    cursor?: AppleMusicAlbumWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppleMusicAlbums from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppleMusicAlbums.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AppleMusicAlbums.
     * 
    **/
    distinct?: Enumerable<AppleMusicAlbumScalarFieldEnum>
  }


  /**
   * AppleMusicAlbum findMany
   */
  export type AppleMusicAlbumFindManyArgs = {
    /**
     * Select specific fields to fetch from the AppleMusicAlbum
     * 
    **/
    select?: AppleMusicAlbumSelect | null
    /**
     * Filter, which AppleMusicAlbums to fetch.
     * 
    **/
    where?: AppleMusicAlbumWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppleMusicAlbums to fetch.
     * 
    **/
    orderBy?: Enumerable<AppleMusicAlbumOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AppleMusicAlbums.
     * 
    **/
    cursor?: AppleMusicAlbumWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppleMusicAlbums from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppleMusicAlbums.
     * 
    **/
    skip?: number
    distinct?: Enumerable<AppleMusicAlbumScalarFieldEnum>
  }


  /**
   * AppleMusicAlbum create
   */
  export type AppleMusicAlbumCreateArgs = {
    /**
     * Select specific fields to fetch from the AppleMusicAlbum
     * 
    **/
    select?: AppleMusicAlbumSelect | null
    /**
     * The data needed to create a AppleMusicAlbum.
     * 
    **/
    data: XOR<AppleMusicAlbumCreateInput, AppleMusicAlbumUncheckedCreateInput>
  }


  /**
   * AppleMusicAlbum update
   */
  export type AppleMusicAlbumUpdateArgs = {
    /**
     * Select specific fields to fetch from the AppleMusicAlbum
     * 
    **/
    select?: AppleMusicAlbumSelect | null
    /**
     * The data needed to update a AppleMusicAlbum.
     * 
    **/
    data: XOR<AppleMusicAlbumUpdateInput, AppleMusicAlbumUncheckedUpdateInput>
    /**
     * Choose, which AppleMusicAlbum to update.
     * 
    **/
    where: AppleMusicAlbumWhereUniqueInput
  }


  /**
   * AppleMusicAlbum updateMany
   */
  export type AppleMusicAlbumUpdateManyArgs = {
    /**
     * The data used to update AppleMusicAlbums.
     * 
    **/
    data: XOR<AppleMusicAlbumUpdateManyMutationInput, AppleMusicAlbumUncheckedUpdateManyInput>
    /**
     * Filter which AppleMusicAlbums to update
     * 
    **/
    where?: AppleMusicAlbumWhereInput
  }


  /**
   * AppleMusicAlbum upsert
   */
  export type AppleMusicAlbumUpsertArgs = {
    /**
     * Select specific fields to fetch from the AppleMusicAlbum
     * 
    **/
    select?: AppleMusicAlbumSelect | null
    /**
     * The filter to search for the AppleMusicAlbum to update in case it exists.
     * 
    **/
    where: AppleMusicAlbumWhereUniqueInput
    /**
     * In case the AppleMusicAlbum found by the `where` argument doesn't exist, create a new AppleMusicAlbum with this data.
     * 
    **/
    create: XOR<AppleMusicAlbumCreateInput, AppleMusicAlbumUncheckedCreateInput>
    /**
     * In case the AppleMusicAlbum was found with the provided `where` argument, update it with this data.
     * 
    **/
    update: XOR<AppleMusicAlbumUpdateInput, AppleMusicAlbumUncheckedUpdateInput>
  }


  /**
   * AppleMusicAlbum delete
   */
  export type AppleMusicAlbumDeleteArgs = {
    /**
     * Select specific fields to fetch from the AppleMusicAlbum
     * 
    **/
    select?: AppleMusicAlbumSelect | null
    /**
     * Filter which AppleMusicAlbum to delete.
     * 
    **/
    where: AppleMusicAlbumWhereUniqueInput
  }


  /**
   * AppleMusicAlbum deleteMany
   */
  export type AppleMusicAlbumDeleteManyArgs = {
    /**
     * Filter which AppleMusicAlbums to delete
     * 
    **/
    where?: AppleMusicAlbumWhereInput
  }


  /**
   * AppleMusicAlbum without action
   */
  export type AppleMusicAlbumArgs = {
    /**
     * Select specific fields to fetch from the AppleMusicAlbum
     * 
    **/
    select?: AppleMusicAlbumSelect | null
  }



  /**
   * Model AppleMusicArtist
   */


  export type AggregateAppleMusicArtist = {
    _count: AppleMusicArtistCountAggregateOutputType | null
    _avg: AppleMusicArtistAvgAggregateOutputType | null
    _sum: AppleMusicArtistSumAggregateOutputType | null
    _min: AppleMusicArtistMinAggregateOutputType | null
    _max: AppleMusicArtistMaxAggregateOutputType | null
  }

  export type AppleMusicArtistAvgAggregateOutputType = {
    id: number | null
  }

  export type AppleMusicArtistSumAggregateOutputType = {
    id: number | null
  }

  export type AppleMusicArtistMinAggregateOutputType = {
    id: number | null
    json: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AppleMusicArtistMaxAggregateOutputType = {
    id: number | null
    json: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type AppleMusicArtistCountAggregateOutputType = {
    id: number
    json: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type AppleMusicArtistAvgAggregateInputType = {
    id?: true
  }

  export type AppleMusicArtistSumAggregateInputType = {
    id?: true
  }

  export type AppleMusicArtistMinAggregateInputType = {
    id?: true
    json?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AppleMusicArtistMaxAggregateInputType = {
    id?: true
    json?: true
    createdAt?: true
    updatedAt?: true
  }

  export type AppleMusicArtistCountAggregateInputType = {
    id?: true
    json?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type AppleMusicArtistAggregateArgs = {
    /**
     * Filter which AppleMusicArtist to aggregate.
     * 
    **/
    where?: AppleMusicArtistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppleMusicArtists to fetch.
     * 
    **/
    orderBy?: Enumerable<AppleMusicArtistOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     * 
    **/
    cursor?: AppleMusicArtistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppleMusicArtists from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppleMusicArtists.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AppleMusicArtists
    **/
    _count?: true | AppleMusicArtistCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AppleMusicArtistAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AppleMusicArtistSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AppleMusicArtistMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AppleMusicArtistMaxAggregateInputType
  }

  export type GetAppleMusicArtistAggregateType<T extends AppleMusicArtistAggregateArgs> = {
        [P in keyof T & keyof AggregateAppleMusicArtist]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAppleMusicArtist[P]>
      : GetScalarType<T[P], AggregateAppleMusicArtist[P]>
  }




  export type AppleMusicArtistGroupByArgs = {
    where?: AppleMusicArtistWhereInput
    orderBy?: Enumerable<AppleMusicArtistOrderByWithAggregationInput>
    by: Array<AppleMusicArtistScalarFieldEnum>
    having?: AppleMusicArtistScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AppleMusicArtistCountAggregateInputType | true
    _avg?: AppleMusicArtistAvgAggregateInputType
    _sum?: AppleMusicArtistSumAggregateInputType
    _min?: AppleMusicArtistMinAggregateInputType
    _max?: AppleMusicArtistMaxAggregateInputType
  }


  export type AppleMusicArtistGroupByOutputType = {
    id: number
    json: string
    createdAt: Date
    updatedAt: Date
    _count: AppleMusicArtistCountAggregateOutputType | null
    _avg: AppleMusicArtistAvgAggregateOutputType | null
    _sum: AppleMusicArtistSumAggregateOutputType | null
    _min: AppleMusicArtistMinAggregateOutputType | null
    _max: AppleMusicArtistMaxAggregateOutputType | null
  }

  type GetAppleMusicArtistGroupByPayload<T extends AppleMusicArtistGroupByArgs> = PrismaPromise<
    Array<
      PickArray<AppleMusicArtistGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AppleMusicArtistGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AppleMusicArtistGroupByOutputType[P]>
            : GetScalarType<T[P], AppleMusicArtistGroupByOutputType[P]>
        }
      >
    >


  export type AppleMusicArtistSelect = {
    id?: boolean
    json?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }


  export type AppleMusicArtistGetPayload<S extends boolean | null | undefined | AppleMusicArtistArgs> =
    S extends { select: any, include: any } ? 'Please either choose `select` or `include`' :
    S extends true ? AppleMusicArtist :
    S extends undefined ? never :
    S extends { include: any } & (AppleMusicArtistArgs | AppleMusicArtistFindManyArgs)
    ? AppleMusicArtist 
    : S extends { select: any } & (AppleMusicArtistArgs | AppleMusicArtistFindManyArgs)
      ? {
    [P in TruthyKeys<S['select']>]:
    P extends keyof AppleMusicArtist ? AppleMusicArtist[P] : never
  } 
      : AppleMusicArtist


  type AppleMusicArtistCountArgs = Merge<
    Omit<AppleMusicArtistFindManyArgs, 'select' | 'include'> & {
      select?: AppleMusicArtistCountAggregateInputType | true
    }
  >

  export interface AppleMusicArtistDelegate<GlobalRejectSettings extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined> {
    /**
     * Find zero or one AppleMusicArtist that matches the filter.
     * @param {AppleMusicArtistFindUniqueArgs} args - Arguments to find a AppleMusicArtist
     * @example
     * // Get one AppleMusicArtist
     * const appleMusicArtist = await prisma.appleMusicArtist.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUnique<T extends AppleMusicArtistFindUniqueArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args: SelectSubset<T, AppleMusicArtistFindUniqueArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findUnique', 'AppleMusicArtist'> extends True ? Prisma__AppleMusicArtistClient<AppleMusicArtistGetPayload<T>> : Prisma__AppleMusicArtistClient<AppleMusicArtistGetPayload<T> | null, null>

    /**
     * Find one AppleMusicArtist that matches the filter or throw an error  with `error.code='P2025'` 
     *     if no matches were found.
     * @param {AppleMusicArtistFindUniqueOrThrowArgs} args - Arguments to find a AppleMusicArtist
     * @example
     * // Get one AppleMusicArtist
     * const appleMusicArtist = await prisma.appleMusicArtist.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findUniqueOrThrow<T extends AppleMusicArtistFindUniqueOrThrowArgs>(
      args?: SelectSubset<T, AppleMusicArtistFindUniqueOrThrowArgs>
    ): Prisma__AppleMusicArtistClient<AppleMusicArtistGetPayload<T>>

    /**
     * Find the first AppleMusicArtist that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppleMusicArtistFindFirstArgs} args - Arguments to find a AppleMusicArtist
     * @example
     * // Get one AppleMusicArtist
     * const appleMusicArtist = await prisma.appleMusicArtist.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirst<T extends AppleMusicArtistFindFirstArgs,  LocalRejectSettings = T["rejectOnNotFound"] extends RejectOnNotFound ? T['rejectOnNotFound'] : undefined>(
      args?: SelectSubset<T, AppleMusicArtistFindFirstArgs>
    ): HasReject<GlobalRejectSettings, LocalRejectSettings, 'findFirst', 'AppleMusicArtist'> extends True ? Prisma__AppleMusicArtistClient<AppleMusicArtistGetPayload<T>> : Prisma__AppleMusicArtistClient<AppleMusicArtistGetPayload<T> | null, null>

    /**
     * Find the first AppleMusicArtist that matches the filter or
     * throw `NotFoundError` if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppleMusicArtistFindFirstOrThrowArgs} args - Arguments to find a AppleMusicArtist
     * @example
     * // Get one AppleMusicArtist
     * const appleMusicArtist = await prisma.appleMusicArtist.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
    **/
    findFirstOrThrow<T extends AppleMusicArtistFindFirstOrThrowArgs>(
      args?: SelectSubset<T, AppleMusicArtistFindFirstOrThrowArgs>
    ): Prisma__AppleMusicArtistClient<AppleMusicArtistGetPayload<T>>

    /**
     * Find zero or more AppleMusicArtists that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppleMusicArtistFindManyArgs=} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AppleMusicArtists
     * const appleMusicArtists = await prisma.appleMusicArtist.findMany()
     * 
     * // Get first 10 AppleMusicArtists
     * const appleMusicArtists = await prisma.appleMusicArtist.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const appleMusicArtistWithIdOnly = await prisma.appleMusicArtist.findMany({ select: { id: true } })
     * 
    **/
    findMany<T extends AppleMusicArtistFindManyArgs>(
      args?: SelectSubset<T, AppleMusicArtistFindManyArgs>
    ): PrismaPromise<Array<AppleMusicArtistGetPayload<T>>>

    /**
     * Create a AppleMusicArtist.
     * @param {AppleMusicArtistCreateArgs} args - Arguments to create a AppleMusicArtist.
     * @example
     * // Create one AppleMusicArtist
     * const AppleMusicArtist = await prisma.appleMusicArtist.create({
     *   data: {
     *     // ... data to create a AppleMusicArtist
     *   }
     * })
     * 
    **/
    create<T extends AppleMusicArtistCreateArgs>(
      args: SelectSubset<T, AppleMusicArtistCreateArgs>
    ): Prisma__AppleMusicArtistClient<AppleMusicArtistGetPayload<T>>

    /**
     * Delete a AppleMusicArtist.
     * @param {AppleMusicArtistDeleteArgs} args - Arguments to delete one AppleMusicArtist.
     * @example
     * // Delete one AppleMusicArtist
     * const AppleMusicArtist = await prisma.appleMusicArtist.delete({
     *   where: {
     *     // ... filter to delete one AppleMusicArtist
     *   }
     * })
     * 
    **/
    delete<T extends AppleMusicArtistDeleteArgs>(
      args: SelectSubset<T, AppleMusicArtistDeleteArgs>
    ): Prisma__AppleMusicArtistClient<AppleMusicArtistGetPayload<T>>

    /**
     * Update one AppleMusicArtist.
     * @param {AppleMusicArtistUpdateArgs} args - Arguments to update one AppleMusicArtist.
     * @example
     * // Update one AppleMusicArtist
     * const appleMusicArtist = await prisma.appleMusicArtist.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    update<T extends AppleMusicArtistUpdateArgs>(
      args: SelectSubset<T, AppleMusicArtistUpdateArgs>
    ): Prisma__AppleMusicArtistClient<AppleMusicArtistGetPayload<T>>

    /**
     * Delete zero or more AppleMusicArtists.
     * @param {AppleMusicArtistDeleteManyArgs} args - Arguments to filter AppleMusicArtists to delete.
     * @example
     * // Delete a few AppleMusicArtists
     * const { count } = await prisma.appleMusicArtist.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
    **/
    deleteMany<T extends AppleMusicArtistDeleteManyArgs>(
      args?: SelectSubset<T, AppleMusicArtistDeleteManyArgs>
    ): PrismaPromise<BatchPayload>

    /**
     * Update zero or more AppleMusicArtists.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppleMusicArtistUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AppleMusicArtists
     * const appleMusicArtist = await prisma.appleMusicArtist.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
    **/
    updateMany<T extends AppleMusicArtistUpdateManyArgs>(
      args: SelectSubset<T, AppleMusicArtistUpdateManyArgs>
    ): PrismaPromise<BatchPayload>

    /**
     * Create or update one AppleMusicArtist.
     * @param {AppleMusicArtistUpsertArgs} args - Arguments to update or create a AppleMusicArtist.
     * @example
     * // Update or create a AppleMusicArtist
     * const appleMusicArtist = await prisma.appleMusicArtist.upsert({
     *   create: {
     *     // ... data to create a AppleMusicArtist
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AppleMusicArtist we want to update
     *   }
     * })
    **/
    upsert<T extends AppleMusicArtistUpsertArgs>(
      args: SelectSubset<T, AppleMusicArtistUpsertArgs>
    ): Prisma__AppleMusicArtistClient<AppleMusicArtistGetPayload<T>>

    /**
     * Count the number of AppleMusicArtists.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppleMusicArtistCountArgs} args - Arguments to filter AppleMusicArtists to count.
     * @example
     * // Count the number of AppleMusicArtists
     * const count = await prisma.appleMusicArtist.count({
     *   where: {
     *     // ... the filter for the AppleMusicArtists we want to count
     *   }
     * })
    **/
    count<T extends AppleMusicArtistCountArgs>(
      args?: Subset<T, AppleMusicArtistCountArgs>,
    ): PrismaPromise<
      T extends _Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AppleMusicArtistCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AppleMusicArtist.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppleMusicArtistAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AppleMusicArtistAggregateArgs>(args: Subset<T, AppleMusicArtistAggregateArgs>): PrismaPromise<GetAppleMusicArtistAggregateType<T>>

    /**
     * Group by AppleMusicArtist.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AppleMusicArtistGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AppleMusicArtistGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AppleMusicArtistGroupByArgs['orderBy'] }
        : { orderBy?: AppleMusicArtistGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends TupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AppleMusicArtistGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAppleMusicArtistGroupByPayload<T> : PrismaPromise<InputErrors>

  }

  /**
   * The delegate class that acts as a "Promise-like" for AppleMusicArtist.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export class Prisma__AppleMusicArtistClient<T, Null = never> implements PrismaPromise<T> {
    [prisma]: true;
    private readonly _dmmf;
    private readonly _fetcher;
    private readonly _queryType;
    private readonly _rootField;
    private readonly _clientMethod;
    private readonly _args;
    private readonly _dataPath;
    private readonly _errorFormat;
    private readonly _measurePerformance?;
    private _isList;
    private _callsite;
    private _requestPromise?;
    constructor(_dmmf: runtime.DMMFClass, _fetcher: PrismaClientFetcher, _queryType: 'query' | 'mutation', _rootField: string, _clientMethod: string, _args: any, _dataPath: string[], _errorFormat: ErrorFormat, _measurePerformance?: boolean | undefined, _isList?: boolean);
    readonly [Symbol.toStringTag]: 'PrismaClientPromise';


    private get _document();
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): Promise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): Promise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): Promise<T>;
  }



  // Custom InputTypes

  /**
   * AppleMusicArtist base type for findUnique actions
   */
  export type AppleMusicArtistFindUniqueArgsBase = {
    /**
     * Select specific fields to fetch from the AppleMusicArtist
     * 
    **/
    select?: AppleMusicArtistSelect | null
    /**
     * Filter, which AppleMusicArtist to fetch.
     * 
    **/
    where: AppleMusicArtistWhereUniqueInput
  }

  /**
   * AppleMusicArtist findUnique
   */
  export interface AppleMusicArtistFindUniqueArgs extends AppleMusicArtistFindUniqueArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findUniqueOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * AppleMusicArtist findUniqueOrThrow
   */
  export type AppleMusicArtistFindUniqueOrThrowArgs = {
    /**
     * Select specific fields to fetch from the AppleMusicArtist
     * 
    **/
    select?: AppleMusicArtistSelect | null
    /**
     * Filter, which AppleMusicArtist to fetch.
     * 
    **/
    where: AppleMusicArtistWhereUniqueInput
  }


  /**
   * AppleMusicArtist base type for findFirst actions
   */
  export type AppleMusicArtistFindFirstArgsBase = {
    /**
     * Select specific fields to fetch from the AppleMusicArtist
     * 
    **/
    select?: AppleMusicArtistSelect | null
    /**
     * Filter, which AppleMusicArtist to fetch.
     * 
    **/
    where?: AppleMusicArtistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppleMusicArtists to fetch.
     * 
    **/
    orderBy?: Enumerable<AppleMusicArtistOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AppleMusicArtists.
     * 
    **/
    cursor?: AppleMusicArtistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppleMusicArtists from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppleMusicArtists.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AppleMusicArtists.
     * 
    **/
    distinct?: Enumerable<AppleMusicArtistScalarFieldEnum>
  }

  /**
   * AppleMusicArtist findFirst
   */
  export interface AppleMusicArtistFindFirstArgs extends AppleMusicArtistFindFirstArgsBase {
   /**
    * Throw an Error if query returns no results
    * @deprecated since 4.0.0: use `findFirstOrThrow` method instead
    */
    rejectOnNotFound?: RejectOnNotFound
  }
      

  /**
   * AppleMusicArtist findFirstOrThrow
   */
  export type AppleMusicArtistFindFirstOrThrowArgs = {
    /**
     * Select specific fields to fetch from the AppleMusicArtist
     * 
    **/
    select?: AppleMusicArtistSelect | null
    /**
     * Filter, which AppleMusicArtist to fetch.
     * 
    **/
    where?: AppleMusicArtistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppleMusicArtists to fetch.
     * 
    **/
    orderBy?: Enumerable<AppleMusicArtistOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AppleMusicArtists.
     * 
    **/
    cursor?: AppleMusicArtistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppleMusicArtists from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppleMusicArtists.
     * 
    **/
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AppleMusicArtists.
     * 
    **/
    distinct?: Enumerable<AppleMusicArtistScalarFieldEnum>
  }


  /**
   * AppleMusicArtist findMany
   */
  export type AppleMusicArtistFindManyArgs = {
    /**
     * Select specific fields to fetch from the AppleMusicArtist
     * 
    **/
    select?: AppleMusicArtistSelect | null
    /**
     * Filter, which AppleMusicArtists to fetch.
     * 
    **/
    where?: AppleMusicArtistWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AppleMusicArtists to fetch.
     * 
    **/
    orderBy?: Enumerable<AppleMusicArtistOrderByWithRelationInput>
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AppleMusicArtists.
     * 
    **/
    cursor?: AppleMusicArtistWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AppleMusicArtists from the position of the cursor.
     * 
    **/
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AppleMusicArtists.
     * 
    **/
    skip?: number
    distinct?: Enumerable<AppleMusicArtistScalarFieldEnum>
  }


  /**
   * AppleMusicArtist create
   */
  export type AppleMusicArtistCreateArgs = {
    /**
     * Select specific fields to fetch from the AppleMusicArtist
     * 
    **/
    select?: AppleMusicArtistSelect | null
    /**
     * The data needed to create a AppleMusicArtist.
     * 
    **/
    data: XOR<AppleMusicArtistCreateInput, AppleMusicArtistUncheckedCreateInput>
  }


  /**
   * AppleMusicArtist update
   */
  export type AppleMusicArtistUpdateArgs = {
    /**
     * Select specific fields to fetch from the AppleMusicArtist
     * 
    **/
    select?: AppleMusicArtistSelect | null
    /**
     * The data needed to update a AppleMusicArtist.
     * 
    **/
    data: XOR<AppleMusicArtistUpdateInput, AppleMusicArtistUncheckedUpdateInput>
    /**
     * Choose, which AppleMusicArtist to update.
     * 
    **/
    where: AppleMusicArtistWhereUniqueInput
  }


  /**
   * AppleMusicArtist updateMany
   */
  export type AppleMusicArtistUpdateManyArgs = {
    /**
     * The data used to update AppleMusicArtists.
     * 
    **/
    data: XOR<AppleMusicArtistUpdateManyMutationInput, AppleMusicArtistUncheckedUpdateManyInput>
    /**
     * Filter which AppleMusicArtists to update
     * 
    **/
    where?: AppleMusicArtistWhereInput
  }


  /**
   * AppleMusicArtist upsert
   */
  export type AppleMusicArtistUpsertArgs = {
    /**
     * Select specific fields to fetch from the AppleMusicArtist
     * 
    **/
    select?: AppleMusicArtistSelect | null
    /**
     * The filter to search for the AppleMusicArtist to update in case it exists.
     * 
    **/
    where: AppleMusicArtistWhereUniqueInput
    /**
     * In case the AppleMusicArtist found by the `where` argument doesn't exist, create a new AppleMusicArtist with this data.
     * 
    **/
    create: XOR<AppleMusicArtistCreateInput, AppleMusicArtistUncheckedCreateInput>
    /**
     * In case the AppleMusicArtist was found with the provided `where` argument, update it with this data.
     * 
    **/
    update: XOR<AppleMusicArtistUpdateInput, AppleMusicArtistUncheckedUpdateInput>
  }


  /**
   * AppleMusicArtist delete
   */
  export type AppleMusicArtistDeleteArgs = {
    /**
     * Select specific fields to fetch from the AppleMusicArtist
     * 
    **/
    select?: AppleMusicArtistSelect | null
    /**
     * Filter which AppleMusicArtist to delete.
     * 
    **/
    where: AppleMusicArtistWhereUniqueInput
  }


  /**
   * AppleMusicArtist deleteMany
   */
  export type AppleMusicArtistDeleteManyArgs = {
    /**
     * Filter which AppleMusicArtists to delete
     * 
    **/
    where?: AppleMusicArtistWhereInput
  }


  /**
   * AppleMusicArtist without action
   */
  export type AppleMusicArtistArgs = {
    /**
     * Select specific fields to fetch from the AppleMusicArtist
     * 
    **/
    select?: AppleMusicArtistSelect | null
  }



  /**
   * Enums
   */

  // Based on
  // https://github.com/microsoft/TypeScript/issues/3192#issuecomment-261720275

  export const AccountDataScalarFieldEnum: {
    id: 'id',
    json: 'json',
    updatedAt: 'updatedAt'
  };

  export type AccountDataScalarFieldEnum = (typeof AccountDataScalarFieldEnum)[keyof typeof AccountDataScalarFieldEnum]


  export const AlbumScalarFieldEnum: {
    id: 'id',
    json: 'json',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AlbumScalarFieldEnum = (typeof AlbumScalarFieldEnum)[keyof typeof AlbumScalarFieldEnum]


  export const AppDataScalarFieldEnum: {
    id: 'id',
    value: 'value'
  };

  export type AppDataScalarFieldEnum = (typeof AppDataScalarFieldEnum)[keyof typeof AppDataScalarFieldEnum]


  export const AppleMusicAlbumScalarFieldEnum: {
    id: 'id',
    json: 'json',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AppleMusicAlbumScalarFieldEnum = (typeof AppleMusicAlbumScalarFieldEnum)[keyof typeof AppleMusicAlbumScalarFieldEnum]


  export const AppleMusicArtistScalarFieldEnum: {
    id: 'id',
    json: 'json',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type AppleMusicArtistScalarFieldEnum = (typeof AppleMusicArtistScalarFieldEnum)[keyof typeof AppleMusicArtistScalarFieldEnum]


  export const ArtistAlbumScalarFieldEnum: {
    id: 'id',
    hotAlbums: 'hotAlbums',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ArtistAlbumScalarFieldEnum = (typeof ArtistAlbumScalarFieldEnum)[keyof typeof ArtistAlbumScalarFieldEnum]


  export const ArtistScalarFieldEnum: {
    id: 'id',
    json: 'json',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ArtistScalarFieldEnum = (typeof ArtistScalarFieldEnum)[keyof typeof ArtistScalarFieldEnum]


  export const AudioScalarFieldEnum: {
    id: 'id',
    bitRate: 'bitRate',
    format: 'format',
    source: 'source',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt',
    queriedAt: 'queriedAt'
  };

  export type AudioScalarFieldEnum = (typeof AudioScalarFieldEnum)[keyof typeof AudioScalarFieldEnum]


  export const LyricsScalarFieldEnum: {
    id: 'id',
    json: 'json',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type LyricsScalarFieldEnum = (typeof LyricsScalarFieldEnum)[keyof typeof LyricsScalarFieldEnum]


  export const PlaylistScalarFieldEnum: {
    id: 'id',
    json: 'json',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type PlaylistScalarFieldEnum = (typeof PlaylistScalarFieldEnum)[keyof typeof PlaylistScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const TrackScalarFieldEnum: {
    id: 'id',
    json: 'json',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type TrackScalarFieldEnum = (typeof TrackScalarFieldEnum)[keyof typeof TrackScalarFieldEnum]


  export const TransactionIsolationLevel: {
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  /**
   * Deep Input Types
   */


  export type AccountDataWhereInput = {
    AND?: Enumerable<AccountDataWhereInput>
    OR?: Enumerable<AccountDataWhereInput>
    NOT?: Enumerable<AccountDataWhereInput>
    id?: StringFilter | string
    json?: StringFilter | string
    updatedAt?: DateTimeFilter | Date | string
  }

  export type AccountDataOrderByWithRelationInput = {
    id?: SortOrder
    json?: SortOrder
    updatedAt?: SortOrder
  }

  export type AccountDataWhereUniqueInput = {
    id?: string
  }

  export type AccountDataOrderByWithAggregationInput = {
    id?: SortOrder
    json?: SortOrder
    updatedAt?: SortOrder
    _count?: AccountDataCountOrderByAggregateInput
    _max?: AccountDataMaxOrderByAggregateInput
    _min?: AccountDataMinOrderByAggregateInput
  }

  export type AccountDataScalarWhereWithAggregatesInput = {
    AND?: Enumerable<AccountDataScalarWhereWithAggregatesInput>
    OR?: Enumerable<AccountDataScalarWhereWithAggregatesInput>
    NOT?: Enumerable<AccountDataScalarWhereWithAggregatesInput>
    id?: StringWithAggregatesFilter | string
    json?: StringWithAggregatesFilter | string
    updatedAt?: DateTimeWithAggregatesFilter | Date | string
  }

  export type AppDataWhereInput = {
    AND?: Enumerable<AppDataWhereInput>
    OR?: Enumerable<AppDataWhereInput>
    NOT?: Enumerable<AppDataWhereInput>
    id?: StringFilter | string
    value?: StringFilter | string
  }

  export type AppDataOrderByWithRelationInput = {
    id?: SortOrder
    value?: SortOrder
  }

  export type AppDataWhereUniqueInput = {
    id?: string
  }

  export type AppDataOrderByWithAggregationInput = {
    id?: SortOrder
    value?: SortOrder
    _count?: AppDataCountOrderByAggregateInput
    _max?: AppDataMaxOrderByAggregateInput
    _min?: AppDataMinOrderByAggregateInput
  }

  export type AppDataScalarWhereWithAggregatesInput = {
    AND?: Enumerable<AppDataScalarWhereWithAggregatesInput>
    OR?: Enumerable<AppDataScalarWhereWithAggregatesInput>
    NOT?: Enumerable<AppDataScalarWhereWithAggregatesInput>
    id?: StringWithAggregatesFilter | string
    value?: StringWithAggregatesFilter | string
  }

  export type TrackWhereInput = {
    AND?: Enumerable<TrackWhereInput>
    OR?: Enumerable<TrackWhereInput>
    NOT?: Enumerable<TrackWhereInput>
    id?: IntFilter | number
    json?: StringFilter | string
    createdAt?: DateTimeFilter | Date | string
    updatedAt?: DateTimeFilter | Date | string
  }

  export type TrackOrderByWithRelationInput = {
    id?: SortOrder
    json?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TrackWhereUniqueInput = {
    id?: number
  }

  export type TrackOrderByWithAggregationInput = {
    id?: SortOrder
    json?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: TrackCountOrderByAggregateInput
    _avg?: TrackAvgOrderByAggregateInput
    _max?: TrackMaxOrderByAggregateInput
    _min?: TrackMinOrderByAggregateInput
    _sum?: TrackSumOrderByAggregateInput
  }

  export type TrackScalarWhereWithAggregatesInput = {
    AND?: Enumerable<TrackScalarWhereWithAggregatesInput>
    OR?: Enumerable<TrackScalarWhereWithAggregatesInput>
    NOT?: Enumerable<TrackScalarWhereWithAggregatesInput>
    id?: IntWithAggregatesFilter | number
    json?: StringWithAggregatesFilter | string
    createdAt?: DateTimeWithAggregatesFilter | Date | string
    updatedAt?: DateTimeWithAggregatesFilter | Date | string
  }

  export type AlbumWhereInput = {
    AND?: Enumerable<AlbumWhereInput>
    OR?: Enumerable<AlbumWhereInput>
    NOT?: Enumerable<AlbumWhereInput>
    id?: IntFilter | number
    json?: StringFilter | string
    createdAt?: DateTimeFilter | Date | string
    updatedAt?: DateTimeFilter | Date | string
  }

  export type AlbumOrderByWithRelationInput = {
    id?: SortOrder
    json?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AlbumWhereUniqueInput = {
    id?: number
  }

  export type AlbumOrderByWithAggregationInput = {
    id?: SortOrder
    json?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AlbumCountOrderByAggregateInput
    _avg?: AlbumAvgOrderByAggregateInput
    _max?: AlbumMaxOrderByAggregateInput
    _min?: AlbumMinOrderByAggregateInput
    _sum?: AlbumSumOrderByAggregateInput
  }

  export type AlbumScalarWhereWithAggregatesInput = {
    AND?: Enumerable<AlbumScalarWhereWithAggregatesInput>
    OR?: Enumerable<AlbumScalarWhereWithAggregatesInput>
    NOT?: Enumerable<AlbumScalarWhereWithAggregatesInput>
    id?: IntWithAggregatesFilter | number
    json?: StringWithAggregatesFilter | string
    createdAt?: DateTimeWithAggregatesFilter | Date | string
    updatedAt?: DateTimeWithAggregatesFilter | Date | string
  }

  export type ArtistWhereInput = {
    AND?: Enumerable<ArtistWhereInput>
    OR?: Enumerable<ArtistWhereInput>
    NOT?: Enumerable<ArtistWhereInput>
    id?: IntFilter | number
    json?: StringFilter | string
    createdAt?: DateTimeFilter | Date | string
    updatedAt?: DateTimeFilter | Date | string
  }

  export type ArtistOrderByWithRelationInput = {
    id?: SortOrder
    json?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ArtistWhereUniqueInput = {
    id?: number
  }

  export type ArtistOrderByWithAggregationInput = {
    id?: SortOrder
    json?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ArtistCountOrderByAggregateInput
    _avg?: ArtistAvgOrderByAggregateInput
    _max?: ArtistMaxOrderByAggregateInput
    _min?: ArtistMinOrderByAggregateInput
    _sum?: ArtistSumOrderByAggregateInput
  }

  export type ArtistScalarWhereWithAggregatesInput = {
    AND?: Enumerable<ArtistScalarWhereWithAggregatesInput>
    OR?: Enumerable<ArtistScalarWhereWithAggregatesInput>
    NOT?: Enumerable<ArtistScalarWhereWithAggregatesInput>
    id?: IntWithAggregatesFilter | number
    json?: StringWithAggregatesFilter | string
    createdAt?: DateTimeWithAggregatesFilter | Date | string
    updatedAt?: DateTimeWithAggregatesFilter | Date | string
  }

  export type ArtistAlbumWhereInput = {
    AND?: Enumerable<ArtistAlbumWhereInput>
    OR?: Enumerable<ArtistAlbumWhereInput>
    NOT?: Enumerable<ArtistAlbumWhereInput>
    id?: IntFilter | number
    hotAlbums?: StringFilter | string
    createdAt?: DateTimeFilter | Date | string
    updatedAt?: DateTimeFilter | Date | string
  }

  export type ArtistAlbumOrderByWithRelationInput = {
    id?: SortOrder
    hotAlbums?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ArtistAlbumWhereUniqueInput = {
    id?: number
  }

  export type ArtistAlbumOrderByWithAggregationInput = {
    id?: SortOrder
    hotAlbums?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ArtistAlbumCountOrderByAggregateInput
    _avg?: ArtistAlbumAvgOrderByAggregateInput
    _max?: ArtistAlbumMaxOrderByAggregateInput
    _min?: ArtistAlbumMinOrderByAggregateInput
    _sum?: ArtistAlbumSumOrderByAggregateInput
  }

  export type ArtistAlbumScalarWhereWithAggregatesInput = {
    AND?: Enumerable<ArtistAlbumScalarWhereWithAggregatesInput>
    OR?: Enumerable<ArtistAlbumScalarWhereWithAggregatesInput>
    NOT?: Enumerable<ArtistAlbumScalarWhereWithAggregatesInput>
    id?: IntWithAggregatesFilter | number
    hotAlbums?: StringWithAggregatesFilter | string
    createdAt?: DateTimeWithAggregatesFilter | Date | string
    updatedAt?: DateTimeWithAggregatesFilter | Date | string
  }

  export type PlaylistWhereInput = {
    AND?: Enumerable<PlaylistWhereInput>
    OR?: Enumerable<PlaylistWhereInput>
    NOT?: Enumerable<PlaylistWhereInput>
    id?: IntFilter | number
    json?: StringFilter | string
    createdAt?: DateTimeFilter | Date | string
    updatedAt?: DateTimeFilter | Date | string
  }

  export type PlaylistOrderByWithRelationInput = {
    id?: SortOrder
    json?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PlaylistWhereUniqueInput = {
    id?: number
  }

  export type PlaylistOrderByWithAggregationInput = {
    id?: SortOrder
    json?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: PlaylistCountOrderByAggregateInput
    _avg?: PlaylistAvgOrderByAggregateInput
    _max?: PlaylistMaxOrderByAggregateInput
    _min?: PlaylistMinOrderByAggregateInput
    _sum?: PlaylistSumOrderByAggregateInput
  }

  export type PlaylistScalarWhereWithAggregatesInput = {
    AND?: Enumerable<PlaylistScalarWhereWithAggregatesInput>
    OR?: Enumerable<PlaylistScalarWhereWithAggregatesInput>
    NOT?: Enumerable<PlaylistScalarWhereWithAggregatesInput>
    id?: IntWithAggregatesFilter | number
    json?: StringWithAggregatesFilter | string
    createdAt?: DateTimeWithAggregatesFilter | Date | string
    updatedAt?: DateTimeWithAggregatesFilter | Date | string
  }

  export type AudioWhereInput = {
    AND?: Enumerable<AudioWhereInput>
    OR?: Enumerable<AudioWhereInput>
    NOT?: Enumerable<AudioWhereInput>
    id?: IntFilter | number
    bitRate?: IntFilter | number
    format?: StringFilter | string
    source?: StringFilter | string
    createdAt?: DateTimeFilter | Date | string
    updatedAt?: DateTimeFilter | Date | string
    queriedAt?: DateTimeFilter | Date | string
  }

  export type AudioOrderByWithRelationInput = {
    id?: SortOrder
    bitRate?: SortOrder
    format?: SortOrder
    source?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    queriedAt?: SortOrder
  }

  export type AudioWhereUniqueInput = {
    id?: number
  }

  export type AudioOrderByWithAggregationInput = {
    id?: SortOrder
    bitRate?: SortOrder
    format?: SortOrder
    source?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    queriedAt?: SortOrder
    _count?: AudioCountOrderByAggregateInput
    _avg?: AudioAvgOrderByAggregateInput
    _max?: AudioMaxOrderByAggregateInput
    _min?: AudioMinOrderByAggregateInput
    _sum?: AudioSumOrderByAggregateInput
  }

  export type AudioScalarWhereWithAggregatesInput = {
    AND?: Enumerable<AudioScalarWhereWithAggregatesInput>
    OR?: Enumerable<AudioScalarWhereWithAggregatesInput>
    NOT?: Enumerable<AudioScalarWhereWithAggregatesInput>
    id?: IntWithAggregatesFilter | number
    bitRate?: IntWithAggregatesFilter | number
    format?: StringWithAggregatesFilter | string
    source?: StringWithAggregatesFilter | string
    createdAt?: DateTimeWithAggregatesFilter | Date | string
    updatedAt?: DateTimeWithAggregatesFilter | Date | string
    queriedAt?: DateTimeWithAggregatesFilter | Date | string
  }

  export type LyricsWhereInput = {
    AND?: Enumerable<LyricsWhereInput>
    OR?: Enumerable<LyricsWhereInput>
    NOT?: Enumerable<LyricsWhereInput>
    id?: IntFilter | number
    json?: StringFilter | string
    createdAt?: DateTimeFilter | Date | string
    updatedAt?: DateTimeFilter | Date | string
  }

  export type LyricsOrderByWithRelationInput = {
    id?: SortOrder
    json?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LyricsWhereUniqueInput = {
    id?: number
  }

  export type LyricsOrderByWithAggregationInput = {
    id?: SortOrder
    json?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: LyricsCountOrderByAggregateInput
    _avg?: LyricsAvgOrderByAggregateInput
    _max?: LyricsMaxOrderByAggregateInput
    _min?: LyricsMinOrderByAggregateInput
    _sum?: LyricsSumOrderByAggregateInput
  }

  export type LyricsScalarWhereWithAggregatesInput = {
    AND?: Enumerable<LyricsScalarWhereWithAggregatesInput>
    OR?: Enumerable<LyricsScalarWhereWithAggregatesInput>
    NOT?: Enumerable<LyricsScalarWhereWithAggregatesInput>
    id?: IntWithAggregatesFilter | number
    json?: StringWithAggregatesFilter | string
    createdAt?: DateTimeWithAggregatesFilter | Date | string
    updatedAt?: DateTimeWithAggregatesFilter | Date | string
  }

  export type AppleMusicAlbumWhereInput = {
    AND?: Enumerable<AppleMusicAlbumWhereInput>
    OR?: Enumerable<AppleMusicAlbumWhereInput>
    NOT?: Enumerable<AppleMusicAlbumWhereInput>
    id?: IntFilter | number
    json?: StringFilter | string
    createdAt?: DateTimeFilter | Date | string
    updatedAt?: DateTimeFilter | Date | string
  }

  export type AppleMusicAlbumOrderByWithRelationInput = {
    id?: SortOrder
    json?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AppleMusicAlbumWhereUniqueInput = {
    id?: number
  }

  export type AppleMusicAlbumOrderByWithAggregationInput = {
    id?: SortOrder
    json?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AppleMusicAlbumCountOrderByAggregateInput
    _avg?: AppleMusicAlbumAvgOrderByAggregateInput
    _max?: AppleMusicAlbumMaxOrderByAggregateInput
    _min?: AppleMusicAlbumMinOrderByAggregateInput
    _sum?: AppleMusicAlbumSumOrderByAggregateInput
  }

  export type AppleMusicAlbumScalarWhereWithAggregatesInput = {
    AND?: Enumerable<AppleMusicAlbumScalarWhereWithAggregatesInput>
    OR?: Enumerable<AppleMusicAlbumScalarWhereWithAggregatesInput>
    NOT?: Enumerable<AppleMusicAlbumScalarWhereWithAggregatesInput>
    id?: IntWithAggregatesFilter | number
    json?: StringWithAggregatesFilter | string
    createdAt?: DateTimeWithAggregatesFilter | Date | string
    updatedAt?: DateTimeWithAggregatesFilter | Date | string
  }

  export type AppleMusicArtistWhereInput = {
    AND?: Enumerable<AppleMusicArtistWhereInput>
    OR?: Enumerable<AppleMusicArtistWhereInput>
    NOT?: Enumerable<AppleMusicArtistWhereInput>
    id?: IntFilter | number
    json?: StringFilter | string
    createdAt?: DateTimeFilter | Date | string
    updatedAt?: DateTimeFilter | Date | string
  }

  export type AppleMusicArtistOrderByWithRelationInput = {
    id?: SortOrder
    json?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AppleMusicArtistWhereUniqueInput = {
    id?: number
  }

  export type AppleMusicArtistOrderByWithAggregationInput = {
    id?: SortOrder
    json?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: AppleMusicArtistCountOrderByAggregateInput
    _avg?: AppleMusicArtistAvgOrderByAggregateInput
    _max?: AppleMusicArtistMaxOrderByAggregateInput
    _min?: AppleMusicArtistMinOrderByAggregateInput
    _sum?: AppleMusicArtistSumOrderByAggregateInput
  }

  export type AppleMusicArtistScalarWhereWithAggregatesInput = {
    AND?: Enumerable<AppleMusicArtistScalarWhereWithAggregatesInput>
    OR?: Enumerable<AppleMusicArtistScalarWhereWithAggregatesInput>
    NOT?: Enumerable<AppleMusicArtistScalarWhereWithAggregatesInput>
    id?: IntWithAggregatesFilter | number
    json?: StringWithAggregatesFilter | string
    createdAt?: DateTimeWithAggregatesFilter | Date | string
    updatedAt?: DateTimeWithAggregatesFilter | Date | string
  }

  export type AccountDataCreateInput = {
    id: string
    json: string
    updatedAt?: Date | string
  }

  export type AccountDataUncheckedCreateInput = {
    id: string
    json: string
    updatedAt?: Date | string
  }

  export type AccountDataUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    json?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccountDataUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    json?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccountDataUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    json?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AccountDataUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    json?: StringFieldUpdateOperationsInput | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppDataCreateInput = {
    id: string
    value: string
  }

  export type AppDataUncheckedCreateInput = {
    id: string
    value: string
  }

  export type AppDataUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
  }

  export type AppDataUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
  }

  export type AppDataUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
  }

  export type AppDataUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    value?: StringFieldUpdateOperationsInput | string
  }

  export type TrackCreateInput = {
    id: number
    json: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TrackUncheckedCreateInput = {
    id: number
    json: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type TrackUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    json?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrackUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    json?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrackUpdateManyMutationInput = {
    id?: IntFieldUpdateOperationsInput | number
    json?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type TrackUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    json?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AlbumCreateInput = {
    id: number
    json: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AlbumUncheckedCreateInput = {
    id: number
    json: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AlbumUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    json?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AlbumUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    json?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AlbumUpdateManyMutationInput = {
    id?: IntFieldUpdateOperationsInput | number
    json?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AlbumUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    json?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ArtistCreateInput = {
    id: number
    json: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ArtistUncheckedCreateInput = {
    id: number
    json: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ArtistUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    json?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ArtistUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    json?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ArtistUpdateManyMutationInput = {
    id?: IntFieldUpdateOperationsInput | number
    json?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ArtistUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    json?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ArtistAlbumCreateInput = {
    id: number
    hotAlbums: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ArtistAlbumUncheckedCreateInput = {
    id: number
    hotAlbums: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ArtistAlbumUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    hotAlbums?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ArtistAlbumUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    hotAlbums?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ArtistAlbumUpdateManyMutationInput = {
    id?: IntFieldUpdateOperationsInput | number
    hotAlbums?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ArtistAlbumUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    hotAlbums?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlaylistCreateInput = {
    id: number
    json: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PlaylistUncheckedCreateInput = {
    id: number
    json: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type PlaylistUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    json?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlaylistUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    json?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlaylistUpdateManyMutationInput = {
    id?: IntFieldUpdateOperationsInput | number
    json?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type PlaylistUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    json?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AudioCreateInput = {
    id: number
    bitRate: number
    format: string
    source: string
    createdAt?: Date | string
    updatedAt?: Date | string
    queriedAt?: Date | string
  }

  export type AudioUncheckedCreateInput = {
    id: number
    bitRate: number
    format: string
    source: string
    createdAt?: Date | string
    updatedAt?: Date | string
    queriedAt?: Date | string
  }

  export type AudioUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    bitRate?: IntFieldUpdateOperationsInput | number
    format?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    queriedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AudioUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    bitRate?: IntFieldUpdateOperationsInput | number
    format?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    queriedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AudioUpdateManyMutationInput = {
    id?: IntFieldUpdateOperationsInput | number
    bitRate?: IntFieldUpdateOperationsInput | number
    format?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    queriedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AudioUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    bitRate?: IntFieldUpdateOperationsInput | number
    format?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    queriedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LyricsCreateInput = {
    id: number
    json: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LyricsUncheckedCreateInput = {
    id: number
    json: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type LyricsUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    json?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LyricsUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    json?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LyricsUpdateManyMutationInput = {
    id?: IntFieldUpdateOperationsInput | number
    json?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type LyricsUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    json?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppleMusicAlbumCreateInput = {
    id: number
    json: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AppleMusicAlbumUncheckedCreateInput = {
    id: number
    json: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AppleMusicAlbumUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    json?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppleMusicAlbumUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    json?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppleMusicAlbumUpdateManyMutationInput = {
    id?: IntFieldUpdateOperationsInput | number
    json?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppleMusicAlbumUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    json?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppleMusicArtistCreateInput = {
    id: number
    json: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AppleMusicArtistUncheckedCreateInput = {
    id: number
    json: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type AppleMusicArtistUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    json?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppleMusicArtistUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    json?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppleMusicArtistUpdateManyMutationInput = {
    id?: IntFieldUpdateOperationsInput | number
    json?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AppleMusicArtistUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    json?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter = {
    equals?: string
    in?: Enumerable<string>
    notIn?: Enumerable<string>
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    not?: NestedStringFilter | string
  }

  export type DateTimeFilter = {
    equals?: Date | string
    in?: Enumerable<Date> | Enumerable<string>
    notIn?: Enumerable<Date> | Enumerable<string>
    lt?: Date | string
    lte?: Date | string
    gt?: Date | string
    gte?: Date | string
    not?: NestedDateTimeFilter | Date | string
  }

  export type AccountDataCountOrderByAggregateInput = {
    id?: SortOrder
    json?: SortOrder
    updatedAt?: SortOrder
  }

  export type AccountDataMaxOrderByAggregateInput = {
    id?: SortOrder
    json?: SortOrder
    updatedAt?: SortOrder
  }

  export type AccountDataMinOrderByAggregateInput = {
    id?: SortOrder
    json?: SortOrder
    updatedAt?: SortOrder
  }

  export type StringWithAggregatesFilter = {
    equals?: string
    in?: Enumerable<string>
    notIn?: Enumerable<string>
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    not?: NestedStringWithAggregatesFilter | string
    _count?: NestedIntFilter
    _min?: NestedStringFilter
    _max?: NestedStringFilter
  }

  export type DateTimeWithAggregatesFilter = {
    equals?: Date | string
    in?: Enumerable<Date> | Enumerable<string>
    notIn?: Enumerable<Date> | Enumerable<string>
    lt?: Date | string
    lte?: Date | string
    gt?: Date | string
    gte?: Date | string
    not?: NestedDateTimeWithAggregatesFilter | Date | string
    _count?: NestedIntFilter
    _min?: NestedDateTimeFilter
    _max?: NestedDateTimeFilter
  }

  export type AppDataCountOrderByAggregateInput = {
    id?: SortOrder
    value?: SortOrder
  }

  export type AppDataMaxOrderByAggregateInput = {
    id?: SortOrder
    value?: SortOrder
  }

  export type AppDataMinOrderByAggregateInput = {
    id?: SortOrder
    value?: SortOrder
  }

  export type IntFilter = {
    equals?: number
    in?: Enumerable<number>
    notIn?: Enumerable<number>
    lt?: number
    lte?: number
    gt?: number
    gte?: number
    not?: NestedIntFilter | number
  }

  export type TrackCountOrderByAggregateInput = {
    id?: SortOrder
    json?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TrackAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type TrackMaxOrderByAggregateInput = {
    id?: SortOrder
    json?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TrackMinOrderByAggregateInput = {
    id?: SortOrder
    json?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type TrackSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type IntWithAggregatesFilter = {
    equals?: number
    in?: Enumerable<number>
    notIn?: Enumerable<number>
    lt?: number
    lte?: number
    gt?: number
    gte?: number
    not?: NestedIntWithAggregatesFilter | number
    _count?: NestedIntFilter
    _avg?: NestedFloatFilter
    _sum?: NestedIntFilter
    _min?: NestedIntFilter
    _max?: NestedIntFilter
  }

  export type AlbumCountOrderByAggregateInput = {
    id?: SortOrder
    json?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AlbumAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type AlbumMaxOrderByAggregateInput = {
    id?: SortOrder
    json?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AlbumMinOrderByAggregateInput = {
    id?: SortOrder
    json?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AlbumSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type ArtistCountOrderByAggregateInput = {
    id?: SortOrder
    json?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ArtistAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type ArtistMaxOrderByAggregateInput = {
    id?: SortOrder
    json?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ArtistMinOrderByAggregateInput = {
    id?: SortOrder
    json?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ArtistSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type ArtistAlbumCountOrderByAggregateInput = {
    id?: SortOrder
    hotAlbums?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ArtistAlbumAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type ArtistAlbumMaxOrderByAggregateInput = {
    id?: SortOrder
    hotAlbums?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ArtistAlbumMinOrderByAggregateInput = {
    id?: SortOrder
    hotAlbums?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ArtistAlbumSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type PlaylistCountOrderByAggregateInput = {
    id?: SortOrder
    json?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PlaylistAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type PlaylistMaxOrderByAggregateInput = {
    id?: SortOrder
    json?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PlaylistMinOrderByAggregateInput = {
    id?: SortOrder
    json?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type PlaylistSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type AudioCountOrderByAggregateInput = {
    id?: SortOrder
    bitRate?: SortOrder
    format?: SortOrder
    source?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    queriedAt?: SortOrder
  }

  export type AudioAvgOrderByAggregateInput = {
    id?: SortOrder
    bitRate?: SortOrder
  }

  export type AudioMaxOrderByAggregateInput = {
    id?: SortOrder
    bitRate?: SortOrder
    format?: SortOrder
    source?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    queriedAt?: SortOrder
  }

  export type AudioMinOrderByAggregateInput = {
    id?: SortOrder
    bitRate?: SortOrder
    format?: SortOrder
    source?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    queriedAt?: SortOrder
  }

  export type AudioSumOrderByAggregateInput = {
    id?: SortOrder
    bitRate?: SortOrder
  }

  export type LyricsCountOrderByAggregateInput = {
    id?: SortOrder
    json?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LyricsAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type LyricsMaxOrderByAggregateInput = {
    id?: SortOrder
    json?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LyricsMinOrderByAggregateInput = {
    id?: SortOrder
    json?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type LyricsSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type AppleMusicAlbumCountOrderByAggregateInput = {
    id?: SortOrder
    json?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AppleMusicAlbumAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type AppleMusicAlbumMaxOrderByAggregateInput = {
    id?: SortOrder
    json?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AppleMusicAlbumMinOrderByAggregateInput = {
    id?: SortOrder
    json?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AppleMusicAlbumSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type AppleMusicArtistCountOrderByAggregateInput = {
    id?: SortOrder
    json?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AppleMusicArtistAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type AppleMusicArtistMaxOrderByAggregateInput = {
    id?: SortOrder
    json?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AppleMusicArtistMinOrderByAggregateInput = {
    id?: SortOrder
    json?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type AppleMusicArtistSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NestedStringFilter = {
    equals?: string
    in?: Enumerable<string>
    notIn?: Enumerable<string>
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    not?: NestedStringFilter | string
  }

  export type NestedDateTimeFilter = {
    equals?: Date | string
    in?: Enumerable<Date> | Enumerable<string>
    notIn?: Enumerable<Date> | Enumerable<string>
    lt?: Date | string
    lte?: Date | string
    gt?: Date | string
    gte?: Date | string
    not?: NestedDateTimeFilter | Date | string
  }

  export type NestedStringWithAggregatesFilter = {
    equals?: string
    in?: Enumerable<string>
    notIn?: Enumerable<string>
    lt?: string
    lte?: string
    gt?: string
    gte?: string
    contains?: string
    startsWith?: string
    endsWith?: string
    not?: NestedStringWithAggregatesFilter | string
    _count?: NestedIntFilter
    _min?: NestedStringFilter
    _max?: NestedStringFilter
  }

  export type NestedIntFilter = {
    equals?: number
    in?: Enumerable<number>
    notIn?: Enumerable<number>
    lt?: number
    lte?: number
    gt?: number
    gte?: number
    not?: NestedIntFilter | number
  }

  export type NestedDateTimeWithAggregatesFilter = {
    equals?: Date | string
    in?: Enumerable<Date> | Enumerable<string>
    notIn?: Enumerable<Date> | Enumerable<string>
    lt?: Date | string
    lte?: Date | string
    gt?: Date | string
    gte?: Date | string
    not?: NestedDateTimeWithAggregatesFilter | Date | string
    _count?: NestedIntFilter
    _min?: NestedDateTimeFilter
    _max?: NestedDateTimeFilter
  }

  export type NestedIntWithAggregatesFilter = {
    equals?: number
    in?: Enumerable<number>
    notIn?: Enumerable<number>
    lt?: number
    lte?: number
    gt?: number
    gte?: number
    not?: NestedIntWithAggregatesFilter | number
    _count?: NestedIntFilter
    _avg?: NestedFloatFilter
    _sum?: NestedIntFilter
    _min?: NestedIntFilter
    _max?: NestedIntFilter
  }

  export type NestedFloatFilter = {
    equals?: number
    in?: Enumerable<number>
    notIn?: Enumerable<number>
    lt?: number
    lte?: number
    gt?: number
    gte?: number
    not?: NestedFloatFilter | number
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}