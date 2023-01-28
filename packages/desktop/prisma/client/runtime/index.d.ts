/**
 * TODO
 * @param this
 */
declare function $extends(this: Client, extension: Args_2 | ((client: Client) => Client)): Client;

declare type Action = keyof typeof DMMF.ModelAction | 'executeRaw' | 'queryRaw' | 'runCommandRaw';

declare class AnyNull extends NullTypesEnumValue {
}

declare type ApplyExtensionsParams = {
    result: object;
    modelName: string;
    args: IncludeSelect;
    extensions: MergedExtensionsList;
};

declare class Arg {
    key: string;
    value: ArgValue;
    error?: InvalidArgError;
    hasError: boolean;
    isEnum: boolean;
    schemaArg?: DMMF.SchemaArg;
    isNullable: boolean;
    inputType?: DMMF.SchemaArgInputType;
    constructor({ key, value, isEnum, error, schemaArg, inputType }: ArgOptions);
    get [Symbol.toStringTag](): string;
    _toString(value: ArgValue, key: string): string | undefined;
    toString(): string | undefined;
    collectErrors(): ArgError[];
}

declare interface ArgError {
    path: string[];
    id?: string;
    error: InvalidArgError;
}

declare interface ArgOptions {
    key: string;
    value: ArgValue;
    isEnum?: boolean;
    error?: InvalidArgError;
    schemaArg?: DMMF.SchemaArg;
    inputType?: DMMF.SchemaArgInputType;
}

declare class Args {
    args: Arg[];
    readonly hasInvalidArg: boolean;
    constructor(args?: Arg[]);
    get [Symbol.toStringTag](): string;
    toString(): string;
    collectErrors(): ArgError[];
}

declare type Args_2 = OptionalFlat<RequiredArgs>;

declare type ArgValue = string | boolean | number | undefined | Args | string[] | boolean[] | number[] | Args[] | null;

declare interface AtLeastOneError {
    type: 'atLeastOne';
    key: string;
    inputType: DMMF.InputType;
    atLeastFields?: string[];
}

declare interface AtMostOneError {
    type: 'atMostOne';
    key: string;
    inputType: DMMF.InputType;
    providedKeys: string[];
}

export declare type BaseDMMF = Pick<DMMF.Document, 'datamodel' | 'mappings'>;

declare interface BaseDMMFHelper extends DMMFDatamodelHelper, DMMFMappingsHelper {
}

declare class BaseDMMFHelper {
    constructor(dmmf: BaseDMMF);
}

declare type BatchQueryEngineResult<T> = QueryEngineResult<T> | Error;

declare type BatchTransactionOptions = {
    isolationLevel?: Transaction.IsolationLevel;
};

declare type BatchTransactionOptions_2 = Omit<PrismaPromiseBatchTransaction, 'kind'>;

declare interface BinaryTargetsEnvValue {
    fromEnvVar: null | string;
    value: string;
}

declare interface CallSite {
    getLocation(): LocationInFile | null;
}

declare type Client = ReturnType<typeof getPrismaClient> extends new () => infer T ? T : never;

declare type ClientArgs = {
    client: ClientExtensionDefinition;
};

declare enum ClientEngineType {
    Library = "library",
    Binary = "binary"
}

declare type ClientExtensionDefinition = {
    [MethodName in string]: (...args: any[]) => any;
};

declare type Compute<T> = T extends Function ? T : {
    [K in keyof T]: T[K];
} & unknown;

declare type ComputedField = {
    name: string;
    needs: string[];
    compute: ResultArgsFieldCompute;
};

declare type ComputedFieldsMap = {
    [fieldName: string]: ComputedField;
};

declare type ConnectorType = 'mysql' | 'mongodb' | 'sqlite' | 'postgresql' | 'sqlserver' | 'jdbc:sqlserver' | 'cockroachdb';

declare type ConnectorType_2 = 'mysql' | 'mongodb' | 'sqlite' | 'postgresql' | 'sqlserver' | 'jdbc:sqlserver' | 'cockroachdb';

declare interface Context {
    /**
     * Get a value from the context.
     *
     * @param key key which identifies a context value
     */
    getValue(key: symbol): unknown;
    /**
     * Create a new context which inherits from this context and has
     * the given key set to the given value.
     *
     * @param key context key for which to set the value
     * @param value value to set for the given key
     */
    setValue(key: symbol, value: unknown): Context;
    /**
     * Return a new context which inherits from this context but does
     * not contain a value for the given key.
     *
     * @param key context key for which to clear a value
     */
    deleteValue(key: symbol): Context;
}

declare class DataLoader<T = unknown> {
    private options;
    batches: {
        [key: string]: Job[];
    };
    private tickActive;
    constructor(options: DataLoaderOptions<T>);
    request(request: T): Promise<any>;
    private dispatchBatches;
    get [Symbol.toStringTag](): string;
}

declare type DataLoaderOptions<T> = {
    singleLoader: (request: T) => Promise<any>;
    batchLoader: (request: T[]) => Promise<any[]>;
    batchBy: (request: T) => string | undefined;
};

declare interface DataSource {
    name: string;
    activeProvider: ConnectorType;
    provider: ConnectorType;
    url: EnvValue;
    config: {
        [key: string]: string;
    };
}

declare type Datasource = {
    url?: string;
};

declare interface DatasourceOverwrite {
    name: string;
    url?: string;
    env?: string;
}

declare type Datasources = {
    [name in string]: Datasource;
};

declare class DbNull extends NullTypesEnumValue {
}

export declare interface Debug {
    (namespace: string): Debugger;
    disable: () => string;
    enable: (namespace: string) => void;
    enabled: (namespace: string) => boolean;
    log: (...args: any[]) => any;
    formatters: Record<string, ((value: any) => string) | undefined>;
}

declare interface Debugger {
    (format: any, ...args: any[]): void;
    log: (...args: any[]) => any;
    extend: (namespace: string, delimiter?: string) => Debugger;
    color: string | number;
    enabled: boolean;
    namespace: string;
}

export declare namespace Decimal {
    export type Constructor = typeof Decimal;
    export type Instance = Decimal;
    export type Rounding = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
    export type Modulo = Rounding | 9;
    export type Value = string | number | Decimal;

    // http://mikemcl.github.io/decimal.js/#constructor-properties
    export interface Config {
        precision?: number;
        rounding?: Rounding;
        toExpNeg?: number;
        toExpPos?: number;
        minE?: number;
        maxE?: number;
        crypto?: boolean;
        modulo?: Modulo;
        defaults?: boolean;
    }
}

export declare class Decimal {
    readonly d: number[];
    readonly e: number;
    readonly s: number;
    private readonly toStringTag: string;

    constructor(n: Decimal.Value);

    absoluteValue(): Decimal;
    abs(): Decimal;

    ceil(): Decimal;

    clampedTo(min: Decimal.Value, max: Decimal.Value): Decimal;
    clamp(min: Decimal.Value, max: Decimal.Value): Decimal;

    comparedTo(n: Decimal.Value): number;
    cmp(n: Decimal.Value): number;

    cosine(): Decimal;
    cos(): Decimal;

    cubeRoot(): Decimal;
    cbrt(): Decimal;

    decimalPlaces(): number;
    dp(): number;

    dividedBy(n: Decimal.Value): Decimal;
    div(n: Decimal.Value): Decimal;

    dividedToIntegerBy(n: Decimal.Value): Decimal;
    divToInt(n: Decimal.Value): Decimal;

    equals(n: Decimal.Value): boolean;
    eq(n: Decimal.Value): boolean;

    floor(): Decimal;

    greaterThan(n: Decimal.Value): boolean;
    gt(n: Decimal.Value): boolean;

    greaterThanOrEqualTo(n: Decimal.Value): boolean;
    gte(n: Decimal.Value): boolean;

    hyperbolicCosine(): Decimal;
    cosh(): Decimal;

    hyperbolicSine(): Decimal;
    sinh(): Decimal;

