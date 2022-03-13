import styles from 'ansi-styles'
import { app } from 'electron'
import logger from 'electron-log'

const color = (hex: string, text: string) => {
  return `${styles.color.ansi(styles.hexToAnsi(hex))}${text}${
    styles.color.close
  }`
}

logger.transports.console.format = `${color(
  '38bdf8',
  '[main]'
)} {h}:{i}:{s}.{ms}{scope} › {text}`

logger.transports.file.level = app.isPackaged ? 'info' : 'debug'
logger.info(
  color(
    '335eea',
    `\n\n██╗   ██╗███████╗███████╗██████╗ ██╗      █████╗ ██╗   ██╗███╗   ███╗██╗   ██╗███████╗██╗ ██████╗
╚██╗ ██╔╝██╔════╝██╔════╝██╔══██╗██║     ██╔══██╗╚██╗ ██╔╝████╗ ████║██║   ██║██╔════╝██║██╔════╝
 ╚████╔╝ █████╗  ███████╗██████╔╝██║     ███████║ ╚████╔╝ ██╔████╔██║██║   ██║███████╗██║██║     
  ╚██╔╝  ██╔══╝  ╚════██║██╔═══╝ ██║     ██╔══██║  ╚██╔╝  ██║╚██╔╝██║██║   ██║╚════██║██║██║     
   ██║   ███████╗███████║██║     ███████╗██║  ██║   ██║   ██║ ╚═╝ ██║╚██████╔╝███████║██║╚██████╗
   ╚═╝   ╚══════╝╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝     ╚═╝ ╚═════╝ ╚══════╝╚═╝ ╚═════╝\n`
  )
)

export default logger
