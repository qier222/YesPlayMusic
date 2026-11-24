// Common widgets: context menus.

import 'dart:async';

import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import '../l10n/l10n.dart';
import '../theme.dart';
import 'icons.dart';
import 'tap.dart';

// ───────────── Context menu ─────────────

class MenuItem {
  const MenuItem(
    this.icon,
    this.label, {
    this.onTap,
    this.enabled = true,
    this.danger = false,
    this.sub,
    this.checked = false,
    this.subSplit = true,
    this.subLoad,
    this.id,
  });
  final String icon;
  final String label;
  final VoidCallback? onTap;
  final bool enabled;
  final bool danger;
  final List<MenuItem>? sub;
  final bool checked;

  /// Draws a divider between a submenu's first item and the rest ("New playlist" and existing playlists).
  final bool subSplit;

  /// Submenus only known after a wait (e.g. the user's playlists) show "Loading…" on hover.
  final Future<List<MenuItem>> Function()? subLoad;

  /// Name of a built-in item, which plugins can use to hide it (see [MenuSpec.more]).
  final String? id;

  bool get hasSub => sub != null || subLoad != null;
}

/// Late menu additions: groups to insert and item ids to hide.
typedef MenuMore = ({List<List<MenuItem>> groups, Set<String> hide});

class MenuSpec {
  const MenuSpec({
    this.title,
    this.subtitle,
    this.cover,
    this.round = false,
    required this.groups,
    this.more,
    this.moreAt,
  });
  final String? title, subtitle, cover;
  final bool round;
  final List<List<MenuItem>> groups;

  /// Items known only a little later (e.g. plugin-defined ones), inserted before group [moreAt] when they arrive
  /// (last by default). Nothing is added on error or when empty.
  final Future<MenuMore>? more;
  final int? moreAt;
}

/// The element that opened the current menu (the right-clicked row). It keeps its hover style while the menu is open.
final menuOwner = ValueNotifier<Object?>(null);

OverlayEntry? _menuEntry;

void closeMenu() {
  _menuEntry?.remove();
  _menuEntry = null;
  menuOwner.value = null;
}

void showMenu(BuildContext context, Offset global, MenuSpec spec) {
  closeMenu();
  final overlay = Overlay.of(context, rootOverlay: true);
  _menuEntry = OverlayEntry(
    builder: (_) => _MenuLayer(at: global, spec: spec),
  );
  overlay.insert(_menuEntry!);
}

