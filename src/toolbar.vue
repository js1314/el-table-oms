<template>
	<span>
		<template v-for="(toolbar, key) in toolbars">
			<el-button
				v-if="toolbar.show"
				:key="key"
				:type="toolbar.type"
				:icon="toolbar.icon"
				:disabled="toolbar.disabled"
				@click.stop="handleToolbar(toolbar)"
			>
				{{ toolbar.text }}
			</el-button>
		</template>
	</span>
</template>

<script>
export default {
	props: {
		admin: Object,
		selectedRows: Array
	},
	watch: {
		selectedRows() {
			this._initToolbars()
		}
	},
	data() {
		return {
			toolbars: [],
			publics: [
				'insert',
				// 'exPort', 'imPort',
				'removeBatch'
			]
			// importing: false,
			// exporting: false
		}
	},
	methods: {
		handleInsert() {
			this.admin._insertView()
		},
		// handleImport() {},
		// handleExport() {},
		handleRemoveBatch() {
			return this.admin.handleWrite('removeBatch', null, true, null, true)
		},
		handleToolbar(toolbar) {
			if (toolbar.custom) {
				this.admin.handleButton(toolbar)
			} else {
				let method = 'handle' + toolbar._public.ucfirst()
				this[method](toolbar)
			}
		},
		async _initToolbars() {
			let _this = this.admin
			let toolbars = []
			for (let i = 0, l = this.publics.length; i < l; i++) {
				let prop = this.publics[i]
				let data = await _this.prop(prop, this.selectedRows)
				data._public = prop
				toolbars.push(data)
			}
			for (let i = 0, l = _this.toolbars.length; i < l; i++) {
				await this._addToolbar(_this.toolbars[i], toolbars)
			}
			toolbars.sort((prev, next) => (prev.sort || 50) - next.sort)
			this.toolbars = toolbars
		},
		async _addToolbar(toolbar, toolbars) {
			if (!toolbar) {
				console.warn('AdminTable: toolbar missinng')
			} else if (Object.isObject(toolbar)) {
				toolbar.custom = true
				toolbars.push(toolbar)
			} else if (Function.isFunction(toolbar)) {
				await this._addToolbar(toolbar(this.selectedRows, this.admin), toolbars)
			} else if (Object.isPromise(toolbar)) {
				let result = await toolbar
				await this._addToolbar(result, toolbars)
			} else if (Object.isArray(toolbar)) {
				for (let i = 0, l = toolbar.length; i < l; i++) {
					await this._addToolbar(toolbar[i], toolbars)
				}
			}
		}
	},
	mounted() {
		this._initToolbars()
	}
}
</script>
