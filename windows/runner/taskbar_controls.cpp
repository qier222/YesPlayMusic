#include "taskbar_controls.h"

#include <unknwn.h>
#include <d2d1.h>
#include <shobjidl.h>
#include <winrt/base.h>

#include <algorithm>
#include <array>
#include <cstring>
#include <vector>

namespace {

enum ButtonId : UINT {
  kPrev = 0x4100,
  kPlayPause = 0x4101,
  kNext = 0x4102,
  kLike = 0x4103,
};

enum class Glyph { kPrev, kPlay, kPause, kNext, kHeart, kHeartFilled };

// SystemUsesLightTheme is 0 in dark mode and non-zero in light mode.
bool IsLightTaskbarTheme() {
  DWORD value = 0;
  DWORD size = sizeof(value);
  const LSTATUS status = RegGetValue(
      HKEY_CURRENT_USER,
      L"Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize",
      L"SystemUsesLightTheme", RRF_RT_REG_DWORD, nullptr, &value, &size);
  if (status == ERROR_SUCCESS) return value != 0;
  return false;
}

void CopyTip(wchar_t (&dst)[260], const std::wstring& text) {
  constexpr size_t kCap = 259;
  size_t len = std::min(text.size(), kCap);
  // Never split a UTF-16 surrogate pair at the truncation boundary.
  if (len > 0 && IS_HIGH_SURROGATE(text[len - 1])) len--;
  std::wmemcpy(dst, text.data(), len);
  dst[len] = L'\0';
}

HRESULT AddPolygon(ID2D1Factory* factory,
                   std::initializer_list<D2D1_POINT_2F> pts,
                   winrt::com_ptr<ID2D1PathGeometry>* out) {
  winrt::com_ptr<ID2D1PathGeometry> geo;
  HRESULT hr = factory->CreatePathGeometry(geo.put());
  if (FAILED(hr)) return hr;
  winrt::com_ptr<ID2D1GeometrySink> sink;
  hr = geo->Open(sink.put());
  if (FAILED(hr)) return hr;
  auto it = pts.begin();
  sink->BeginFigure(*it++, D2D1_FIGURE_BEGIN_FILLED);
  for (; it != pts.end(); ++it) {
    sink->AddLine(*it);
  }
  sink->EndFigure(D2D1_FIGURE_END_CLOSED);
  hr = sink->Close();
  if (FAILED(hr)) return hr;
  *out = std::move(geo);
  return S_OK;
}

HRESULT CreateHeartGeometry(ID2D1Factory* factory,
                            winrt::com_ptr<ID2D1PathGeometry>* out) {
  winrt::com_ptr<ID2D1PathGeometry> geo;
  HRESULT hr = factory->CreatePathGeometry(geo.put());
  if (FAILED(hr)) return hr;
  winrt::com_ptr<ID2D1GeometrySink> sink;
  hr = geo->Open(sink.put());
  if (FAILED(hr)) return hr;
  sink->BeginFigure(D2D1::Point2F(12.0f, 20.0f), D2D1_FIGURE_BEGIN_FILLED);
  sink->AddBezier(D2D1::BezierSegment(D2D1::Point2F(12.0f, 20.0f),
                                      D2D1::Point2F(3.0f, 14.6f),
                                      D2D1::Point2F(3.0f, 8.9f)));
  sink->AddBezier(D2D1::BezierSegment(D2D1::Point2F(3.0f, 6.2f),
                                      D2D1::Point2F(5.1f, 4.0f),
                                      D2D1::Point2F(7.7f, 4.0f)));
  sink->AddBezier(D2D1::BezierSegment(D2D1::Point2F(9.6f, 4.0f),
                                      D2D1::Point2F(11.2f, 5.1f),
                                      D2D1::Point2F(12.0f, 6.8f)));
  sink->AddBezier(D2D1::BezierSegment(D2D1::Point2F(12.8f, 5.1f),
                                      D2D1::Point2F(14.4f, 4.0f),
                                      D2D1::Point2F(16.3f, 4.0f)));
  sink->AddBezier(D2D1::BezierSegment(D2D1::Point2F(18.9f, 4.0f),
                                      D2D1::Point2F(21.0f, 6.2f),
                                      D2D1::Point2F(21.0f, 8.9f)));
  sink->AddBezier(D2D1::BezierSegment(D2D1::Point2F(21.0f, 14.6f),
                                      D2D1::Point2F(12.0f, 20.0f),
                                      D2D1::Point2F(12.0f, 20.0f)));
  sink->EndFigure(D2D1_FIGURE_END_CLOSED);
  hr = sink->Close();
  if (FAILED(hr)) return hr;
  *out = std::move(geo);
  return S_OK;
}

HICON RenderGlyphIcon(ID2D1Factory* factory, ID2D1DCRenderTarget* rt,
                      ID2D1StrokeStyle* stroke_style, int size, Glyph glyph,
                      bool light_theme) {
  HDC mem_dc = CreateCompatibleDC(nullptr);
  if (!mem_dc) return nullptr;

  BITMAPINFO bmi{};
  bmi.bmiHeader.biSize = sizeof(BITMAPINFOHEADER);
  bmi.bmiHeader.biWidth = size;
  bmi.bmiHeader.biHeight = -size;  // top-down
  bmi.bmiHeader.biPlanes = 1;
  bmi.bmiHeader.biBitCount = 32;
  bmi.bmiHeader.biCompression = BI_RGB;

  void* bits = nullptr;
  HBITMAP color_bmp =
      CreateDIBSection(mem_dc, &bmi, DIB_RGB_COLORS, &bits, nullptr, 0);
  if (!color_bmp || !bits) {
    if (color_bmp) DeleteObject(color_bmp);
    DeleteDC(mem_dc);
    return nullptr;
  }
  std::memset(bits, 0, static_cast<size_t>(size) * static_cast<size_t>(size) * 4);

  HGDIOBJ old_bmp = SelectObject(mem_dc, color_bmp);
  const RECT rc{0, 0, size, size};
  HRESULT hr = rt->BindDC(mem_dc, &rc);
  if (SUCCEEDED(hr)) {
    const D2D1_COLOR_F ink =
        light_theme ? D2D1::ColorF(0x18181B, 1.0f) : D2D1::ColorF(0xF7F7F8, 1.0f);
    const D2D1_COLOR_F heart = D2D1::ColorF(0xFF5C7A, 1.0f);

    winrt::com_ptr<ID2D1SolidColorBrush> ink_brush;
    winrt::com_ptr<ID2D1SolidColorBrush> heart_brush;
    rt->CreateSolidColorBrush(ink, ink_brush.put());
    rt->CreateSolidColorBrush(heart, heart_brush.put());

    rt->BeginDraw();
    rt->Clear(D2D1::ColorF(0.0f, 0.0f, 0.0f, 0.0f));
    const float scale = static_cast<float>(size) / 24.0f;
    rt->SetTransform(D2D1::Matrix3x2F::Scale(scale, scale));

    if (ink_brush && heart_brush) {
      switch (glyph) {
        case Glyph::kPrev: {
          winrt::com_ptr<ID2D1PathGeometry> g1, g2;
          if (SUCCEEDED(AddPolygon(factory, {{19.4f, 7.4f}, {13.0f, 12.0f}, {19.4f, 16.6f}}, &g1)) &&
              SUCCEEDED(AddPolygon(factory, {{11.0f, 7.4f}, {4.6f, 12.0f}, {11.0f, 16.6f}}, &g2))) {
            rt->FillGeometry(g1.get(), ink_brush.get());
            rt->DrawGeometry(g1.get(), ink_brush.get(), 2.6f, stroke_style);
            rt->FillGeometry(g2.get(), ink_brush.get());
            rt->DrawGeometry(g2.get(), ink_brush.get(), 2.6f, stroke_style);
          }
          break;
        }
        case Glyph::kNext: {
          winrt::com_ptr<ID2D1PathGeometry> g1, g2;
          if (SUCCEEDED(AddPolygon(factory, {{4.6f, 7.4f}, {11.0f, 12.0f}, {4.6f, 16.6f}}, &g1)) &&
              SUCCEEDED(AddPolygon(factory, {{13.0f, 7.4f}, {19.4f, 12.0f}, {13.0f, 16.6f}}, &g2))) {
            rt->FillGeometry(g1.get(), ink_brush.get());
            rt->DrawGeometry(g1.get(), ink_brush.get(), 2.6f, stroke_style);
            rt->FillGeometry(g2.get(), ink_brush.get());
            rt->DrawGeometry(g2.get(), ink_brush.get(), 2.6f, stroke_style);
          }
          break;
        }
        case Glyph::kPlay: {
          winrt::com_ptr<ID2D1PathGeometry> g;
          if (SUCCEEDED(AddPolygon(factory, {{8.0f, 6.6f}, {17.8f, 12.0f}, {8.0f, 17.4f}}, &g))) {
            rt->FillGeometry(g.get(), ink_brush.get());
            rt->DrawGeometry(g.get(), ink_brush.get(), 4.4f, stroke_style);
          }
          break;
        }
        case Glyph::kPause:
          rt->FillRoundedRectangle(
              D2D1::RoundedRect(D2D1::RectF(6.5f, 5.0f, 10.0f, 19.0f), 1.6f, 1.6f),
              ink_brush.get());
          rt->FillRoundedRectangle(
              D2D1::RoundedRect(D2D1::RectF(14.0f, 5.0f, 17.5f, 19.0f), 1.6f, 1.6f),
              ink_brush.get());
          break;
        case Glyph::kHeart:
        case Glyph::kHeartFilled: {
          winrt::com_ptr<ID2D1PathGeometry> g;
          if (SUCCEEDED(CreateHeartGeometry(factory, &g))) {
            if (glyph == Glyph::kHeartFilled) {
              rt->FillGeometry(g.get(), heart_brush.get());
              rt->DrawGeometry(g.get(), heart_brush.get(), 1.5f, stroke_style);
            } else {
              rt->DrawGeometry(g.get(), ink_brush.get(), 1.6f, stroke_style);
            }
          }
          break;
        }
      }
    }
    hr = rt->EndDraw();
  }

  SelectObject(mem_dc, old_bmp);
  DeleteDC(mem_dc);

  HICON icon = nullptr;
  if (SUCCEEDED(hr)) {
    const size_t stride = ((static_cast<size_t>(size) + 15) / 16) * 2;
    std::vector<uint8_t> mask_bits(stride * static_cast<size_t>(size), 0);
    HBITMAP mask_bmp = CreateBitmap(size, size, 1, 1, mask_bits.data());
    if (mask_bmp) {
      ICONINFO ii{};
      ii.fIcon = TRUE;
      ii.hbmMask = mask_bmp;
      ii.hbmColor = color_bmp;
      icon = CreateIconIndirect(&ii);
      DeleteObject(mask_bmp);
    }
  }
  DeleteObject(color_bmp);
  return icon;
}

}  // namespace

