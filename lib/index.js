const json2php = require('json2php');
const webpack = require('webpack');
const {RawSource} = webpack.sources;
const {createHash} = webpack.util;

class WordpressStyleHashWebpackPlugin {
	constructor(options) {}

	stringify(asset) {
		return `<?php return ${json2php(JSON.parse(JSON.stringify(asset)))};\n`;
	}

	apply(compiler) {
		compiler.hooks.thisCompilation.tap(
			this.constructor.name,
			(compilation) => {
				compilation.hooks.processAssets.tap(
					{
						name: this.constructor.name,
						stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ANALYSE
					},
					() => this.addAssets(compilation)
				);
			}
		);
	}

	addAssets(compilation) {
		const entrypointChunks = new Set();

		for (const entrypoint of compilation.entrypoints.values()) {
			for (const chunk of entrypoint.chunks) {
				entrypointChunks.add(chunk);
			}
		}

		for (const chunk of entrypointChunks) {
			const chunkFiles = Array.from(chunk.files);

			const chunkCSSFile = chunkFiles.find((f) => /\.css$/i.test(f));

			if (!chunkCSSFile) {
				continue;
			}

			const {hashFunction, hashDigest, hashDigestLength} = compilation.outputOptions;

			const contentHash = chunkFiles
				.sort()
				.reduce((hash, filename) => {
					const asset = compilation.getAsset(filename);
					return hash.update(asset.source.buffer());
				}, createHash(hashFunction))
				.digest(hashDigest)
				.slice(0, hashDigestLength);

			const assetData = {
				version: contentHash
			};

			let assetFilename = compilation
				.getPath('[file]', {filename: chunkCSSFile})
				.replace(/\.css$/i, '.asset.php');

			compilation.assets[assetFilename] = new RawSource(this.stringify(assetData));

			chunk.files['add'](assetFilename);
		}
	}
}

module.exports = WordpressStyleHashWebpackPlugin;
