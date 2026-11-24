import Cocoa
import SwiftUI

/// 灵动岛：贴着屏幕顶部（有刘海就包住刘海）的迷你播放器，参考 Droppy 的音乐部分。
/// 收起时刘海左边是封面、右边是跳动的音浪；鼠标移上去展开成完整的播放器：
/// 封面、歌名歌手、进度条（可拖）、上一首 / 播放暂停 / 下一首。
/// 数据由 MediaSession.update 转过来，按钮通过 MediaSession 的通道发回 Dart。
final class DynamicIsland {
  static let shared = DynamicIsland()

  let model = IslandModel()
  /// 把命令发回 Dart（toggle / next / previous / seek）。
  var send: ((String, Any?) -> Void)?
  /// 主窗口：点封面或歌名时把它叫到前台。
  weak var mainWindow: NSWindow?

  private var panel: IslandPanel?
  private var globalMonitor: Any?
  private var localMonitor: Any?
  private var hoverWork: DispatchWorkItem?
  private var leaveWork: DispatchWorkItem?
  private var pauseHide: DispatchWorkItem?

  /// 面板固定这么大，留出足够边距容纳展开态阴影；面板只在岛展开时接鼠标。
  private let panelSize = NSSize(width: 500, height: 260)

  func setEnabled(_ on: Bool) {
    if on == (panel != nil) { return }
    on ? show() : hide()
  }

  func update(title: String, artist: String, duration: Double, position: Double, playing: Bool) {
    let m = model
    m.title = title
    m.artist = artist
    m.duration = duration
    m.position = position
    m.positionAt = Date()
    if m.playing != playing {
      withAnimation(.easeInOut(duration: 0.16)) { m.playing = playing }
    }
    // 暂停后过几秒收回刘海里，不一直占着屏幕顶
    pauseHide?.cancel()
    if playing {
      if !m.live { withAnimation(IslandModel.expandAnim) { m.live = true } }
    } else {
      let w = DispatchWorkItem { [weak self] in
        guard let self = self, !self.model.playing else { return }
        withAnimation(IslandModel.collapseAnim) { self.model.live = false }
      }
      pauseHide = w
      DispatchQueue.main.asyncAfter(deadline: .now() + 4, execute: w)
    }
    if title.isEmpty, m.expanded { setExpanded(false) }
  }

  func setArt(_ image: NSImage?) {
    model.art = image
    model.tint = image.flatMap(IslandModel.tint(of:)) ?? .white
  }

  // MARK: - 窗口

  private func show() {
    let p = IslandPanel(
      contentRect: NSRect(origin: .zero, size: panelSize),
      styleMask: [.borderless, .nonactivatingPanel], backing: .buffered, defer: false)
    p.isFloatingPanel = true
    p.level = NSWindow.Level(rawValue: NSWindow.Level.mainMenu.rawValue + 3)
    p.collectionBehavior = [.canJoinAllSpaces, .stationary, .fullScreenAuxiliary, .ignoresCycle]
    p.backgroundColor = .clear
    p.isOpaque = false
    p.hasShadow = false
    p.isMovable = false
    p.ignoresMouseEvents = true
    p.isReleasedWhenClosed = false
    let host = FirstMouseHostingView(rootView: IslandView(model: model, island: self))
    host.frame = NSRect(origin: .zero, size: panelSize)
    p.contentView = host
    panel = p
    place()
    p.orderFrontRegardless()
    NotificationCenter.default.addObserver(
      self, selector: #selector(screensChanged),
      name: NSApplication.didChangeScreenParametersNotification, object: nil)
    // 事件驱动监听鼠标移动，鼠标静止时零轮询、零 CPU 唤醒
    let mask: NSEvent.EventTypeMask = [.mouseMoved, .leftMouseDragged]
    globalMonitor = NSEvent.addGlobalMonitorForEvents(matching: mask) { [weak self] _ in
      self?.handleMouseMove()
    }
    localMonitor = NSEvent.addLocalMonitorForEvents(matching: mask) { [weak self] event in
      self?.handleMouseMove()
      return event
    }
  }

  private func hide() {
    hoverWork?.cancel()
    leaveWork?.cancel()
    if let m = globalMonitor { NSEvent.removeMonitor(m) }
    if let m = localMonitor { NSEvent.removeMonitor(m) }
    globalMonitor = nil
    localMonitor = nil
    NotificationCenter.default.removeObserver(
      self, name: NSApplication.didChangeScreenParametersNotification, object: nil)
    panel?.orderOut(nil)
    panel = nil
    model.expanded = false
  }

