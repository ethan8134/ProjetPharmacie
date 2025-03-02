<template>
    <div>
        <div class="search-container">
            <input type="text" v-model="searchTerm" placeholder="Rechercher un médicament..." />
            <button @click="fetchMedications">Rechercher</button>

            <div class="dropdown">
                <button @click="toggleDropdown">Filtrer ▼</button>
                <div v-if="showDropdown" class="dropdown-menu">
                    <button @click="selectForme('')">Toutes les formes</button>
                    <button v-for="forme in uniqueFormes" :key="forme" @click="selectForme(forme)">
                        {{ forme }}
                    </button>
                </div>
            </div>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Forme</th>
                        <th>Quantité</th>
                        <th>Image</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="med in medications" :key="med.id">
                        <td v-if="!med.editing">{{ med.denomination }}</td>
                        <td v-else><input v-model="med.denomination" /></td>

                        <td v-if="!med.editing">{{ med.formepharmaceutique }}</td>
                        <td v-else><input v-model="med.formepharmaceutique" /></td>

                        <td v-if="!med.editing">{{ med.qte }}</td>
                        <td v-else><input type="number" v-model="med.qte" /></td>

                        <td>
                            <img v-if="med.photo" :src="med.photo" alt="Pas de photo" width="50" />
                            <input type="file" v-if="med.editing" @change="(event) => handleFileUpload(event, med)" />
                        </td>

                        <td class="action-buttons">
                            <button v-if="!med.editing" @click="startEdit(med)">Modifier</button>
                            <button v-else @click="updateMedicament(med)">Valider</button>
                            <button v-if="med.editing" @click="cancelEdit(med)">Annuler</button>
                            <button @click="() => deleteMedicament(med.id)">Supprimer</button>
                            <button @click="() => incrementQuantity(med)">➕</button>
                            <button @click="() => decrementQuantity(med)">➖</button>
                        </td>

                    </tr>
                </tbody>
            </table>
        </div>
        <div class="button-container">
            <button @click="toggleForm">➕ Ajouter un médicament</button>
        </div>
        <div v-if="showForm" class="modal">
            <div class="modal-content">
                <h2>📝 Ajouter un médicament</h2>

                <div class="form-group">
                    <label>Nom du médicament</label>
                    <input v-model="newMedicament.denomination" placeholder="Ex: Paracétamol" required />
                </div>

                <div class="form-group">
                    <label>Forme pharmaceutique</label>
                    <input v-model="newMedicament.formepharmaceutique" placeholder="Ex: Comprimé" required />
                </div>

                <div class="form-group">
                    <label>Quantité</label>
                    <input type="number" v-model="newMedicament.qte" placeholder="Ex: 10" required />
                </div>

                <div class="form-group">
                    <label>Image du médicament</label>
                    <input type="file" @change="handleFileUploadNew" />
                </div>

                <div class="form-buttons">
                    <button class="add-btn" @click="addNewMedicament">✅ Valider</button>
                    <button class="cancel-btn" @click="toggleForm">❌ Annuler</button>
                </div>
            </div>
        </div>


    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';

const searchTerm = ref('');
const medications = ref([]);
const allMedications = ref([]);
const showDropdown = ref(false);
const selectedForme = ref('');
const uniqueFormes = ref(['Comprimé', 'Effervescent', 'Gélule', 'Poudre', 'Suppositoire']);
const showForm = ref(false);
const newMedicament = ref({ denomination: '', formepharmaceutique: '', qte: 0, photo: null });
const originalMedicament = ref({});
const apiBaseUrl = 'https://apipharmacie.pecatte.fr/api/9/medicaments';


const fetchMedications = () => {
    const fetchOptions = { method: "GET" };

    fetch(apiBaseUrl, fetchOptions)
        .then(response => response.json())
        .then(data => {
            allMedications.value = data.map(med => ({
                ...med,
                photo: med.photo && !med.photo.startsWith('data:image') && !med.photo.startsWith('https')
                    ? `https://apipharmacie.pecatte.fr/images/${med.photo}`
                    : med.photo
            }));

            // Mise à jour des formes uniques
            uniqueFormes.value = [...new Set(allMedications.value.map(med => med.formepharmaceutique))];

            // Appliquer le filtre si une forme est sélectionnée
            filterMedications();
        })
        .catch(error => {
            console.error("Erreur lors de la récupération des médicaments: ", error);
        });
};

// Filtrer les médicaments en fonction de la recherche et de la forme sélectionnée
const filterMedications = () => {
    medications.value = allMedications.value.filter(med => {
        const matchesSearch = searchTerm.value ? med.denomination.toLowerCase().includes(searchTerm.value.toLowerCase()) : true;
        const matchesForme = selectedForme.value ? med.formepharmaceutique === selectedForme.value : true;
        return matchesSearch && matchesForme;
    });
};

// Sélectionne une forme et met à jour l'affichage
const selectForme = (forme) => {
    selectedForme.value = forme;
    showDropdown.value = false;
    filterMedications();
};

// Ouvrir/fermer le menu déroulant
const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value;
};