    hyperbolicTangent(): Decimal;
    tanh(): Decimal;

    inverseCosine(): Decimal;
    acos(): Decimal;

    inverseHyperbolicCosine(): Decimal;
    acosh(): Decimal;

    inverseHyperbolicSine(): Decimal;
    asinh(): Decimal;

    inverseHyperbolicTangent(): Decimal;
    atanh(): Decimal;

    inverseSine(): Decimal;
    asin(): Decimal;

    inverseTangent(): Decimal;
    atan(): Decimal;

    isFinite(): boolean;

    isInteger(): boolean;
    isInt(): boolean;

    isNaN(): boolean;

    isNegative(): boolean;
    isNeg(): boolean;

    isPositive(): boolean;
    isPos(): boolean;

    isZero(): boolean;

    lessThan(n: Decimal.Value): boolean;
    lt(n: Decimal.Value): boolean;

    lessThanOrEqualTo(n: Decimal.Value): boolean;
    lte(n: Decimal.Value): boolean;

    logarithm(n?: Decimal.Value): Decimal;
    log(n?: Decimal.Value): Decimal;

    minus(n: Decimal.Value): Decimal;
    sub(n: Decimal.Value): Decimal;

    modulo(n: Decimal.Value): Decimal;
    mod(n: Decimal.Value): Decimal;

    naturalExponential(): Decimal;
    exp(): Decimal;

    naturalLogarithm(): Decimal;
    ln(): Decimal;

    negated(): Decimal;
    neg(): Decimal;

    plus(n: Decimal.Value): Decimal;
    add(n: Decimal.Value): Decimal;

    precision(includeZeros?: boolean): number;
    sd(includeZeros?: boolean): number;

    round(): Decimal;

    sine() : Decimal;
    sin() : Decimal;

    squareRoot(): Decimal;
    sqrt(): Decimal;

    tangent() : Decimal;
    tan() : Decimal;

    times(n: Decimal.Value): Decimal;
    mul(n: Decimal.Value) : Decimal;

    toBinary(significantDigits?: number): string;
    toBinary(significantDigits: number, rounding: Decimal.Rounding): string;

    toDecimalPlaces(decimalPlaces?: number): Decimal;
    toDecimalPlaces(decimalPlaces: number, rounding: Decimal.Rounding): Decimal;
    toDP(decimalPlaces?: number): Decimal;
    toDP(decimalPlaces: number, rounding: Decimal.Rounding): Decimal;

    toExponential(decimalPlaces?: number): string;
    toExponential(decimalPlaces: number, rounding: Decimal.Rounding): string;

    toFixed(decimalPlaces?: number): string;
    toFixed(decimalPlaces: number, rounding: Decimal.Rounding): string;

    toFraction(max_denominator?: Decimal.Value): Decimal[];

    toHexadecimal(significantDigits?: number): string;
    toHexadecimal(significantDigits: number, rounding: Decimal.Rounding): string;
    toHex(significantDigits?: number): string;
    toHex(significantDigits: number, rounding?: Decimal.Rounding): string;

    toJSON(): string;

    toNearest(n: Decimal.Value, rounding?: Decimal.Rounding): Decimal;

    toNumber(): number;

    toOctal(significantDigits?: number): string;
    toOctal(significantDigits: number, rounding: Decimal.Rounding): string;

    toPower(n: Decimal.Value): Decimal;
    pow(n: Decimal.Value): Decimal;

    toPrecision(significantDigits?: number): string;
    toPrecision(significantDigits: number, rounding: Decimal.Rounding): string;

    toSignificantDigits(significantDigits?: number): Decimal;
    toSignificantDigits(significantDigits: number, rounding: Decimal.Rounding): Decimal;
    toSD(significantDigits?: number): Decimal;
    toSD(significantDigits: number, rounding: Decimal.Rounding): Decimal;

    toString(): string;

    truncated(): Decimal;
    trunc(): Decimal;

    valueOf(): string;

    static abs(n: Decimal.Value): Decimal;
    static acos(n: Decimal.Value): Decimal;
    static acosh(n: Decimal.Value): Decimal;
    static add(x: Decimal.Value, y: Decimal.Value): Decimal;
    static asin(n: Decimal.Value): Decimal;
    static asinh(n: Decimal.Value): Decimal;
    static atan(n: Decimal.Value): Decimal;
    static atanh(n: Decimal.Value): Decimal;
    static atan2(y: Decimal.Value, x: Decimal.Value): Decimal;
    static cbrt(n: Decimal.Value): Decimal;
    static ceil(n: Decimal.Value): Decimal;
    static clamp(n: Decimal.Value, min: Decimal.Value, max: Decimal.Value): Decimal;
    static clone(object?: Decimal.Config): Decimal.Constructor;
    static config(object: Decimal.Config): Decimal.Constructor;
    static cos(n: Decimal.Value): Decimal;
    static cosh(n: Decimal.Value): Decimal;
    static div(x: Decimal.Value, y: Decimal.Value): Decimal;
    static exp(n: Decimal.Value): Decimal;
    static floor(n: Decimal.Value): Decimal;
    static hypot(...n: Decimal.Value[]): Decimal;
    static isDecimal(object: any): object is Decimal;
    static ln(n: Decimal.Value): Decimal;
    static log(n: Decimal.Value, base?: Decimal.Value): Decimal;
    static log2(n: Decimal.Value): Decimal;
    static log10(n: Decimal.Value): Decimal;
    static max(...n: Decimal.Value[]): Decimal;
    static min(...n: Decimal.Value[]): Decimal;
    static mod(x: Decimal.Value, y: Decimal.Value): Decimal;
    static mul(x: Decimal.Value, y: Decimal.Value): Decimal;
    static noConflict(): Decimal.Constructor;   // Browser only
    static pow(base: Decimal.Value, exponent: Decimal.Value): Decimal;
    static random(significantDigits?: number): Decimal;
    static round(n: Decimal.Value): Decimal;
    static set(object: Decimal.Config): Decimal.Constructor;
    static sign(n: Decimal.Value): number;
    static sin(n: Decimal.Value): Decimal;
    static sinh(n: Decimal.Value): Decimal;
    static sqrt(n: Decimal.Value): Decimal;
    static sub(x: Decimal.Value, y: Decimal.Value): Decimal;
    static sum(...n: Decimal.Value[]): Decimal;
    static tan(n: Decimal.Value): Decimal;
    static tanh(n: Decimal.Value): Decimal;
    static trunc(n: Decimal.Value): Decimal;

    static readonly default?: Decimal.Constructor;
    static readonly Decimal?: Decimal.Constructor;

    static readonly precision: number;
    static readonly rounding: Decimal.Rounding;
    static readonly toExpNeg: number;
    static readonly toExpPos: number;
    static readonly minE: number;
    static readonly maxE: number;
    static readonly crypto: boolean;
    static readonly modulo: Decimal.Modulo;

    static readonly ROUND_UP: 0;
    static readonly ROUND_DOWN: 1;
    static readonly ROUND_CEIL: 2;
    static readonly ROUND_FLOOR: 3;
    static readonly ROUND_HALF_UP: 4;
    static readonly ROUND_HALF_DOWN: 5;
    static readonly ROUND_HALF_EVEN: 6;
    static readonly ROUND_HALF_CEIL: 7;
    static readonly ROUND_HALF_FLOOR: 8;
    static readonly EUCLID: 9;
}

/**
 * Interface for any Decimal.js-like library
 * Allows us to accept Decimal.js from different
 * versions and some compatible alternatives
 */
export declare interface DecimalJsLike {
    d: number[];
    e: number;
    s: number;
}

export declare const decompressFromBase64: any;

declare type DefaultArgs = {
    result: {};
    model: {};
    query: {};
    client: {};
};

declare function defineExtension(ext: Args_2 | ((client: Client) => Client)): (client: Client) => Client;

declare type Dictionary<T> = {
    [key: string]: T;
};

declare interface Dictionary_2<T> {
    [key: string]: T;
}

