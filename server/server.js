const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

// Adicione o middleware CORS para permitir solicitações de qualquer origem
app.use(
  cors({
    origin: null,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true
  })
);
app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.json()); // Parse do corpo da requisição como JSON

// Armazena os dados recebidos em uma variável (exemplo simples)
let storedData = null;

// Rota para receber dados em /assessores (POST)
app.post("/assessores", (req, res) => {
  try {
    const jsonData = req.body;
    storedData = jsonData;
    res.json({ message: "Dados recebidos com sucesso!" });
  } catch (error) {
    console.error("Erro ao processar a requisição POST:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Rota para obter os dados armazenados em /assessores (GET)
app.get("/assessores", (req, res) => {
  // Retorna os dados armazenados (ou qualquer outro processamento necessário)
  res.json(storedData);
});

// Rota de Delete
app.delete("/delete-assessores", (req, res) => {
  // Lógica para deletar os arquivos (exemplo simples)
  storedData = null;

  res.json({ message: "Arquivos deletados com sucesso!" });
});

app.listen(port, () => {
  console.log(`Servidor Node.js rodando na porta: ${port}`);
});
