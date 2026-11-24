import Cocoa
import FlutterMacOS
import MediaPlayer
import WebKit

class MainFlutterWindow: NSWindow {
  /// Settings → "keep running after closing the window", sent by Dart (prefs).
  /// On, closing (red button, ⌘W) only hides the window; clicking the Dock icon brings it back.
  static var keepRunning = false

  override func close() {
    guard MainFlutterWindow.keepRunning else { return super.close() }
    guard styleMask.contains(.fullScreen) else { return orderOut(nil) }
    // Hiding a full-screen window would leave an empty Space behind: leave full screen first.
    hideAfterFullScreen = true
    toggleFullScreen(nil)
  }

  private var hideAfterFullScreen = false

  @objc private func didExitFullScreen(_ note: Notification) {
    guard hideAfterFullScreen else { return }
    hideAfterFullScreen = false
    orderOut(nil)
  }

  override func awakeFromNib() {
    let flutterViewController = FlutterViewController()
    flutterViewController.backgroundColor = NSColor(red: 0x0B / 255.0, green: 0x0B / 255.0, blue: 0x0D / 255.0, alpha: 1)
    self.contentViewController = flutterViewController

    // 设计稿是 1440 × 900，标题栏隐藏，红绿灯盖在左侧图标栏顶部。
    self.titleVisibility = .hidden
    self.titlebarAppearsTransparent = true
    self.styleMask.insert(.fullSizeContentView)
    self.isMovableByWindowBackground = false
    self.minSize = NSSize(width: 1280, height: 800)
    let screen = self.screen?.visibleFrame ?? NSRect(x: 0, y: 0, width: 1440, height: 900)
    let size = NSSize(width: min(1440, screen.width), height: min(900, screen.height))
    self.setFrame(
      NSRect(x: screen.midX - size.width / 2, y: screen.midY - size.height / 2, width: size.width, height: size.height),
      display: true)

    RegisterGeneratedPlugins(registry: flutterViewController)

    NotificationCenter.default.addObserver(
      self, selector: #selector(didExitFullScreen(_:)),
      name: NSWindow.didExitFullScreenNotification, object: self)

    let channel = FlutterMethodChannel(
      name: "yesplaymusic/window", binaryMessenger: flutterViewController.engine.binaryMessenger)
    channel.setMethodCallHandler { [weak self] call, result in
      guard let self = self else { return result(nil) }
      switch call.method {
      case "startDrag":
        if let event = self.currentEvent ?? NSApp.currentEvent {
          self.performDrag(with: event)
        }
        result(nil)
      case "zoom":
        self.zoom(nil)
        result(nil)
      case "prefs":
        let a = call.arguments as? [String: Any]
        MainFlutterWindow.keepRunning = a?["keepRunning"] as? Bool ?? false
        result(nil)
      default:
        result(FlutterMethodNotImplemented)
      }
    }

    // 系统的「正在播放」和媒体键：见 MediaSession。
    MediaSession.shared.attach(
      FlutterMethodChannel(
        name: "yesplaymusic/media", binaryMessenger: flutterViewController.engine.binaryMessenger))

    // 插件的网页登录（host.webSignIn）：见 WebSignIn。
    let signIn = FlutterMethodChannel(
      name: "yesplaymusic/websignin", binaryMessenger: flutterViewController.engine.binaryMessenger)
    signIn.setMethodCallHandler { [weak self] call, result in
      guard call.method == "open", let a = call.arguments as? [String: Any],
        let url = URL(string: a["url"] as? String ?? ""),
        let of = URL(string: a["cookiesOf"] as? String ?? ""),
        let until = a["until"] as? [String], !until.isEmpty
      else { return result(FlutterMethodNotImplemented) }
      if let open = WebSignIn.current {
        open.window.makeKeyAndOrderFront(nil)
        return result(FlutterError(code: "busy", message: "another sign-in window is open", details: nil))
      }
      WebSignIn.current = WebSignIn(
        url: url, cookiesOf: of, until: Set(until), userAgent: a["userAgent"] as? String,
        title: a["title"] as? String ?? "", over: self, result: result)
    }

    super.awakeFromNib()
  }
}

/// 在单独的小窗口里打开服务自己的登录页。窗口用不落盘的独立存储，和其他网页、
/// 下一次登录都不共享；[until] 里的 Cookie 都出现后关窗，把访问 [cookiesOf]
/// 时会带的 Cookie 请求头交回去。用户关掉窗口就算取消。
final class WebSignIn: NSObject, WKHTTPCookieStoreObserver, NSWindowDelegate {
  static var current: WebSignIn?

  let window: NSWindow
  private let web: WKWebView
  private let target: URL
  private let until: Set<String>
  private var result: FlutterResult?

  init(
    url: URL, cookiesOf: URL, until: Set<String>, userAgent: String?, title: String,
    over parent: NSWindow?, result: @escaping FlutterResult
  ) {
    target = cookiesOf
    self.until = until
    self.result = result
    let config = WKWebViewConfiguration()
    config.websiteDataStore = .nonPersistent()
    web = WKWebView(frame: NSRect(x: 0, y: 0, width: 480, height: 700), configuration: config)
    if let ua = userAgent, !ua.isEmpty { web.customUserAgent = ua }
    window = NSWindow(
      contentRect: NSRect(x: 0, y: 0, width: 480, height: 700),
      styleMask: [.titled, .closable, .resizable], backing: .buffered, defer: false)
    super.init()
    window.title = title.isEmpty ? "登录" : "登录 \(title)"
    window.isReleasedWhenClosed = false
    window.contentView = web
    window.delegate = self
    if let p = parent {
      window.setFrameOrigin(
        NSPoint(x: p.frame.midX - 240, y: p.frame.midY - 350))
    } else {
      window.center()
    }
    config.websiteDataStore.httpCookieStore.add(self)
    web.load(URLRequest(url: url))
    window.makeKeyAndOrderFront(nil)
  }