const addNewMedicament = () => {
    const fetchOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            denomination: newMedicament.value.denomination,
            formepharmaceutique: newMedicament.value.formepharmaceutique,
            qte: newMedicament.value.qte,
            photo: newMedicament.value.photo || ""
        })
    };

    fetch(apiBaseUrl, fetchOptions)
        .then(response => response.json())
        .then(result => {
            if (result.status === 1) {
                fetchMedications();
                showForm.value = false;
                newMedicament.value = { denomination: '', formepharmaceutique: '', qte: 0, photo: null };
            } else {
                console.error("Erreur lors de l'ajout du médicament: ", result.message);
            }
        })
        .catch(error => {
            console.error("Erreur réseau lors de l'ajout du médicament: ", error);
        });
};

const updateMedicament = (med) => {
    const updatedMed = {
        id: med.id,
        denomination: med.denomination,
        formepharmaceutique: med.formepharmaceutique,
        qte: med.qte,
        photo: med.photo && med.photo.startsWith('data:image') ? med.photo : null
    };

    fetch(apiBaseUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedMed)
    })
        .then(response => response.json())
        .then(result => {
            if (result.status === 1) {
                med.editing = false;
                fetchMedications();
            }
        })
        .catch(error => {
            console.error("Erreur lors de la mise à jour du médicament: ", error);
        });
};

const deleteMedicament = (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce médicament ? Cette action est irréversible.")) {
        return;
    }

    const fetchOptions = { method: "DELETE" };

    fetch(`${apiBaseUrl}/${id}`, fetchOptions)
        .then(response => response.json())
        .then(result => {
            if (result.status === 1) {
                medications.value = medications.value.filter(med => med.id !== id);
            } else {
                console.error("Erreur lors de la suppression du médicament: ", result.message);
            }
        })
        .catch(error => {
            console.error("Erreur réseau lors de la suppression du médicament: ", error);
        });
};

const incrementQuantity = (med) => {
    med.qte += 1;
    updateMedicament(med);
};

const decrementQuantity = (med) => {
    if (med.qte > 0) {
        med.qte -= 1;
        updateMedicament(med);
    }
};



const toggleForm = () => {
    showForm.value = !showForm.value;
};

const startEdit = (med) => {
    originalMedicament.value[med.id] = { ...med };
    med.editing = true;
};

const cancelEdit = (med) => {
    Object.assign(med, originalMedicament.value[med.id]);
    med.editing = false;
};

const handleFileUploadNew = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        newMedicament.value.photo = reader.result;
    };
    reader.readAsDataURL(file);
};

const handleFileUpload = (event, med) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        med.photo = reader.result;
    };
    reader.readAsDataURL(file);
};


watch(searchTerm, filterMedications);
onMounted(fetchMedications);

</script>

<style scoped>
body {
    font-family: Arial, sans-serif;
    background-color: #f4f4f4;
    margin: 0;
    padding: 0;
}

.container {
    width: 90%;
    max-width: 1200px;
    margin: 20px auto;
    padding: 20px;
    background: white;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 10px;
}

h1 {
    text-align: center;
    color: #333;
}

button {
    background-color: #007BFF;
    color: white;
    border: none;
    padding: 10px 15px;
    cursor: pointer;
    border-radius: 5px;
    transition: background 0.3s ease-in-out;
}

button:hover {
    background-color: #0056b3;
}

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
    border-color: #007BFF;
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


table {
    width: 100%;

    background: white;
}

th,
td {
    border: 1px solid #ddd;
    padding: 10px;
    text-align: left;
    color: black;
    vertical-align: middle;
    height: 60px;
}

th {
    background-color: #007BFF;
    color: white;
}

tr:nth-child(even) {
    background: #f9f9f9;
}

img {
    border-radius: 5px;
    max-width: 50px;
}


.action-buttons {
    display: solid;
    justify-content: space-between;
    align-items: center;
    gap: 5px;
    height: 100%;
}

.action-buttons button {
    flex: 1;
    padding: 8px 12px;
    height: 40px;
    text-align: center;
}


.button-container {
    margin-top: 15px;
    display: flex;
    justify-content: center;
}

.button-container button {
    width: 100%;
    max-width: 100%;
    padding: 12px;
    font-size: 18px;
    background-color: #007BFF;
    border-radius: 5px;
    border: none;
    color: white;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.3s ease-in-out;
}

.button-container button:hover {
    background-color: #007BFF;
}

.search-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin-bottom: 15px;
    width: 100%;
}

.search-container input {
    flex: 1;
    max-width: 400px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 16px;
    transition: border 0.3s ease-in-out;
}

.search-container input:focus {
    border-color: #007BFF;
    outline: none;
}

.search-container button {
    padding: 10px 15px;
    font-size: 16px;
    background-color: #007BFF;
    border: none;
    border-radius: 5px;
    color: white;
    cursor: pointer;
    transition: background 0.3s ease-in-out;
}

.search-container button:hover {
    background-color: #0056b3;
}

.dropdown {
    position: relative;
}

.dropdown-menu {
    position: absolute;
    top: 100%;
    left: 0;
    background: white;
    border: 1px solid #ddd;
    border-radius: 5px;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 10;
    display: flex;
    flex-direction: column;
    width: 200px;
}

.dropdown-menu button {
    background: white;
    color: black;
    padding: 10px;
    border: none;
    text-align: left;
    width: 100%;
    cursor: pointer;
    transition: background 0.3s ease-in-out;
}

.dropdown-menu button:hover {
    background: #007BFF;
    color: white;
}
</style>
