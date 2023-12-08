document.addEventListener("DOMContentLoaded", () => {
  const dropArea = document.getElementById("drop-area");
  const fileInput = document.getElementById("fileInput");
  const fileContent = document.getElementById("file-content");
  const sendButton = document.getElementById("sendButton");
  const deleteButton = document.getElementById("deleteButton");
  const fetchDataButton = document.getElementById("fetchDataButton");
  const responseFetchContent = document.getElementById("responseFetchContent");

  let jsonData = null;

  dropArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropArea.classList.add("drag-over");
  });

  dropArea.addEventListener("dragleave", () => {
    dropArea.classList.remove("drag-over");
  });

  dropArea.addEventListener("drop", (e) => {
    e.preventDefault();
    dropArea.classList.remove("drag-over");
    const file = e.dataTransfer.files[0];
    handleFile(file);
  });

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    handleFile(file);
  });

  sendButton.addEventListener("click", () => {
    if (jsonData) {
      sendJSONToBackend(jsonData);
    }
  });

  fetchDataButton.addEventListener("click", () => {
    fetchAssessoresData();
  });

  deleteButton.addEventListener("click", () => {
    deleteFiles();
  });

  function handleFile(file) {
    const reader = new FileReader();

    reader.onload = (event) => {
      const fileData = event.target.result;
      const fileType = getFileType(file);

      if (fileType === "csv") {
        jsonData = convertCSVtoJSON(fileData);
      } else if (fileType === "xlsx") {
        jsonData = convertXLSXtoJSON(fileData);
      }

      fileContent.textContent = "Arquivo recebido!";
      // fileContent.style.display = "block";
    };

    reader.readAsText(file);
  }

  function getFileType(file) {
    const fileName = file.name;
    const fileExtension = fileName.split(".").pop().toLowerCase();

    if (fileExtension === "csv") {
      return "csv";
    } else if (fileExtension === "xlsx") {
      return "xlsx";
    } else {
      // Pode adicionar suporte para outros tipos de arquivo conforme necessário
      alert("Tipo de arquivo não suportado");
      return null;
    }
  }

  function convertCSVtoJSON(csvData) {
    const lines = csvData.split("\n");
    const headers = lines[0].split(",");

    const jsonData = [];

    for (let i = 1; i < lines.length; i++) {
      const currentLine = lines[i].split(",");
      const entry = {};

      for (let j = 0; j < headers.length; j++) {
        entry[headers[j]] = currentLine[j];
      }

      jsonData.push(entry);
    }

    return jsonData;
  }

  function convertXLSXtoJSON(xlsxData) {
    const workbook = XLSX.read(xlsxData, { type: "binary" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    console.log(XLSX.utils.sheet_to_json(sheet));
    return XLSX.utils.sheet_to_json(sheet);
  }

  function sendJSONToBackend(jsonData) {
    const url = "https://api-csv-xp.onrender.com/assessores"; // Substitua com a rota do seu backend

    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData),
      credentials: "omit",
    })
      .then((response) => {
        if (response.ok) {
          console.log("JSON enviado com sucesso para o backend!");
        } else {
          console.error(
            "Erro na resposta do servidor:",
            response.status,
            response.statusText
          );
        }
      })
      .catch((error) => {
        console.error("Erro na solicitação POST:", error);
      });
  }

  function deleteFiles() {
    // Código para fazer uma requisição DELETE para o servidor
    fetch("https://api-csv-xp.onrender.com/delete-assessores", {
      method: "DELETE",
      credentials: "omit",
      mode: "no-cors",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.message); // Mensagem do servidor após excluir os arquivos
        jsonData = null; // Define jsonData como null após a exclusão (ou ajuste conforme necessário)
        fileContent.textContent = ""; // Limpa o conteúdo exibido
        fileContent.style.display = "none";
      })
      .catch((error) => console.error("Erro ao excluir arquivos:", error));
  }

  function fetchAssessoresData() {
    // Fazer uma requisição GET para a rota /assessores no servidor
    fetch("https://api-csv-xp.onrender.com/assessores", {
      method: "GET",
      headers: {
        Origin: "https://api-csv-xp.onrender.com/assessores", // Substitua "your-origin-url" pela URL real da sua aplicação
      },
    })
      .then((response) => response.json())
      .then((data) => {
        // Mostrar os dados na tela (ajuste conforme necessário)
        fileContent.textContent = JSON.stringify(data, null, 2);
        fileContent.style.display = "block";
      })
  }
});
