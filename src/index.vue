<template>
	<!--查看的视图-->
	<el-container v-if="view === 'select'" class="el-table-oms el-table-oms__select" v-loading.lock="loading">
		<el-aside v-if="aside.show" style="width: 240px">
			<div class="el-table-oms__aside" v-loading="aside.loading">
				<div class="el-table-oms__aside-form">
					<el-input
						v-model="asideKeyword"
						:placeholder="aside.placeholder"
						@blur="handleAsideSearch()"
						@keyup.native.enter="handleAsideSearch()"
						@clear="handleAsideSearch()"
						clearable
					>
					</el-input>
				</div>
				<div class="el-table-oms__aside-list" :style="asideHeightStyle">
					<el-link
						v-for="row in asideRows"
						:key="row.id"
						type="primary"
						class="el-table-oms__aside-item"
						:class="{ active: asideRow[aside.filterField] == row[aside.filterField] }"
						@click="handleAsideFilter(row)"
						:underline="false"
					>
						{{ row.name }}
					</el-link>
				</div>
				<el-row v-if="hasAsidePage" ref="asidePagination" type="flex" justify="center" style="margin-top: 16px">
					<el-pagination
						:total="asideTotal"
						:current-page.sync="asidePageNum"
						:page-size="asidePageSize"
						:pager-count="5"
						@current-change="handleAsideSearch({ [page.pageNumName]: $event }, false)"
						layout="prev,pager,next"
						background
						small
					/>
				</el-row>
			</div>
		</el-aside>
		<el-main class="el-table-oms__main">
			<el-tabs
				v-if="tabList.length"
				v-model="tabName"
				@tab-click="handleTabClick"
				type="border-card"
				:class="{ 'el-table-oms__tabs': !tabCollapse }"
			>
				<el-tab-pane v-for="(tab, index) in tabList" :key="index" :label="tab.desc" :name="tab.name"></el-tab-pane>
				<transition name="el-collapse-transition">
					<component
						v-if="!loading"
						v-show="tabCollapse"
						:is="search.component"
						:query="query"
						:config="search"
						:admin="admin"
						:dicts="dicts"
					/>
				</transition>
				<a v-if="tabCollapse" href="#" class="el-table-oms__collapse show" title="点击收起搜索拦" @click="handleTabCollapse">
					<i class="el-icon-caret-top"></i>
				</a>
				<a v-else href="#" class="el-table-oms__collapse hide" title="点击展开搜索拦" @click="handleTabCollapse">
					<i class="el-icon-caret-bottom"></i>
				</a>
			</el-tabs>
			<template v-else-if="search.show && search.placement === 'top'">
				<el-card v-if="search.card" :class="{ 'el-table-oms__tabs': !tabCollapse }" style="position: relative">
					<transition name="el-collapse-transition">
						<component
							v-if="!loading"
							v-show="tabCollapse"
							:is="search.component"
							:query="query"
							:config="search"
							:admin="admin"
							:dicts="dicts"
						/>
					</transition>
					<a v-if="tabCollapse" href="#" class="el-table-oms__collapse show" title="点击收起搜索拦" @click="handleTabCollapse">
						<i class="el-icon-caret-top"></i>
					</a>
					<a v-else href="#" class="el-table-oms__collapse hide" title="点击展开搜索拦" @click="handleTabCollapse">
						<i class="el-icon-caret-bottom"></i>
					</a>
				</el-card>
				<component v-else-if="!loading" :is="search.component" :query="query" :config="search" :admin="admin" :dicts="dicts" />
			</template>
			<el-row class="el-table-oms__toobars" type="flex">
				<div class="left">
					<toolbar v-if="!loading" :admin="admin" :selectedRows="selectedRows" />
				</div>
				<div v-if="search.show && search.placement === 'right'" class="right">
					<component v-if="!loading" :is="search.component" :query="query" :config="search" :admin="admin" :dicts="dicts" />
				</div>
			</el-row>
			<!-- v-bind:$props -->
			<el-table
				ref="table"
				class="el-table-oms__table"
				:data="rows"
				:border="border"
				:style="tableWidthStyle"
				:height="tableHeight"
				:row-key="primaryKey"
				:span-method="handleSpanMethod"
				:load="handleLoad"
				:lazy="lazy"
				:default-expand-all="!lazy"
				tooltip-effect="dark"
				@sort-change="handleSortChange"
				@current-change="setCurrentRow"
				@selection-change="setSelectedRows"
				@row-click="handleRowClick"
				@cell-dblclick="handleCellDblClick"
				@cell-click="handleCellClick"
				@expand-change="handleExpandChange"
				highlight-current-row
				fit
			>
				<!--多选-->
				<el-table-column
					v-if="selectable && multiple"
					type="selection"
					width="50"
					align="center"
					fixed="left"
					reserve-selection
				></el-table-column>
				<!--单选-->
				<el-table-column v-else-if="selectable" width="50" align="center" fixed="left">
					<template slot-scope="scope">
						<el-radio :label="currentRow[primaryKey]" v-model="scope.row[primaryKey]"></el-radio>
					</template>
				</el-table-column>
				<!--展开-->
				<el-table-column v-if="expand.show" type="expand" fixed="left">
					<div slot-scope="scope" v-loading="!expandRows[scope.row[primaryKey]].loaded">
						<component
							v-if="expandRows[scope.row[primaryKey]].loaded"
							:is="expandRows[scope.row[primaryKey]].component"
							:selectedRows="selectedRows"
							:admin="admin"
							:dicts="dicts"
							:row="row"
							@expand-selection-change="handleExpandSelectionChange"
						/>
					</div>
				</el-table-column>
				<el-table-column
					v-for="(column, index) in columns"
					:key="index"
					:label="column.title"
					:prop="column.prop"
					:type="column.type"
					:min-width="column.minWidth || 50"
					:show-overflow-tooltip="column.tooltip"
					:align="column.align || 'center'"
					:header-align="column.headerAlign || 'center'"
					:width="column.width || ''"
					:class-name="column.className || ''"
					:render-header="column.render || null"
					:sortable="column.sortable || false"
					:sort-by="column.sortBy || null"
				>
					<template slot-scope="{ row }">
						<!--查看图片-->
						<el-tooltip v-if="column.image" content="点击查看原图">
							<el-image
								v-if="row[column.prop]"
								class="el-table-oms__image"
								:src="row[column.prop]"
								:preview-src-list="row[column.prop].split(',')"
								:z-index="3000"
							></el-image>
							<span v-else>-</span>
						</el-tooltip>
						<!--查看图片或视频-->
						<template v-else-if="column.media">
							<template v-if="row[column.prop] != null">
								<el-tooltip v-if="['gif', 'jpg', 'png'].includes(row[column.prop].split('.').end())" content="点击查看原图">
									<el-image
										class="el-table-oms__media"
										:src="row[column.prop]"
										:preview-src-list="row[column.prop].split(',')"
										:z-index="3000"
									></el-image>
								</el-tooltip>
								<video v-else class="el-table-oms__media" :src="row[column.prop]" controls></video>
							</template>
							<span v-else>-</span>
						</template>
						<!--查看二维码-->
						<el-link v-else-if="column.qrcode" type="primary" @click="showQRCode(row)">点击查看</el-link>
						<!--链接查看详情-->
						<template v-else-if="column.link">
							<el-tooltip v-if="row[column.prop] != null" content="点击查看详情">
								<el-link type="primary">
									<!--格式化-->
									<span v-if="column.formatter" v-html="column.formatter(row, column, row[column.prop], index)"></span>
									<!--字典翻译-->
									<span v-else-if="column.dict">{{ dicts[column.dictProp || column.prop][row[column.prop]] }}</span>
									<!--正常-->
									<span v-else>{{ row[column.prop] }}</span>
								</el-link>
							</el-tooltip>
							<span v-else>-</span>
						</template>
						<!--自定义组件-->
						<component
							v-else-if="column.component"
							:is="column.component"
							v-bind="column.componentProps"
							:key="index"
							:admin="admin"
							:dicts="dicts"
							:row="row"
						/>
						<!--双击修改-->
						<el-tooltip v-else-if="column.editable" content="双击修改该值">
							<!--格式化-->
							<span v-if="column.formatter" v-html="column.formatter(row, column, row[column.prop], index)"></span>
							<!--null-->
							<span v-else-if="row[column.prop] == null">-</span>
							<!--字典翻译-->
							<span v-else-if="column.dict">{{ dicts[column.dictProp || column.prop][row[column.prop]] }}</span>
							<!--正常-->
							<span v-else>{{ row[column.prop] }}</span>
						</el-tooltip>
						<!--其它-->
						<template v-else>
							<!--格式化-->
							<span v-if="column.formatter" v-html="column.formatter(row, column, row[column.prop], index)"></span>
							<!--null-->
							<span v-else-if="row[column.prop] == null">-</span>
							<!--字典翻译-->
							<span v-else-if="column.dict">{{ dicts[column.dictProp || column.prop][row[column.prop]] }}</span>
							<!--正常-->
							<span v-else>{{ row[column.prop] }}</span>
						</template>
					</template>
				</el-table-column>
				<el-table-column
					v-if="control.show"
					class-name="el-table-oms__control"
					:label="control.title"
					:prop="control.prop"
					:align="control.align || 'center'"
					:width="control.showButtons ? control.width || '' : '150px'"
				>
					<template slot="header">
						<span>{{ control.title }}</span>
						<el-switch
							ref="controlSwitch"
							:value="control.showButtons"
							:active-value="true"
							:inactive-value="false"
							@change="handleControlSwitch"
							style="margin-left: 5px"
						></el-switch>
					</template>
					<template slot-scope="{ row }">
						<control :row="row" :admin="admin" :control="control" />
					</template>
				</el-table-column>
			</el-table>
			<el-row v-if="hasPage" ref="pagination" type="flex" justify="center">
				<el-pagination
					:total="total"
					:current-page.sync="pageNum"
					:page-size.sync="pageSize"
					:page-sizes="page.pageSizes"
					:layout="page.layout"
					@size-change="handleSearch({ [page.pageSizeName]: $event }, false, false)"
					@current-change="handleSearch({ [page.pageNumName]: $event }, false, true)"
					background
				/>
			</el-row>
		</el-main>
		<el-dialog
			class="el-table-oms__dialog"
			:visible.sync="editor.show"
			:width="editor.width"
			:class="editor.class"
			:style="editor.style"
			:title="editor.title || editor.text"
			:fullscreen="editor.fullscreen"
			:top="editor.top || '5vh'"
			:lock-scroll="!!editor.lockScroll"
			:close-on-click-modal="false"
			:close-on-press-escape="false"
			@closed="hideEditor"
			append-to-body
		>
			<!-- 不能使用，会导致component重复渲染 -->
			<!-- :destroy-on-close="!editor.cache" -->
			<component
				v-if="editor.cache || editor.loaded"
				v-show="editor.loaded"
				v-bind="editor.componentProps"
				:key="editor.title"
				ref="editor"
				class="el-table-oms__dialog-com"
				:is="editor.component"
				:action="editor.action"
				:admin="admin"
				:view="view"
				:row.sync="row"
				:rows.sync="rows"
				:dicts="dicts"
				@close="hideEditor"
				@refresh="handleRefresh"
				@cancel="handleCancel"
			/>
		</el-dialog>
		<el-image-viewer v-if="imageViewer" :url-list="imageViewer" :z-index="3000" :on-close="hideViewer" />
	</el-container>
	<!--添加或编辑的视图-->
	<div v-else v-show="editor.show" v-loading.lock="loading" ref="table" class="el-table-oms el-table-oms__scroll" :style="tableHeightStyle">
		<div style="padding: 16px 16px 0 16px">
			<component
				v-show="editor.loaded"
				ref="editor"
				:is="editor.component"
				:action="editor.action"
				:admin="admin"
				:view="view"
				:row="row"
				:rows="rows"
				:dicts="dicts"
				@close="hideEditor"
				@refresh="handleRefresh"
				@cancel="handleCancel"
			/>
		</div>
	</div>
