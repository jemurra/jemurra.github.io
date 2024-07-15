let csvData = []; // Array to store parsed CSV data
let headerRow = []; // Array to store header row
let totalRow = []; // Array to store total row
let currentSortColumn = ''; // Variable to keep track of current sort column
let sortDirection = 'asc'; // Variable to keep track of sort direction

Highcharts.setOptions({ credits: false });

// Function to check input text
function checkInput() {
    const inputText = document.getElementById('inputText').value.trim();
    const correctText = 'UFB4all'; // Change this to your specific text

    if (inputText === correctText) {
        // Close the popup
        document.getElementById('popupOverlay').style.display = 'none';
        // Load CSV data via fetch
        loadCSVData();
    } else {
        // Display error message
        document.getElementById('errorMessage').textContent = 'Incorrect text. Please try again.';
    }
}

// Function to load CSV data via fetch
function loadCSVData() {
    const csvUrl = './data.csv'; // Replace with your CSV file URL or endpoint

    fetch(csvUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(csv => {
            processCSV(csv);
            processAndRenderChart(csv); // Process and render Highcharts chart with initial data
        })
        .catch(error => {
            console.error('Error fetching CSV:', error);
            // Handle error (e.g., display error message)
        });
}

// Function to process CSV data
function processCSV(csv) {
    const rows = csv.trim().split('\n').map(row => row.split(','));
    headerRow = rows[0]; // First row as header row
    totalRow = rows[rows.length - 1]; // Last row as total row
    csvData = rows.slice(1, rows.length - 1); // Exclude header and total rows for sorting
    renderTable(headerRow, csvData);
}

// Function to render table with CSV data
function renderTable(header, data) {
    const table = document.getElementById('csvTable');
    table.innerHTML = ''; // Clear existing table

    // Create table headers from header row
    let headerRow = table.createTHead().insertRow();
    header.forEach((cell, index) => {
        let th = document.createElement('th');
        th.textContent = cell;
        th.classList.add('sortable-header'); // Add class for sortable headers
        th.setAttribute('data-column', index); // Add data attribute for sorting

        // Add sort indicator
        if (index === parseInt(currentSortColumn)) {
            th.classList.add(sortDirection);
        }

        headerRow.appendChild(th);
    });

    // Create total row at the top
    let totalRowElement = table.insertRow();
    totalRowElement.setAttribute('data-column', 'total'); // Mark total row as non-sortable
    totalRow.forEach(cell => {
        let td = totalRowElement.insertCell();
        td.textContent = cell;
    });

    // Create table body from data
    let tbody = table.createTBody(); // Declare tbody only once

    data.forEach(rowData => {
        let row = tbody.insertRow();
        rowData.forEach(cell => {
            let td = row.insertCell();
            td.textContent = cell;
        });
    });

    // Add event listener for column header click for sorting
    table.querySelectorAll('th').forEach((header, index) => {
        header.addEventListener('click', () => {
            handleColumnHeaderClick(index.toString());
        });
    });
}

// Function to handle column header click for sorting
function handleColumnHeaderClick(columnIndex) {
    if (columnIndex !== 'total') {
        // Determine if clicked column is the current sort column
        if (currentSortColumn === columnIndex) {
            // Toggle sort direction
            sortDirection = (sortDirection === 'asc') ? 'desc' : 'asc';
        } else {
            // Set new sort column and default to ascending
            currentSortColumn = columnIndex;
            sortDirection = 'asc';
        }

        // Remove sort indicators from all headers
        document.querySelectorAll('.sortable-header').forEach(header => {
            header.classList.remove('asc', 'desc');
        });

        // Add sort indicator to clicked header
        document.querySelector(`th[data-column="${columnIndex}"]`).classList.add(sortDirection);

        // Perform sorting
        csvData.sort((a, b) => {
            let comparison = 0;
            if (a[currentSortColumn] > b[currentSortColumn]) {
                comparison = 1;
            } else if (a[currentSortColumn] < b[currentSortColumn]) {
                comparison = -1;
            }
            return (sortDirection === 'desc') ? (comparison * -1) : comparison;
        });

        // Re-render the sorted table
        renderTable(headerRow, csvData);
    }
}

// Function to map text values to numeric points
function mapToNumericPoints(value) {
    switch (value) {
        case '1B':
            return 1;
        case '2B':
            return 2;
        case '3B':
            return 3;
        case 'HR':
            return 4;
        case 'BB':
            return .8;
        case 'RE':
            return .2;
        default:
            return 0; // Return 0 or handle other cases as needed
    }
}
