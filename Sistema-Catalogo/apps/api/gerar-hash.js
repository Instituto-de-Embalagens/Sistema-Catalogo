// gerar-hash.js
const bcrypt = require("bcryptjs");

async function run() {
  const senha = "catalogo123";
  const hash = await bcrypt.hash(senha, 10);
  console.log("Senha:", senha);
  console.log("Hash:", hash);
}

run();
