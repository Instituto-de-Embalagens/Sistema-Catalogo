// src/index.ts
import "dotenv/config";
import app from "./app";

const PORT = process.env.PORT || 3333;

async function bootstrap() {
  try {
    console.log("Iniciando API do Catálogo...");
    console.log("SPREAD-ID:", process.env.GOOGLE_SHEETS_SPREADSHEET_ID);

    app.listen(PORT, () => {
      console.log(`🚀 API rodando na porta ${PORT}`);
    });
  } catch (err) {
    console.error("Erro ao iniciar API:", err);
    process.exit(1);
  }
}

bootstrap();
