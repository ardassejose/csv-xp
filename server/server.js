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

// Lista de URLs permitidas para a rota GET /assessores
const allowedURLs = [
  "http://localhost:3000/assessores",
  "https://api-csv-xp.onrender.com/assessores",
];

// Middleware para verificar se a requisição GET está em uma URL permitida
const allowGetAssessores = (req, res, next) => {
  const requestedOrigin = req.get("origin");
  console.log(requestedOrigin);
  const requestedURL = req.protocol + "://" + req.get("host") + req.originalUrl;

  if (req.method === "GET" && allowedURLs.includes(requestedURL)) {
    next(); // Continue para a próxima função de middleware (rota permitida)
  } else {
    res.status(403).json({ error: "Acesso proibido" });
  }
};

// Adicione o middleware de autenticação à rota GET /assessores
app.get("/assessores", allowGetAssessores, async (req, res) => {
  try {
    // Verifique se há dados criptografados antes de tentar descriptografar
    if (storedData) {
      // Descriptografa os dados antes de enviá-los como resposta
      const decryptedData = decryptData(
        storedData.encryptedData,
        storedData.iv
      );
      res.json(decryptedData);
    } else {
      res.json(storedData); // Se não houver dados armazenados, responda com um objeto vazio
    }
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
