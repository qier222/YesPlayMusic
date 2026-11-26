import 'dart:async';
import 'dart:io';
import 'dart:typed_data';

import 'package:crypto/crypto.dart';

const _revision = '20ee463537e241de443166aec326b99f3bd8f534';
const _size = 94664;
const _sha256 =
    '64110a2764d6465453f874f4cece6cf0b89cea4756d2890bc0ed0344272d65c6';
const _timeout = Duration(seconds: 30);
final _source = Uri.https(
  'raw.githubusercontent.com',
  '/ghtz08/kugou-kgm-decoder/$_revision/assets/kugou_key.xz',
);

Future<void> main() async {
  final asset = File.fromUri(Platform.script.resolve('../assets/kugou_key.xz'));
  try {
    if (await _isValid(asset)) {
      stdout.writeln('KGM 解密表已通过 SHA-256 校验，使用本地文件。');
      return;
    }

    final bytes = await _download();
    await asset.parent.create(recursive: true);
    final staging = await asset.parent.createTemp('.kgm-key-');
    try {
      final temp = await File.fromUri(staging.uri.resolve('kugou_key.xz'))
          .writeAsBytes(bytes, flush: true);
      try {
        await temp.rename(asset.path);
      } on FileSystemException {
        // Windows 上其他并行构建可能已写入同一份解密表。
        if (!await _isValid(asset)) rethrow;
      }
    } finally {
      await staging.delete(recursive: true);
    }
    stdout.writeln('KGM 解密表已下载并通过 SHA-256 校验。');
  } on Exception catch (error) {
    stderr.writeln('准备 KGM 解密表失败：$error');
    exitCode = 1;
  }
}

Future<bool> _isValid(File file) async {
  final stat = await file.stat();
  if (stat.type != FileSystemEntityType.file || stat.size != _size) {
    return false;
  }
  final digest = await sha256.bind(file.openRead()).first;
  return digest.toString() == _sha256;
}

Future<Uint8List> _download() async {
  final client = HttpClient()
    ..connectionTimeout = _timeout
    ..findProxy = HttpClient.findProxyFromEnvironment;
  try {
    final request = await client.getUrl(_source).timeout(_timeout);
    request.followRedirects = false;
    final response = await request.close().timeout(_timeout);
    if (response.statusCode != HttpStatus.ok) {
      throw HttpException('HTTP ${response.statusCode}', uri: _source);
    }
    final bytes = BytesBuilder(copy: false);
    await for (final chunk in response.timeout(_timeout)) {
      if (bytes.length + chunk.length > _size) {
        throw const FormatException('解密表长度超出预期');
      }
      bytes.add(chunk);
    }
    final result = bytes.takeBytes();
    if (result.length != _size ||
        sha256.convert(result).toString() != _sha256) {
      throw const FormatException('解密表 SHA-256 校验失败');
    }
    return result;
  } finally {
    client.close(force: true);
  }
}