export declare namespace DMMF {
    export interface Document {
        datamodel: Datamodel;
        schema: Schema;
        mappings: Mappings;
    }
    export interface Mappings {
        modelOperations: ModelMapping[];
        otherOperations: {
            read: string[];
            write: string[];
        };
    }
    export interface OtherOperationMappings {
        read: string[];
        write: string[];
    }
    export interface DatamodelEnum {
        name: string;
        values: EnumValue[];
        dbName?: string | null;
        documentation?: string;
    }
    export interface SchemaEnum {
        name: string;
        values: string[];
    }
    export interface EnumValue {
        name: string;
        dbName: string | null;
    }
    export interface Datamodel {
        models: Model[];
        enums: DatamodelEnum[];
        types: Model[];
    }
    export interface uniqueIndex {
        name: string;
        fields: string[];
    }
    export interface PrimaryKey {
        name: string | null;
        fields: string[];
    }
    export interface Model {
        name: string;
        dbName: string | null;
        fields: Field[];
        uniqueFields: string[][];
        uniqueIndexes: uniqueIndex[];
        documentation?: string;
        primaryKey: PrimaryKey | null;
        [key: string]: any;
    }
    export type FieldKind = 'scalar' | 'object' | 'enum' | 'unsupported';
    export type FieldNamespace = 'model' | 'prisma';
    export type FieldLocation = 'scalar' | 'inputObjectTypes' | 'outputObjectTypes' | 'enumTypes' | 'fieldRefTypes';
    export interface Field {
        kind: FieldKind;
        name: string;
        isRequired: boolean;
        isList: boolean;
        isUnique: boolean;
        isId: boolean;
        isReadOnly: boolean;
        isGenerated?: boolean;
        isUpdatedAt?: boolean;
        /**
         * Describes the data type in the same the way is is defined in the Prisma schema:
         * BigInt, Boolean, Bytes, DateTime, Decimal, Float, Int, JSON, String, $ModelName
         */
        type: string;
        dbNames?: string[] | null;
        hasDefaultValue: boolean;
        default?: FieldDefault | FieldDefaultScalar | FieldDefaultScalar[];
        relationFromFields?: string[];
        relationToFields?: any[];
        relationOnDelete?: string;
        relationName?: string;
        documentation?: string;
        [key: string]: any;
    }
    export interface FieldDefault {
        name: string;
        args: any[];
    }
    export type FieldDefaultScalar = string | boolean | number;
    export interface Schema {
        rootQueryType?: string;
        rootMutationType?: string;
        inputObjectTypes: {
            model?: InputType[];
            prisma: InputType[];
        };
        outputObjectTypes: {
            model: OutputType[];
            prisma: OutputType[];
        };
        enumTypes: {
            model?: SchemaEnum[];
            prisma: SchemaEnum[];
        };
        fieldRefTypes: {
            prisma?: FieldRefType[];
        };
    }
    export interface Query {
        name: string;
        args: SchemaArg[];
        output: QueryOutput;
    }
    export interface QueryOutput {
        name: string;
        isRequired: boolean;
        isList: boolean;
    }
    export type ArgType = string | InputType | SchemaEnum;
    export interface SchemaArgInputType {
        isList: boolean;
        type: ArgType;
        location: FieldLocation;
        namespace?: FieldNamespace;
    }
    export interface SchemaArg {
        name: string;
        comment?: string;
        isNullable: boolean;
        isRequired: boolean;
        inputTypes: SchemaArgInputType[];
        deprecation?: Deprecation;
    }
    export interface OutputType {
        name: string;
        fields: SchemaField[];
        fieldMap?: Record<string, SchemaField>;
    }
    export interface SchemaField {
        name: string;
        isNullable?: boolean;
        outputType: OutputTypeRef;
        args: SchemaArg[];
        deprecation?: Deprecation;
        documentation?: string;
    }
    export type TypeRefCommon = {
        isList: boolean;
        namespace?: FieldNamespace;
    };
    export type TypeRefScalar = TypeRefCommon & {
        location: 'scalar';
        type: string;
    };
    export type TypeRefOutputObject = TypeRefCommon & {
        location: 'outputObjectTypes';
        type: OutputType | string;
    };
    export type TypeRefEnum = TypeRefCommon & {
        location: 'enumTypes';
        type: SchemaEnum | string;
    };
    export type OutputTypeRef = TypeRefScalar | TypeRefOutputObject | TypeRefEnum;
    export interface Deprecation {
        sinceVersion: string;
        reason: string;
        plannedRemovalVersion?: string;
    }
    export interface InputType {
        name: string;
        constraints: {
            maxNumFields: number | null;
            minNumFields: number | null;
            fields?: string[];
        };
        meta?: {
            source?: string;
        };
        fields: SchemaArg[];
        fieldMap?: Record<string, SchemaArg>;
    }
    export interface FieldRefType {
        name: string;
        allowTypes: FieldRefAllowType[];
        fields: SchemaArg[];
    }
    export type FieldRefAllowType = TypeRefScalar | TypeRefEnum;
    export interface ModelMapping {
        model: string;
        plural: string;
        findUnique?: string | null;
        findUniqueOrThrow?: string | null;
        findFirst?: string | null;
        findFirstOrThrow?: string | null;
        findMany?: string | null;
        create?: string | null;
        createMany?: string | null;
        update?: string | null;
        updateMany?: string | null;
        upsert?: string | null;
        delete?: string | null;
        deleteMany?: string | null;
        aggregate?: string | null;
        groupBy?: string | null;
        count?: string | null;
        findRaw?: string | null;
        aggregateRaw?: string | null;
    }
    export enum ModelAction {
        findUnique = "findUnique",
        findUniqueOrThrow = "findUniqueOrThrow",
        findFirst = "findFirst",
        findFirstOrThrow = "findFirstOrThrow",
        findMany = "findMany",
        create = "create",
        createMany = "createMany",
        update = "update",
        updateMany = "updateMany",
        upsert = "upsert",
        delete = "delete",
        deleteMany = "deleteMany",
        groupBy = "groupBy",
        count = "count",
        aggregate = "aggregate",
        findRaw = "findRaw",
        aggregateRaw = "aggregateRaw"
    }
}

export declare interface DMMFClass extends BaseDMMFHelper, DMMFSchemaHelper {
}

export declare class DMMFClass {
    constructor(dmmf: DMMF.Document);
}

declare class DMMFDatamodelHelper implements Pick<DMMF.Document, 'datamodel'> {
    datamodel: DMMF.Datamodel;
    datamodelEnumMap: Dictionary_2<DMMF.DatamodelEnum>;
    modelMap: Dictionary_2<DMMF.Model>;
    typeMap: Dictionary_2<DMMF.Model>;
    typeAndModelMap: Dictionary_2<DMMF.Model>;
    constructor({ datamodel }: Pick<DMMF.Document, 'datamodel'>);
    getDatamodelEnumMap(): Dictionary_2<DMMF.DatamodelEnum>;
    getModelMap(): Dictionary_2<DMMF.Model>;
    getTypeMap(): Dictionary_2<DMMF.Model>;
    getTypeModelMap(): Dictionary_2<DMMF.Model>;
}

declare class DMMFMappingsHelper implements Pick<DMMF.Document, 'mappings'> {
    mappings: DMMF.Mappings;
    mappingsMap: Dictionary_2<DMMF.ModelMapping>;
    constructor({ mappings }: Pick<DMMF.Document, 'mappings'>);
    getMappingsMap(): Dictionary_2<DMMF.ModelMapping>;
}

