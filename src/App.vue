<script setup>
import MedicamentList from './components/MedicamentList.vue';
import MedicamentHeader from './components/MedicamentHeader.vue';
</script>

<template>
    <div class="app-container">
        <div class="titre">
            <MedicamentHeader></MedicamentHeader>
        </div>
        <div class="liste">
            <MedicamentList></MedicamentList>
        </div>
    </div>
</template>

<style scoped>
.liste {
    margin: 20px
}

.app-container {
    background-color: gray;
    margin: 0;
    padding: 0;
}

.titre {
    color: black
}
</style>