  @objc private func screensChanged() { place() }

  /// 有刘海的屏优先（内建屏），否则放在菜单栏所在的主屏。
  private func targetScreen() -> NSScreen? {
    if #available(macOS 12.0, *),
      let s = NSScreen.screens.first(where: { $0.safeAreaInsets.top > 0 })
    {
      return s
    }
    return NSScreen.screens.first
  }

  private func place() {
    guard let p = panel, let s = targetScreen() else { return }
    let f = s.frame
    var notch = NSSize(width: 0, height: 0)
    if #available(macOS 12.0, *), s.safeAreaInsets.top > 0 {
      let l = s.auxiliaryTopLeftArea?.width ?? 0
      let r = s.auxiliaryTopRightArea?.width ?? 0
      notch = NSSize(width: max(0, f.width - l - r), height: s.safeAreaInsets.top)
    }
    if notch.width > 0 {
      model.hasNotch = true
      model.notch = notch
    } else {
      // 没刘海：自己画一个和菜单栏一样高的岛
      let bar = f.maxY - s.visibleFrame.maxY
      model.hasNotch = false
      model.notch = NSSize(width: 180, height: max(24, min(bar, 37)))
    }
    p.setFrame(
      NSRect(
        x: f.midX - panelSize.width / 2, y: f.maxY - panelSize.height,
        width: panelSize.width, height: panelSize.height),
      display: true)
  }

  // MARK: - 悬停

  /// 鼠标移动时判断是否进入/离开岛区域；拖动进度条结束时也会复查一次。
  func handleMouseMove() {
    guard let p = panel, !model.title.isEmpty else { return }
    let mouse = NSEvent.mouseLocation
    let size = model.bodySize
    let f = p.frame
    var rect = NSRect(
      x: f.midX - size.width / 2, y: f.maxY - size.height, width: size.width, height: size.height)
    if model.expanded {
      rect = rect.insetBy(dx: -8, dy: -8)
      if rect.contains(mouse) || model.dragging {
        leaveWork?.cancel()
        leaveWork = nil
      } else if leaveWork == nil {
        let w = DispatchWorkItem { [weak self] in
          guard let self = self, !self.model.dragging else { return }
          self.setExpanded(false)
        }
        leaveWork = w
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.22, execute: w)
      }
    } else {
      // 收起时刘海下沿多给几像素，好碰到
      rect = NSRect(x: rect.minX, y: rect.minY - 4, width: rect.width, height: rect.height + 4)
      if rect.contains(mouse) {
        if hoverWork == nil {
          let w = DispatchWorkItem { [weak self] in
            self?.setExpanded(true)
          }
          hoverWork = w
          DispatchQueue.main.asyncAfter(deadline: .now() + 0.08, execute: w)
        }
      } else {
        hoverWork?.cancel()
        hoverWork = nil
      }
    }
  }

  func setExpanded(_ on: Bool) {
    hoverWork?.cancel()
    hoverWork = nil
    leaveWork?.cancel()
    leaveWork = nil
    guard model.expanded != on else { return }
    withAnimation(on ? IslandModel.expandAnim : IslandModel.collapseAnim) {
      model.expanded = on
    }
    panel?.ignoresMouseEvents = !on
  }

  func openApp() {
    send?("openNowPlaying", nil)
    NSApp.activate(ignoringOtherApps: true)
    if let w = mainWindow ?? NSApp.windows.first(where: { $0 is MainFlutterWindow }) {
      if w.isMiniaturized { w.deminiaturize(nil) }
      w.makeKeyAndOrderFront(nil)
    }
    setExpanded(false)
  }
}

final class IslandPanel: NSPanel {
  override var canBecomeKey: Bool { true }
  override var canBecomeMain: Bool { false }
}

/// 面板不激活 App，第一次点击也要直接生效。
final class FirstMouseHostingView<V: View>: NSHostingView<V> {
  override func acceptsFirstMouse(for event: NSEvent?) -> Bool { true }
}