declare class DMMFSchemaHelper implements Pick<DMMF.Document, 'schema'> {
    schema: DMMF.Schema;
    queryType: DMMF.OutputType;
    mutationType: DMMF.OutputType;
    outputTypes: {
        model: DMMF.OutputType[];
        prisma: DMMF.OutputType[];
    };
    outputTypeMap: Dictionary_2<DMMF.OutputType>;
    inputObjectTypes: {
        model?: DMMF.InputType[];
        prisma: DMMF.InputType[];
    };
    inputTypeMap: Dictionary_2<DMMF.InputType>;
    enumMap: Dictionary_2<DMMF.SchemaEnum>;
    rootFieldMap: Dictionary_2<DMMF.SchemaField>;
    constructor({ schema }: Pick<DMMF.Document, 'schema'>);
    get [Symbol.toStringTag](): string;
    outputTypeToMergedOutputType: (outputType: DMMF.OutputType) => DMMF.OutputType;
    resolveOutputTypes(): void;
    resolveInputTypes(): void;
    resolveFieldArgumentTypes(): void;
    getQueryType(): DMMF.OutputType;
    getMutationType(): DMMF.OutputType;
    getOutputTypes(): {
        model: DMMF.OutputType[];
        prisma: DMMF.OutputType[];
    };
    getEnumMap(): Dictionary_2<DMMF.SchemaEnum>;
    hasEnumInNamespace(enumName: string, namespace: 'prisma' | 'model'): boolean;
    getMergedOutputTypeMap(): Dictionary_2<DMMF.OutputType>;
    getInputTypeMap(): Dictionary_2<DMMF.InputType>;
    getRootFieldMap(): Dictionary_2<DMMF.SchemaField>;
}

declare class Document_2 {
    readonly type: 'query' | 'mutation';
    readonly children: Field[];
    constructor(type: 'query' | 'mutation', children: Field[]);
    get [Symbol.toStringTag](): string;
    toString(): string;
    validate(select?: any, isTopLevelQuery?: boolean, originalMethod?: string, errorFormat?: 'pretty' | 'minimal' | 'colorless', validationCallsite?: any): void;
    protected printFieldError: ({ error }: FieldError, missingItems: MissingItem[], minimal: boolean) => string | undefined;
    protected printArgError: ({ error, path, id }: ArgError, hasMissingItems: boolean, minimal: boolean) => string | undefined;
    /**
     * As we're allowing both single objects and array of objects for list inputs, we need to remove incorrect
     * zero indexes from the path
     * @param inputPath e.g. ['where', 'AND', 0, 'id']
     * @param select select object
     */
    private normalizePath;
}

declare interface DocumentInput {
    dmmf: DMMFClass;
    rootTypeName: 'query' | 'mutation';
    rootField: string;
    select?: any;
    modelName?: string;
    extensions: MergedExtensionsList;
}

/**
 * Placeholder value for "no text".
 */
export declare const empty: Sql;

declare interface EmptyIncludeError {
    type: 'emptyInclude';
    field: DMMF.SchemaField;
}

declare interface EmptySelectError {
    type: 'emptySelect';
    field: DMMF.SchemaField;
}

declare type EmptyToUnknown<T> = T;

export declare abstract class Engine {
    abstract on(event: EngineEventType, listener: (args?: any) => any): void;
    abstract start(): Promise<void>;
    abstract stop(): Promise<void>;
    abstract getConfig(): Promise<GetConfigResult>;
    abstract getDmmf(): Promise<DMMF.Document>;
    abstract version(forceRun?: boolean): Promise<string> | string;
    abstract request<T>(options: RequestOptions<unknown>): Promise<QueryEngineResult<T>>;
    abstract requestBatch<T>(options: RequestBatchOptions): Promise<BatchQueryEngineResult<T>[]>;
    abstract transaction(action: 'start', headers: Transaction.TransactionHeaders, options?: Transaction.Options): Promise<Transaction.Info<unknown>>;
    abstract transaction(action: 'commit', headers: Transaction.TransactionHeaders, info: Transaction.Info<unknown>): Promise<void>;
    abstract transaction(action: 'rollback', headers: Transaction.TransactionHeaders, info: Transaction.Info<unknown>): Promise<void>;
    abstract metrics(options: MetricsOptionsJson): Promise<Metrics>;
    abstract metrics(options: MetricsOptionsPrometheus): Promise<string>;
}

declare interface EngineConfig {
    cwd?: string;
    dirname?: string;
    datamodelPath: string;
    enableDebugLogs?: boolean;
    allowTriggerPanic?: boolean;
    prismaPath?: string;
    fetcher?: (query: string) => Promise<{
        data?: any;
        error?: any;
    }>;
    generator?: GeneratorConfig;
    datasources?: DatasourceOverwrite[];
    showColors?: boolean;
    logQueries?: boolean;
    logLevel?: 'info' | 'warn';
    env: Record<string, string>;
    flags?: string[];
    clientVersion?: string;
    previewFeatures?: string[];
    engineEndpoint?: string;
    activeProvider?: string;
    logEmitter: EventEmitter;
    /**
     * The contents of the schema encoded into a string
     * @remarks only used for the purpose of data proxy
     */
    inlineSchema?: string;
    /**
     * The contents of the datasource url saved in a string
     * @remarks only used for the purpose of data proxy
     */
    inlineDatasources?: Record<string, InlineDatasource>;
    /**
     * The string hash that was produced for a given schema
     * @remarks only used for the purpose of data proxy
     */
    inlineSchemaHash?: string;
    /**
     * The configuration object for enabling tracing
     * @remarks enabling is determined by the client
     */
    tracingConfig: TracingConfig;
}

declare type EngineEventType = 'query' | 'info' | 'warn' | 'error' | 'beforeExit';

declare type EngineMiddleware<T = unknown> = (params: EngineMiddlewareParams, next: (params: EngineMiddlewareParams) => Promise<{
    data: T;
    elapsed: number;
}>) => Promise<{
    data: T;
    elapsed: number;
}>;

declare type EngineMiddlewareParams = {
    document: Document_2;
    runInTransaction?: boolean;
};

declare interface EnvValue {
    fromEnvVar: null | string;
    value: string;
}

declare interface EnvValue_2 {
    fromEnvVar: string | null;
    value: string | null;
}

declare type ErrorFormat = 'pretty' | 'colorless' | 'minimal';

declare interface ErrorWithBatchIndex {
    batchRequestIdx?: number;
}

declare interface EventEmitter {
    on(event: string, listener: (...args: any[]) => void): unknown;
    emit(event: string, args?: any): boolean;
}

declare namespace Extensions {
    export {
        defineExtension,
        getExtensionContext
    }
}
export { Extensions }

declare namespace Extensions_2 {
    export {
        DefaultArgs,
        GetResultPayload,
        GetResultSelect,
        GetModel,
        GetClient,
        ReadonlySelector,
        RequiredArgs as Args
    }
}

declare class Field {
    readonly name: string;
    readonly args?: Args;
    readonly children?: Field[];
    readonly error?: InvalidFieldError;
    readonly hasInvalidChild: boolean;
    readonly hasInvalidArg: boolean;
    readonly schemaField?: DMMF.SchemaField;
    constructor({ name, args, children, error, schemaField }: FieldArgs);
    get [Symbol.toStringTag](): string;
    toString(): string;
    collectErrors(prefix?: string): {
        fieldErrors: FieldError[];
        argErrors: ArgError[];
    };
}

declare interface FieldArgs {
    name: string;
    schemaField?: DMMF.SchemaField;
    args?: Args;
    children?: Field[];
    error?: InvalidFieldError;
}

declare interface FieldError {
    path: string[];
    error: InvalidFieldError;
}

/**
 * A reference to a specific field of a specific model
 */
export declare interface FieldRef<Model, FieldType> {
    readonly modelName: Model;
    readonly name: string;
    readonly typeName: FieldType;
    readonly isList: boolean;
}

/**
 * Find paths that match a set of regexes
 * @param root to start from
 * @param match to match against
 * @param types to select files, folders, links
 * @param deep to recurse in the directory tree
 * @param limit to limit the results
 * @param handler to further filter results
 * @param found to add to already found
 * @param seen to add to already seen
 * @returns found paths (symlinks preserved)
 */
