import 'package:flutter_test/flutter_test.dart';
import 'package:yesplaymusic/music/eq.dart';

void main() {
  test('每个预设都是 10 段，范围在 ±12 dB 内', () {
    for (final p in EqPreset.values) {
      if (p == EqPreset.custom) continue;
      final g = eqPresetGains[p]!;
      expect(g, hasLength(eqBands.length), reason: p.name);
      expect(g.every((x) => x.abs() <= eqMaxDb), isTrue, reason: p.name);
    }
  });

  test('关着、或者全 0 时不加滤镜，也不压音量', () {
    const off = EqSettings(preset: EqPreset.rock);
    expect(eqFilter(off), '');
    expect(eqPreamp(off), 0);
    const flat = EqSettings(enabled: true);
    expect(flat.active, isFalse);
    expect(eqFilter(flat), '');
  });

  test('滤镜：每段一个带标签的 equalizer，前级增益抵消最高的提升', () {
    const s = EqSettings(enabled: true, preset: EqPreset.bassBoost);
    final f = eqFilter(s).split(',');
    expect(f, hasLength(10));
    expect(f.first, '@ypmeq0:lavfi-equalizer=f=31:t=o:w=1:g=6.0');
    expect(f.last, '@ypmeq9:lavfi-equalizer=f=16000:t=o:w=1:g=0.0');
    expect(eqPreamp(s), -6);
    // Only cuts: no preamp needed
    const cut = EqSettings(
      enabled: true,
      preset: EqPreset.custom,
      custom: [-3, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    );
    expect(eqPreamp(cut), 0);
  });

  test('存取：自定义的增益保留，坏数据回到默认', () {
    const s = EqSettings(
      enabled: true,
      preset: EqPreset.custom,
      custom: [1, 2, 3, 4, 5, 6, 7, 8, 9, 20],
    );
    final back = EqSettings.fromJson(s.toJson());
    expect(back.enabled, isTrue);
    expect(back.preset, EqPreset.custom);
    expect(back.custom.last, eqMaxDb); // clamped to range
    expect(
      EqSettings.fromJson({
        'preset': 'nope',
        'custom': [1],
      }).preset,
      EqPreset.flat,
    );
    expect(EqSettings.fromJson(null).enabled, isFalse);
  });
}
