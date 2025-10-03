import { expectType } from 'tsd'
import Warinig, { BuildWarnOptsFn, WarnOpts } from './'

const warning = Warinig()
const buildWarnOpts = warning.create('FastifyWarning', 'CODE', 'message')
expectType<BuildWarnOptsFn>(buildWarnOpts)
const opts = buildWarnOpts()
expectType<WarnOpts>(opts)
expectType<string>(opts.code)
expectType<string>(opts.message)
expectType<string>(opts.name)

expectType<void>(warning.emit('CODE'))
expectType<Map<string, boolean>>(warning.emitted)