final class IslandModel: ObservableObject {
  /// 参考 Apple 官方 Dynamic Island 的 `.smooth`（临界阻尼，无回弹，可丝滑打断）
  static var expandAnim: Animation {
    if #available(macOS 14.0, *) {
      return .smooth(duration: 0.36)
    }
    return .spring(response: 0.36, dampingFraction: 1.0)
  }

  static var collapseAnim: Animation {
    if #available(macOS 14.0, *) {
      return .smooth(duration: 0.30)
    }
    return .spring(response: 0.30, dampingFraction: 1.0)
  }

  static let expandedWidth: CGFloat = 380
  static let collapsedPad: CGFloat = 5

  @Published var title = ""
  @Published var artist = ""
  @Published var art: NSImage?
  @Published var tint: Color = .white
  @Published var duration: Double = 0
  @Published var position: Double = 0
  var positionAt = Date()
  @Published var playing = false
  /// 收起时是否露出封面和音浪（在播，或刚暂停不久）。
  @Published var live = false
  @Published var expanded = false
  @Published var dragging = false
  @Published var hasNotch = false
  @Published var notch = NSSize(width: 180, height: 32)

  /// 系统按时间推算当前进度，不用 Dart 每帧发。
  func elapsed(at now: Date = Date()) -> Double {
    let p = playing ? position + now.timeIntervalSince(positionAt) : position
    return duration > 0 ? min(max(0, p), duration) : max(0, p)
  }

  var showCollapsed: Bool { live && !title.isEmpty }

  /// 展开态内容顶部留白：有刘海紧贴刘海下方，无刘海用常规内边距。
  var expandedTopInset: CGFloat { hasNotch ? notch.height + 6 : 16 }

  /// 黑色岛身（不含上沿两个外翻的小角）的大小。
  var bodySize: NSSize {
    if expanded { return NSSize(width: Self.expandedWidth, height: expandedTopInset + 150) }
    if showCollapsed {
      let art = max(14, notch.height - Self.collapsedPad * 2)
      let side = Self.collapsedPad + art + 6
      return NSSize(width: notch.width + side * 2, height: notch.height)
    }
    // 收回刘海里：有刘海就和刘海一样大，没刘海就缩成一条看不见的线
    return hasNotch ? notch : NSSize(width: notch.width * 0.6, height: 0)
  }

  /// 封面的平均色，提亮一点给音浪和氛围光用。
  static func tint(of image: NSImage) -> Color? {
    guard let cg = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else { return nil }
    var px = [UInt8](repeating: 0, count: 4)
    guard
      let ctx = CGContext(
        data: &px, width: 1, height: 1, bitsPerComponent: 8, bytesPerRow: 4,
        space: CGColorSpaceCreateDeviceRGB(),
        bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)
    else { return nil }
    ctx.interpolationQuality = .medium
    ctx.draw(cg, in: CGRect(x: 0, y: 0, width: 1, height: 1))
    let c = NSColor(
      red: CGFloat(px[0]) / 255, green: CGFloat(px[1]) / 255, blue: CGFloat(px[2]) / 255,
      alpha: 1)
    guard let hsb = c.usingColorSpace(.deviceRGB) else { return nil }
    var h: CGFloat = 0
    var s: CGFloat = 0
    var b: CGFloat = 0
    var a: CGFloat = 0
    hsb.getHue(&h, saturation: &s, brightness: &b, alpha: &a)
    return Color(hue: Double(h), saturation: Double(min(s, 0.72)), brightness: Double(max(b, 0.84)))
  }
}

// MARK: - 形状

/// 岛的轮廓：上沿两角向外翻（像刘海和屏幕边框接起来），下沿两角是圆角。
struct IslandShape: Shape {
  var top: CGFloat
  var bottom: CGFloat

  var animatableData: AnimatablePair<CGFloat, CGFloat> {
    get { AnimatablePair(top, bottom) }
    set {
      top = newValue.first
      bottom = newValue.second
    }
  }

  func path(in r: CGRect) -> Path {
    let w = r.width
    let h = r.height
    let t = min(top, w / 4)
    let b = max(0, min(bottom, (w - 2 * t) / 2, h - t))
    var p = Path()
    p.move(to: CGPoint(x: 0, y: 0))
    p.addQuadCurve(to: CGPoint(x: t, y: t), control: CGPoint(x: t, y: 0))
    p.addLine(to: CGPoint(x: t, y: h - b))
    p.addQuadCurve(to: CGPoint(x: t + b, y: h), control: CGPoint(x: t, y: h))
    p.addLine(to: CGPoint(x: w - t - b, y: h))
    p.addQuadCurve(to: CGPoint(x: w - t, y: h - b), control: CGPoint(x: w - t, y: h))
    p.addLine(to: CGPoint(x: w - t, y: t))
    p.addQuadCurve(to: CGPoint(x: w, y: 0), control: CGPoint(x: w - t, y: 0))
    p.closeSubpath()
    return p
  }
}

