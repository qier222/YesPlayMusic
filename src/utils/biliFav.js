// 获取bili fav完整播放列表
export async function getBiliFav(id) {
  let data = await fetch(`http://127.0.0.1:10764/playlist/get?mlid=${id}`).then(
    resp => resp.json()
  );
  return data['data'];
}
