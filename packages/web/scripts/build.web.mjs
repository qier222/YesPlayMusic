import { build } from 'vite'
import { promises as fs } from 'fs'

const main = async () => {
  const api = process.env.VITE_APP_NETEASE_API_URL || ''
  const rewriteApi = process.env.NETEASE_API_URL_FOR_REWRITE || ''

  /**
   * 使用 Vercel 的 rewrite 功能来帮我们解决跨域的问题
   * @see https://vercel.com/docs/project-configuration#project-configuration/rewrites
   */
  if (process.env.VERCEL && api === '/netease') {
    console.log(`VITE_APP_NETEASE_API_URL: ${api}`)
    console.log(`NETEASE_API_URL_FOR_REWRITE: ${rewriteApi}`)

    if (!rewriteApi.startsWith('http')) {
      throw new Error('NETEASE_API_URL_FOR_REWRITE must start with http')
    }

    const vercelConfig = JSON.parse(await fs.readFile('./vercel.example.json'))
    vercelConfig.rewrites[0].destination = `${rewriteApi}${
      rewriteApi.endsWith('/') ? '' : '/'
    }:match*`

    console.log('vercel.json 👇')
    console.log(vercelConfig)

    await fs.writeFile(
      '../../vercel.json',
      JSON.stringify(vercelConfig, null, 2)
    )
  }

  await build()
}

main()