// MARK: - 视图

struct IslandView: View {
  @ObservedObject var model: IslandModel
  let island: DynamicIsland
  @State private var infoHover = false

  var body: some View {
    let expanded = model.expanded
    let visible = expanded || model.showCollapsed
    let size = model.bodySize
    let ear: CGFloat = expanded ? 12 : 6
    let radius: CGFloat = expanded ? 24 : 10
    let shape = IslandShape(top: ear, bottom: radius)

    let h = model.notch.height
    let pad = IslandModel.collapsedPad
    let collapsedArt = max(14, h - pad * 2)
    let collapsedRadius = max(4, 10 - pad)

    // 封面几何：收起态贴刘海左侧，展开态滑落放大到 60×60
    let coverSize: CGFloat = expanded ? 60 : collapsedArt
    let coverRadius: CGFloat = expanded ? 12 : collapsedRadius
    let coverX: CGFloat = expanded ? 18 : pad
    let coverY: CGFloat = expanded ? model.expandedTopInset : pad

    // 音浪几何：收起态贴刘海右侧，展开态滑落到歌名右侧
    let waveW: CGFloat = 20
    let waveH: CGFloat = expanded ? 16 : collapsedArt * 0.58
    let waveX: CGFloat = max(0, size.width - (expanded ? 18 : pad + 2) - waveW)
    let waveY: CGFloat = expanded
      ? model.expandedTopInset + (60 - waveH) / 2
      : (h - waveH) / 2

    VStack(spacing: 0) {
      ZStack(alignment: .top) {
        shape
          .fill(Color.black)

        ZStack(alignment: .top) {
          // 展开态专属内容（固定居中宽度，展开/收起全程同步位移、缩放、模糊、淡入淡出）
          ZStack(alignment: .topLeading) {
            // 歌名 + 歌手
            Button(action: island.openApp) {
              VStack(alignment: .leading, spacing: 4) {
                Text(model.title)
                  .font(.system(size: 16, weight: .semibold))
                  .foregroundColor(.white)
                  .lineLimit(1)
                  .truncationMode(.tail)
                if !model.artist.isEmpty {
                  Text(model.artist)
                    .font(.system(size: 13, weight: .regular))
                    .foregroundColor(.white.opacity(0.6))
                    .lineLimit(1)
                    .truncationMode(.tail)
                }
              }
              .frame(width: IslandModel.expandedWidth - 90 - 46, height: 60, alignment: .leading)
              .contentShape(Rectangle())
            }
            .buttonStyle(.plain)
            .onHover { infoHover = $0 }
            .scaleEffect(expanded ? 1 : 0.88, anchor: .leading)
            .blur(radius: expanded ? 0 : 4)
            .opacity(expanded ? 1 : 0)
            .offset(x: 90, y: expanded ? model.expandedTopInset : model.expandedTopInset - 14)
            .allowsHitTesting(expanded)

            // 进度条（左右时间与封面/音浪外沿对齐）
            ProgressRow(model: model, island: island)
              .frame(width: IslandModel.expandedWidth - 36)
              .scaleEffect(expanded ? 1 : 0.90, anchor: .top)
              .blur(radius: expanded ? 0 : 4)
              .opacity(expanded ? 1 : 0)
              .offset(x: 18, y: expanded ? model.expandedTopInset + 74 : model.expandedTopInset + 48)
              .allowsHitTesting(expanded)

            // 播放控制按钮
            HStack(spacing: 22) {
              ControlButton(name: "backward.fill", iconSize: 15, boxSize: 36) {
                island.send?("previous", nil)
              }
              ControlButton(
                name: model.playing ? "pause.fill" : "play.fill",
                iconSize: 21,
                boxSize: 40,
                iconOffsetX: model.playing ? 0 : 1.5
              ) {
                island.send?("toggle", nil)
              }
              ControlButton(name: "forward.fill", iconSize: 15, boxSize: 36) {
                island.send?("next", nil)
              }
            }
            .frame(width: IslandModel.expandedWidth)
            .scaleEffect(expanded ? 1 : 0.84, anchor: .top)
            .blur(radius: expanded ? 0 : 4)
            .opacity(expanded ? 1 : 0)
            .offset(x: 0, y: expanded ? model.expandedTopInset + 98 : model.expandedTopInset + 64)
            .allowsHitTesting(expanded)
          }
          .frame(width: IslandModel.expandedWidth, height: size.height, alignment: .topLeading)

          // 共享元素层：同一套封面与音浪在收起/展开之间连续形变与位移
          ZStack(alignment: .topLeading) {
            Button(action: island.openApp) {
              Cover(image: model.art, radius: coverRadius, bordered: expanded)
                .frame(width: coverSize, height: coverSize)
                .scaleEffect(expanded && !model.playing ? 0.93 : 1.0)
                .brightness(expanded && infoHover ? 0.06 : 0)
                .shadow(
                  color: .black.opacity(expanded ? 0.35 : 0),
                  radius: expanded ? 8 : 0,
                  y: expanded ? 4 : 0)
                .contentShape(Rectangle())
            }
            .buttonStyle(PressScaleStyle())
            .onHover { infoHover = $0 }
            .scaleEffect(visible ? 1 : 0.65)
            .blur(radius: visible ? 0 : 3)
            .opacity(visible ? 1 : 0)
            .offset(x: coverX, y: coverY)
            .allowsHitTesting(expanded)

            Waveform(playing: model.playing && visible, tint: model.tint, bars: 4, height: waveH)
              .frame(width: waveW, height: waveH)
              .scaleEffect(visible ? 1 : 0.65)
              .blur(radius: visible ? 0 : 3)
              .opacity(visible ? 1 : 0)
              .offset(x: waveX, y: waveY)
              .allowsHitTesting(false)
          }
          .frame(width: size.width, height: size.height, alignment: .topLeading)
        }
        .frame(width: size.width + ear * 2, height: size.height, alignment: .top)
        .clipShape(shape)

        // 展开时加极细微的轮廓描边，深色壁纸/窗口下也能清晰分辨边缘
        shape
          .stroke(Color.white.opacity(expanded ? 0.10 : 0), lineWidth: 0.5)
          .allowsHitTesting(false)
      }
      .frame(width: size.width + ear * 2, height: size.height)
      .shadow(
        color: .black.opacity(expanded ? 0.45 : 0),
        radius: expanded ? 18 : 0,
        x: 0,
        y: expanded ? 8 : 0)
      .opacity(model.title.isEmpty || (!model.hasNotch && size.height == 0) ? 0 : 1)
      Spacer(minLength: 0)
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
  }
}

struct Cover: View {
  let image: NSImage?
  let radius: CGFloat
  var bordered: Bool = false

