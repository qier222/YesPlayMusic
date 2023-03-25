/**  By default, it writes logs to the following locations:
 * on Linux: ~/.config/R3PLAY/logs/main.log
 * on macOS: ~/Library/Logs/r3play/main.log
 * on Windows: %USERPROFILE%\AppData\Roaming\r3play\logs\main.log
 * @see https://www.npmjs.com/package/electron-log
 */

import log from 'electron-log'
import pc from 'picocolors'
import { isDev } from './env'

Object.assign(console, log.functions)
log.variables.process = 'main'
if (log.transports.ipc) log.transports.ipc.level = false
log.transports.console.format = `${isDev ? '' : pc.dim('{h}:{i}:{s}{scope} ')}{level} › {text}`
log.transports.file.level = 'info'

log.info(
  `\n\n██╗   ██╗███████╗███████╗██████╗ ██╗      █████╗ ██╗   ██╗███╗   ███╗██╗   ██╗███████╗██╗ ██████╗
╚██╗ ██╔╝██╔════╝██╔════╝██╔══██╗██║     ██╔══██╗╚██╗ ██╔╝████╗ ████║██║   ██║██╔════╝██║██╔════╝
 ╚████╔╝ █████╗  ███████╗██████╔╝██║     ███████║ ╚████╔╝ ██╔████╔██║██║   ██║███████╗██║██║     
  ╚██╔╝  ██╔══╝  ╚════██║██╔═══╝ ██║     ██╔══██║  ╚██╔╝  ██║╚██╔╝██║██║   ██║╚════██║██║██║     
   ██║   ███████╗███████║██║     ███████╗██║  ██║   ██║   ██║ ╚═╝ ██║╚██████╔╝███████║██║╚██████╗
   ╚═╝   ╚══════╝╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝     ╚═╝ ╚═════╝ ╚══════╝╚═╝ ╚═════╝\n`
)

export default log

log.info(`[logger] logger initialized`)