export declare function findSync(root: string, match: (RegExp | string)[], types?: ('f' | 'd' | 'l')[], deep?: ('d' | 'l')[], limit?: number, handler?: Handler, found?: string[], seen?: Record<string, true>): string[];

declare interface GeneratorConfig {
    name: string;
    output: EnvValue | null;
    isCustomOutput?: boolean;
    provider: EnvValue;
    config: Dictionary<string>;
    binaryTargets: BinaryTargetsEnvValue[];
    previewFeatures: string[];
}

declare type GetClient<Base extends object, C extends RequiredArgs['client'], CP extends RequiredArgs['client']> = C & Omit_2<CP, keyof C> & Omit_2<Base, '$use' | keyof C | keyof CP>;

declare type GetConfigResult = {
    datasources: DataSource[];
    generators: GeneratorConfig[];
};

declare function getExtensionContext<T>(that: {
    [K: symbol]: T;
}): T;

declare type GetModel<Base extends object, M extends RequiredArgs['model'][string]> = M & Omit_2<Base, keyof M>;

export declare function getPrismaClient(config: GetPrismaClientConfig): {
    new (optionsArg?: PrismaClientOptions): {
        _baseDmmf: BaseDMMFHelper;
        _dmmf?: DMMFClass | undefined;
        _engine: Engine;
        _fetcher: RequestHandler;
        _connectionPromise?: Promise<any> | undefined;
        _disconnectionPromise?: Promise<any> | undefined;
        _engineConfig: EngineConfig;
        _clientVersion: string;
        _errorFormat: ErrorFormat;
        _clientEngineType: ClientEngineType;
        _tracingConfig: TracingConfig;
        _hooks?: Hooks | undefined;
        _metrics: MetricsClient;
        _getConfigPromise?: Promise<{
            datasources: DataSource[];
            generators: GeneratorConfig[];
        }> | undefined;
        _middlewares: Middlewares;
        _previewFeatures: string[];
        _activeProvider: string;
        _rejectOnNotFound?: InstanceRejectOnNotFound;
        _dataProxy: boolean;
        _extensions: MergedExtensionsList;
        getEngine(): Engine;
        /**
         * Hook a middleware into the client
         * @param middleware to hook
         */
        $use<T>(middleware: QueryMiddleware<T>): any;
        /**
         * Hook a middleware into the client
         * @param middleware to hook
         */
        $use<T_1>(namespace: 'all', cb: QueryMiddleware<T_1>): any;
        /**
         * Hook a middleware into the client
         * @param middleware to hook
         */
        $use<T_2>(namespace: 'engine', cb: EngineMiddleware<T_2>): any;
        $on(eventType: EngineEventType, callback: (event: any) => void): void;
        $connect(): Promise<void>;
        /**
         * @private
         */
        _runDisconnect(): Promise<void>;
        /**
         * Disconnect from the database
         */
        $disconnect(): Promise<void>;
        _getActiveProvider(): Promise<void>;
        /**
         * Executes a raw query and always returns a number
         */
        $executeRawInternal(transaction: PrismaPromiseTransaction | undefined, lock: PromiseLike<void> | undefined, query: string | TemplateStringsArray | Sql, ...values: RawValue[]): Promise<any>;
        /**
         * Executes a raw query provided through a safe tag function
         * @see https://github.com/prisma/prisma/issues/7142
         *
         * @param query
         * @param values
         * @returns
         */
        $executeRaw(query: TemplateStringsArray | Sql, ...values: any[]): PrismaPromise<unknown>;
        /**
         * Unsafe counterpart of `$executeRaw` that is susceptible to SQL injections
         * @see https://github.com/prisma/prisma/issues/7142
         *
         * @param query
         * @param values
         * @returns
         */
        $executeRawUnsafe(query: string, ...values: RawValue[]): PrismaPromise<unknown>;
        /**
         * Executes a raw command only for MongoDB
         *
         * @param command
         * @returns
         */
        $runCommandRaw(command: object): PrismaPromise<unknown>;
        /**
         * Executes a raw query and returns selected data
         */
        $queryRawInternal(transaction: PrismaPromiseTransaction | undefined, lock: PromiseLike<void> | undefined, query: string | TemplateStringsArray | Sql, ...values: RawValue[]): Promise<unknown[]>;
        /**
         * Executes a raw query provided through a safe tag function
         * @see https://github.com/prisma/prisma/issues/7142
         *
         * @param query
         * @param values
         * @returns
         */
        $queryRaw(query: TemplateStringsArray | Sql, ...values: any[]): PrismaPromise<unknown>;
        /**
         * Unsafe counterpart of `$queryRaw` that is susceptible to SQL injections
         * @see https://github.com/prisma/prisma/issues/7142
         *
         * @param query
         * @param values
         * @returns
         */
        $queryRawUnsafe(query: string, ...values: RawValue[]): PrismaPromise<unknown>;
        __internal_triggerPanic(fatal: boolean): Promise<any>;
        /**
         * Execute a batch of requests in a transaction
         * @param requests
         * @param options
         */
        _transactionWithArray({ promises, options, }: {
            promises: Array<PrismaPromise<any>>;
            options?: BatchTransactionOptions | undefined;
        }): Promise<any>;
        /**
         * Perform a long-running transaction
         * @param callback
         * @param options
         * @returns
         */
        _transactionWithCallback({ callback, options, }: {
            callback: (client: Client) => Promise<unknown>;
            options?: Options | undefined;
        }): Promise<unknown>;
        /**
         * Execute queries within a transaction
         * @param input a callback or a query list
         * @param options to set timeouts (callback)
         * @returns
         */
        $transaction(input: any, options?: any): Promise<any>;
        /**
         * Runs the middlewares over params before executing a request
         * @param internalParams
         * @returns
         */
        _request(internalParams: InternalRequestParams): Promise<any>;
        _executeRequest({ args, clientMethod, jsModelName, dataPath, callsite, action, model, headers, argsMapper, transaction, lock, unpacker, otelParentCtx, }: InternalRequestParams): Promise<object>;
        _getDmmf: (params: Pick<InternalRequestParams, "callsite" | "clientMethod">) => Promise<DMMFClass>;
        readonly $metrics: MetricsClient;
        /**
         * Shortcut for checking a preview flag
         * @param feature preview flag
         * @returns
         */
        _hasPreviewFlag(feature: string): boolean;
        $extends: typeof $extends;
        readonly [Symbol.toStringTag]: string;
    };
};

/**
 * Config that is stored into the generated client. When the generated client is
 * loaded, this same config is passed to {@link getPrismaClient} which creates a
 * closure with that config around a non-instantiated [[PrismaClient]].
 */
declare interface GetPrismaClientConfig {
    document: Omit<DMMF.Document, 'schema'>;
    generator?: GeneratorConfig;
    sqliteDatasourceOverrides?: DatasourceOverwrite[];
    relativeEnvPaths: {
        rootEnvPath?: string | null;
        schemaEnvPath?: string | null;
    };
    relativePath: string;
    dirname: string;
    filename?: string;
    clientVersion?: string;
    engineVersion?: string;
    datasourceNames: string[];
    activeProvider: string;
    /**
     * True when `--data-proxy` is passed to `prisma generate`
     * If enabled, we disregard the generator config engineType.
     * It means that `--data-proxy` binds you to the Data Proxy.
     */
    dataProxy: boolean;
    /**
     * The contents of the schema encoded into a string
     * @remarks only used for the purpose of data proxy
     */
    inlineSchema?: string;
    /**
     * A special env object just for the data proxy edge runtime.
     * Allows bundlers to inject their own env variables (Vercel).
     * Allows platforms to declare global variables as env (Workers).
     * @remarks only used for the purpose of data proxy
     */
    injectableEdgeEnv?: LoadedEnv;
    /**
     * The contents of the datasource url saved in a string.
     * This can either be an env var name or connection string.
     * It is needed by the client to connect to the Data Proxy.
     * @remarks only used for the purpose of data proxy
     */
    inlineDatasources?: InlineDatasources;
    /**
     * The string hash that was produced for a given schema
     * @remarks only used for the purpose of data proxy
     */
    inlineSchemaHash?: string;
}

