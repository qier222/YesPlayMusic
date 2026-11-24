// 10-band equalizer: bands, presets, and the audio filter handed to mpv.
//
// Each band is an ffmpeg equalizer (peaking filter, 1 octave wide). The trimmed
// ffmpeg bundled on macOS / Windows only includes this one audio filter, which is
// enough. Each band has its own label (@ypmeq0…) so dragging a slider changes the
// gain with af-command instead of rebuilding the filter chain.

import 'dart:math' as math;

/// Band frequencies (Hz).
const eqBands = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

/// Gain range of each band (dB).
const eqMaxDb = 12.0;

enum EqPreset {
  flat,
  pop,
  rock,
  vocal,
  bassBoost,
  trebleBoost,
  classical,
  jazz,
  electronic,
  custom,
}

/// Band gains of each preset (dB). custom uses the user's own.
const Map<EqPreset, List<double>> eqPresetGains = {
  EqPreset.flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  EqPreset.pop: [-1, 0, 2, 3, 4, 3, 1, 0, 1, 1],
  EqPreset.rock: [4, 3, 2, 0, -1, -1, 1, 3, 4, 4],
  EqPreset.vocal: [-2, -2, -1, 1, 3, 4, 3, 1, 0, -1],
  EqPreset.bassBoost: [6, 5, 4, 2, 0, 0, 0, 0, 0, 0],
  EqPreset.trebleBoost: [0, 0, 0, 0, 0, 1, 2, 4, 5, 6],
  EqPreset.classical: [3, 2, 1, 0, 0, 0, -1, 0, 2, 3],
  EqPreset.jazz: [3, 2, 1, 2, -1, -1, 0, 1, 2, 3],
  EqPreset.electronic: [5, 4, 1, 0, -2, 1, 0, 1, 4, 5],
};

/// Equalizer settings: on/off, the selected preset, the custom gains.
class EqSettings {
  const EqSettings({
    this.enabled = false,
    this.preset = EqPreset.flat,
    this.custom = const [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  });

  final bool enabled;
  final EqPreset preset;

  /// Gains of the custom preset; kept while another preset is selected.
  final List<double> custom;

  /// The band gains in effect.
  List<double> get gains =>
      preset == EqPreset.custom ? custom : eqPresetGains[preset]!;

  /// Actually changes the sound: on, and not all zero.
  bool get active => enabled && gains.any((g) => g != 0);

  EqSettings copyWith({
    bool? enabled,
    EqPreset? preset,
    List<double>? custom,
  }) => EqSettings(
    enabled: enabled ?? this.enabled,
    preset: preset ?? this.preset,
    custom: custom ?? this.custom,
  );

  factory EqSettings.fromJson(Object? j) {
    if (j is! Map) return const EqSettings();
    final c = j['custom'];
    return EqSettings(
      enabled: j['enabled'] == true,
      preset: EqPreset.values.firstWhere(
        (p) => p.name == j['preset'],
        orElse: () => EqPreset.flat,
      ),
      custom: c is List && c.length == eqBands.length
          ? [for (final x in c) clampEqDb(x is num ? x.toDouble() : 0)]
          : const [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    );
  }

  Map<String, Object?> toJson() => {
    'enabled': enabled,
    'preset': preset.name,
    'custom': custom,
  };
}

double clampEqDb(double db) => db.clamp(-eqMaxDb, eqMaxDb).toDouble();

/// Label of band [i]'s filter, for af-command.
String eqLabel(int i) => 'ypmeq$i';

/// The whole mpv af: 10 labelled equalizers. Empty when not active.
String eqFilter(EqSettings s) {
  if (!s.active) return '';
  final g = s.gains;
  return [
    for (var i = 0; i < eqBands.length; i++)
      '@${eqLabel(i)}:lavfi-equalizer=f=${eqBands[i]}:t=o:w=1:g=${_db(g[i])}',
  ].join(',');
}

/// Preamp (dB, ≤ 0): when a band is boosted, lower everything by as much to avoid clipping.
double eqPreamp(EqSettings s) {
  if (!s.active) return 0;
  final top = s.gains.reduce(math.max);
  return top > 0 ? -top : 0;
}

String _db(double v) => v.toStringAsFixed(1);
