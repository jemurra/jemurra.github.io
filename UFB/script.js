<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Highcharts Column Chart from CSV Data</title>
  <!-- Include Highcharts library -->
  <script src="https://code.highcharts.com/highcharts.js"></script>
</head>
<body>

<div id="chartContainer" style="height: 400px; width: 100%;"></div>

<script>
  let csvData = []; // Array to store parsed CSV data
  let headerRow = []; // Array to store header row
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
        processAndRenderChart(); // Process and render Highcharts chart with initial data
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
    csvData = rows.slice(1); // Exclude header row

    // Ensure headerRow and csvData are correctly loaded
    console.log('Header row:', headerRow);
    console.log('CSV data:', csvData);
  }

  // Function to process and render Highcharts chart
  function processAndRenderChart() {
    // Assuming headerRow has AB_1, AB_2, ..., AB_21 as categories (adjust if needed)
    const categories = headerRow.slice(1); // Exclude the first element (PLAYER)

    // Map data for each player to numeric points
    const seriesData = csvData.map(row => ({
      name: row[0], // Player's name
      data: categories.map(category => mapToNumericPoints(row[headerRow.indexOf(category)]))
    }));

    // Create the chart
    Highcharts.chart('chartContainer', {
      chart: {
        type: 'column' // Column chart type
      },
      title: {
        text: 'Player Performance by Type of Play'
      },
      xAxis: {
        categories: categories, // Categories (AB_1, AB_2, ..., AB_21)
        title: {
          text: 'Type of Play' // X-axis title
        }
      },
      yAxis: {
        title: {
          text: 'Numeric Points' // Y-axis title
        }
      },
      series: seriesData // Data for the columns
    });
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

  // Load CSV data when the page loads
  loadCSVData();
</script>

</body>
</html>
