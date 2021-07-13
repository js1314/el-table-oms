/**
 * 组件默认动态参数，可以根据自己项目情况自行更改
 * 动态参数：
 * [...Object|Function<Promise|Object>]
 *  为对象则是组件参数
 *  为方法返回结果为对象则是组件参数，返回promise则接收resolve的首个实参作为组件参数
 *
 * @author YonglongZhu<733433@qq.com>
 */

export default {
	// ---------- toolbar
	removeBatch() {
		return {
			text: '删除',
			title: '删除',
			show: null,
			sort: 1,
			type: 'danger',
			action: 'remove',
			disabled: false
		}
	},
	insert() {
		return {
			text: '添加',
			title: '添加',
			show: null,
			sort: 2,
			type: 'primary',
			width: '80%',
			action: 'insert',
			icon: 'el-icon-plus',
			handle: null, //处理方法
			proxy: null //代理方法
		}
	},
	exPort() {
		return {
			show: false,
			sort: 30,
			text: '导出',
			type: 'primary',
			page: 1,
			pageSize: 10000,
			filename: 'table',
			fileType: 'excel'
			// conditions: null, // 自定义导出条件
			// 以下为exportCsv特有参数
			// filename: 'table.csv', // 文件名，默认为 table.csv
			// original: true, // 是否导出为原始数据，默认为 true
			// noHeader: false, // 不显示表头，默认为 false
			// columns: [], // 自定义导出的列数据
			// data: [], // 自定义导出的行数据
			// callback: null, // 添加此函数后，不会下载，而是返回数据
			// separator: ',', // 数据分隔符，默认是逗号(,)
			// quoted: false,// 每项数据是否加引号，默认为 false
		}
	},
	imPort() {
		return {
			show: false,
			sort: 40,
			text: '导入',
			pageSize: 10000,
			accept: '.xls,.xlsx,.csv',
			handleTemplate: null,
			templateText: '下载导入模板'
		}
	},

	// ---------- control
	insertChild() {
		return {
			text: '添加子级',
			title: '添加子级',
			show: null,
			sort: 30,
			width: '80%',
			type: 'primary', //primary / success / warning / danger / info / text
			action: 'insert',
			handle: null //处理方法
		}
	},
	download() {
		return {
			text: '下载',
			title: '下载',
			show: null,
			sort: 40,
			prop: '',
			type: 'primary',
			action: 'read',
			handle: null //处理方法
		}
	},
	remove() {
		return {
			text: '删除',
			title: '删除',
			show: null,
			sort: 100, //排最后
			type: 'danger',
			action: 'remove'
		}
	},
	update() {
		return {
			text: '编辑',
			title: '编辑',
			show: null,
			sort: 10,
			width: '80%',
			type: 'primary',
			action: 'update',
			handle: null, //处理方法
			proxy: null, //代理方法
			renew: false //每次编辑都调详情接口
		}
	},
	detail() {
		return {
			text: '详情',
			title: '详情',
			show: null,
			sort: 20,
			width: '80%',
			type: 'primary',
			action: 'detail',
			handle: null, //处理方法
			proxy: null, //代理方法
			renew: false //每次查看都调接口
		}
	},
	control() {
		return {
			prop: 'control',
			title: '操作',
			show: true,
			width: '',
			fixed: 'right',
			showButtons: false
		}
	},
	dict() {
		return {
			query: [],
			handle: null,
			custom: {}
		}
	},

	// ---------- search
	search() {
		return {
			text: '查询',
			title: '查询',
			show: null,
			query: {},
			handle: null, //处理方法
			proxy: null, //代理方法
			placement: 'top'
		}
	},
	tabs() {
		return []
	},
	page() {
		return {
			pageNum: 1,
			pageSize: 10,
			show: true,
			showSizer: true,
			pageSizes: [10, 50, 100],
			layout: 'total, sizes, prev, pager, next, jumper',
			pageNumName: 'pageIndex',
			pageSizeName: 'pageSize',
			sortByName: 'sortBy',
			sortTypeName: 'sortType'
		}
	},
	// 统一转换返回格式
	transform(data) {
		return {
			code: data.errorCode, //0:success
			msg: data.errorMsg, //message
			data: data.result //{ records: [], total: 0 }
		}
	},

	// ---------- table
	rowspan() {
		return {
			//跨行分组配置
			uniq: 'id', //唯一键名
			prop: 'rowspan', //分组根据
			props: [] //跨行的props
		}
	},
	colspan() {
		return {
			//跨列分组配置
			prop: '', //分组根据
			props: [] //跨行的props
		}
	},
	displayMode() {
		return {
			show: false,
			current: 'table',
			// grid: null, // Table
			card: null,
			list: null,
			change() {}
		}
	},
	//二维码生成配置
	qrcode() {
		return {
			show: false,
			width: 256,
			height: 256,
			url: '',
			params: []
		}
	},
	//左边筛选配置
	aside() {
		return {
			show: false,
			handle: null,
			page: false,
			query: {},
			pageNum: 1,
			pageSize: 20,
			filterParam: 'id',
			filterField: 'id',
			searchParam: 'idOrName',
			placeholder: '请输入关键字'
		}
	},
	//展开项配置
	expand() {
		return {
			show: false,
			component: null
		}
	}
}
