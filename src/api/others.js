import request from "@/utils/request";
import { mapTrackPlayableStatus } from "@/utils/common";

export function search(params) {
  return request({
    url: "/search",
    method: "get",
    params,
  }).then((data) => {
    if (data.result.song !== undefined)
      data.result.song.songs = mapTrackPlayableStatus(data.result.song.songs);
    return data;
  });
}
