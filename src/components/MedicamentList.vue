<template>
    <div>
        <div class="search-container">
            <input type="text" v-model="searchTerm" placeholder="Rechercher un médicament..." />
            <button @click="fetchMedications">Rechercher</button>

            <div class="dropdown">
                <button @click="toggleDropdown">Filtrer ▼</button>
                <div v-if="showDropdown" class="dropdown-menu">
                    <button @click="selectForme('')">Toutes les formes</button>
                    <button v-for="forme in uniqueShapes" :key="forme" @click="selectForme(forme)">
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
                            <button @click="() => incrementQuantity(med)">+</button>
                            <button @click="() => decrementQuantity(med)">-</button>
                        </td>

                    </tr>
                </tbody>
            </table>
        </div>
        <div>
            <div class="button-container">
                <button @click="showForm = true">+ Ajouter un médicament</button>
            </div>

            <MedicamentForm v-if="showForm" :show="showForm" :key="showForm" @add-medicament="addMedicament"
                @close-form="showForm = false" />
        </div>
    </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import MedicamentForm from './MedicamentForm.vue';

const searchTerm = ref('');
const medications = ref([]);
const allMedications = ref([]);
const showDropdown = ref(false);
const selectedShape = ref('');
const uniqueShapes = ref(['Comprimé', 'Effervescent', 'Gélule', 'Poudre', 'Suppositoire']);
const showForm = ref(false);
const originalMedication = ref({});
const apiBaseUrl = 'https://apipharmacie.pecatte.fr/api/9/medicaments';


const fetchMedications = () => {
    const fetchOptions = { method: "GET" };

    fetch(apiBaseUrl, fetchOptions)
        .then(response => response.json())
        .then(data => {
            allMedications.value = data.map(med => ({
                ...med,
                photo: med.photo && !med.photo.startsWith('data:image') && !med.photo.startsWith('https') //vérifie que le photo est accessible
                    ? `https://apipharmacie.pecatte.fr/images/${med.photo}`
                    : med.photo
            }));

            uniqueShapes.value = [...new Set(allMedications.value.map(med => med.formepharmaceutique))];  // stock les types de formes pour pouvoir filtrer

            filterMedications(); // applique le filtre si une forme est sélectionnée
        })
        .catch(error => {
            console.error("Erreur lors de la récupération des médicaments: ", error);
        });
};

const filterMedications = () => {
    medications.value = allMedications.value.filter(med => {
        const matchesSearch = searchTerm.value ? med.denomination.toLowerCase().includes(searchTerm.value.toLowerCase()) : true; // filtre le résultat en fonction du médicament recherché
        const matchesShape = selectedShape.value ? med.formepharmaceutique === selectedShape.value : true; // filtre le résultat en fonction de la forme pharmaceutique filtrée
        return matchesSearch && matchesShape;
    });
};

const selectForme = (forme) => {
    selectedShape.value = forme; // met à jour la valeur de la forme selectionnée pour le filtre
    showDropdown.value = false; // ferme le bandeau déroulant
    filterMedications(); // applique le filtre sur la liste
};

const toggleDropdown = () => {
    showDropdown.value = !showDropdown.value; // logique pour gérer l'ouverture ou la fermeture du bandeau déroulant
};

const addMedicament = (newMedicament) => {
    fetch(apiBaseUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },  // fait une requête pour enregistrer un nouvel objet dans l'api
        body: JSON.stringify(newMedicament)
    })
        .then(response => response.json())
        .then(result => {
            if (result.status === 1) {
                fetchMedications(); // si enregistré on affiche la nouvelle liste modifiée
                showForm.value = false; // et on ferme le formulaire
            }
        })
        .catch(error => {
            console.error("Erreur lors de l'ajout du médicament: ", error);
        });
};
const updateMedicament = (med) => {
    //crée une copie du médicament à modifier
    const updatedMed = {
        id: med.id,
        denomination: med.denomination,
        formepharmaceutique: med.formepharmaceutique,
        qte: med.qte,
        photo: med.photo && med.photo.startsWith('data:image') ? med.photo : null //s'assurer de l'affichage de la photo à chaque modification
    };

    fetch(apiBaseUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" }, // requête PUT pour mettre à jour les données
        body: JSON.stringify(updatedMed)
    })
        .then(response => response.json())
        .then(result => {
            if (result.status === 1) {
                med.editing = false;   // si données mises à jour alors on sort du mode édition
                fetchMedications(); // et on affiche la nouvelle liste mise à jour
            }
        })
        .catch(error => {
            console.error("Erreur lors de la mise à jour du médicament: ", error);
        });
};

const deleteMedicament = (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce médicament ? Cette action est irréversible.")) {
        return; // pop-up pour demander la confirmation à l'utilisateur
    }

    const fetchOptions = { method: "DELETE" };

    fetch(`${apiBaseUrl}/${id}`, fetchOptions)
        .then(response => response.json())
        .then(result => {
            if (result.status === 1) {
                medications.value = medications.value.filter(med => med.id !== id); // supprime le médicament avec l'id recherché
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
    updateMedicament(med); // augmente la quantité et fait appel à updateMedicament() pour la réutilisabilité du code
};

const decrementQuantity = (med) => {
    if (med.qte > 0) {
        med.qte -= 1;
        updateMedicament(med); // diminue la quantité et fait appel à updateMedicament() pour la réutilisabilité du code
    }
};


const startEdit = (med) => {
    originalMedication.value[med.id] = { ...med }; // crée une sauvegarde du médicament dans son état actuel
    med.editing = true; // ouvre le mode édition
};

const cancelEdit = (med) => {
    Object.assign(med, originalMedication.value[med.id]); // restaure les données initiales au médicament
    med.editing = false; // ferme le mode édition
};


// permet de convertir une image en base 64
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


button {
    background-color: #008020;
    color: white;
    border: none;
    padding: 10px 15px;
    cursor: pointer;
    border-radius: 5px;
    transition: background 0.3s ease-in-out;
}

button:hover {
    background-color: gray;
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
    background-color: #008020;
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
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 5px;
    height: 100px;
}

.action-buttons button {
    flex: 1;
    padding: 8px 12px;
    margin: auto 0px;
    height: 40px;
    width: 60px;
    text-align: center;
    border: solid;
    border-color: black;
    border-width: 1px;
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
    background-color: #008020;
    border-radius: 5px;
    border: none;
    color: white;
    font-weight: bold;
    cursor: pointer;
    transition: background 0.3s ease-in-out;
}

.button-container button:hover {
    background-color: darkgreen;
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
    border-color: #008020;
    outline: none;
}

.search-container button {
    padding: 10px 15px;
    font-size: 16px;
    background-color: #008020;
    border: none;
    border-radius: 5px;
    color: white;
    cursor: pointer;
    transition: background 0.3s ease-in-out;
}

.search-container button:hover {
    background-color: darkgreen;
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
    background: #008020;
    color: white;
}
</style>
