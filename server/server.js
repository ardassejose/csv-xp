const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const crypto = require("crypto");

const app = express();
const port = 3000;
// Gera uma chave aleatória para criptografia
const encryptionKey = crypto.randomBytes(32);

// Adicione o middleware CORS para permitir solicitações de qualquer origem
app.use(
  cors({
    origin: null,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

app.options("/assessores", (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.status(200).send();
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Permite qualquer origem. Substitua '*' pela sua origem real, se necessário.
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.json()); // Parse do corpo da requisição como JSON

// Armazena os dados recebidos em uma variável (exemplo simples)
let storedData = null;

// Função para criptografar dados
function encryptData(data) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", encryptionKey, iv);
  let encryptedData = cipher.update(JSON.stringify(data), "utf-8", "hex");
  encryptedData += cipher.final("hex");
  return { iv: iv.toString("hex"), encryptedData };
}

// Função para descriptografar dados
function decryptData(encryptedData, iv) {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    encryptionKey,
    Buffer.from(iv, "hex")
  );
  let decryptedData = decipher.update(encryptedData, "hex", "utf-8");
  decryptedData += decipher.final("utf-8");
  return JSON.parse(decryptedData);
}

// Rota para receber dados em /assessores (POST)
app.post("/assessores", (req, res) => {
  try {
    const jsonData = req.body;
    storedData = encryptData(jsonData);
    res.json({ message: "Dados recebidos com sucesso!" });
  } catch (error) {
    console.error("Erro ao processar a requisição POST:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
});

// Rota para obter os dados armazenados em /assessores (GET)
app.get("/assessores", async (req, res) => {
  try {
    res.json(storedData || {}); // Responder com os dados armazenados ou um objeto vazio
  } catch (error) {
    console.error("Erro ao obter dados:", error);
    res.status(500).json({ error: "Erro ao obter dados" });
  }
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
