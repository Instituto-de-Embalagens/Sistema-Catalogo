"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const googleAuth_1 = require("./src/services/google/googleAuth");
async function main() {
    try {
        const googleAuth = (0, googleAuth_1.getGoogleAuth)();
        const client = await googleAuth.getClient();
        const token = await googleAuth.getAccessToken();
        console.log("Client OK:", !!client);
        console.log("Token OK:", token ? "Gerado com sucesso" : "Veio vazio");
    }
    catch (err) {
        console.error("Erro ao autenticar no Google:", err);
    }
}
main();
