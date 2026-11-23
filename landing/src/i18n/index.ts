import zh from './zh';
import en from './en';

export const languages = { zh: '简体中文', en: 'English' } as const;
export type Lang = keyof typeof languages;
export type Dict = typeof zh;

const dicts: Record<Lang, Dict> = { zh, en };
export const t = (lang: Lang) => dicts[lang];
export const pathOf = (lang: Lang) => `/${lang}/`;
