import ElTableOms from './index.vue'

const install = function(Vue) {
	Vue.component(ElTableOms.name, ElTableOms)
}

/* istanbul ignore if */
typeof window !== 'undefined' && window.Vue && install(window.Vue)

export default { install, ElTableOms }
