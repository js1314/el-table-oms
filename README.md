# el-table-oms

element-ui Table for Oms Project~

# Examples

## index.vue
<pre>
&lt;template>
	&lt;el-table-oms
		:key="$route.name"
		:columns="columns"
		:insert="insert"
		:update="update"
		:detail="detail"
		:search="search"
		:page="page"
		:buttons="buttons"
		:control="control"
		:dict="dict"
	/>
&lt;/template>

&lt;script>
import { findDict, detailUser, addUser, updateUser, pageUser, changeStatusUser } from '@/api/user.js'

export default {
	data() {
		return {
			dict: {
				handle: findDict,
				//需要获取的字典名
				query: ['roleList'],
				//自定义字典
				custom: {
					status: {
						0: '冻结',
						1: '启用'
					}
				}
			},
			insert: {
				show: true,
				text: '新增用户',
				title: '新增用户',
				width: '40%',
				handle: addUser,
				component: () => import('./components/editor.vue')
			},
			detail: {
				show: false,
				handle: detailUser
			},
			update: {
				show: true,
				text: '编辑',
				title: '用户编辑',
				width: '50%',
				renew: true,
				handle: updateUser,
				component: () => import('./components/editor.vue')
			},
			search: {
				show: true,
				handle: pageUser,
				query: this.$route.meta.query, //默认条件
				placement: 'right',
				component: () => import('./components/search.vue')
			},
			page: {
				show: true
			},
			buttons: [this.changeStatusButton],
			control: {},
			columns: [
				{ prop: 'id', title: '用户id' },
				{ prop: 'userName', title: '账号' },
				{ prop: 'cellphone', title: '手机号' },
				{ prop: 'realName', title: '姓名', editable: true },
				{ prop: 'roleName', title: '角色' },
				//dict为true，将status翻译成中文。使用dictProp:'myStatus'自定义字典名
				{ prop: 'status', title: '状态', dict: true },
				{ prop: 'lastLoginDate', title: '最近登录时间' }
			]
		}
	},
	methods: {
		changeStatusButton(row) {
			if (row.status == 1) {
				return {
					show: true,
					type: 'warning',
					text: '冻结',
					title: '冻结用户',
					confirm: true,
					handle: ({ id }) => changeStatus({ id, status: 0 })
				}
			} else {
				return {
					show: true,
					type: 'info',
					text: '启用',
					title: '启用用户',
					confirm: true,
					handle: ({ id }) => changeStatus({ id, status: 1 })
				}
			}
		}
	}
}
&lt;/script>
</pre>

## components/editor.vue
<pre>
&lt;template>
	&lt;el-form ref="form" :model="user" :rules="rules" label-width="120px">
		&lt;el-form-item label="角色" prop="roleCode">
			&lt;el-select v-if="dicts.roleList" v-model="user.roleCode" placeholder="请选择角色">
				&lt;el-option v-for="(role, index) in dicts.roleList" :key="index" :value="role.value" :label="role.label">&lt;/el-option>
			&lt;/el-select>
		&lt;/el-form-item>
		&lt;el-form-item label="登录账号" prop="userName">
			&lt;el-input v-model="user.userName" placeholder="请输入登录账号"> &lt;/el-input>
		&lt;/el-form-item>
		&lt;el-form-item label="登录密码" prop="password">
			&lt;el-input type="password" v-model="user.password" placeholder="请输入登录密码"> &lt;/el-input>
		&lt;/el-form-item>
		&lt;el-form-item v-if="isInsertAction" label="确认密码" prop="confirmPassword">
			&lt;el-input type="password" v-model="user.confirmPassword" placeholder="请输入确认密码">&lt;/el-input>
		&lt;/el-form-item>
		&lt;el-form-item label="姓名" prop="realName">
			&lt;el-input v-model="user.realName" placeholder="请输入姓名">&lt;/el-input>
		&lt;/el-form-item>
		&lt;el-form-item label="手机号" prop="cellphone">
			&lt;el-input v-model="user.cellphone" placeholder="请输入手机号">&lt;/el-input>
		&lt;/el-form-item>
		&lt;el-form-item label="备注" prop="remark">
			&lt;el-input v-model="user.remark" type="textarea" placeholder="备注">&lt;/el-input>
		&lt;/el-form-item>
		&lt;el-form-item>
			&lt;el-button type="default" @click="$emit('cancel')">取消&lt;/el-button>
			&lt;!-- 第一个参数为参数实例对象，第二个参数为回调方法的参数 -->
			&lt;el-button type="primary" @click="admin.handleSave($refs.form)">保存&lt;/el-button>
		&lt;/el-form-item>
	&lt;/el-form>
