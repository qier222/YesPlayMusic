import { app } from 'electron'
import logger from 'electron-log'
import pc from 'picocolors'

Object.assign(console, logger.functions)

logger.transports.console.format = `${pc.dim('{h}:{i}:{s}{scope}')} › {text}`

logger.transports.file.level = app.isPackaged ? 'info' : 'debug'
logger.info(
  `\n\n██╗   ██╗███████╗███████╗██████╗ ██╗      █████╗ ██╗   ██╗███╗   ███╗██╗   ██╗███████╗██╗ ██████╗
╚██╗ ██╔╝██╔════╝██╔════╝██╔══██╗██║     ██╔══██╗╚██╗ ██╔╝████╗ ████║██║   ██║██╔════╝██║██╔════╝
 ╚████╔╝ █████╗  ███████╗██████╔╝██║     ███████║ ╚████╔╝ ██╔████╔██║██║   ██║███████╗██║██║     
  ╚██╔╝  ██╔══╝  ╚════██║██╔═══╝ ██║     ██╔══██║  ╚██╔╝  ██║╚██╔╝██║██║   ██║╚════██║██║██║     
   ██║   ███████╗███████║██║     ███████╗██║  ██║   ██║   ██║ ╚═╝ ██║╚██████╔╝███████║██║╚██████╗
   ╚═╝   ╚══════╝╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝     ╚═╝ ╚═════╝ ╚══════╝╚═╝ ╚═════╝\n`
)

export default logger

logger.info(`[logger] logger initialized`)
