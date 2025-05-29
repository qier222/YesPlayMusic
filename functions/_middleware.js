export async function onRequest({ request, next, env }) {
  const url = new URL(request.url)
  
  // 检查请求路径是否以/api开头
  if (url.pathname.startsWith('/api/')) {
    // 提取API路径（去除/api前缀）
    const apiPath = url.pathname.replace('/api', '')
    
    // 构建API请求URL（替换为您的API服务地址）
    const apiUrl = `https://netease-cloud-music-api-one-mu-15.vercel.app/${apiPath}${url.search}`
    
    // 创建新的请求
    const apiRequest = new Request(apiUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: 'follow'
    } )
    
    try {
      // 发送请求到API服务
      return await fetch(apiRequest)
    } catch (error) {
      return new Response(`API请求错误: ${error.message}`, { status: 500 })
    }
  }
  
  // 对于非API请求，继续正常处理
  return next()
}
