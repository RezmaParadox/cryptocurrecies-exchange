<template>
    <button 
    @click="buttonClick"
    class="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
        <VueSpinnerDots v-if="isLoading" color="green" size="30" />
        <slot v-if="!isLoading" ></slot>
    </button>
</template>

<script>
export default {
    name: "PxButton",

    props: {
        isLoading: {
        type: Boolean,
        default: false,
        },
    },

    methods: {
        buttonClick() {
            this.$emit("custom-click");
        }
    },
}
</script>