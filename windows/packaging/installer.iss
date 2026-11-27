; Windows 安装包（Inno Setup 6）。CI 里这样用：
;   iscc /DAppVersion=3.0.0 /DSourceDir=<Release 目录的绝对路径> windows\packaging\installer.iss

#ifndef AppVersion
  #define AppVersion "0.0.0"
#endif
#ifndef SourceDir
  #define SourceDir "..\..\build\windows\x64\runner\Release"
#endif
#define AppUserModelId "0xTangerine.YesPlayMusic"

[Setup]
AppId={{6F2C3E2A-6E1B-4C55-9C2A-3D2B0E9A7B10}
AppName=YesPlayMusic
AppVersion={#AppVersion}
AppPublisher=0xTangerine
AppPublisherURL=https://github.com/qier222/YesPlayMusic
AppSupportURL=https://github.com/qier222/YesPlayMusic/issues
AppUpdatesURL=https://github.com/qier222/YesPlayMusic/releases
DefaultDirName={autopf}\YesPlayMusic-3
DefaultGroupName=YesPlayMusic
DisableProgramGroupPage=yes
LicenseFile=..\..\LICENSE
OutputDir=..\..\dist
OutputBaseFilename=YesPlayMusic-{#AppVersion}-windows-x64-setup
SetupIconFile=..\runner\resources\app_icon.ico
UninstallDisplayIcon={app}\YesPlayMusic.exe
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
ArchitecturesAllowed=x64compatible
ArchitecturesInstallIn64BitMode=x64compatible
PrivilegesRequiredOverridesAllowed=dialog
CloseApplications=yes

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: "{#SourceDir}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{autoprograms}\YesPlayMusic"; Filename: "{app}\YesPlayMusic.exe"; AppUserModelID: "{#AppUserModelId}"
Name: "{autodesktop}\YesPlayMusic"; Filename: "{app}\YesPlayMusic.exe"; AppUserModelID: "{#AppUserModelId}"; Tasks: desktopicon

[Registry]
Root: HKCU; Subkey: "Software\Classes\AppUserModelId\{#AppUserModelId}"; ValueType: string; ValueName: "DisplayName"; ValueData: "YesPlayMusic"; Flags: uninsdeletekey
Root: HKCU; Subkey: "Software\Classes\AppUserModelId\{#AppUserModelId}"; ValueType: string; ValueName: "IconUri"; ValueData: "{app}\data\flutter_assets\assets\app_icon.png"; Flags: uninsdeletekey

[Run]
Filename: "{app}\YesPlayMusic.exe"; Description: "{cm:LaunchProgram,YesPlayMusic}"; Flags: nowait postinstall skipifsilent
