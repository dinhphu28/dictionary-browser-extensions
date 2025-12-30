# DINHPHU28 Dictionary Browser Extensions

```asciiarmor
.
├── README.md
├── build.js
└── src
    ├── chrome
    │   ├── background.js
    │   ├── content
    │   │   └── lookup.js
    │   └── manifest.json
    ├── firefox
    │   ├── background.js
    │   ├── content
    │   │   └── lookup.js
    │   └── manifest.json
    └── share
        ├── CustomStyle.css
        ├── DefaultStyle.css
        └── content
            ├── listeners.js
            ├── popup.js
            ├── render.js
            ├── shim.js
            ├── state.js
            └── toggle.js
```

## Build

```sh
node build.js
```

Output build is in `dist/`
