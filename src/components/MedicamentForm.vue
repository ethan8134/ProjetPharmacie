<template>
    <form @submit.prevent="submitForm">
        <input v-model="medication.denomination" placeholder="Nom" required />
        <input v-model="medication.formepharmaceutique" placeholder="Forme pharmaceutique" required />
        <input type="number" v-model="medication.qte" placeholder="Quantité" required />
        <input type="file" @change="handleFileUpload" />
        <button type="submit">Ajouter</button>
    </form>
</template>

<script setup>
import { ref } from 'vue';

const medication = ref({ denomination: '', formepharmaceutique: '', qte: 0, photo: '' });
const emit = defineEmits(['add-medicament']);

const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        medication.value.photo = reader.result;
    };
    reader.readAsDataURL(file);
};

const submitForm = () => {
    emit('add-medicament', { ...medication.value });
    medication.value = { denomination: '', formepharmaceutique: '', qte: 0, photo: '' };
};
</script>

<style>
form {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px;
    background: #fff;
    border: 1px solid #ccc;
    border-radius: 5px;
}

button {
    padding: 5px;
    background: #007bff;
    color: white;
    border: none;
    cursor: pointer;
    border-radius: 5px;
}
</style>