  var body: some View {
    let shape = RoundedRectangle(cornerRadius: radius, style: .continuous)
    GeometryReader { g in
      ZStack {
        shape.fill(Color.white.opacity(0.1))
        if let image = image {
          Image(nsImage: image)
            .resizable()
            .aspectRatio(contentMode: .fill)
            .frame(width: g.size.width, height: g.size.height)
        } else {
          Image(systemName: "music.note")
            .font(.system(size: min(g.size.width, g.size.height) * 0.38, weight: .semibold))
            .foregroundColor(.white.opacity(0.45))
        }
      }
      .frame(width: g.size.width, height: g.size.height)
      .clipShape(shape)
      .overlay(
        shape.stroke(Color.white.opacity(bordered ? 0.14 : 0), lineWidth: 0.5)
      )
    }
  }
}

struct PressScaleStyle: ButtonStyle {
  func makeBody(configuration: Configuration) -> some View {
    configuration.label
      .scaleEffect(configuration.isPressed ? 0.88 : 1.0)
      .animation(.easeOut(duration: 0.1), value: configuration.isPressed)
  }
}

struct ControlButton: View {
  let name: String
  let iconSize: CGFloat
  let boxSize: CGFloat
  var iconOffsetX: CGFloat = 0
  let action: () -> Void
  @State private var hover = false

  var body: some View {
    let shape = RoundedRectangle(cornerRadius: 10, style: .continuous)
    Button(action: action) {
      Image(systemName: name)
        .font(.system(size: iconSize, weight: .semibold))
        .foregroundColor(.white.opacity(hover ? 1 : 0.88))
        .offset(x: iconOffsetX)
        .frame(width: boxSize, height: boxSize)
        .background(
          shape
            .fill(Color.white.opacity(hover ? 0.12 : 0))
        )
        .contentShape(shape)
    }
    .buttonStyle(PressScaleStyle())
    .onHover { hover = $0 }
    .animation(.easeOut(duration: 0.12), value: hover)
  }
}

/// 轻量的程序化音浪（非实时音频 FFT）；暂停时不启动定时器，零 CPU 唤醒。
struct Waveform: View {
  let playing: Bool
  let tint: Color
  let bars: Int
  let height: CGFloat

