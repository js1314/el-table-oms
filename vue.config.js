module.exports = {
	outputDir: 'dist',
	productionSourceMap: false,
	css: { extract: false },
	configureWebpack: {
		externals: {
			'element-ui': 'ELEMENT'
		}
	}
}
