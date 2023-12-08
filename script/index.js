document.addEventListener("DOMContentLoaded", () => {
  const dropArea = document.getElementById("drop-area");
  const fileInput = document.getElementById("fileInput");
  const fileContent = document.getElementById("file-content");
  const sendButton = document.getElementById("sendButton");
  const deleteButton = document.getElementById("deleteButton");
  const fetchDataButton = document.getElementById("fetchDataButton");

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

      if (fileType === "csv" || fileType === "xlsx") {
        jsonData = convertFileToJSON(fileData, fileType);
        fileContent.textContent = "Arquivo recebido!";
      } else {
        alert("Tipo de arquivo não suportado");
        jsonData = null;
      }
    };

    reader.readAsText(file);
  }

  function getFileType(file) {
    const fileName = file.name;
    const fileExtension = fileName.split(".").pop().toLowerCase();

    if (fileExtension === "csv" || fileExtension === "xlsx") {
      return fileExtension;
    }

    return null;
  }

  function convertFileToJSON(fileData, fileType) {
    if (fileType === "csv") {
      return convertCSVtoJSON(fileData);
    } else if (fileType === "xlsx") {
      return convertXLSXtoJSON(fileData);
    }

    return null;
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

    return XLSX.utils.sheet_to_json(sheet);
  }

  function sendJSONToBackend(jsonData) {
    fetch("https://api-csv-xp.onrender.com/assessores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData),
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(
            `Erro na resposta do servidor: ${response.status} ${response.statusText}`
          );
        }
      })
      .then((data) => {
        window.alert("JSON enviado para o backend com sucesso!");
      })
      .catch((error) => {
        console.error("Erro na solicitação POST:", error);
      });
  }

  function deleteFiles() {
    fetch("https://api-csv-xp.onrender.com/delete-assessores", {
      method: "DELETE",
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(
            `Erro ao excluir arquivos: ${response.status} ${response.statusText}`
          );
        }
      })
      .then((data) => {
        window.alert(data.message);
        jsonData = null;
        fileContent.textContent = "";
      })
      .catch((error) => {
        console.error("Erro ao excluir arquivos:", error);
      });
  }

  function fetchAssessoresData() {
    fetch("https://api-csv-xp.onrender.com/assessores", {
      method: "GET",
    })
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(
            `Erro na resposta do servidor: ${response.status} ${response.statusText}`
          );
        }
      })
      .then((data) => {
        fileContent.textContent = JSON.stringify(data, null, 2);
      })
      .catch((error) => {
        console.error("Erro ao obter dados:", error);
      });
  }
});
