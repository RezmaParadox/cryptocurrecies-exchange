<template>
  <div class="flex-col">
    <div class="flex justify-center">
      <VueSpinner v-if="isLoading" color="green" size="100" />
    </div>  
    <template v-if="!isLoading">
      <div class="flex flex-col sm:flex-row justify-around items-center">
        <div class="flex flex-col items-center">
          <img class="w-20 h-20 mr-5" :src="`https://static.coincap.io/assets/icons/${asset.symbol.toLowerCase()}@2x.png`" :alt="asset.name" />
          <h1 class="text-5xl">
            {{ asset.name }}
            <small class="sm:mr-2 text-gray-500">
              {{ asset.symbol }}
            </small>
          </h1>
        </div>

        <div class="my-10 flex flex-col">
          <ul>
            <li class="flex justify-between">
              <b class="text-gray-600 mr-10 uppercase">Ranking</b>
              <span>#{{asset.rank}} </span>
            </li>
            <li class="flex justify-between">
              <b class="text-gray-600 mr-10 uppercase">Precio actual</b>
              <span>{{dollarFilter(asset.priceUsd)}}</span>
            </li>
            <li class="flex justify-between">
              <b class="text-gray-600 mr-10 uppercase">Precio más bajo</b>
              <span>{{dollarFilter(min)}}</span>
            </li>
            <li class="flex justify-between">
              <b class="text-gray-600 mr-10 uppercase">Precio más alto</b>
              <span>{{dollarFilter(max)}}</span>
            </li>
            <li class="flex justify-between">
              <b class="text-gray-600 mr-10 uppercase">Precio Promedio</b>
              <span>{{dollarFilter(avg)}}</span>
            </li>
            <li class="flex justify-between">
              <b class="text-gray-600 mr-10 uppercase">Variación 24hs</b>
              <span>{{percentFilter(asset.changePercent24Hr)}}</span>
            </li>
          </ul>
        </div>

        <div class="my-10 sm:mt-0 flex flex-col justify-center text-center">
          <button
            @click="toggleConverter"
            class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            {{fromUsd ? `USD a ${asset.symbol}` : `COIN a ${asset.symbol}`}}
          </button>

          <div class="flex flex-row my-5">
            <label class="w-full" for="convertValue">
              <input
                v-model="convertValue"
                id="convertValue"
                type="number"
                class="text-center bg-white focus:outline-none focus:shadow-outline border border-gray-300 rounded-lg py-2 px-4 block w-full appearance-none leading-normal"
                :placeholder="`Valor en ${fromUsd ? 'USD' : asset.symbol}`"
              />
            </label>
          </div>
          <span>{{convertResult}} {{fromUsd ? asset.symbol : 'USD'}}</span>
        </div>
      </div>
       <apexchart type="line" :options="chartOptions" :series="chartSeries" height="400" />
       <h3 class="text-xl my-10"> Mejores ofertas de cambio</h3>
       <table class="text-center border-gray-600 w-full">
         <tr v-for="m in markets" :key="`${m.exchangeId}-${m.priceUsd}`" class="boder-b">
          <td>
            <b>{{m.exchangeId}}</b>
          </td>
          <td>
            {{ dollarFilter(m.priceUsd) }}
          </td>
          <td>
            {{ m.baseSymbol }}/{{ m.quoteSymbol }}
          </td>
          <td>
            <px-button
              :isLoading="m.isLoading || false"
              v-if="!m.url" 
              @click="getWebSite(m)">
              <slot>Obtener Link</slot>
            </px-button>
            <p v-else-if="m.url === null || m.url === undefined" class="text-red-600"> No disponible </p>  
            <a v-else class="hover:underline text-green-600" target="_blank" :href="m.url">
              {{ m.url }}
            </a>
          </td>
         </tr>
       </table>
    </template>
  </div>
</template>

<script>
import api from "@/api";
import { dollarFilter, percentFilter } from "@/filters";
import { format } from 'date-fns';
import PxButton from '@/components/PxButton.vue';

export default {
  components: { PxButton },
  name: "CoinDetail",

  data() {
    return {
      asset: {},
      history: [],
      markets: [],
      isLoading: false,
      fromUsd: true,
      convertValue: null,
      chartOptions: {
        chart: {
          id: 'historical-chart',
          type: 'line',
          toolbar: {
            show: false
          }
        },
        xaxis: {
          categories: []  // Aquí puedes definir las etiquetas de tiempo o fechas
        }
      },
      chartSeries: [{
        name: 'Precio USD',
        data: []  // Aquí van los datos de precios del historial
      }]
    };
  },

  setup() {
    return { dollarFilter, percentFilter };
  },

  created() {
    this.getCoin();
  },

  watch: {
    $route() {
      this.getCoin();
    }
  },

  computed: {
    convertResult() {
      if(!this.convertValue) {
        return 0;
      }
      const result = this.fromUsd
        ? this.convertValue / this.asset.priceUsd
        : this.convertValue * this.asset.priceUsd
      
      return result.toFixed(4);
    }, 
    min() {
      return Math.min(...this.history.map(h => parseFloat(h.priceUsd).toFixed(2)));
    },
    max() {
      return Math.max(...this.history.map(h => parseFloat(h.priceUsd).toFixed(2)));
    },
    avg() {
      return this.history.reduce((a, b) => a + parseFloat(b.priceUsd), 0) / this.history.length;
    }
  },  

  methods: {
    toggleConverter() {
      this.fromUsd = !this.fromUsd;
    },
    getWebSite(exchange){
      exchange.isLoading = true;
      return api.getExchange(exchange.exchangeId)
        .then(res => {
          exchange.url = res.exchangeUrl;
        })
        .finally(() => (exchange.isLoading = false));
    },
    getCoin() {
      const id = this.$route.params.id;
      this.isLoading = true;

      Promise.all([
        api.getAsset(id),
        api.getAssetHistory(id),
        api.getMarkets(id),
      ])
      .then(([asset, history, markets]) => {
        this.asset = asset;
        this.history = history;
        this.markets = markets;
        console.log(history);
        // Configurar los datos para el gráfico
        this.chartOptions.xaxis.categories = history.map(item => format(new Date(item.date), 'dd/MM/yyyy HH:mm'));  // Formatear fecha
        this.chartSeries[0].data = history.map(item => parseFloat(item.priceUsd).toFixed(2));
      })
      .finally(() => (this.isLoading = false));
    },
  },
};
</script>