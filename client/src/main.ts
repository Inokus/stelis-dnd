import './assets/main.css';
import 'primeicons/primeicons.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import { definePreset } from '@primevue/themes';
import ToastService from 'primevue/toastservice';

import Aura from '@primevue/themes/aura';

import App from './App.vue';
import router from './router';

const app = createApp(App);

const NeutralPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{neutral.50}',
      100: '{neutral.100}',
      200: '{neutral.200}',
      300: '{neutral.300}',
      400: '{neutral.400}',
      500: '{neutral.500}',
      600: '{neutral.600}',
      700: '{neutral.700}',
      800: '{neutral.800}',
      900: '{neutral.900}',
      950: '{neutral.950}',
    },
  },
});

app.use(createPinia());
app.use(router);
app.use(PrimeVue, {
  theme: {
    preset: NeutralPreset,
  },
});
app.use(ToastService);

app.mount('#app');
