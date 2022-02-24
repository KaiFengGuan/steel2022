import { createRouter, createWebHistory } from 'vue-router'

import Layout from '@/layout'

const fullRouterMap = [
  {
    path: '/visualization',
    name: 'Visualization',
    component: () => import('@/views/visualization')
  },
];

const routes = [
  {
    path: '/',
    component: Layout,
    hidden: true,
    redirect: '/visualization',
    children: fullRouterMap
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
