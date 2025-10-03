declare function warning (): Warning

export declare class WarnOpts {
  code: string;
  name: string;
  message: string;
}

export type BuildWarnOptsFn = (a?: any, b?: any, c?: any) => WarnOpts

interface Warning {
  create(name: string, code: string, message: string): BuildWarnOptsFn,
  emit(cod: string, a?: any, b?: any, c?: any): void,
  emitted: Map<string, boolean>
}

export default warning
