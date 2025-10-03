import { blue, redBright, yellow } from 'colorette'
import { figures } from 'listr2'

export const info = blue(figures.arrowRight)

export const error = redBright(figures.cross)

export const warning = yellow(figures.warning)
