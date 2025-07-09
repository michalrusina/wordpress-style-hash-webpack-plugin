# Wordpress Style Hash Webpack Plugin

This webpack plugin adds an asset file for each CSS entry point that declares an object with the current version calculated for the current source code.
This allows CSS bundles produced by webpack to leverage WordPress style file versioning without an error-prone process of manually maintaining a version number.

## Installation

Install the module

```bash
npm install michalrusina/wordpress-style-hash-webpack-plugin --save-dev
```

**Note**: This package requires Node.js 18.0.0 or later. It also requires webpack 5 and newer. It is not compatible with older versions.

## Usage

### Webpack

Use this plugin as you would other webpack plugins:

```js
// webpack.config.js
const WordpressStyleHashWebpackPlugin = require('wordpress-style-hash-webpack-plugin');

module.exports = {
	// ...
	plugins: [new WordpressStyleHashWebpackPlugin()],
};
```

Each CSS entry point in the webpack bundle will include an asset file that contains the unique version hash calculated based on the file content.

For example:

```css
// Source file style.css
.foo:after { content: 'bar'; }

// Webpack will produce the output build/style.dd4c2dc50d046ed9d4c063a7ca95702f.css
.foo:after { content: 'bar'; }

// Webpack will also produce build/style.asset.php containing file version
<?php return array('version' => 'dd4c2dc50d046ed9d4c063a7ca95702f'); ?>
```


This can be used to enqueue stylesheets like this:

```php
<?php

$asset_data = require(__DIR__ . '/build/style.asset.php');

wp_register_style(
	'style_handle',
	'build/widgetStyle.css',
	null,
	asset_data['version']
);

wp_enqueue_style('style_handle');

?>
```

**Note:** Multiple instances of the plugin are not supported and may produced unexpected results. This plugin uses the same naming as `DependencyExtractionWebpackPlugin`, this may cause filename conflicts if you have `foo.js` and `foo.css` in one directory.

#### Options

The plugin can be configured with an options object:

```js
new WordpressStyleHashWebpackPlugin({
    addHash: true,
});
```

- `addHash` (`boolean`, default: `true`)
When false, the hash will not be added to the output filename, and will be set to `null` in `*.asset.php`. This can be useful if you prefer to manage the filename without the hash or when using [BrowserSync](https://browsersync.io/) with CSS injection.