class TaskbarControls::Impl {
 public:
  explicit Impl(HWND window)
      : window_(window),
        taskbar_button_created_msg_(
            RegisterWindowMessage(L"TaskbarButtonCreated")) {}

  ~Impl() { DestroyIcons(); }

  UINT TaskbarButtonCreatedMessage() const {
    return taskbar_button_created_msg_;
  }

  void OnTaskbarButtonCreated() {
    taskbar_ = nullptr;
    buttons_added_ = false;
    winrt::com_ptr<ITaskbarList3> taskbar;
    if (FAILED(CoCreateInstance(CLSID_TaskbarList, nullptr,
                                CLSCTX_INPROC_SERVER,
                                IID_PPV_ARGS(taskbar.put())))) {
      return;
    }
    if (FAILED(taskbar->HrInit())) return;
    taskbar_ = std::move(taskbar);
    SyncButtons();
  }

  void OnThemeOrDpiChanged(UINT dpi) {
    if (dpi == 0 && window_) dpi = GetDpiForWindow(window_);
    if (RebuildIconsIfNeeded(dpi)) SyncButtons();
  }

  void UpdateState(const MediaPlaybackState& state) {
    if (state == state_) return;
    state_ = state;
    SyncButtons();
  }

  void UpdateLabels(const TaskbarLabels& labels) {
    if (labels == labels_) return;
    labels_ = labels;
    SyncButtons();
  }