&lt;/template>

&lt;script>
export default {
	props: {
		//update时为当前表格行数据，insert时row为空对象
		row: Object,
		//el-table-oms组件实例对象
		admin: Object,
		//操作的类型，insert或update
		action: String,
		//字典，状态值翻译成中文。比如dicts.orderStatus[row.orderStatus]，把订单状态翻译成了中文
		//取值dicts.orderStatusEnum.PAYMENTED
		dicts: Object
	},
	data() {
		return {
			user: this.row,
			//insert操作
			isInsertAction: this.action === 'insert',
			rules: {
				roleCode: [{ required: true, message: '请选择角色', trigger: 'change' }],
				userName: [
					{ required: true, message: '请输入登录账号', trigger: 'change' },
					{ min: 3, max: 64, message: '登录账号长度应在 3 到 64 个字符以内', trigger: 'change' }
				],
				password: [
					{ required: true, message: '请输入登录密码', trigger: 'change' },
					{ min: 6, max: 64, message: '密码长度应在 6 到 64 个字符以内', trigger: 'change' }
				],
				confirmPassword: [
					{ required: true, message: '请再次输入密码', trigger: 'change' },
					{ min: 6, max: 64, message: '密码长度应在 6 到 64 个字符以内', trigger: 'change' },
					{
						trigger: 'change',
						validator: (rule, value, callback) => {
							if (value === '') {
								callback(new Error('请再次输入密码'))
							} else if (value !== this.user.password) {
								callback(new Error('两次输入密码不一致'))
							} else {
								callback()
							}
						}
					}
				],
				realName: [
					{ required: true, message: '请输入姓名', trigger: 'change' },
					{ min: 2, max: 32, message: '姓名长度应在 2 到 32 个字符以内', trigger: 'change' }
				],
				cellphone: [{ required: true, message: '请输入手机号', trigger: 'change' }]
			}
		}
	}
}
&lt;/script>

</pre>

## components/search.vue
<pre>
&lt;template>
	&lt;el-form :model="query" label-width="100px" inline>
		&lt;el-form-item prop="idOrName">
			&lt;el-input v-model="query.idOrName" placeholder="请输入用户ID或名称" @keyup.native.enter="admin.handleSearch()" clearable />
		&lt;/el-form-item>
		&lt;el-button type="primary" @click="admin.handleSearch()">搜索&lt;/el-button>
	&lt;/el-form>
&lt;/template>

&lt;script>
export default {
	props: {
		query: Object, //当前查询条件
		config: Object, //查询配置
		admin: Object //el-table-oms组件实例对象
	}
}
&lt;/script>
</pre>

## api/user.js

<pre>

/**
默认后台返回的json格式：{
	code: 0, //0:success
	msg: '', //message
	data: {
		records: [], //分页数据
		total: 0 //分页总条数
	}
}
如果需要转化，请使用 transform 参数
 */

//数据字典
/**
{
	code: 0, //0:success
	msg: '', //message
	data: {
		roleList: [{
			value: "1",
			label: "管理员"
		}]
	}
}
*/
export function findDict(data) {
	return request({
		url: 'sys/Dict/find',
		method: 'post',
		data
	})
}

//用户详情
export function detailUser({ id }) {
	return request({
		url: 'sys/User/detail/' + id,
		method: 'get'
	})
}

//添加用户
export function addUser(data) {
	return request({
		url: 'sys/User/add',
		method: 'post',
		data
	})
}

//更新用户
export function updateUser(data) {
	return request({
		url: 'sys/User/update',
		method: 'post',
		data
	})
}

//启用禁用用户
export function changeStatusUser(params) {
	return request({
		url: 'sys/User/changeStatus',
		method: 'get',
		params
	})
}
</pre>

# Versions

## v1.0.5

1. Fix `handleToolbar` remove `this.selectedRows` params
2. Add `Examples`

## v1.0.6

1. Update `Examples`

## v1.0.8

1. Build