</template>

<script>
import control from './control.vue'
import toolbar from './toolbar.vue'
import defaults from './defaults.js'
import QRCode from './qrcode.js'
import ElImageViewer from 'element-ui/packages/image/src/image-viewer'

export default {
	name: 'ElTableOms',
	components: { control, toolbar, ElImageViewer },
	props: {
		border: {
			type: Boolean,
			default: true
		},
		tooltip: {
			type: Boolean,
			default: true
		},
		primaryKey: {
			type: String,
			default: 'id'
		},
		columns: {
			type: Array,
			default: () => []
		},
		buttons: {
			type: Array,
			default: () => []
		},
		toolbars: {
			type: Array,
			default: () => []
		},
		width: {
			type: [Number, String],
			default: '100%'
		},
		height: {
			type: [Number, String],
			default: '100%'
		},
		offsetHeight: {
			type: Number,
			default: 0
		},
		control: {
			type: Object,
			default: defaults.control
		},
		insert: {
			type: [Object, Function],
			default: defaults.insert
		},
		insertChild: {
			type: [Object, Function],
			default: defaults.insertChild
		},
		download: {
			type: [Object, Function],
			default: defaults.download
		},
		remove: {
			type: [Object, Function],
			default: defaults.remove
		},
		removeBatch: {
			type: [Object, Function],
			default: defaults.removeBatch
		},
		update: {
			type: [Object, Function],
			default: defaults.update
		},
		detail: {
			type: [Object, Function],
			default: defaults.detail
		},
		exPort: {
			type: [Object, Function],
			default: defaults.exPort
		},
		imPort: {
			type: [Object, Function],
			default: defaults.imPort
		},
		search: {
			type: Object,
			default: defaults.search
		},
		page: {
			type: Object,
			default: defaults.page
		},
		displayMode: {
			type: Object,
			default: defaults.displayMode
		},
		rowspan: {
			type: Object,
			default: defaults.rowspan
		},
		colspan: {
			type: Object,
			default: defaults.colspan
		},
		selectable: {
			type: Boolean,
			default: false
		},
		multiple: {
			type: Boolean,
			default: true
		},
		action: {
			type: String,
			default: ''
		},
		load: {
			type: Function,
			default: null
		},
		transform: {
			type: Function,
			default: defaults.transform
		},
		tabs: {
			type: [Array, Function],
			default: () => []
		},
		tab: {
			type: String,
			default: 'all'
		},
		dict: {
			type: [Object, Function],
			default: defaults.dict
		},
		qrcode: {
			type: Object,
			default: defaults.qrcode
		},
		aside: {
			type: Object,
			default: defaults.aside
		},
		expand: {
			type: Object,
			default: defaults.expand
		},
		lazy: {
			type: Boolean,
			default: true
		},
		rowClick: {
			type: Function,
			default: null
		}
	},
	data() {
		//对象参数默认值初始化
		this._initDefaults()
		return {
			view: 'select',
			admin: this,
			row: {},
			rows: [],
			dicts: {},
			cache: {},
			total: 0,
			editor: {},
			button: {},
			errorCode: 0,
			errorMsg: '',
			loading: true,
			submitting: false,
			selectedRows: [],
			tableHeight: null, //初始值必须为null,否则el-table报错
			heightTimer: [],
			hasLazyNode: false,
			tabList: [],
			tabName: this.tab,
			activeTab: { query: {} },
			pageNum: this.page.pageNum,
			pageSize: this.page.pageSize,
			query: { ...this.search.query },
			currentRow: {},
			tabCollapse: true,
			asideRow: {},
			asideRows: [],
			expandRows: {},
			asideTotal: 0,
			asideQuery: {},
			asidePageNum: this.aside.pageNum,
			asidePageSize: this.aside.pageSize,
			asideLoading: false,
			asideKeyword: '',
			asideHeight: '',
			imageViewer: null
		}
	},
	computed: {
		hasPage() {
			return this.page.show && this.total > this.page.pageSizes[0]
		},
		tableHeightStyle() {
			return this.tableHeight ? { height: this.tableHeight } : {}
		},
		tableWidthStyle() {
			return this.width ? { width: this.width } : {}
		},
		hasAsidePage() {
			return this.aside.page && this.asideTotal > this.page.pageSizes[0]
		},
		asideHeightStyle() {
			return this.asideHeight ? { height: this.asideHeight } : {}
		}
	},
	methods: {
		//异步prop
		prop(key, row) {
			return new Promise((resolve) => {
				let promise
				if (!defaults[key]) {
					resolve({})
				} else if (Object.isObject(this[key])) {
					resolve(Object.replace(defaults[key](), this[key]))
				} else if (Array.isArray(this[key])) {
					resolve(this[key])
				} else if (!Function.isFunction(this[key]) || !(promise = this[key](row || this.row, this))) {
					resolve({})
				} else if (Object.isObject(promise)) {
					resolve(Object.replace(defaults[key](), promise))
				} else if (Array.isArray(promise)) {
					resolve(promise)
				} else if (Object.isPromise(promise)) {
					promise.then((data) => resolve(Object.replace(defaults[key](), data))).catch(() => resolve({}))
				} else {
					resolve({})
				}
			})
		},
		redirect(editor, row) {
			if (!editor.prop && editor.show == null) return editor.handle(row || this.row, this), false
			let path = editor.redirect
			let redirect = this.$route.path
			if (!path || path == redirect) return true
			let vKey = this.primaryKey
			let key = editor.queryKey || vKey
			let query = row ? { [key]: row[vKey], redirect } : { redirect }
			this.$router.push({ path, query })
			return false
		},
		showQRCode(row) {
			this.showViewer(this._createQRCode(row))
		},
		showViewer(v) {
			this.imageViewer = [].concat(v)
		},
		hideViewer() {
			this.imageViewer = null
		},
		hideEditor() {
			let editor = this.editor
			this.loading = false
			this.button = {}
			this.dialog = {}
			//先隐藏
			this.editor.show = false
			this.row = {}
			//在渲染结果时在清空editor,防止lockScroll
			editor.cache || this.$nextTick(() => (this.editor = {}))
			this.$emit('close', editor)
		},
		handleTabCollapse() {
			this.tabCollapse = !this.tabCollapse
			this._initHeight()
		},
		handleControlSwitch(v) {
			this.control.showButtons = v
			this.$refs.controlSwitch.value = v
		},
		handleRefresh(action) {
			if (action === 'select' || this.view === 'select') {
				this.hideEditor()
				this.handleSearch({}, false, true)
			} else {
				this.loading = true
				this._initView()
			}
		},
		handleCancel(action) {
			if (action === 'select' || this.view === 'select') {
				this.hideEditor()
			} else {
				//关闭当前菜单
				this.$store.dispatch('tagsView/delView', this.$route)
				this.$router.push(this.$route.query.redirect || this.$route.meta._from || '/')
			}
		},
		handleSave(form, row) {
			let { action, confirm, custom } = this.editor
			return this.handleWrite(action || 'update', row, false, form, confirm, custom, this.editor)
		},
		handleRead(action, row) {
			return new Promise((resolve, reject) => {
				this.prop(action).then((read) => {
					if (Function.isFunction(read.handle)) {
						row = row || this.row
						this._promiseRead(read.handle(row, this), row, action, read, resolve, reject)
					} else {
						resolve()
					}
				})
			})
		},
		handleWrite(action, row, validated, form, confirm, custom, execWrite) {
			this.submitting = true
			return new Promise((resolve, reject) => {
				if (this.loading || (!validated && !this._validateEditor(form))) {
					this.submitting = false
				} else {
					row = row || (action.includes('Batch') ? this.getSelectedPrimaryValues() : this.row)
					if (custom) {
						this._handleWrite(action, this.button, row, confirm, resolve, reject)
					} else if (execWrite) {
						//如果是执行写行为则不在读取配置项，用已读取的editor配置项
						this._handleWrite(action, execWrite, row, confirm, resolve, reject)
					} else {
						this.prop(action, row).then((write) => this._handleWrite(action, write, row, confirm, resolve, reject))
					}
				}
			})
		},
		handleReset(renew) {
			if (renew) {
				this._setQuery({})
				this.handleSelect({}, 'reset')
			} else {
				let form = Component.getChildren(this.$refs.editor, 'ElForm')[0]
				form && form.resetFields()
			}
		},
		handleSelect(query = {}, action = 'select') {
			let handle = this.search.handle
			if (!handle) return null
			this.cache = {}
			this.loading = true
			let { pageNumName, pageSizeName, pageNum, pageSize } = this.page
			let _ = { [pageNumName]: pageNum, [pageSizeName]: pageSize }
			let __ = { ..._, ...query, ...this.search.query, ...this.activeTab.query }
			return this._promiseRead(handle(__, this), __, action, this.search)
		},
		handleSearch(query = {}, keepPage = false, keepSize = false, fromAside = false) {
			let handle = this.search.handle
			if (!handle || this.loading) return null
			this.cache = {}
			this.loading = true
			let { pageNumName, pageSizeName, pageNum, pageSize } = this.page
			let _ = { [pageNumName]: keepPage ? this.pageNum : pageNum, [pageSizeName]: keepSize ? this.pageSize : pageSize }
			let __ = { ...this.query, ..._, ...query }
			return this._promiseRead(handle(__, this), __, 'search', this.search, fromAside ? null : () => this._handleSearch(__))
		},
		handleSortChange({ prop, order, column }) {
			if (order == null) {
				this.handleSearch({}, false, true)
			} else {
				this.handleSearch(
					{ [this.page.sortByName]: column.sortBy || prop, [this.page.sortTypeName]: order === 'descending' ? 'desc' : 'asc' },
					false,
					true
				)
			}
		},
		handleButton(button, row) {
			let { title, confirm, prompt, image, qrcode, resolve, reject } = button
			this.row = row || {}
			this.button = button
			//确认框
			if (confirm) {
				this.$confirm('是否' + title + '？', '提示', {
					confirmButtonText: '是',
					cancelButtonText: '否',
					type: 'warning',
					center: true
				})
					.then(() =>
						this._handleButton()
							.then(resolve)
							.catch(reject)
					)
					.catch(reject)
			}
			//对话框
			else if (prompt) {
				this.$prompt(button.message, button.title, {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					inputValue: row[button.prop],
					inputType: button.inputType,
					inputPattern: button.inputPattern,
					inputValidator: button.inputValidator,
					inputPlaceholder: button.inputPlaceholder,
					inputErrorMessage: button.inputErrorMessage || button.title + '不正确'
				})
					.then(({ value }) => {
						this.row = { [this.primaryKey]: row[this.primaryKey], [button.prop]: value }
						this._handleButton()
							.then(resolve)
							.catch(reject)
					})
					.catch(reject)
			}
			//查看二维码
			else if (qrcode) {
				this.showQRCode(row)
			}
			//查看图片
			else if (image) {
				this._handleButton()
					.then(({ data }) => {
						this.showViewer(data)
						resolve && resolve()
					})
					.catch(reject)
			}
			//其它
			else {
				this._handleButton()
					.then(resolve)
					.catch(reject)
			}
		},
		getCurrentRow() {
			return this.currentRow
		},
		setCurrentRow(row) {
			this.currentRow = row
		},
		getSelectedRows() {
			return this.selectedRows
		},
		getSelectedPrimaryValues() {
			return this.selectedRows.map((row) => row[this.primaryKey])
		},
		setSelectedRows(rows) {
			this.selectedRows = rows
			let table = this.$refs.table
			let ids = this.getSelectedPrimaryValues()
			this.$emit('selection-change', { rows, ids, table })
		},
		handleRowClick(row, column) {
			if (this.rowClick && !this.rowClick(row, this)) return
			let admin = this
			let table = this.$refs.table
			if (this.expand.show && this.expand.toggle) {
				table.toggleRowExpansion(row)
			} else if (this.multiple) {
				table.toggleRowSelection(row)
			} else if (this.selectable) {
				table.setCurrentRow(row)
			}
			this.setCurrentRow(row)
			this.$emit('row-click', { row, column, table, admin })
		},
		toggleRowSelection(row) {
			this.$refs.table.toggleRowSelection(row || this.currentRow)
		},
		handleCellDblClick(row, column, cell) {
			let orgColumn = this.columns.find((col) => col.prop == column.property)
			if (orgColumn && orgColumn.editable) {
				this.$prompt('请输入' + orgColumn.title, '修改', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					inputValue: row[orgColumn.prop] || '',
					inputPattern: orgColumn.inputPattern,
					inputValidator: orgColumn.inputValidator,
					inputErrorMessage: orgColumn.inputErrorMessage || orgColumn.title + '不正确'
				}).then(({ value }) => this.handleWrite('update', { [this.primaryKey]: row[this.primaryKey], [orgColumn.prop]: value }, true))
			}
			this.$emit('cell-dblclick', { row, column, cell })
		},
		handleCellClick(row, column, cell) {
			let orgColumn = this.columns.find((col) => col.prop == column.property)
			if (orgColumn && orgColumn.link && orgColumn.component) {
				//点击单元格渲染组件
				this.row = row
				this.editor = {
					width: '80%',
					top: '0',
					lockScroll: true,
					text: orgColumn.title,
					...orgColumn,
					show: true,
					loaded: true
				}
			}
			this.$emit('cell-click', { row, column, cell })
		},
		handleSpanMethod({ row, column, rowIndex, columnIndex }) {
			if (this.loading) return
			let { prop, props, uniq } = this.rowspan
			if (prop && props && props.includes(column.property) && row[prop] > 1) {
				let id = column.id + '-' + row[uniq || prop]
				if (this.cache[id] == 1) {
					//这里在一次数据更新时只执行一次
					this.cache[id]++
					return { rowspan: 0, colspan: 0 }
				}
				this.cache[id] = 1
				return {
					rowspan: row[prop],
					colspan: 1
				}
			}
		},
		handleTabClick(vm) {
			this.activeTab = this.tabList[vm.index]
			Object.assign(this.query, this.activeTab.query)
			this.handleSearch({}, false, true)
		},
		handleLoad(tree, treeNode, resolve) {
			this.load &&
				this.load(tree).then(({ code, data }) => {
					if (code == 0) {
						resolve(data)
						this.hasLazyNode = true
					} else {
						resolve([])
					}
				})
		},
		async handleAsideSearch(query = {}, keepPage = true, keepSize = true) {
			let handle = this.aside.handle
			if (!handle || this.asideLoading) {
				return
			}
			this.asideLoading = true
			let { pageNumName, pageSizeName } = this.page
			let { pageNum, pageSize, searchParam } = this.aside
			let handleResult = await handle({
				[pageNumName]: keepPage ? this.asidePageNum : pageNum,
				[pageSizeName]: keepSize ? this.asidePageSize : pageSize,
				[searchParam]: this.asideKeyword,
				...query,
				...this.asideQuery
			})
			let { data, code } = this.transform(handleResult)
			if (code === 0) {
				let { records, total } = data
				this.asideRows = records
				this.asideTotal = total
			} else {
				this.asideRows = []
				this.asideTotal = 0
			}
			this.$nextTick(() => {
				this.asideLoading = false
				this.loading = false
				this._initAsideHeight()
			})
		},
		handleAsideFilter(row) {
			let { filterParam, filterField } = this.aside
			this.query[filterParam] = row[filterField]
			this.asideRow = row
			this.handleSearch({}, false, true, true)
		},
		handleExpandChange(row) {
			let { renew, component } = this.expand
			let id = row[this.primaryKey]
			this.$set(this.expandRows, id, {
				...this.expand,
				show: true,
				loaded: false,
				component: null
			})
			let resolve = () => {
				this.expandRows[id].loaded = true
				this.expandRows[id].component = component
			}
			if (!renew) {
				resolve()
			} else if (Function.isFunction(renew)) {
				this._promiseRead(renew(row, this), row, 'detail', this.expandRows[id], resolve)
			} else {
				this.handleRead('detail', row).then(resolve)
			}
		},
		handleExpandSelectionChange({ rows, ids }) {
			let table = this.$refs.table
			this.$emit('expand-selection-change', { rows, ids, table })
		},
		_handleSearch(query) {
			let { show, queryParams } = this.aside
			if (show && queryParams && this.total > 0) {
				let oldAsideQuery = JSON.stringify(this.asideQuery)
				let newAsideQuery = {}
				Object.forEach(queryParams, (value, key) => (newAsideQuery[key] = query[value] || ''))
				if (oldAsideQuery !== JSON.stringify(newAsideQuery)) {
					this.asideQuery = newAsideQuery
					this.handleAsideSearch({}, false, false)
				}
			}
		},
		_setQuery(query) {
			this.query = { ...query }
			this.pageNum = query[this.page.pageNumName]
			this.pageSize = query[this.page.pageSizeName]
		},
		//删除懒加载缓存
		_clearLazyNodes() {
			if (this.hasLazyNode) {
				let states = this.$refs.table.store.states
				states.lazyTreeNodeMap = {}
				states.treeData = {}
				this.hasLazyNode = false
			}
		},
		_validateEditor(form) {
			if (this.loading) {
				return false
			}
			let editor = this.$refs.editor
			if (!editor) {
				return true
			}
			let forms = form ? [form] : Component.getChildren(editor, 'ElForm')
			return (
				!forms.length ||
				!forms.some((form) => {
					let validated = true
					form.validate((valid) => (validated = valid))
					return !validated
				})
			)
		},
		_handleWrite(action, write, row, confirm, resolve, reject) {
			if (!Function.isFunction(write.handle)) {
				this.submitting = false
				resolve()
			} else if (!confirm) {
				if (write.custom) {
					this._promiseSwitch(write.handle(row, this), action, write, resolve, reject)
				} else {
					this.loading = true
					this._promiseWrite(write.handle(row, this), action, write, resolve, reject)
				}
			} else {
				this.$confirm('是否' + write.title + '？', '', {
					confirmButtonText: '是',
					cancelButtonText: '否',
					type: 'warning',
					center: true
				})
					.then(() => {
						if (write.custom) {
							this._promiseSwitch(write.handle(row, this), action, write, resolve, reject)
						} else {
							this.loading = true
							this._promiseWrite(write.handle(row, this), action, write, resolve, reject)
						}
					})
					.catch(() => (this.submitting = false))
			}
		},
		_handleButton() {
			return new Promise((resolve, reject) => {
				let { handle, component, action, renew } = this.button
				//如果没有组件且有处理方法，则认为是button的click事件
				if (!component && Function.isFunction(handle)) {
					this._promiseSwitch(handle(this.row, this), action, this.button, resolve, reject)
				} else if (this.redirect(this.button, this.row)) {
					this.editor = {
						...this.button,
						show: true,
						loaded: false,
						component: null
					}
					let loaded = () => {
						this.editor.loaded = true
						this.editor.component = component
						resolve && resolve()
					}
					if (!renew) {
						loaded()
					} else if (Function.isFunction(renew)) {
						this._promiseRead(renew(this.row, this), this.row, 'detail', this.button, loaded, reject)
					} else {
						this.handleRead('detail', this.row)
							.then(loaded)
							.catch(reject)
					}
				}
			})
		},
		_promiseSwitch(promise, action, options, resolve, reject) {
			if (!action || action.includes('insert') || action.includes('delete') || action.includes('update') || action.includes('write')) {
				this._promiseWrite(promise, 'update', options, resolve, reject)
			} else if (action.includes('detail') || action.includes('read')) {
				this._promiseRead(promise, null, 'detail', options, resolve, reject)
			} else {
				this.$msgbox({
					message: 'admin-table: Invalid action',
					type: 'danger',
					center: true
				})
			}
		},
		_promiseRead(promise, query, action, options, resolve, reject) {
			promise
				.then((data) => {
					let res = this._thenRead(query, data, action, options)
					resolve && resolve(res)
				})
				.catch((error) => {
					this._catchRead(query, error, action, options)
					reject && reject(error)
				})
			return promise
		},
		_promiseWrite(promise, action, options, resolve, reject) {
			promise
				.then((data) => {
					let res = this._thenWrite(data, action, options)
					resolve && resolve(res)
				})
				.catch((error) => {
					this._catchWrite(error, action, options)
					reject && reject(error)
				})
			return promise
		},
		_thenRead(query, _data, action, options) {
			let isDetail = action.includes('detail')
			isDetail || this._setQuery(query)
			let res = this.transform(_data, isDetail)
			let { data, code, msg } = res
			this.errorCode = code
			this.errorMsg = msg
			if (code === 0) {
				if (isDetail) {
					this.row = data
				} else {
					let { records, total } = data
					this.rows = records
					this.total = parseInt(total, 10) || 0
					this._clearLazyNodes()
				}
			} else {
				if (isDetail) {
					this.row = {}
				} else {
					this.rows = []
					this.total = 0
					this._clearLazyNodes()
				}
			}
			this.$nextTick(() => {
				this.submitting = false
				this.loading = false
				this._initHeight()
			})
			return res
		},
		_catchRead(query, error, action, options) {
			if (action.includes('detail')) {
				this.row = {}
			} else {
				this.rows = []
				this.total = 0
			}
			//json data or response data
			this.errorCode = error.code
			this.errorMsg = error.msg
			this.errorMsg &&
				this.$msgbox({
					title: '失败',
					message: error.path ? error.error + ' ' + error.path : this.errorMsg,
					type: 'warning'
				})
			this.$nextTick(() => {
				this.submitting = false
				this.loading = false
				this._initHeight()
			})
		},
		_thenWrite(data, action, options) {
			this.submitting = false
			this.loading = false
			let res = this.transform(data, false)
			const { code, msg } = res
			this.errorCode = 0
			this.errorMsg = msg
			if (code === 0) {
				this.$message({
					message: options.title + '成功',
					type: 'success'
				})
				if (this.view === 'select') {
					this.hideEditor()
					//有没有cache都清空
					this.editor = {}
					this.handleSearch({}, true, true)
				}
			} else if (this.errorMsg) {
				this.$msgbox({
					title: '失败',
					message: this.errorMsg,
					type: 'warning'
				})
			}
			this._initHeight()
			return res
		},
		_catchWrite(error, action, options) {
			this.submitting = false
			this.loading = false
			this.errorCode = error.code
			this.errorMsg = error.message
			this.errorMsg &&
				this.$msgbox({
					title: '失败',
					message: this.errorMsg,
					type: 'warning'
				})
			this._initHeight()
		},
		_createQRCode(row) {
			let { show, url, params } = this.qrcode
			if (!show) return null
			let qrCode = new QRCode(null, this.qrcode)
			let qrText = url + (url.includes('?') ? '' : '?') + params.map((key) => key + '=' + encodeURIComponent(row[key])).join('&')
			console.log('_createQRCode:' + qrText)
			return qrCode.toDataURL(qrText)
		},
		_initDefaults() {
			for (let prop in defaults) {
				if (Object.isObject(this[prop])) {
					let values = defaults[prop]()
					for (let key in values) {
						if (this[prop][key] === undefined) {
							this.$set(this[prop], key, values[key])
						}
					}
				}
			}
		},
		_initHeight() {
			if (this.height === 'auto') return
			let page,
				table = this.$refs.table
			if (!table) return setTimeout(this._initHeight, 16)
			if (table.$el && this.hasPage && !(page = this.$refs.pagination)) return setTimeout(this._initHeight, 16)
			clearTimeout(this.heightTimer[0])
			this.heightTimer[0] = setTimeout(() => {
				//减去距离下边的基础下边距:16px
				let height = window.innerHeight - this.offsetHeight - (table.$el || table).getBoundingClientRect().top - 16
				//存在分页高度则还要减去marginTop:16px
				height -= page && page.$el.offsetHeight > 0 ? page.$el.offsetHeight + 16 : 0
				height + 'px' === this.tableHeight || (this.tableHeight = height + 'px')
				console.log('_initHeight:' + this.tableHeight)
			}, 100)
		},
		_initAsideHeight() {
			if (this.height === 'auto') return
			let page,
				table = this.$refs.table
			if (!table) return setTimeout(this._initAsideHeight, 16)
			if (table.$el && this.hasAsidePage && !(page = this.$refs.asidePagination)) return setTimeout(this._initAsideHeight, 16)
			clearTimeout(this.heightTimer[1])
			this.heightTimer[1] = setTimeout(() => {
				//减去距离下边的基础下边距:16px
				let height = window.innerHeight - this.offsetHeight - (table.$el || table).getBoundingClientRect().top - 16
				//存在分页高度则还要减去marginTop:16px
				height -= page && page.$el.offsetHeight > 0 ? page.$el.offsetHeight + 16 : 0
				this.asideHeight = height + 'px'
				console.log('_initAsideHeight:' + this.asideHeight)
			}, 100)
		},
		async _insertView() {
			let editor = await this.prop('insert')
			if (this.redirect(editor)) {
				this.row = { ...editor.row }
				this.loading = false
				this.editor = {
					...editor,
					show: true,
					loaded: true,
					action: 'insert'
				}
				this._initHeight()
			}
		},
		async _detailView(row) {
			let editor = await this.prop('detail', row)
			if (this.redirect(editor, row)) {
				this.editor = {
					...editor,
					show: true,
					action: 'detail'
				}
				let resolve = () => {
					this.editor.loaded = true
					this.editor.component = editor.component
				}
				this.row = { ...row }
				if (Function.isFunction(editor.handle)) {
					this._promiseRead(editor.handle(this.row, this), this.row, 'detail', editor, resolve)
				} else {
					resolve()
				}
				this._initHeight()
			}
		},
		async _updateView(row) {
			let data = await this.handleRead('detail', row)
			data = this.transform(data, true).data
			let editor = this.prop('update', data)
			if (this.redirect(editor, data)) {
				this.row = data
				this.editor = {
					...editor,
					show: true,
					loaded: true,
					action: 'update'
				}
				this._initHeight()
			}
		},
		async _initDict() {
			let dict = await this.prop('dict')
			if (!dict.handle || !Function.isFunction(dict.handle)) {
				this.dicts = dict
			} else {
				let res = await dict.handle(dict.query)
				let { data, code, msg } = this.transform(res, true)
				if (code == 0) {
					this.dicts = Object.extend(data, dict.custom)
				} else {
					this.dicts = dict.custom
					this.$message(msg)
				}
			}
		},
		async _initTabs() {
			this.tabList = await this.prop('tabs')
			this.activeTab = this.tabList.find((tab) => tab.name === this.tabName) || { query: {} }
			Object.assign(this.query, this.activeTab.query)
		},
		async _initView() {
			//如果自定义了action则不使用$route.query
			//因为大部门场景传action都是嵌套页面
			let query = this.action ? {} : this.$route.query || {}
			let name = this.action || this.$route.name.toLowerCase()
			delete query.redirect
			if (name.match(/insert$/i)) {
				this.view = 'insert'
				await this._insertView()
			} else if (name.match(/update$/i)) {
				this.view = 'update'
				await this._updateView(query)
			} else if (name.match(/detail$/i)) {
				this.view = 'detail'
				await this._detailView(query)
			} else if (this.aside.show) {
				this.view = 'select'
				await this.handleAsideSearch()
			} else {
				this.view = 'select'
				await this.handleSelect(query)
			}
		}
	},
	beforeDestroy() {
		window.removeEventListener('resize', this._initHeight, false)
	},
	created() {
		window.addEventListener('resize', this._initHeight, false)
	},
	updated() {
		this._initHeight()
	},
	async mounted() {
		await this._initDict()
		await this._initTabs()
		await this._initView()
	}
}
</script>

