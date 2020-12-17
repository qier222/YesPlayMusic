import initLocalStorage from "@/store/initLocalStorage.js";
import pkg from "../../package.json";

const updateSetting = () => {
  const parsedSettings = JSON.parse(localStorage.getItem("settings"));
  const settings = {
    playlistCategories: initLocalStorage?.settings?.playlistCategories,
    showUnavailableSongInGreyStyle:
      initLocalStorage?.settings?.showUnavailableSongInGreyStyle,
    automaticallyCacheSongs:
      initLocalStorage?.settings?.automaticallyCacheSongs,
    nyancatStyle: initLocalStorage?.settings?.nyancatStyle,
    ...parsedSettings,
  };

  localStorage.setItem("settings", JSON.stringify(settings));
};

const updateData = () => {
  const parsedData = JSON.parse(localStorage.getItem("data"));
  const data = {
    ...parsedData,
  };
  localStorage.setItem("data", JSON.stringify(data));
};

export default function () {
  updateSetting();
  updateData();
  localStorage.setItem("appVersion", JSON.stringify(pkg.version));
}