class _MenuLayer extends StatelessWidget {
  const _MenuLayer({required this.at, required this.spec});
  final Offset at;
  final MenuSpec spec;

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.sizeOf(context);
    return Stack(
      children: [
        Positioned.fill(
          child: Listener(
            behavior: HitTestBehavior.opaque,
            onPointerDown: (_) => closeMenu(),
          ),
        ),
        CustomSingleChildLayout(
          delegate: _MenuPos(at, size),
          child: Shortcuts(
            shortcuts: const {
              SingleActivator(LogicalKeyboardKey.escape): DismissIntent(),
            },
            child: Actions(
              actions: {
                DismissIntent: CallbackAction<DismissIntent>(
                  onInvoke: (_) => closeMenu(),
                ),
              },
              child: Focus(
                autofocus: true,
                child: _MenuPanel(spec: spec, origin: at),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _MenuPos extends SingleChildLayoutDelegate {
  _MenuPos(this.at, this.size);
  final Offset at;
  final Size size;

  @override
  BoxConstraints getConstraintsForChild(BoxConstraints c) =>
      BoxConstraints.loose(size);

  @override
  Offset getPositionForChild(Size s, Size child) {
    var x = at.dx + 2;
    var y = at.dy + 2;
    if (x + child.width > size.width - 8) x = at.dx - child.width - 2;
    if (y + child.height > size.height - 8) {
      y = (size.height - 8 - child.height).clamp(8, double.infinity);
    }
    return Offset(x, y);
  }

  @override
  bool shouldRelayout(_MenuPos old) => old.at != at || old.size != size;
}

class _MenuPanel extends StatefulWidget {
  const _MenuPanel({
    required this.spec,
    required this.origin,
    this.isSub = false,
  });
  final MenuSpec spec;
  final Offset origin;
  final bool isSub;

  @override
  State<_MenuPanel> createState() => _MenuPanelState();
}

class _MenuPanelState extends State<_MenuPanel> {
  int? _subOpen;
  final _links = <int, LayerLink>{};
  List<List<MenuItem>> _more = const [];
  Set<String> _hide = const {};

  @override
  void initState() {
    super.initState();
    widget.spec.more?.then((m) {
      if (!mounted) return;
      setState(() {
        _more = m.groups.where((x) => x.isNotEmpty).toList();
        _hide = m.hide;
      });
    }, onError: (Object _) {});
  }

  @override
  Widget build(BuildContext context) {
    final base = [
      for (final g in widget.spec.groups)
        g.where((i) => i.id == null || !_hide.contains(i.id)).toList(),
    ].where((g) => g.isNotEmpty).toList();
    final at = (widget.spec.moreAt ?? base.length).clamp(0, base.length);
    final groups = [...base.take(at), ..._more, ...base.skip(at)];
    final spec = widget.spec;
    var idx = 0;
    final children = <Widget>[];
    if (spec.title != null) {
      children.add(
        Padding(
          padding: const EdgeInsets.fromLTRB(12, 16, 12, 12),
          child: Row(
            children: [
              if (spec.cover != null)
                Cover(spec.cover!, w: 36, h: 36, r: spec.round ? 18 : 6),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    tx(spec.title!, 14, w: w700),
                    const SizedBox(height: 3),
                    tx(spec.subtitle ?? '', 12, w: w500, c: P.muted),
                  ],
                ),
              ),
            ],
          ),
        ),
      );
    }
    for (var g = 0; g < groups.length; g++) {
      if (g > 0 || spec.title != null) {
        children.add(
          Container(
            height: 1,
            margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            color: P.line,
          ),
        );
      }
      for (final item in groups[g]) {
        final i = idx++;
        final link = _links.putIfAbsent(i, LayerLink.new);
        children.add(
          _MenuRow(
            item: item,
            link: link,
            subOpen: _subOpen == i,
            onHover: (v) {
              if (v) setState(() => _subOpen = item.hasSub ? i : null);
            },
          ),
        );
      }
    }
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0, end: 1),
      duration: const Duration(milliseconds: 160),
      curve: Curves.easeOutCubic,
      builder: (_, t, child) => Opacity(
        opacity: t,
        child: Transform.scale(
          scale: 0.96 + 0.04 * t,
          alignment: Alignment.topLeft,
          child: child,
        ),
      ),
      child: Container(
        width: 248,
        padding: const EdgeInsets.symmetric(vertical: 6),
        decoration: squircle(
          14,
          color: P.dark ? const Color(0xFF17171A) : white,
          side: BorderSide(color: P.dark ? wa(0.08) : ba(0.08)),
          shadows: [
            BoxShadow(
              color: ba(P.dark ? 0.5 : 0.18),
              blurRadius: 32,
              offset: const Offset(0, 12),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: children,
        ),
      ),
    );
  }
}

class _MenuRow extends StatelessWidget {
  const _MenuRow({
    required this.item,
    required this.link,
    required this.subOpen,
    required this.onHover,
  });
  final MenuItem item;
  final LayerLink link;
  final bool subOpen;
  final ValueChanged<bool> onHover;

  @override
  Widget build(BuildContext context) {
    final enabled = item.enabled;
    final col = !enabled ? P.faint : (item.danger ? heart : P.ink);
    final icol = !enabled ? P.faint : (item.danger ? heart : P.muted);
    Widget row = Tap(
      onHover: enabled ? onHover : null,
      onTap: !enabled || item.hasSub
          ? null
          : () {
              closeMenu();
              item.onTap?.call();
            },
      builder: (_, h, _) => AnimatedContainer(
        duration: const Duration(milliseconds: 80),
        height: 34,
        margin: const EdgeInsets.symmetric(horizontal: 6),
        padding: const EdgeInsets.symmetric(horizontal: 10),
        decoration: squircle(
          8,
          color: enabled && (h || subOpen)
              ? (P.dark ? const Color(0xFF232327) : P.surface)
              : const Color(0x00000000),
        ),
        child: Row(
          children: [
            // No space reserved when the icon is null (e.g. radio menus that only use a check for selection)
            if (item.icon.isNotEmpty) ...[
              Ico(item.icon, size: 20, color: icol),
              const SizedBox(width: 10),
            ],
            Expanded(
              child: tx(item.label, 14, w: w600, c: col),
            ),
            if (item.hasSub) Ico('chevron-right', size: 16, color: P.faint),
            if (item.checked) Ico('check', size: 16, color: accent),
          ],
        ),
      ),
    );
    if (!item.hasSub) return row;
    return CompositedTransformTarget(
      link: link,
      child: _SubMenuHost(
        link: link,
        open: subOpen,
        items: item.sub ?? const [],
        load: item.subLoad,
        split: item.subSplit,
        child: row,
      ),
    );
  }
}

class _SubMenuHost extends StatefulWidget {
  const _SubMenuHost({
    required this.link,
    required this.open,
    required this.items,
    required this.child,
    this.split = true,
    this.load,
  });
  final LayerLink link;
  final bool open, split;
  final List<MenuItem> items;
  final Future<List<MenuItem>> Function()? load;
  final Widget child;

  @override
  State<_SubMenuHost> createState() => _SubMenuHostState();
}

class _SubMenuHostState extends State<_SubMenuHost> {
  final _ctrl = OverlayPortalController();
  Future<List<MenuItem>>? _loading;

  @override
  void didUpdateWidget(covariant _SubMenuHost oldWidget) {
    super.didUpdateWidget(oldWidget);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      if (widget.open && !_ctrl.isShowing) _ctrl.show();
      if (!widget.open && _ctrl.isShowing) _ctrl.hide();
    });
  }

  @override
  Widget build(BuildContext context) {
    return OverlayPortal(
      controller: _ctrl,
      overlayChildBuilder: (_) => Align(
        alignment: Alignment.topLeft,
        child: CompositedTransformFollower(
          link: widget.link,
          targetAnchor: Alignment.topRight,
          offset: const Offset(10, -6),
          child: widget.load == null
              ? _panel(widget.items)
              : FutureBuilder<List<MenuItem>>(
                  future: _loading ??= widget.load!(),
                  builder: (_, snap) => _panel(
                    snap.hasData
                        ? snap.data!
                        : [
                            MenuItem(
                              '',
                              snap.hasError
                                  ? context.l10n.stateCouldNotLoad
                                  : context.l10n.stateLoading,
                            ),
                          ],
                  ),
                ),
        ),
      ),
      child: widget.child,
    );
  }

  Widget _panel(List<MenuItem> items) => _MenuPanel(
    spec: MenuSpec(
      groups: widget.split && items.length > 1
          ? [items.take(1).toList(), items.skip(1).toList()]
          : [items],
    ),
    origin: Offset.zero,
    isSub: true,
  );
}
