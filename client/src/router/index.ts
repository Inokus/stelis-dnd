import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '@/layouts/MainLayout.vue';
import { authenticate, validateSlug } from './guards';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: MainLayout,
      children: [
        {
          path: 'signup',
          name: 'signup',
          component: () => import('../views/SignupView.vue'),
          beforeEnter: () => {
            if (authenticate()) {
              return { path: '/' };
            }

            return true;
          },
        },
        {
          path: 'login',
          name: 'login',
          component: () => import('../views/LoginView.vue'),
          beforeEnter: () => {
            if (authenticate()) {
              return { path: '/' };
            }

            return true;
          },
        },
        {
          path: '',
          name: 'campaignsList',
          component: () => import('../views/CampaignsListView.vue'),
          beforeEnter: () => {
            if (!authenticate()) {
              return { path: '/login' };
            }

            return true;
          },
        },
        {
          path: '/:slug',
          name: 'campaign',
          component: () => import('../views/CampaignView.vue'),
          props: true,
          beforeEnter: async (to) => {
            if (!authenticate()) {
              return { path: '/login' };
            }

            const slug = String(to.params.slug);

            if (!(await validateSlug(slug))) {
              return { path: '/' };
            }

            return true;
          },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: MainLayout,
    },
  ],
});

export default router;