declare type GetResultPayload<Base extends object, R extends RequiredArgs['result'][string]> = {} extends R ? Base : {
    [K in keyof R]: ReturnType<R[K]['compute']>;
} & {
    [K in Exclude<keyof Base, keyof R>]: Base[K];
};

declare type GetResultSelect<Base extends object, R extends RequiredArgs['result'][string]> = R extends unknown ? Base & {
    [K in keyof R]?: boolean;
} : never;

declare type HandleErrorParams = {
    error: any;
    clientMethod: string;
    callsite?: CallSite;
    transaction?: PrismaPromiseTransaction;
};

declare type Handler = (base: string, item: string, type: ItemType) => boolean | string;

declare type HookParams = {
    query: string;
    path: string[];
    rootField?: string;
    typeName?: string;
    document: any;
    clientMethod: string;
    args: any;
};

declare type Hooks = {
    beforeRequest?: (options: HookParams) => any;
};

declare interface IncludeAndSelectError {
    type: 'includeAndSelect';
    field: DMMF.SchemaField;
}

declare type IncludeSelect = {
    select?: Selection_2;
    include?: Selection_2;
};

declare type Info<Payload = unknown> = {
    /**
     * Transaction ID returned by the query engine.
     */
    id: string;
    /**
     * Arbitrary payload the meaning of which depends on the `Engine` implementation.
     * For example, `DataProxyEngine` needs to associate different API endpoints with transactions.
     * In `LibraryEngine` and `BinaryEngine` it is currently not used.
     */
    payload: Payload;
};

declare type InlineDatasource = {
    url: NullableEnvValue;
};

declare type InlineDatasources = {
    [name in InternalDatasource['name']]: {
        url: InternalDatasource['url'];
    };
};

declare type InstanceRejectOnNotFound = RejectOnNotFound | Record<string, RejectOnNotFound> | Record<string, Record<string, RejectOnNotFound>>;

declare type InteractiveTransactionOptions<Payload> = Transaction.Info<Payload>;

declare type InteractiveTransactionOptions_2 = Omit<PrismaPromiseInteractiveTransaction, 'kind'>;

declare interface InternalDatasource {
    name: string;
    activeProvider: ConnectorType_2;
    provider: ConnectorType_2;
    url: EnvValue_2;
    config: any;
}

declare type InternalRequestParams = {
    /**
     * The original client method being called.
     * Even though the rootField / operation can be changed,
     * this method stays as it is, as it's what the user's
     * code looks like
     */
    clientMethod: string;
    /**
     * Name of js model that triggered the request. Might be used
     * for warnings or error messages
     */
    jsModelName?: string;
    callsite?: CallSite;
    /** Headers metadata that will be passed to the Engine */
    headers?: Record<string, string>;
    transaction?: PrismaPromiseTransaction;
    unpacker?: Unpacker;
    lock?: PromiseLike<void>;
    otelParentCtx?: Context;
    /** Used to "desugar" a user input into an "expanded" one */
    argsMapper?: (args?: UserArgs) => UserArgs;
} & Omit<QueryMiddlewareParams, 'runInTransaction'>;

declare type InvalidArgError = InvalidArgNameError | MissingArgError | InvalidArgTypeError | AtLeastOneError | AtMostOneError | InvalidNullArgError;

/**
 * This error occurs if the user provides an arg name that doesn't exist
 */
declare interface InvalidArgNameError {
    type: 'invalidName';
    providedName: string;
    providedValue: any;
    didYouMeanArg?: string;
    didYouMeanField?: string;
    originalType: DMMF.ArgType;
    possibilities?: DMMF.SchemaArgInputType[];
    outputType?: DMMF.OutputType;
}

/**
 * If the scalar type of an arg is not matching what is required
 */
declare interface InvalidArgTypeError {
    type: 'invalidType';
    argName: string;
    requiredType: {
        bestFittingType: DMMF.SchemaArgInputType;
        inputType: DMMF.SchemaArgInputType[];
    };
    providedValue: any;
}

declare type InvalidFieldError = InvalidFieldNameError | InvalidFieldTypeError | EmptySelectError | NoTrueSelectError | IncludeAndSelectError | EmptyIncludeError;

declare interface InvalidFieldNameError {
    type: 'invalidFieldName';
    modelName: string;
    didYouMean?: string | null;
    providedName: string;
    isInclude?: boolean;
    isIncludeScalar?: boolean;
    outputType: DMMF.OutputType;
}

declare interface InvalidFieldTypeError {
    type: 'invalidFieldType';
    modelName: string;
    fieldName: string;
    providedValue: any;
}

/**
 * If a user incorrectly provided null where she shouldn't have
 */
declare interface InvalidNullArgError {
    type: 'invalidNullArg';
    name: string;
    invalidType: DMMF.SchemaArgInputType[];
    atLeastOne: boolean;
    atMostOne: boolean;
}

declare enum IsolationLevel {
    ReadUncommitted = "ReadUncommitted",
    ReadCommitted = "ReadCommitted",
    RepeatableRead = "RepeatableRead",
    Snapshot = "Snapshot",
    Serializable = "Serializable"
}

declare type ItemType = 'd' | 'f' | 'l';

declare interface Job {
    resolve: (data: any) => void;
    reject: (data: any) => void;
    request: any;
}

/**
 * Create a SQL query for a list of values.
 */
export declare function join(values: RawValue[], separator?: string, prefix?: string, suffix?: string): Sql;

declare class JsonNull extends NullTypesEnumValue {
}

declare type KnownErrorParams = {
    code: string;
    clientVersion: string;
    meta?: Record<string, unknown>;
    batchRequestIdx?: number;
};

declare type LoadedEnv = {
    message?: string;
    parsed: {
        [x: string]: string;
    };
} | undefined;

declare type LocationInFile = {
    fileName: string;
    lineNumber: number | null;
    columnNumber: number | null;
};

declare type LogDefinition = {
    level: LogLevel;
    emit: 'stdout' | 'event';
};

declare type LogLevel = 'info' | 'query' | 'warn' | 'error';

export declare function makeDocument({ dmmf, rootTypeName, rootField, select, modelName, extensions, }: DocumentInput): Document_2;

/**
 * Generates more strict variant of an enum which, unlike regular enum,
 * throws on non-existing property access. This can be useful in following situations:
 * - we have an API, that accepts both `undefined` and `SomeEnumType` as an input
 * - enum values are generated dynamically from DMMF.
 *
 * In that case, if using normal enums and no compile-time typechecking, using non-existing property
 * will result in `undefined` value being used, which will be accepted. Using strict enum
 * in this case will help to have a runtime exception, telling you that you are probably doing something wrong.
 *
 * Note: if you need to check for existence of a value in the enum you can still use either
 * `in` operator or `hasOwnProperty` function.
 *
 * @param definition
 * @returns
 */
export declare function makeStrictEnum<T extends Record<PropertyKey, string | number>>(definition: T): T;

/**
 * Class that holds the list of all extensions, applied to particular instance, as well
 * as resolved versions of the components that need to apply on different levels. Main idea
 * of this class: avoid re-resolving as much of the stuff as possible when new extensions are added while also
 * delaying the resolve until the point it is actually needed. For example, computed fields of the model won't be resolved unless
 * the model is actually queried. Neither adding extensions with `client` component only cause other components to
 * recompute.
 */
declare class MergedExtensionsList {
    private head?;
    private constructor();
    static empty(): MergedExtensionsList;
    static single(extension: Args_2): MergedExtensionsList;
    isEmpty(): boolean;
    append(extension: Args_2): MergedExtensionsList;
    getAllComputedFields(dmmfModelName: string): ComputedFieldsMap | undefined;
    getAllClientExtensions(): ClientExtensionDefinition | undefined;
    getAllModelExtensions(dmmfModelName: string): ModelExtensionDefinition | undefined;
    getAllQueryCallbacks(jsModelName: string, action: string): any;
}

