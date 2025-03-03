<template>
    <div v-if="show" class="modal">
        <div class="modal-content">
            <h2>📝 Ajouter un médicament</h2>

            <form @submit.prevent="submitForm">
                <div class="form-group">
                    <label>Nom du médicament</label>
                    <input v-model="medicament.denomination" placeholder="Ex: Paracétamol" required />
                </div>

                <div class="form-group">
                    <label>Forme pharmaceutique</label>
                    <input v-model="medicament.formepharmaceutique" placeholder="Ex: Comprimé" required />
                </div>

                <div class="form-group">
                    <label>Quantité</label>
                    <input type="number" v-model.number="medicament.qte" placeholder="Ex: 10" required />
                </div>

                <div class="form-group">
                    <label>Image du médicament</label>
                    <input type="file" @change="handleFileUpload" />
                </div>

                <div class="form-buttons">
                    <button class="add-btn" type="submit">✅ Valider</button>
                    <button class="cancel-btn" type="button" @click="cancelForm">❌ Annuler</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue';

const props = defineProps({
    show: Boolean
});

const emit = defineEmits(['add-medicament', 'close-form']);

const medicament = ref({
    denomination: '',
    formepharmaceutique: '',
    qte: 1,
    photo: ''
});

// convertir une image en base 64
const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        medicament.value.photo = reader.result;
    };
    reader.readAsDataURL(file);
};

const submitForm = () => {
    if (!medicament.value.denomination || !medicament.value.formepharmaceutique || medicament.value.qte <= 0) {
        alert('Veuillez remplir tous les champs correctement.'); // vérifie que l'utilisateur a bien rempli tous les champs 
        return;
    }
    emit('add-medicament', { ...medicament.value }); // évènement vers MedicamentList et transmet une copie du médicament
    resetForm();
    emit('close-form'); // ferme le formulaire
};

const cancelForm = () => { // annuler la saisie
    resetForm();
    emit('close-form'); // ferme le formulaire
};

const resetForm = () => {
    medicament.value = { denomination: '', formepharmaceutique: '', qte: 0, photo: '' }; // vide le formulaire et le rend vierge
};
</script>

<style scoped>
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 2000;
    backdrop-filter: blur(5px);
}

.modal-content {
    background: white;
    color: black;
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
    width: 100%;
    max-width: 500px;
    text-align: center;
    animation: fadeIn 0.3s ease-in-out;
    position: relative;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.9);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

.form-group {
    width: 100%;
    margin-bottom: 15px;
    display: flex;
    flex-direction: column;
    text-align: left;
}

.form-group label {
    font-weight: bold;
    margin-bottom: 5px;
    color: #333;
    font-size: 15px;
}

.form-group input {
    width: 100%;
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-size: 16px;
    transition: border 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
    background-color: #f9f9f9;
}

.form-group input:focus {
    border-color: #008020;
    box-shadow: 0 0 8px rgba(0, 123, 255, 0.3);
    outline: none;
    background-color: white;
}

.form-buttons {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    margin-top: 20px;
}

.add-btn {
    flex: 1;
    background-color: #28a745;
    color: white;
    border: none;
    padding: 14px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.3s ease-in-out;
    font-size: 16px;
    font-weight: bold;
}

.add-btn:hover {
    background-color: #218838;
}

.cancel-btn {
    flex: 1;
    background-color: #dc3545;
    color: white;
    border: none;
    padding: 14px;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.3s ease-in-out;
    font-size: 16px;
    font-weight: bold;
}

.cancel-btn:hover {
    background-color: #c82333;
}
</style>