  const char* HandleCommand(WPARAM wparam) const {
    if (HIWORD(wparam) != THBN_CLICKED) return nullptr;
    switch (LOWORD(wparam)) {
      case kPrev: return "previous";
      case kPlayPause: return "toggle";
      case kNext: return "next";
      case kLike: return "like";
      default: return nullptr;
    }
  }

 private:
  void DestroyIcons() {
    for (HICON& icon : icons_) {
      if (icon) {
        DestroyIcon(icon);
        icon = nullptr;
      }
    }
    has_icons_ = false;
  }

  bool RebuildIconsIfNeeded(UINT dpi_override) {
    const UINT dpi =
        dpi_override ? dpi_override : (window_ ? GetDpiForWindow(window_) : 96);
    const bool light = IsLightTaskbarTheme();
    if (has_icons_ && dpi == cached_dpi_ && light == cached_light_) {
      return false;
    }

    if (!factory_) {
      if (FAILED(D2D1CreateFactory(D2D1_FACTORY_TYPE_SINGLE_THREADED,
                                   factory_.put()))) {
        return false;
      }
    }
    if (!rt_) {
      const auto props = D2D1::RenderTargetProperties(
          D2D1_RENDER_TARGET_TYPE_DEFAULT,
          D2D1::PixelFormat(DXGI_FORMAT_B8G8R8A8_UNORM,
                            D2D1_ALPHA_MODE_PREMULTIPLIED),
          96.0f, 96.0f);
      if (FAILED(factory_->CreateDCRenderTarget(&props, rt_.put()))) {
        return false;
      }
    }
    if (!stroke_style_) {
      const auto stroke_props = D2D1::StrokeStyleProperties(
          D2D1_CAP_STYLE_ROUND, D2D1_CAP_STYLE_ROUND, D2D1_CAP_STYLE_ROUND,
          D2D1_LINE_JOIN_ROUND);
      if (FAILED(factory_->CreateStrokeStyle(&stroke_props, nullptr, 0,
                                             stroke_style_.put()))) {
        return false;
      }
    }

    const int icon_px = std::max(16, GetSystemMetricsForDpi(SM_CXSMICON, dpi));
    constexpr std::array<Glyph, 6> kGlyphs = {
        Glyph::kPrev, Glyph::kPlay,  Glyph::kPause,
        Glyph::kNext, Glyph::kHeart, Glyph::kHeartFilled,
    };
    std::array<HICON, 6> next_icons{};
    for (size_t i = 0; i < kGlyphs.size(); ++i) {
      next_icons[i] = RenderGlyphIcon(factory_.get(), rt_.get(),
                                      stroke_style_.get(), icon_px, kGlyphs[i],
                                      light);
      if (!next_icons[i]) {
        for (HICON icon : next_icons) {
          if (icon) DestroyIcon(icon);
        }
        return false;
      }
    }

    DestroyIcons();
    icons_ = next_icons;
    has_icons_ = true;
    cached_dpi_ = dpi;
    cached_light_ = light;
    return true;
  }

