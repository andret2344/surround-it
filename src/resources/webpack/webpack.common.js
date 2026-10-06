const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
	mode: 'production',
	entry: {
		content: path.resolve(__dirname, '..', '..', 'main', 'typescript', 'content.ts'),
		popup: path.resolve(__dirname, '..', '..', 'main', 'typescript', 'popup.ts'),
		options: path.resolve(__dirname, '..', '..', 'main', 'typescript', 'options.ts')
	},
	output: {
		clean: true
	},
	resolve: {
		extensions: ['.ts', '.js']
	},
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				loader: 'ts-loader',
				exclude: /node_modules/
			},
			{
				test: /\.s[ac]ss$/,
				use: [
					'style-loader',
					'css-loader',
					'sass-loader'
				]
			}
		]
	},
	plugins: [
		new CopyWebpackPlugin({
			patterns: [
				{from: 'src/resources/assets/icons', to: 'icons'},
				{from: 'src/resources/assets/_locales', to: '_locales'},
				{from: 'LICENSE.txt'},
				{from: 'NOTICE'}
			]
		}),
		new HtmlWebpackPlugin({
			template: 'src/main/html/popup.html',
			filename: 'popup.html',
			inject: 'body',
			chunks: ['popup']
		}),
		new HtmlWebpackPlugin({
			template: 'src/main/html/options.html',
			filename: 'options.html',
			inject: 'body',
			chunks: ['options']
		})
	]
};
