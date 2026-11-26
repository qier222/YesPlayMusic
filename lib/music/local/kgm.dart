import 'dart:convert';
import 'dart:io';
import 'dart:isolate';
import 'dart:typed_data';

import 'package:archive/archive.dart';
import 'package:crypto/crypto.dart';
import 'package:flutter/services.dart' show rootBundle;
import 'package:path/path.dart' as p;

/// 播放前将 KGM v3 封装的 FLAC 解密到本地缓存。
abstract final class KgmDecoder {
  static final _pending = <String, Future<File>>{};

  static Future<File> materializeFlac(File source, String cacheDir) async {
    final input = await source.open();
    final Uint8List header;
    try {
      header = await input.read(0x2c);
    } finally {
      await input.close();
    }
    if (!_startsWith(header, _kgmMagic)) return source;
    if (header.length < 0x2c) {
      throw const FormatException('KGM 文件头不完整');
    }

    final fields = ByteData.sublistView(header);
    final offset = fields.getUint32(0x10, Endian.little);
    final version = fields.getUint32(0x14, Endian.little);
    if (version != 3) {
      throw FormatException('暂不支持 KGM 加密版本 $version');
    }
    final stat = await source.stat();
    if (offset < header.length || stat.size - offset < _flacMagic.length) {
      throw const FormatException('KGM 音频偏移无效');
    }

    final identity = jsonEncode([
      1, // 解密缓存格式版本
      source.absolute.path,
      stat.size,
      stat.modified.microsecondsSinceEpoch,
    ]);
    final key = sha1.convert(utf8.encode(identity));
    final output = File(p.join(cacheDir, 'kgm', '$key.flac'));
    final pending = _pending[output.path];
    if (pending != null) return pending;

    final task = _materialize(source, stat, header, offset, output);
    _pending[output.path] = task;
    try {
      return await task;
    } finally {
      _pending.remove(output.path);
    }
  }

  static Future<File> _materialize(
    File source,
    FileStat stat,
    Uint8List header,
    int offset,
    File output,
  ) async {
    final length = stat.size - offset;
    if (await output.exists() && await output.length() == length) return output;

    final data = await rootBundle.load('assets/kugou_key.xz');
    final compressed = Uint8List.sublistView(data);
    final ownKey = Uint8List(17)..setRange(0, 16, header, 0x1c);
    await Isolate.run(
      () => _decrypt(source, stat, output, offset, ownKey, compressed),
    );
    return output;
  }
}

void _decrypt(
  File source,
  FileStat stat,
  File output,
  int offset,
  Uint8List ownKey,
  Uint8List compressed,
) {
  const chunkSize = 256 * 1024;
  final length = stat.size - offset;
  final publicKey = XZDecoder().decodeBytes(compressed);
  if ((length + 15) ~/ 16 > publicKey.length) {
    throw const FormatException('KGM 解密表长度不足');
  }

  output.parent.createSync(recursive: true);
  final staging = output.parent.createTempSync('.解密-');
  final temp = File(p.join(staging.path, 'audio.tmp'));
  try {
    final input = source.openSync();
    try {
      input.setPositionSync(offset);
      final destination = temp.openSync(mode: FileMode.write);
      try {
        var position = 0;
        while (position < length) {
          final remaining = length - position;
          final count = remaining < chunkSize ? remaining : chunkSize;
          final bytes = input.readSync(count);
          if (bytes.length != count) {
            throw const FormatException('KGM 文件数据不完整');
          }
          for (var i = 0; i < bytes.length; i++) {
            final index = position + i;
            final mask =
                ownKey[index % ownKey.length] ^
                publicKey[index ~/ 16] ^
                _mend[index % _mend.length];
            final value = bytes[i] ^ mask;
            bytes[i] = value ^ ((value & 0x0f) << 4);
          }
          if (position == 0 && !_startsWith(bytes, _flacMagic)) {
            throw const FormatException('KGM 解密结果不是 FLAC');
          }
          destination.writeFromSync(bytes);
          position += bytes.length;
        }
      } finally {
        destination.closeSync();
      }
    } finally {
      input.closeSync();
    }

    final current = source.statSync();
    if (current.size != stat.size || current.modified != stat.modified) {
      throw const FormatException('KGM 文件在解密期间发生变化，请重试');
    }
    try {
      temp.renameSync(output.path);
    } on FileSystemException {
      if (!output.existsSync() || output.lengthSync() != length) rethrow;
    }
  } finally {
    if (temp.existsSync()) temp.deleteSync();
    staging.deleteSync();
  }
}

bool _startsWith(Uint8List bytes, List<int> prefix) {
  if (bytes.length < prefix.length) return false;
  for (var i = 0; i < prefix.length; i++) {
    if (bytes[i] != prefix[i]) return false;
  }
  return true;
}

const _flacMagic = [0x66, 0x4c, 0x61, 0x43];

