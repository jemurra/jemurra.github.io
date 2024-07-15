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

    // Create table body and rows from data
    let tbody = table.createTBody();
    data.forEach(rowData => {
        let row = tbody.insertRow();
        rowData.forEach(cell => {
            let td = row.insertCell();
            td.textContent = cell;
        });
    });

    // Add event listener to table rows for filtering Highcharts data
    const tableRows = tbody.querySelectorAll('tr');
    tableRows.forEach((row, index) => {
        row.addEventListener('click', () => {
            filterHighchartsData(index);
        });
    });
}

// Function to handle column header click for sorting
function handleColumnHeaderClick(event) {
    const columnIndex = event.target.getAttribute('data-column');

    if (columnIndex !== null && columnIndex !== 'total') {
        // Determine if clicked column is the current sort column
        if (currentSortColumn === columnIndex.toString()) {
            // Toggle sort direction
            sortDirection = (sortDirection === 'asc') ? 'desc' : 'asc';
        } else {
            // Set new sort column and default to ascending
            currentSortColumn = columnIndex.toString();
            sortDirection = 'asc';
        }

        // Remove sort indicators from all headers
        document.querySelectorAll('.sortable-header').forEach(header => {
            header.classList.remove('asc', 'desc');
        });

        // Add sort indicator to clicked header
        event.target.classList.add(sortDirection);

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

// Event listener for column header click
document.addEventListener('click', function(event) {
    if (event.target.tagName === 'TH') {
        handleColumnHeaderClick(event);
    }
});

// Show popup on page load
document.getElementById('popupOverlay').style.display = 'flex';

// HIGHCHARTS FUNCTIONS BELOW
// Function to convert CSV string to array
function csvToArray(csv) {
    return csv.trim().split('\n').map(row => row.split(','));
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
            return 0.75;
        case 'RE':
            return 0.25;
        default:
            return 0; // Return 0 or handle other cases as needed
    }
}

// Function to process CSV and render Highcharts chart
function processAndRenderChart(csv) {
    const rows = csvToArray(csv);
    const headerRow = rows[0]; // Extract header row
    const dataRows = rows.slice(1); // Extract data rows

    // Initialize series array for Highcharts
    const series = [];

    // Iterate through each row (player)
    dataRows.forEach(row => {
        const playerName = row[0]; // First column is player name
        const playerData = row.slice(1); // Remaining columns are data points

        // Filter out empty values and create data array for the series
        const data = playerData.filter(value => value !== '').map((value, index) => ({
            y: mapToNumericPoints(value), // Map text value to numeric point
            name: headerRow[index + 1] // Use only the column header
        }));

        // Add the series for this player to the series array
        series.push({
            name: playerName, // Player name as series name
            data: data // Data array for the series
        });
    });

    // Call function to create Highcharts chart with the prepared series data
    createHighchart(series);
}

// Function to create Highcharts chart
function createHighchart(seriesData) {
    Highcharts.chart('chartContainer', {
        chart: {
            type: 'line' // Use 'line' type for multiple line series
        },
        title: {
            text: 'At Bats By Brewer :)' // Chart title
        },
        xAxis: {
            title: {
                text: 'At Bat' // X-axis title
            },
            categories: seriesData.length > 0 ? seriesData[0].data.map(point => point.name) : [] // Categories based on data points
        },
        yAxis: {
            title: {
                text: 'Result' // Y-axis title
            }
        },
        series: seriesData // Series data prepared earlier
    });
}

// Function to filter Highcharts data based on clicked row index
function filterHighchartsData(rowIndex) {
    // Get the row data from csvData array
    const rowData = csvData[rowIndex];

    // Prepare filtered series based on clicked row data
    const filteredSeries = rowData.slice(1).map((value, index) => ({
        y: mapToNumericPoints(value),
        name: headerRow[index + 1]
    }));

    // Create a new chart with filtered series
    Highcharts.chart('chartContainer', {
        chart: {
            type: 'line'
        },
        title: {
            text: 'At Bats By Brewer :)'
        },
        xAxis: {
            title: {
                text: 'At Bat'
            },
            categories: headerRow.slice(1) // Use only the column headers
        },
        yAxis: {
            title: {
                text: 'Result'
            }
        },
        series: [{
            name: rowData[0], // Player name as series name
            data: filteredSeries // Filtered data array for the series
        }],
        credits: {
            enabled: false // Disable credits
        }
    });
}

// Example CSV processing and chart rendering on load
const csvUrl = './rawdata.csv'; // Replace with your CSV file URL or endpoint

fetch(csvUrl)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    })
    .then(csv => {
        processAndRenderChart(csv);
    })
    .catch(error => {
        console.error('Error fetching CSV:', error);
        // Handle error (e.g., display error message)
    });
