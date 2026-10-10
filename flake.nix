{
  description = "A Nix-flake-based Node.js development environment";

  # The last nixpkgs revision that still ships Node.js 16 (see "engines" in package.json).
  inputs.nixpkgs.url = "github:nixos/nixpkgs/a71323f68d4377d12c04a5410e214495ec598d4c";

  outputs =
    { self, ... }@inputs:

    let
      supportedSystems = [
        "x86_64-linux"
        "aarch64-linux"
        "aarch64-darwin"
      ];
      forEachSupportedSystem =
        f:
        inputs.nixpkgs.lib.genAttrs supportedSystems (
          system:
          f {
            inherit system;
            pkgs = import inputs.nixpkgs {
              inherit system;
              overlays = [ inputs.self.overlays.default ];
              # Node.js 16 is EOL and marked insecure.
              config.permittedInsecurePackages = [ "nodejs-16.20.2" ];
            };
          }
        );
    in
    {
      overlays.default = final: prev: rec {
        nodejs = prev.nodejs_16;
        yarn = (prev.yarn.override { inherit nodejs; });
      };

      devShells = forEachSupportedSystem (
        { pkgs, system }:
        {
          default = pkgs.mkShell {
            packages =
              with pkgs;
              [
                nodejs
                yarn
                git
              ]
              ++ lib.optionals stdenv.isLinux [
                # deb/rpm/pacman targets; electron-builder's bundled fpm is x86-only.
                fpm
                rpm
                libarchive
              ]
              ++ lib.optionals stdenv.isDarwin [ darwin.apple_sdk.frameworks.AppKit ];

            env = {
              # nixpkgs builds Node.js 16 against OpenSSL 3, which rejects the md4
              # hash webpack 4 uses ("error:0308010C:digital envelope routines::unsupported").
              NODE_OPTIONS = "--openssl-legacy-provider";
            }
            // pkgs.lib.optionalAttrs pkgs.stdenv.isLinux { USE_SYSTEM_FPM = "true"; };
          };
        }
      );
    };
}
