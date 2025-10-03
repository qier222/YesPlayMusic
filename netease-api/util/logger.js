// ANSI 颜色代码
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    dim: '\x1b[2m',
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    bgRed: '\x1b[41m',
    bgGreen: '\x1b[42m',
    bgYellow: '\x1b[43m'
};

const logger = {
    debug: (msg, ...args) => console.info(`${colors.cyan}[DEBUG]${colors.reset}`, msg, ...args),
    info: (msg, ...args) => console.info(`${colors.green}[INFO]${colors.reset}`, msg, ...args),
    warn: (msg, ...args) => console.info(`${colors.yellow}[WARN]${colors.reset}`, msg, ...args),
    error: (msg, ...args) => console.error(`${colors.red}[ERROR]${colors.reset}`, msg, ...args),
    success: (msg, ...args) => console.log(`${colors.bright}${colors.green}[SUCCESS]${colors.reset}`, msg, ...args),
    critical: (msg, ...args) => console.error(`${colors.bright}${colors.bgRed}[CRITICAL]${colors.reset}`, msg, ...args)
};

// 导出logger
module.exports = logger;