const _kgmMagic = [
  0x7c,
  0xd5,
  0x32,
  0xeb,
  0x86,
  0x02,
  0x7f,
  0x4b,
  0xa8,
  0xaf,
  0xa6,
  0x8e,
  0x0f,
  0xff,
  0x99,
  0x14,
];

const _mend = [
  0xb8,
  0xd5,
  0x3d,
  0xb2,
  0xe9,
  0xaf,
  0x78,
  0x8c,
  0x83,
  0x33,
  0x71,
  0x51,
  0x76,
  0xa0,
  0xcd,
  0x37,
  0x2f,
  0x3e,
  0x35,
  0x8d,
  0xa9,
  0xbe,
  0x98,
  0xb7,
  0xe7,
  0x8c,
  0x22,
  0xce,
  0x5a,
  0x61,
  0xdf,
  0x68,
  0x69,
  0x89,
  0xfe,
  0xa5,
  0xb6,
  0xde,
  0xa9,
  0x77,
  0xfc,
  0xc8,
  0xbd,
  0xbd,
  0xe5,
  0x6d,
  0x3e,
  0x5a,
  0x36,
  0xef,
  0x69,
  0x4e,
  0xbe,
  0xe1,
  0xe9,
  0x66,
  0x1c,
  0xf3,
  0xd9,
  0x02,
  0xb6,
  0xf2,
  0x12,
  0x9b,
  0x44,
  0xd0,
  0x6f,
  0xb9,
  0x35,
  0x89,
  0xb6,
  0x46,
  0x6d,
  0x73,
  0x82,
  0x06,
  0x69,
  0xc1,
  0xed,
  0xd7,
  0x85,
  0xc2,
  0x30,
  0xdf,
  0xa2,
  0x62,
  0xbe,
  0x79,
  0x2d,
  0x62,
  0x62,
  0x3d,
  0x0d,
  0x7e,
  0xbe,
  0x48,
  0x89,
  0x23,
  0x02,
  0xa0,
  0xe4,
  0xd5,
  0x75,
  0x51,
  0x32,
  0x02,
  0x53,
  0xfd,
  0x16,
  0x3a,
  0x21,
  0x3b,
  0x16,
  0x0f,
  0xc3,
  0xb2,
  0xbb,
  0xb3,
  0xe2,
  0xba,
  0x3a,
  0x3d,
  0x13,
  0xec,
  0xf6,
  0x01,
  0x45,
  0x84,
  0xa5,
  0x70,
  0x0f,
  0x93,
  0x49,
  0x0c,
  0x64,
  0xcd,
  0x31,
  0xd5,
  0xcc,
  0x4c,
  0x07,
  0x01,
  0x9e,
  0x00,
  0x1a,
  0x23,
  0x90,
  0xbf,
  0x88,
  0x1e,
  0x3b,
  0xab,
  0xa6,
  0x3e,
  0xc4,
  0x73,
  0x47,
  0x10,
  0x7e,
  0x3b,
  0x5e,
  0xbc,
  0xe3,
  0x00,
  0x84,
  0xff,
  0x09,
  0xd4,
  0xe0,
  0x89,
  0x0f,
  0x5b,
  0x58,
  0x70,
  0x4f,
  0xfb,
  0x65,
  0xd8,
  0x5c,
  0x53,
  0x1b,
  0xd3,
  0xc8,
  0xc6,
  0xbf,
  0xef,
  0x98,
  0xb0,
  0x50,
  0x4f,
  0x0f,
  0xea,
  0xe5,
  0x83,
  0x58,
  0x8c,
  0x28,
  0x2c,
  0x84,
  0x67,
  0xcd,
  0xd0,
  0x9e,
  0x47,
  0xdb,
  0x27,
  0x50,
  0xca,
  0xf4,
  0x63,
  0x63,
  0xe8,
  0x97,
  0x7f,
  0x1b,
  0x4b,
  0x0c,
  0xc2,
  0xc1,
  0x21,
  0x4c,
  0xcc,
  0x58,
  0xf5,
  0x94,
  0x52,
  0xa3,
  0xf3,
  0xd3,
  0xe0,
  0x68,
  0xf4,
  0x00,
  0x23,
  0xf3,
  0x5e,
  0x0a,
  0x7b,
  0x93,
  0xdd,
  0xab,
  0x12,
  0xb2,
  0x13,
  0xe8,
  0x84,
  0xd7,
  0xa7,
  0x9f,
  0x0f,
  0x32,
  0x4c,
  0x55,
  0x1d,
  0x04,
  0x36,
  0x52,
  0xdc,
  0x03,
  0xf3,
  0xf9,
  0x4e,
  0x42,
  0xe9,
  0x3d,
  0x61,
  0xef,
  0x7c,
  0xb6,
  0xb3,
  0x93,
  0x50,
];
