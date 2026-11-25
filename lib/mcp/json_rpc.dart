// JSON-RPC 2.0 and MCP protocol message helpers.

import 'dart:convert';

const String mcpProtocolVersion = '2025-03-26';
const List<String> mcpSupportedVersions = ['2025-03-26', '2024-11-05'];

abstract final class JsonRpcCode {
  static const int parseError = -32700;
  static const int invalidRequest = -32600;
  static const int methodNotFound = -32601;
  static const int invalidParams = -32602;
  static const int internalError = -32603;
}

class JsonRpcException implements Exception {
  const JsonRpcException(this.code, this.message, [this.data]);

  final int code;
  final String message;
  final Object? data;

  @override
  String toString() => 'JsonRpcException($code): $message';
}

Map<String, Object?> jsonRpcResult(Object? id, Object? result) => {
  'jsonrpc': '2.0',
  'id': id,
  'result': result,
};

Map<String, Object?> jsonRpcError(
  Object? id,
  int code,
  String message, [
  Object? data,
]) => {
  'jsonrpc': '2.0',
  'id': id,
  'error': {'code': code, 'message': message, 'data': ?data},
};

Map<String, Object?> jsonRpcNotification(
  String method, [
  Map<String, Object?>? params,
]) => {'jsonrpc': '2.0', 'method': method, 'params': ?params};

/// Wraps a tool result as MCP content with an optional PNG attachment.
Map<String, Object?> toolResult(Object? data, {bool isError = false}) {
  final attachment = data is ({Object data, List<int> png}) ? data : null;
  final value = attachment?.data ?? data;
  final text = value is String ? value : jsonEncode(value);
  return {
    'content': [
      {'type': 'text', 'text': text},
      if (attachment != null)
        {
          'type': 'image',
          'mimeType': 'image/png',
          'data': base64Encode(attachment.png),
        },
    ],
    if (isError) 'isError': true,
  };
}
