// GD音乐台get(适配SPlayer的UNM-Server)
// 感谢来自GD Studio的开发API
// https://music.gdstudio.xyz/

const createOption = require('../util/option.js')

module.exports = async (query, request) => {
    try {
        const { id, br = "320" } = query;
        if (!id) {
            return {
                status: 400,
                body: {
                    code: 400,
                    message: "缺少必要参数 id",
                    data: [],
                },
            };
        }
        const validBR = ["128", "192", "320", "740", "999"];
        // const covertBR = ["128000", "192000", "320000","740000", "999000"];
        if (!validBR.includes(br)) {
            return {
                status: 400,
                body: {
                    code: 400,
                    message: "无效音质参数",
                    allowed_values: validBR,
                    data: [],
                },
            };
        }

        const apiUrl = new URL("https://music-api.gdstudio.xyz/api.php");
        apiUrl.searchParams.append("types", "url");
        apiUrl.searchParams.append("id", id);
        apiUrl.searchParams.append("br", br);

        const response = await fetch(apiUrl.toString());
        if (!response.ok) throw new Error(`API 响应状态: ${response.status}`);
        const result = await response.json();

        // 代理逻辑
        const useProxy = process.env.ENABLE_PROXY || false;
        const proxy = process.env.PROXY_URL;
        if (useProxy && result.url && result.url.includes("kuwo")) {
            result.proxyUrl = proxy + result.url.replace(/^http:\/\//, "http/");
        }

        return {
            status: 200,
            body: {
                code: 200,
                message: "请求成功",
                data: {
                    id,
                    br,
                    url: result.url,
                    ...(proxy && result.proxyUrl ? { proxyUrl: result.proxyUrl } : {})
                }
            }
        };
    } catch (error) {
        console.error("Error in song_url_ncmget:", error);
        return {
            status: 500,
            body: {
                code: 500,
                message: "服务器处理请求失败",
                ...(process.env.NODE_ENV === "development" ? { error: error.message } : {}),
                data: [],
            },
        };
    }
}