  void SyncButtons() {
    if (!taskbar_ || !window_) return;
    RebuildIconsIfNeeded(0);
    if (!has_icons_) return;

    const THUMBBUTTONFLAGS flags = state_.active ? THBF_ENABLED : THBF_HIDDEN;
    std::array<THUMBBUTTON, 4> buttons{};

    buttons[0].dwMask = THB_ICON | THB_TOOLTIP | THB_FLAGS;
    buttons[0].iId = kPrev;
    buttons[0].hIcon = icons_[0];
    buttons[0].dwFlags = flags;
    CopyTip(buttons[0].szTip, labels_.prev);

    buttons[1].dwMask = THB_ICON | THB_TOOLTIP | THB_FLAGS;
    buttons[1].iId = kPlayPause;
    buttons[1].hIcon = state_.playing ? icons_[2] : icons_[1];
    buttons[1].dwFlags = flags;
    CopyTip(buttons[1].szTip, state_.playing ? labels_.pause : labels_.play);

    buttons[2].dwMask = THB_ICON | THB_TOOLTIP | THB_FLAGS;
    buttons[2].iId = kNext;
    buttons[2].hIcon = icons_[3];
    buttons[2].dwFlags = flags;
    CopyTip(buttons[2].szTip, labels_.next);

    buttons[3].dwMask = THB_ICON | THB_TOOLTIP | THB_FLAGS;
    buttons[3].iId = kLike;
    buttons[3].hIcon = state_.liked ? icons_[5] : icons_[4];
    buttons[3].dwFlags = flags;
    CopyTip(buttons[3].szTip, state_.liked ? labels_.unlike : labels_.like);

    if (!buttons_added_) {
      if (SUCCEEDED(taskbar_->ThumbBarAddButtons(
              window_, static_cast<UINT>(buttons.size()), buttons.data()))) {
        buttons_added_ = true;
      }
    } else {
      taskbar_->ThumbBarUpdateButtons(
          window_, static_cast<UINT>(buttons.size()), buttons.data());
    }
  }

  const HWND window_;
  const UINT taskbar_button_created_msg_;
  winrt::com_ptr<ITaskbarList3> taskbar_;
  winrt::com_ptr<ID2D1Factory> factory_;
  winrt::com_ptr<ID2D1DCRenderTarget> rt_;
  winrt::com_ptr<ID2D1StrokeStyle> stroke_style_;
  std::array<HICON, 6> icons_{};
  bool has_icons_ = false;
  bool buttons_added_ = false;
  UINT cached_dpi_ = 0;
  bool cached_light_ = false;
  MediaPlaybackState state_;
  TaskbarLabels labels_;
};

TaskbarControls::TaskbarControls(HWND window)
    : impl_(std::make_unique<Impl>(window)) {}

TaskbarControls::~TaskbarControls() = default;

UINT TaskbarControls::TaskbarButtonCreatedMessage() const {
  return impl_->TaskbarButtonCreatedMessage();
}

void TaskbarControls::OnTaskbarButtonCreated() {
  impl_->OnTaskbarButtonCreated();
}

void TaskbarControls::OnThemeOrDpiChanged(UINT dpi) {
  impl_->OnThemeOrDpiChanged(dpi);
}

void TaskbarControls::UpdateState(const MediaPlaybackState& state) {
  impl_->UpdateState(state);
}

void TaskbarControls::UpdateLabels(const TaskbarLabels& labels) {
  impl_->UpdateLabels(labels);
}

const char* TaskbarControls::HandleCommand(WPARAM wparam) const {
  return impl_->HandleCommand(wparam);
}
