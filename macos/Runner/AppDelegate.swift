import Cocoa
import FlutterMacOS

@main
class AppDelegate: FlutterAppDelegate {
  override func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool {
    // With "keep running" on, the main window is only hidden; closing another
    // window (e.g. web sign-in) while it's hidden mustn't quit the app either.
    return !MainFlutterWindow.keepRunning
  }

  override func applicationShouldHandleReopen(_ sender: NSApplication, hasVisibleWindows flag: Bool) -> Bool {
    // Dock icon clicked while the main window is hidden: bring it back.
    if !flag, let window = mainFlutterWindow {
      window.makeKeyAndOrderFront(nil)
    }
    return true
  }

  override func applicationSupportsSecureRestorableState(_ app: NSApplication) -> Bool {
    return true
  }
}
