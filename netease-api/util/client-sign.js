const crypto = require("crypto");
const os = require("os");

class AdvancedClientSignGenerator {
  /**
   * 获取本机MAC地址
   */
  static getRealMacAddress() {
    try {
      const interfaces = os.networkInterfaces();
      for (let interfaceName in interfaces) {
        const interface = interfaces[interfaceName];
        for (let i = 0; i < interface.length; i++) {
          const alias = interface[i];
          // 排除内部地址和无效地址
          if (
            alias.mac &&
            alias.mac !== "00:00:00:00:00:00" &&
            !alias.internal
          ) {
            return alias.mac.toUpperCase();
          }
        }
      }
      return null;
    } catch (error) {
      console.warn("获取MAC地址失败:", error.message);
      return null;
    }
  }

  /**
   * 生成随机MAC地址
   */
  static generateRandomMac() {
    const chars = "0123456789ABCDEF";
    let mac = "";
    for (let i = 0; i < 6; i++) {
      if (i > 0) mac += ":";
      mac +=
        chars[Math.floor(Math.random() * 16)] +
        chars[Math.floor(Math.random() * 16)];
    }
    // 确保第一个字节是单播地址（最低位为0）
    const firstByte = parseInt(mac.substring(0, 2), 16);
    const unicastFirstByte = (firstByte & 0xfe)
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();
    return unicastFirstByte + mac.substring(2);
  }

  /**
   * 获取MAC地址（优先真实，否则随机）
   */
  static getMacAddress() {
    const realMac = this.getRealMacAddress();
    if (realMac) {
      return realMac;
    }
    console.warn("无法获取真实MAC地址，使用随机生成");
    return this.generateRandomMac();
  }

  /**
   * 字符串转HEX编码
   */
  static stringToHex(str) {
    return Buffer.from(str, "utf8").toString("hex").toUpperCase();
  }

  /**
   * SHA-256哈希
   */
  static sha256(data) {
    return crypto.createHash("sha256").update(data, "utf8").digest("hex");
  }

  /**
   * 生成随机设备ID
   */
  static generateRandomDeviceId() {
    const partLengths = [4, 4, 4, 4, 4, 4, 4, 5]; // 各部分长度
    const chars = "0123456789ABCDEF";

    const parts = partLengths.map((length) => {
      let part = "";
      for (let i = 0; i < length; i++) {
        part += chars[Math.floor(Math.random() * 16)];
      }
      return part;
    });

    return parts.join("_");
  }

  /**
   * 生成随机clientSign（优先使用真实MAC，否则随机）
   */
  static generateRandomClientSign(secretKey = "") {
    // 获取MAC地址（优先真实，否则随机）
    const macAddress = this.getMacAddress();

    // 生成随机设备ID
    const deviceId = this.generateRandomDeviceId();

    // 转换设备ID为HEX
    const hexDeviceId = this.stringToHex(deviceId);

    // 构造签名字符串
    const signString = `${macAddress}@@@${hexDeviceId}`;

    // 生成哈希
    const hash = this.sha256(signString + secretKey);

    return `${signString}@@@@@@${hash}`;
  }

  /**
   * 批量生成多个随机签名
   */
  static generateMultipleRandomSigns(count, secretKey = "") {
    const signs = [];
    for (let i = 0; i < count; i++) {
      signs.push(this.generateRandomClientSign(secretKey));
    }
    return signs;
  }

  /**
   * 使用指定参数生成签名
   */
  static generateWithCustomDeviceId(macAddress, deviceId, secretKey = "") {
    const hexDeviceId = this.stringToHex(deviceId);
    const signString = `${macAddress}@@@${hexDeviceId}`;
    const hash = this.sha256(signString + secretKey);
    return `${signString}@@@@@@${hash}`;
  }

  /**
   * 验证签名格式是否正确
   */
  static validateClientSign(clientSign) {
    try {
      const parts = clientSign.split("@@@@@@");
      if (parts.length !== 2) return false;

      const [infoPart, hash] = parts;
      const infoParts = infoPart.split("@@@");
      if (infoParts.length !== 2) return false;

      const [mac, hexDeviceId] = infoParts;

      // 验证MAC地址格式
      const macRegex = /^([0-9A-F]{2}:){5}[0-9A-F]{2}$/;
      if (!macRegex.test(mac)) return false;

      // 验证哈希格式
      const hashRegex = /^[0-9a-f]{64}$/;
      if (!hashRegex.test(hash)) return false;

      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = AdvancedClientSignGenerator;