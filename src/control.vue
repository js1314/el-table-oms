<template>
	<span v-if="control.showButtons" class="control">
		<template v-for="(btn, key) in [button].concat(buttons)">
			<el-button v-if="btn.show" :key="key" :type="btn.type" :icon="btn.icon" :disabled="btn.disabled" @click.stop="handleButton(btn)">
				{{ btn.text }}
			</el-button>
		</template>
	</span>
	<div v-else class="control" @mouseenter="drawer = hasButton" @mouseleave="drawer = false">
		<el-button
			v-if="button.show"
			ref="button"
			:type="button.type"
			:icon="button.icon"
			:disabled="button.disabled"
			@click.stop="handleButton(button)"
		>
			<span>{{ button.text }}</span>
			<span v-if="hasButton" style="margin: 0 0 0 5px">...</span>
		</el-button>
		<el-drawer
			v-if="hasButton"
			class="control-drawer"
			:visible.sync="drawer"
			size="auto"
			:close-on-press-escape="false"
			:withHeader="false"
			:modal="false"
		>
			<div class="control-drawer-body" :style="padding">
				<el-button
					v-for="(btn, key) in buttons.concat(button)"
					:key="key"
					:type="btn.type"
					:icon="btn.icon"
					:disabled="btn.disabled"
					@click.stop="handleButton(btn)"
				>
					<span>{{ btn.text }}</span>
					<i v-if="hasButton && btn.text === button.text" class="el-icon-arrow-right el-icon--right" style="margin: 0 0 0 5px"></i>
				</el-button>
			</div>
		</el-drawer>
	</div>
</template>

<script>
export default {
	props: {
		row: Object,
		admin: Object,
		control: Object
	},
	watch: {
		row() {
			this._initButtons()
		}
	},
	computed: {
		hasButton() {
			return !this.control.showButtons && this.buttons.length > 0
		}
	},
	data() {
		return {
			drawer: false,
			button: {},
			padding: {},
			buttons: [],
			publics: ['detail', 'update', 'insertChild', 'download', 'remove']
		}
	},
	methods: {
		handleInsertChild(editor) {
			let _this = this.admin
			if (_this.redirect(editor, this.row)) {
				_this.row = Object.clone(this.row)
				_this.editor = {
					...editor,
					show: true,
					loaded: true,
					action: 'insert'
				}
			}
		},
		handleRemove(editor) {
			let _this = this.admin
			_this.handleWrite('remove', Object.clone(this.row), true, null, true)
		},
		handleUpdate(editor) {
			let _this = this.admin
			if (_this.redirect(editor, this.row)) {
				_this.editor = {
					...editor,
					show: true,
					loaded: false,
					action: 'update'
				}
				let resolve = () => {
					_this.editor.loaded = true
					_this.editor.component = editor.component
				}
				if (!editor.renew) {
					_this.row = Object.clone(this.row)
					resolve()
				} else if (Function.isFunction(editor.renew)) {
					_this.row = {}
					_this._promiseRead(editor.renew(this.row, this), this.row, 'detail', editor, resolve)
				} else {
					_this.row = {}
					_this.handleRead('detail', this.row).then(resolve)
				}
			}
		},
		handleDetail(editor) {
			let _this = this.admin
			if (_this.redirect(editor, this.row)) {
				_this.row = Object.clone(this.row)
				_this.editor = {
					...editor,
					show: true,
					loaded: false,
					action: 'detail'
				}
				let resolve = () => {
					_this.editor.loaded = true
					_this.editor.component = editor.component
				}
				if (Function.isFunction(editor.handle)) {
					_this._promiseRead(editor.handle(this.row, _this), this.row, 'detail', editor, resolve)
				} else {
					resolve()
				}
			}
		},
		handleDownload(editor) {
			let alink = document.createElement('a')
			let file = this.row[editor.prop]
			alink.href = file
			alink.setAttribute('download', file.split('/').pop())
			document.body.appendChild(alink)
			alink.click()
			document.body.removeChild(alink)
		},
		handleButton(button) {
			if (button.custom) {
				this.admin.handleButton(button, this.row)
			} else {
				let method = 'handle' + button._public.ucfirst()
				this[method](button)
			}
		},
		async _initButtons() {
			let _this = this.admin
			let buttons = []
			for (let i = 0, l = this.publics.length; i < l; i++) {
				let prop = this.publics[i]
				let data = await _this.prop(prop, this.row)
				data._public = prop
				buttons.push(data)
			}
			for (let i = 0, l = _this.buttons.length; i < l; i++) {
				await this._addButton(_this.buttons[i], buttons)
			}
			buttons.sort((prev, next) => (prev.sort || 50) - next.sort)
			this.buttons = buttons.filter((button) => button.show)
			this.button = this.buttons.shift() || {}
			this.hasButton && this.$nextTick(() => (this.padding = { padding: '0 ' + (150 - this.$refs.button.$el.offsetWidth) / 2 + 'px' }))
		},
		async _addButton(button, buttons) {
			if (!button) {
				console.warn('AdminTable: button missinng')
			} else if (Object.isObject(button)) {
				button.custom = true
				buttons.push(button)
			} else if (Function.isFunction(button)) {
				await this._addButton(button(this.row, this.admin), buttons)
			} else if (Object.isPromise(button)) {
				let result = await button
				await this._addButton(result, buttons)
			} else if (Object.isArray(button)) {
				for (let i = 0, l = button.length; i < l; i++) {
					await this._addButton(button[i], buttons)
				}
			}
		}
	},
	mounted() {
		if (this.row) {
			this._initButtons()
		}
	}
}
</script>

<style lang="scss" scoped>
.control {
	display: flex;
	flex-direction: row;
	justify-content: center;
	overflow-x: auto;
	&-drawer {
		position: absolute;
		overflow: visible;
		&-body {
			display: flex;
			align-items: center;
			height: 100%;
		}
	}
}
</style>
