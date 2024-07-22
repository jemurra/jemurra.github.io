let csvData = []; // Array to store parsed CSV data
let headerRow = []; // Array to store header row
let totalRow = []; // Array to store total row
let currentSortColumn = ''; // Variable to keep track of current sort column
let sortDirection = 'asc'; // Variable to keep track of sort direction

Highcharts.setOptions({ credits: false });

// Function to check input text
function checkInput() {
    const inputText = document.getElementById('inputText').value.trim();
    const correctText = 'Andy4prez'; // Change this to your specific text

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

// Highchart Stuff
//test data
const testData = `
PLAYER,AB_1,AB_2,AB_3,AB_4,AB_5,AB_6,AB_7,AB_8,AB_9,AB_10,AB_11,AB_12,AB_13,AB_14,AB_15,AB_16,AB_17,AB_18,AB_19,AB_20,AB_21
Allison,FO,GO,FO,RE,PO,GO,1B,GO,1B,RE,GO,FO,FC,1B,1B,1B,FO,1B,1B,1B,1B
`;

// Split CSV into rows
const rows = testData.trim().split('\n');

// Extract headers and data
const headers = rows[0].split(',');
const values = rows[1].split(',');

// Remove first element from values (PLAYER name)
values.shift();

// Prepare series data for Highcharts
const seriesData = headers.slice(1).map((header, index) => ({
    name: header,
    y: mapToNumericPoints(values[index]),
    label: values[index] 
}));


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
            return 0.8;
        case 'RE':
            return 0.2;
        default:
            return 0; // Return 0 or handle other cases as needed
    }
}

Highcharts.chart('chartContainer', {
    chart: {
        type: 'column'
    },
    title: {
        text: 'Allison Hits'
    },
    xAxis: {
        categories: headers.slice(1) // Use headers for x-axis categories
    },
    yAxis: {
        title: {
            text: 'Result'
        }
    },
    series: [{
        name: 'Player',
        data: seriesData,
        dataLabels: {
            enabled: true,
            formatter: function() {
                return this.point.label; // Display label text on the column
            }
        }
    }]
});
