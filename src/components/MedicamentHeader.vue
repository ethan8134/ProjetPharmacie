<template>
  <header>
    <h2>Pharmacie du Tarn</h2>
    <h1>💊 Gestion des Médicaments</h1>
  </header>
</template>

<style scoped>
header {
  display: flex;
  align-items: center;
  padding: 15px;
  background: #008020;
  color: white;
  font-size: 1.8em;
  font-weight: bold;
  border-bottom: 4px solid darkgreen;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  position: relative;
  height: 90px;
}

h1 {
  margin: 0;
  font-size: 24px;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

h2 {
  font-size: 20px;
  margin: 0px 7px;
  font-weight: normal;
  flex-shrink: 0;
}
</style>
