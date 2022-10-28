import fp from 'fastify-plugin'
import sensible, { SensibleOptions } from '@fastify/sensible'

/**
 * This plugins adds some utilities to handle http errors
 *
 * @see https://github.com/fastify/fastify-sensible
 */
export default fp<SensibleOptions>(async (fastify, opts) => {
  fastify.register(sensible, {
    errorHandler: false
  })
})