<style lang="scss">
.el-dialog {
	&__header {
		padding: 16px !important;
	}
	&__body {
		padding: 16px !important;
		.el-table-oms {
			padding: 0 !important;
		}
	}
}
</style>

<style lang="scss" scoped>
.el-table-oms {
	&__table {
		th.gutter {
			display: table-cell !important;
		}
		.el-table__body-wrapper {
			//滚动条自动出现，解决有时候高度正确却不出现滚动条的情况
			overflow-y: auto;
		}
		.el-radio__label {
			display: none;
		}
	}
	&__control .cell {
		overflow: visible;
	}
	&__dialog::v-deep .el-dialog.is-fullscreen .el-dialog__body {
		min-height: calc(100% - 56px);
	}
	&__scroll {
		overflow-x: hidden;
		overflow-y: auto;
	}
	&__select {
		padding: 16px;
	}
	&__scroll &__select {
		padding: 0;
	}
	&__select &__select {
		padding: 0;
	}
	&__collapse {
		position: absolute;
		left: 0;
		width: 100%;
		cursor: pointer;
		display: flex;
		justify-content: center;
		height: 5px;
		background-color: #fff;
		i {
			position: relative;
			color: #fff;
		}
		&:hover {
			background-color: #333;
			i {
				color: #333;
			}
		}
		&.show {
			bottom: 0;
			border-top-left-radius: 6px;
			border-top-right-radius: 6px;
			i {
				top: -8px;
			}
		}
		&.hide {
			top: 0;
			border-bottom-left-radius: 6px;
			border-bottom-right-radius: 6px;
			i {
				top: -2px;
			}
		}
	}
	&__tabs::v-deep {
		.el-tabs__content {
			overflow: visible;
			padding: 0;
		}
		.el-card__body {
			padding: 0;
			min-height: 10px;
		}
	}
	&__image {
		cursor: pointer;
		&::v-deep img {
			width: auto;
			max-height: 50px;
		}
	}
	&__media {
		width: 200px;
		height: 180px;
		cursor: pointer;
		&::v-deep img {
			width: auto;
			max-width: 200px;
			max-height: 180px;
		}
	}
	&__aside {
		display: flex;
		flex-direction: column;
		width: 240px !important;
		height: 100%;
		overflow: hidden;
		padding-right: 16px;
		&-list {
			overflow: auto;
			border: #1f1f1f 1px solid;
			margin-top: 16px;
			&::-webkit-scrollbar {
				width: 3px;
				height: 3px;
			}
		}
		&-item {
			width: 100%;
			height: 50px;
			line-height: 50px;
			background-color: #303030;
			border-bottom: #1f1f1f 1px solid;
			font-size: 16px;
			&.active {
				background-color: #1f1f1f;
			}
			&:hover {
				background-color: #404040;
			}
		}
	}
	&__main {
		padding: 0;
		& > div:not(:first-child) {
			margin-top: 16px;
		}
	}
	&__toobars {
		.left {
			display: flex;
			flex: 1;
			justify-content: flex-start;
		}
		.right {
			display: flex;
			justify-content: flex-end;
			&::v-deep {
				.el-form-item {
					margin-bottom: 0;
				}
			}
		}
	}
}
</style>
