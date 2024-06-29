<template>
  <div>
    <VueSpinner v-if="isLoading" color="green" size="100" />
    <px-assets-table v-else :assets="assets" />
  </div>
</template>

<script>
import api from "@/api";
import PxAssetsTable from "@/components/PxAssetsTable.vue";
export default {
  name: "homePage",
  components: {
    PxAssetsTable,
  },

  data() {
    return {
      assets: [],
      isLoading: false
    };
  },

  created() {
    this.isLoading = true;
    api.getAssets()
      .then(assets => (this.assets = assets))
      .finally(() => (this.isLoading = false));
  }
};
</script>

<style></style>
