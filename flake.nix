{
  description = "Subpar Editor - A lightweight IDE built with Electron, React, and Monaco Editor";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs {
          inherit system;
        };
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Node.js and package management
            nodejs_20
            nodePackages.npm

            # Build tools for native dependencies (node-pty)
            python3
            pkg-config
            gnumake
            gcc

            # Electron runtime dependencies
            electron

            # Libraries needed for Electron
            libGL
            libGLU
            xorg.libX11
            xorg.libXext
            xorg.libXi
            xorg.libXtst
            xorg.libXrandr
            xorg.libXcursor
            xorg.libXScrnSaver
            xorg.libxcb
            libxkbcommon
            gtk3
            glib
            dbus
            at-spi2-atk
            cups
            expat
            nspr
            nss
            alsa-lib
            cairo
            pango
            gdk-pixbuf
            atk
            mesa

            # Development utilities
            git
          ];

          shellHook = ''
            echo "🚀 Subpar Editor development environment loaded!"
            echo ""
            echo "Available commands:"
            echo "  npm install      - Install dependencies"
            echo "  npm run dev      - Start development server"
            echo "  npm run build    - Build for production"
            echo ""
            echo "Node version: $(node --version)"
            echo "npm version: $(npm --version)"

            # Set up npm to work properly with native modules
            export npm_config_build_from_source=true

            # Electron needs these
            export ELECTRON_OVERRIDE_DIST_PATH="${pkgs.electron}/bin/"

            # Help node-gyp find Python
            export PYTHON="${pkgs.python3}/bin/python"
          '';

          # Set LD_LIBRARY_PATH for runtime
          LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath (with pkgs; [
            libGL
            libGLU
            xorg.libX11
            xorg.libXext
            gtk3
            glib
            dbus
            nspr
            nss
            alsa-lib
            cups
            cairo
            pango
            gdk-pixbuf
            atk
            mesa
            libxkbcommon
          ]);
        };
      }
    );
}