export declare type Metric<T> = {
    key: string;
    value: T;
    labels: Record<string, string>;
    description: string;
};

export declare type MetricHistogram = {
    buckets: MetricHistogramBucket[];
    sum: number;
    count: number;
};

export declare type MetricHistogramBucket = [maxValue: number, count: number];

export declare type Metrics = {
    counters: Metric<number>[];
    gauges: Metric<number>[];
    histograms: Metric<MetricHistogram>[];
};

export declare class MetricsClient {
    private _engine;
    constructor(engine: Engine);
    /**
     * Returns all metrics gathered up to this point in prometheus format.
     * Result of this call can be exposed directly to prometheus scraping endpoint
     *
     * @param options
     * @returns
     */
    prometheus(options?: MetricsOptions): Promise<string>;
    /**
     * Returns all metrics gathered up to this point in prometheus format.
     *
     * @param options
     * @returns
     */
    json(options?: MetricsOptions): Promise<Metrics>;
}

declare type MetricsOptions = {
    /**
     * Labels to add to every metrics in key-value format
     */
    globalLabels?: Record<string, string>;
};

declare type MetricsOptionsCommon = {
    globalLabels?: Record<string, string>;
};

declare type MetricsOptionsJson = {
    format: 'json';
} & MetricsOptionsCommon;

declare type MetricsOptionsPrometheus = {
    format: 'prometheus';
} & MetricsOptionsCommon;

declare class MiddlewareHandler<M extends Function> {
    private _middlewares;
    use(middleware: M): void;
    get(id: number): M | undefined;
    has(id: number): boolean;
    length(): number;
}

declare class Middlewares {
    query: MiddlewareHandler<QueryMiddleware<unknown>>;
    engine: MiddlewareHandler<EngineMiddleware<unknown>>;
}

/**
 * Opposite of InvalidArgNameError - if the user *doesn't* provide an arg that should be provided
 * This error both happens with an implicit and explicit `undefined`
 */
declare interface MissingArgError {
    type: 'missingArg';
    missingName: string;
    missingArg: DMMF.SchemaArg;
    atLeastOne: boolean;
    atMostOne: boolean;
}

declare interface MissingItem {
    path: string;
    isRequired: boolean;
    type: string | object;
}

declare type ModelArgs = {
    model: {
        [ModelName in string]: ModelExtensionDefinition;
    };
};

declare type ModelExtensionDefinition = {
    [MethodName in string]: (...args: any[]) => any;
};

declare type NameArgs = {
    name?: string;
};

declare type NeverToUnknown<T> = [T] extends [never] ? unknown : T;

/**
 * @deprecated please don´t rely on type checks to this error anymore.
 * This will become a PrismaClientKnownRequestError with code P2025
 * in the future major version of the client
 */
export declare class NotFoundError extends PrismaClientKnownRequestError {
    constructor(message: string);
}

declare interface NoTrueSelectError {
    type: 'noTrueSelect';
    field: DMMF.SchemaField;
}

declare type NullableEnvValue = {
    fromEnvVar: string | null;
    value?: string | null;
};

declare class NullTypesEnumValue extends ObjectEnumValue {
    _getNamespace(): string;
}

/**
 * Base class for unique values of object-valued enums.
 */
declare abstract class ObjectEnumValue {
    constructor(arg?: symbol);
    abstract _getNamespace(): string;
    _getName(): string;
    toString(): string;
}

export declare const objectEnumValues: {
    classes: {
        DbNull: typeof DbNull;
        JsonNull: typeof JsonNull;
        AnyNull: typeof AnyNull;
    };
    instances: {
        DbNull: DbNull;
        JsonNull: JsonNull;
        AnyNull: AnyNull;
    };
};

declare type Omit_2<T, K extends string | number | symbol> = {
    [P in keyof T as P extends K ? never : P]: T[P];
};

declare type OptionalFlat<T> = {
    [K in keyof T]?: T[K];
};

/**
 * maxWait ?= 2000
 * timeout ?= 5000
 */
declare type Options = {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: IsolationLevel;
};

declare type PatchDeep<O1, O2, O = O1 & O2> = {
    [K in keyof O]: K extends keyof O1 ? K extends keyof O2 ? O1[K] extends object ? O2[K] extends object ? O1[K] extends Function ? O1[K] : O2[K] extends Function ? O1[K] : PatchDeep<O1[K], O2[K]> : O1[K] : O1[K] : O1[K] : O2[K & keyof O2];
} & unknown;

declare type PatchFlat<O1, O2> = O1 & Omit_2<O2, keyof O1>;

/**
 * Patches 3 objects on top of each other with minimal looping.
 * This is a more efficient way of doing `PatchFlat<A, PatchFlat<B, C>>`
 */
declare type PatchFlat3<A, B, C> = A & {
    [K in Exclude<keyof B | keyof C, keyof A>]: K extends keyof B ? B[K] : C[K & keyof C];
};

declare type Pick_2<T, K extends string | number | symbol> = {
    [P in keyof T as P extends K ? P : never]: T[P];
};

export declare class PrismaClientExtensionError extends Error {
    extensionName: string | undefined;
    constructor(extensionName: string | undefined, cause: unknown);
    get [Symbol.toStringTag](): string;
}

export declare class PrismaClientInitializationError extends Error {
    clientVersion: string;
    errorCode?: string;
    constructor(message: string, clientVersion: string, errorCode?: string);
    get [Symbol.toStringTag](): string;
}

export declare class PrismaClientKnownRequestError extends Error implements ErrorWithBatchIndex {
    code: string;
    meta?: Record<string, unknown>;
    clientVersion: string;
    batchRequestIdx?: number;
    constructor(message: string, { code, clientVersion, meta, batchRequestIdx }: KnownErrorParams);
    get [Symbol.toStringTag](): string;
}

export declare interface PrismaClientOptions {
    /**
     * Will throw an Error if findUnique returns null
     */
    rejectOnNotFound?: InstanceRejectOnNotFound;
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources;
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat;
    /**
     * @example
     * \`\`\`
     * // Defaults to stdout
     * log: ['query', 'info', 'warn']
     *
     * // Emit as events
     * log: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     * ]
     * \`\`\`
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: Array<LogLevel | LogDefinition>;
    /**
     * @internal
     * You probably don't want to use this. \`__internal\` is used by internal tooling.
     */
    __internal?: {
        debug?: boolean;
        hooks?: Hooks;
        engine?: {
            cwd?: string;
            binaryPath?: string;
            endpoint?: string;
            allowTriggerPanic?: boolean;
        };
    };
}

export declare class PrismaClientRustPanicError extends Error {
    clientVersion: string;
    constructor(message: string, clientVersion: string);
    get [Symbol.toStringTag](): string;
}

export declare class PrismaClientUnknownRequestError extends Error implements ErrorWithBatchIndex {
    clientVersion: string;
    batchRequestIdx?: number;
    constructor(message: string, { clientVersion, batchRequestIdx }: UnknownErrorParams);
    get [Symbol.toStringTag](): string;
}

export declare class PrismaClientValidationError extends Error {
    get [Symbol.toStringTag](): string;
}

/**
 * Prisma's `Promise` that is backwards-compatible. All additions on top of the
 * original `Promise` are optional so that it can be backwards-compatible.
 * @see [[createPrismaPromise]]
 */
