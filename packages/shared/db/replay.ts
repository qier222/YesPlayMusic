export const enum ReplayTables {
  CoverColor = 'CoverColor',
  AppData = 'AppData',
}

export interface ReplayTableKeys {
  [ReplayTables.CoverColor]: number
  [ReplayTables.AppData]: 'appVersion' | 'skippedVersion'
}

export interface ReplayTableStructures {
  [ReplayTables.CoverColor]: {
    id: number
    color: string
  }
  [ReplayTables.AppData]: {
    value: string
  }
}