  func cookiesDidChange(in store: WKHTTPCookieStore) {
    store.getAllCookies { [weak self] all in
      guard let self = self, self.result != nil else { return }
      let fit = all.filter(self.sentTo)
      guard self.until.isSubset(of: Set(fit.map(\.name))) else { return }
      let header = HTTPCookie.requestHeaderFields(with: fit)["Cookie"] ?? ""
      self.finish(header, nil)
    }
  }

  /// 访问 target 时浏览器会不会带上这个 Cookie。
  private func sentTo(_ c: HTTPCookie) -> Bool {
    let host = (target.host ?? "").lowercased()
    var domain = c.domain.lowercased()
    if domain.hasPrefix(".") { domain.removeFirst() }
    guard host == domain || host.hasSuffix("." + domain) else { return false }
    let path = target.path.isEmpty ? "/" : target.path
    guard path.hasPrefix(c.path) else { return false }
    if c.isSecure && target.scheme != "https" { return false }
    if let exp = c.expiresDate, exp < Date() { return false }
    return true
  }

  private func finish(_ cookie: String?, _ error: FlutterError?) {
    guard let r = result else { return }
    result = nil
    web.configuration.websiteDataStore.httpCookieStore.remove(self)
    r(error ?? cookie)
    if WebSignIn.current === self { WebSignIn.current = nil }
    window.delegate = nil
    window.close()
    web.stopLoading()
  }

  func windowWillClose(_ notification: Notification) {
    finish(nil, FlutterError(code: "cancelled", message: "the sign-in window was closed", details: nil))
  }
}

/// 系统的「正在播放」（控制中心、锁屏）和媒体键、耳机按键。Dart 端在
/// lib/media_session.dart：update 传歌曲信息过来，命令通过 invokeMethod 传回去。
final class MediaSession {
  static let shared = MediaSession()
  private var channel: FlutterMethodChannel?
  private var info: [String: Any] = [:]
  private var artURL = ""

  func attach(_ channel: FlutterMethodChannel) {
    self.channel = channel
    channel.setMethodCallHandler { [weak self] call, result in
      guard call.method == "update", let a = call.arguments as? [String: Any] else {
        return result(FlutterMethodNotImplemented)
      }
      self?.update(a)
      result(nil)
    }
    let c = MPRemoteCommandCenter.shared()
    func on(_ cmd: MPRemoteCommand, _ name: String) {
      cmd.isEnabled = true
      cmd.addTarget { [weak self] _ in
        self?.channel?.invokeMethod(name, arguments: nil)
        return .success
      }
    }
    on(c.playCommand, "play")
    on(c.pauseCommand, "pause")
    on(c.togglePlayPauseCommand, "toggle")
    on(c.nextTrackCommand, "next")
    on(c.previousTrackCommand, "previous")
    c.changePlaybackPositionCommand.isEnabled = true
    c.changePlaybackPositionCommand.addTarget { [weak self] e in
      guard let e = e as? MPChangePlaybackPositionCommandEvent else { return .commandFailed }
      self?.channel?.invokeMethod("seek", arguments: e.positionTime)
      return .success
    }
  }

  private func update(_ a: [String: Any]) {
    let playing = a["playing"] as? Bool ?? false
    info[MPMediaItemPropertyTitle] = a["title"] as? String ?? ""
    info[MPMediaItemPropertyArtist] = a["artist"] as? String ?? ""
    info[MPMediaItemPropertyAlbumTitle] = a["album"] as? String ?? ""
    info[MPMediaItemPropertyPlaybackDuration] = a["duration"] as? Double ?? 0
    info[MPNowPlayingInfoPropertyElapsedPlaybackTime] = a["position"] as? Double ?? 0
    info[MPNowPlayingInfoPropertyPlaybackRate] = playing ? 1.0 : 0.0
    if let art = a["art"] as? String, art != artURL {
      artURL = art
      info.removeValue(forKey: MPMediaItemPropertyArtwork)
      loadArt(art)
    }
    let center = MPNowPlayingInfoCenter.default()
    center.nowPlayingInfo = info
    center.playbackState = playing ? .playing : .paused
  }

  private func loadArt(_ s: String) {
    let url = s.hasPrefix("/") ? URL(fileURLWithPath: s) : URL(string: s)
    guard let url = url else { return }
    DispatchQueue.global(qos: .utility).async { [weak self] in
      guard let image = NSImage(contentsOf: url) else { return }
      DispatchQueue.main.async {
        guard let self = self, self.artURL == s else { return }
        self.info[MPMediaItemPropertyArtwork] = MPMediaItemArtwork(boundsSize: image.size) { _ in image }
        MPNowPlayingInfoCenter.default().nowPlayingInfo = self.info
      }
    }
  }
}
