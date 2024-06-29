import { createApp } from "vue";
import App from "./App.vue";
import "@/assets/css/tailwind.css";
import router from "@/router/index";
import { VueSpinnersPlugin } from 'vue3-spinners';
import VueApexCharts from "vue3-apexcharts";

// import {dollarFilter, percentFilter} from "./filters";

// Vue.filter ("dollar", dollarFilter);
// Vue.filter ("percent", percentFilter);

createApp(App)
    .use(router)
    .use(VueSpinnersPlugin)
    .use(VueApexCharts)
    .mount("#app");
