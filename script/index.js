document.addEventListener('DOMContentLoaded', () => {
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('fileInput');
    const fileContent = document.getElementById('file-content');
    const sendButton = document.getElementById('sendButton');
    const deleteButton = document.getElementById('deleteButton');
    const fetchDataButton = document.getElementById('fetchDataButton')
    const responseFetchContent = document.getElementById('responseFetchContent')

    let jsonData = null;

    dropArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropArea.classList.add('drag-over');
    });

    dropArea.addEventListener('dragleave', () => {
        dropArea.classList.remove('drag-over');
    });

    dropArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dropArea.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        handleFile(file);
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        handleFile(file);
    });

    sendButton.addEventListener('click', () => {
        if (jsonData) {
            sendJSONToBackend(jsonData);
        }
    });

    fetchDataButton.addEventListener('click', () => {
        fetchAssessoresData()
    })

    deleteButton.addEventListener('click', () => {
        deleteFiles();
    });

    function handleFile(file) {
        const reader = new FileReader();

        reader.onload = (event) => {
            const csvData = event.target.result;
            jsonData = convertCSVtoJSON(csvData);
            fileContent.textContent = JSON.stringify(jsonData, null, 2);
            fileContent.style.display = 'block';
        };

        reader.readAsText(file);
    }

    function convertCSVtoJSON(csvData) {
        const lines = csvData.split('\n');
        const headers = lines[0].split(',');

        const jsonData = [];

        for (let i = 1; i < lines.length; i++) {
            const currentLine = lines[i].split(',');
            const entry = {};

            for (let j = 0; j < headers.length; j++) {
                entry[headers[j]] = currentLine[j];
            }

            jsonData.push(entry);
        }

        return jsonData;
    }

    function sendJSONToBackend(jsonData) {
        const xhr = new XMLHttpRequest();
        const url = 'http://localhost:3000/assessores'; // Substitua com a rota do seu backend

        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                console.log('JSON enviado com sucesso para o backend!');
            }
        };

        xhr.send(JSON.stringify(jsonData));
    }

    function deleteFiles() {
        // Código para fazer uma requisição DELETE para o servidor
        fetch('http://localhost:3000/delete-assessores', {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message); // Mensagem do servidor após excluir os arquivos
            jsonData = null; // Define jsonData como null após a exclusão (ou ajuste conforme necessário)
            fileContent.textContent = ''; // Limpa o conteúdo exibido
            fileContent.style.display = 'none';
        })
        .catch(error => console.error('Erro ao excluir arquivos:', error));
    }

    function fetchAssessoresData() {
        // Fazer uma requisição GET para a rota /assessores no servidor
        fetch('http://localhost:3000/assessores')
            .then(response => response.json())
            .then(data => {
                // Mostrar os dados na tela (ajuste conforme necessário)
                responseFetchContent.textContent = JSON.stringify(data, null, 2);
                responseFetchContent.style.display = 'block';
            })
            .catch(error => console.error('Erro ao obter dados:', error));
    }
});
