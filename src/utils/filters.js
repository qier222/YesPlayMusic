import Vue from "vue";
import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import relativeTime from "dayjs/plugin/relativeTime";

Vue.filter("formatTime", (Milliseconds, format = "HH:MM:SS") => {
  if (!Milliseconds) return "";
  dayjs.extend(duration);
  dayjs.extend(relativeTime);

  let time = dayjs.duration(Milliseconds);
  let hours = time.hours().toString();
  let mins = time.minutes().toString();
  let seconds = time
    .seconds()
    .toString()
    .padStart(2, "0");

  if (format === "HH:MM:SS") {
    return hours !== "0"
      ? `${hours}:${mins.padStart(2, "0")}:${seconds}`
      : `${mins}:${seconds}`;
  } else if (format === "Human") {
    return hours !== "0" ? `${hours} hr ${mins} min` : `${mins} min`;
  }
});

Vue.filter("formatDate", (timestamp, format = "MMM D, YYYY") => {
  if (!timestamp) return "";
  return dayjs(timestamp).format(format);
});

Vue.filter("formatAlbumType", (type, album) => {
  if (!type) return "";
  if (type === "EP/Single") {
    return album.size === 1 ? "Single" : "EP";
  } else if (type === "Single") {
    return "Single";
  } else if (type === "专辑") {
    return "Album";
  } else {
    return type;
  }
});

Vue.filter("resizeImage", (imgUrl, size = 512) => {
  if (!imgUrl) return "";
  let httpsImgUrl = imgUrl;
  if (imgUrl.slice(0, 5) !== "https") {
    httpsImgUrl = "https" + imgUrl.slice(4);
  }
  return `${httpsImgUrl}?param=${size}y${size}`;
});

Vue.filter("formatPlayCount", (count) => {
  if (!count) return "";
  if (count > 100000000) {
    return `${~~(count / 100000000)}亿`;
  }
  if (count > 10000) {
    return `${~~(count / 10000)}万`;
  }
  return count;
});

Vue.filter("toHttps", (url) => {
  if (!url) return "";
  return url.replace(/^http:/, "https:");
});
