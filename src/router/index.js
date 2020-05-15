import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    children: [
      {
        path: '/configModule',
        component: () => import('../views/page/ConfigModule.vue'),
        name: '模块配置信息'
      }, {
        path: '/configDataBase',
        component: () => import('../views/page/ConfigDataBase.vue'),
        name: '数据库管理'
      }, {
        path: '/configModuleBase',
        component: () => import('../views/page/ConfigModuleBase.vue'),
        name: '模块数据库管理'
      }
    ]
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
