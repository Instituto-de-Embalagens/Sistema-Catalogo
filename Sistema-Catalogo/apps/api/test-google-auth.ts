import { getGoogleAuth } from "./src/services/google/googleAuth";

async function main() {
  try {
    const googleAuth = getGoogleAuth();
    const client = await googleAuth.getClient();
    const token = await googleAuth.getAccessToken();

    console.log("Client OK:", !!client);
    console.log("Token OK:", token ? "Gerado com sucesso" : "Veio vazio");
  } catch (err) {
    console.error("Erro ao autenticar no Google:", err);
  }
}

main();