  var body: some View {
    if playing {
      TimelineView(.animation(minimumInterval: 0.16, paused: false)) { ctx in
        barsView(tick: floor(ctx.date.timeIntervalSinceReferenceDate / 0.16))
      }
    } else {
      barsView(tick: 0)
    }
  }

  private func barsView(tick: Double) -> some View {
    HStack(alignment: .center, spacing: 2.5) {
      ForEach(0..<bars, id: \.self) { i in
        Capsule()
          .fill(tint)
          .frame(width: 2.5, height: height)
          .scaleEffect(y: level(i, tick), anchor: .center)
      }
    }
    .frame(height: height)
    .animation(.easeInOut(duration: 0.16), value: tick)
  }

  private func level(_ i: Int, _ tick: Double) -> CGFloat {
    let minScale = max(2.5 / max(height, 1), 0.16)
    guard playing else { return minScale }
    let a = sin(tick * 1.7 + Double(i) * 2.1)
    let b = sin(tick * 0.9 + Double(i) * 1.3)
    return max(minScale, CGFloat(0.28 + 0.72 * abs(a * 0.6 + b * 0.4)))
  }
}

/// 进度条：可点可拖，拖动时左端填充的前沿是 2px 的紫线，时间跟着走。
struct ProgressRow: View {
  @ObservedObject var model: IslandModel
  let island: DynamicIsland
  @State private var drag: Double?
  @State private var hover = false

  private static let edge = Color(red: 0xD6 / 255, green: 0xB0 / 255, blue: 0xFA / 255)

  var body: some View {
    TimelineView(.animation(minimumInterval: 0.5, paused: !model.expanded || !model.playing || drag != nil)) { ctx in
      let elapsed = model.elapsed(at: ctx.date)
      let frac = drag ?? (model.duration > 0 ? elapsed / model.duration : 0)
      let shown = drag.map { $0 * model.duration } ?? elapsed
      HStack(spacing: 8) {
        Text(Self.time(shown))
          .frame(width: 34, alignment: .leading)
        bar(frac)
        Text(Self.time(model.duration))
          .frame(width: 34, alignment: .trailing)
      }
      .font(.system(size: 10.5, weight: .medium).monospacedDigit())
      .foregroundColor(.white.opacity(drag != nil ? 0.85 : 0.48))
    }
  }

  private func bar(_ frac: Double) -> some View {
    let thick: CGFloat = drag != nil || hover ? 6 : 4
    let clamped = CGFloat(min(max(frac, 0), 1))
    return GeometryReader { g in
      let w = g.size.width
      let x = w * clamped
      ZStack(alignment: .leading) {
        Capsule()
          .fill(Color.white.opacity(0.18))
        Rectangle()
          .fill(Color.white.opacity(drag != nil ? 0.95 : 0.85))
          .frame(width: x)
        if drag != nil {
          // 拖动态：填充前沿 2px 紫线，居中显示
          RoundedRectangle(cornerRadius: 1, style: .continuous)
            .fill(Self.edge)
            .frame(width: 2, height: thick * 0.68)
            .offset(x: min(max(0, x - 2), max(0, w - 2)))
        }
      }
      .frame(height: thick)
      .clipShape(Capsule())
      .frame(maxHeight: .infinity)
      .contentShape(Rectangle())
      .gesture(
        DragGesture(minimumDistance: 0)
          .onChanged { v in
            if drag == nil { model.dragging = true }
            drag = Double(min(max(v.location.x / max(w, 1), 0), 1))
          }
          .onEnded { v in
            let f = Double(min(max(v.location.x / max(w, 1), 0), 1))
            if model.duration > 0 {
              model.position = f * model.duration
              model.positionAt = Date()
              island.send?("seek", f * model.duration)
            }
            drag = nil
            model.dragging = false
            island.handleMouseMove()
          })
    }
    .frame(height: 16)
    .onHover { hover = $0 }
    .animation(.easeOut(duration: 0.12), value: thick)
  }

  static func time(_ s: Double) -> String {
    let t = Int(max(0, s.isFinite ? s : 0))
    return String(format: "%d:%02d", t / 60, t % 60)
  }
}
