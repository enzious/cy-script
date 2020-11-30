# Building

```sh
npm install
npm run build:release
```

# Installation

Put either the files from `build/debug` or `build/release` into the channel's settings to pull latest production build:

## CHANNEL.js
```javascript
$.getScript('<publicPath>/cy-script.js', function () {
  new CyScript();
});
```

## CHANNEL.css
```css
@import url("<publicPath>/cy-script.css");
```