declare interface PrismaPromise<A> extends Promise<A> {
    /**
     * Extension of the original `.then` function
     * @param onfulfilled same as regular promises
     * @param onrejected same as regular promises
     * @param transaction interactive transaction options
     */
    then<R1 = A, R2 = never>(onfulfilled?: (value: A) => R1 | PromiseLike<R1>, onrejected?: (error: unknown) => R2 | PromiseLike<R2>, transaction?: InteractiveTransactionOptions_2): Promise<R1 | R2>;
    /**
     * Extension of the original `.catch` function
     * @param onrejected same as regular promises
     * @param transaction interactive transaction options
     */
    catch<R = never>(onrejected?: ((reason: any) => R | PromiseLike<R>) | undefined | null, transaction?: InteractiveTransactionOptions_2): Promise<A | R>;
    /**
     * Extension of the original `.finally` function
     * @param onfinally same as regular promises
     * @param transaction interactive transaction options
     */
    finally(onfinally?: (() => void) | undefined | null, transaction?: InteractiveTransactionOptions_2): Promise<A>;
    /**
     * Called when executing a batch of regular tx
     * @param transaction transaction options for regular tx
     */
    requestTransaction?(transaction: BatchTransactionOptions_2, lock?: PromiseLike<void>): PromiseLike<unknown>;
}

declare type PrismaPromiseBatchTransaction = {
    kind: 'batch';
    id: number;
    isolationLevel?: IsolationLevel;
    index: number;
};

declare type PrismaPromiseInteractiveTransaction = {
    kind: 'itx';
    id: string;
    payload: unknown;
};

declare type PrismaPromiseTransaction = PrismaPromiseBatchTransaction | PrismaPromiseInteractiveTransaction;

declare type QueryEngineRequestHeaders = {
    traceparent?: string;
    transactionId?: string;
    fatal?: string;
};

declare type QueryEngineResult<T> = {
    data: T;
    elapsed: number;
};

declare type QueryMiddleware<T = unknown> = (params: QueryMiddlewareParams, next: (params: QueryMiddlewareParams) => Promise<T>) => Promise<T>;

declare type QueryMiddlewareParams = {
    /** The model this is executed on */
    model?: string;
    /** The action that is being handled */
    action: Action;
    /** TODO what is this */
    dataPath: string[];
    /** TODO what is this */
    runInTransaction: boolean;
    /** TODO what is this */
    args: any;
};

declare type QueryOptions = {
    query: {
        [ModelName in string]: {
            [ModelAction in string]: QueryOptionsCb;
        } & {};
    };
};

declare type QueryOptionsCb = (args: QueryOptionsCbArgs) => Promise<any>;

declare type QueryOptionsCbArgs = {
    model?: string;
    operation: string;
    args: object;
    query: (args: object) => Promise<unknown>;
};

/**
 * Create raw SQL statement.
 */
export declare function raw(value: string): Sql;

/**
 * Supported value or SQL instance.
 */
export declare type RawValue = Value | Sql;

declare type ReadonlyDeep<T> = {
    readonly [K in keyof T]: ReadonlyDeep<T[K]>;
};

declare type ReadonlySelector<T> = T extends unknown ? {
    readonly [K in keyof T as K extends 'include' | 'select' ? K : never]: ReadonlyDeep<T[K]>;
} & {
    [K in keyof T as K extends 'include' | 'select' ? never : K]: T[K];
} : never;

declare type RejectOnNotFound = boolean | ((error: Error) => Error) | undefined;

declare type Request_2 = {
    document: Document_2;
    transaction?: PrismaPromiseTransaction;
    headers?: Record<string, string>;
    otelParentCtx?: Context;
    otelChildCtx?: Context;
    tracingConfig?: TracingConfig;
};

declare type RequestBatchOptions = {
    queries: string[];
    headers?: QueryEngineRequestHeaders;
    transaction?: BatchTransactionOptions;
    numTry?: number;
    containsWrite: boolean;
};

declare class RequestHandler {
    client: Client;
    hooks: any;
    dataloader: DataLoader<Request_2>;
    private logEmmitter?;
    constructor(client: Client, hooks?: any, logEmitter?: EventEmitter);
    request({ document, dataPath, rootField, typeName, isList, callsite, rejectOnNotFound, clientMethod, engineHook, args, headers, transaction, unpacker, extensions, otelParentCtx, otelChildCtx, }: RequestParams): Promise<object>;
    /**
     * Handles the error and logs it, logging the error is done synchronously waiting for the event
     * handlers to finish.
     */
    handleAndLogRequestError({ error, clientMethod, callsite, transaction }: HandleErrorParams): never;
    handleRequestError({ error, clientMethod, callsite, transaction }: HandleErrorParams): never;
    sanitizeMessage(message: any): any;
    unpack(document: any, data: any, path: any, rootField: any, unpacker?: Unpacker): any;
    applyResultExtensions({ result, modelName, args, extensions }: ApplyExtensionsParams): object;
    get [Symbol.toStringTag](): string;
}

declare type RequestOptions<InteractiveTransactionPayload> = {
    query: string;
    headers?: QueryEngineRequestHeaders;
    numTry?: number;
    transaction?: InteractiveTransactionOptions<InteractiveTransactionPayload>;
    isWrite: boolean;
};

declare type RequestParams = {
    document: Document_2;
    dataPath: string[];
    rootField: string;
    typeName: string;
    isList: boolean;
    clientMethod: string;
    callsite?: CallSite;
    rejectOnNotFound?: RejectOnNotFound;
    transaction?: PrismaPromiseTransaction;
    engineHook?: EngineMiddleware;
    extensions: MergedExtensionsList;
    args?: any;
    headers?: Record<string, string>;
    unpacker?: Unpacker;
    otelParentCtx?: Context;
    otelChildCtx?: Context;
};

declare type RequiredArgs = NameArgs & ResultArgs & ModelArgs & ClientArgs & QueryOptions;

declare type ResultArgs = {
    result: {
        [ModelName in string]: ResultModelArgs;
    };
};

declare type ResultArgsFieldCompute = (model: any) => unknown;

declare type ResultFieldDefinition = {
    needs?: {
        [FieldName in string]: boolean;
    };
    compute: ResultArgsFieldCompute;
};

declare type ResultModelArgs = {
    [FieldName in string]: ResultFieldDefinition;
};

declare type Selection_2 = Record<string, boolean | IncludeSelect>;

/**
 * A SQL instance can be nested within each other to build SQL strings.
 */
export declare class Sql {
    values: Value[];
    strings: string[];
    constructor(rawStrings: ReadonlyArray<string>, rawValues: ReadonlyArray<RawValue>);
    get text(): string;
    get sql(): string;
    inspect(): {
        text: string;
        sql: string;
        values: unknown[];
    };
}

/**
 * Create a SQL object from a template string.
 */
export declare function sqltag(strings: ReadonlyArray<string>, ...values: RawValue[]): Sql;

declare type TracingConfig = {
    enabled: boolean;
    middleware: boolean;
};

declare namespace Transaction {
    export {
        IsolationLevel,
        Options,
        Info,
        TransactionHeaders
    }
}

declare type TransactionHeaders = {
    traceparent?: string;
};

export declare function transformDocument(document: Document_2): Document_2;

declare namespace Types {
    export {
        Extensions_2 as Extensions,
        Utils
    }
}
export { Types }

declare type UnknownErrorParams = {
    clientVersion: string;
    batchRequestIdx?: number;
};

/**
 * Unpacks the result of a data object and maps DateTime fields to instances of `Date` in-place
 * @param options: UnpackOptions
 */
export declare function unpack({ document, path, data }: UnpackOptions): any;

declare type Unpacker = (data: any) => any;

declare interface UnpackOptions {
    document: Document_2;
    path: string[];
    data: any;
}

/**
 * Input that flows from the user into the Client.
 */
declare type UserArgs = {
    [K in string]: UserArgsProp | UserArgsProp[];
};

declare type UserArgsProp = UserArgs | string | number | boolean | bigint | null | undefined;

declare namespace Utils {
    export {
        EmptyToUnknown,
        NeverToUnknown,
        PatchFlat,
        PatchDeep,
        Omit_2 as Omit,
        Pick_2 as Pick,
        PatchFlat3,
        Compute,
        OptionalFlat,
        ReadonlyDeep
    }
}

/**
 * Values supported by SQL engine.
 */
export declare type Value = unknown;

export declare function warnEnvConflicts(envPaths: any): void;

export { }
