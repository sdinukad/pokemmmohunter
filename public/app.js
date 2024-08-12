document.addEventListener('DOMContentLoaded', () => {
    // Load region and location data from JSON files
    fetch('locations.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load locations.json');
            }
            return response.json();
        })
        .then(locations => {
            const regionSelect = document.getElementById('region');
            const locationSelect = document.getElementById('location');
            const locationSearch = document.getElementById('locationSearch');

            // Populate region select
            for (const region of Object.keys(locations)) {
                const option = document.createElement('option');
                option.value = region;
                option.textContent = region;
                regionSelect.appendChild(option);
            }

            // Set default region to Kanto and update location options
            regionSelect.value = 'Kanto'; // Set default value
            updateLocationOptions('Kanto', locations);

            // Update location options based on selected region
            regionSelect.addEventListener('change', () => {
                const selectedRegion = regionSelect.value;
                updateLocationOptions(selectedRegion, locations);
            });

            // Filter location options based on search input
            locationSearch.addEventListener('input', () => {
                const filter = locationSearch.value.toLowerCase();
                const options = locationSelect.options;

                for (let i = 0; i < options.length; i++) {
                    const txtValue = options[i].textContent || options[i].innerText;
                    if (txtValue.toLowerCase().indexOf(filter) > -1) {
                        options[i].style.display = "";
                    } else {
                        options[i].style.display = "none";
                    }
                }

                // Show the dropdown list
                locationSelect.size = options.length;
                locationSelect.style.display = "block";
            });

            // Update search box with selected location when chosen from dropdown
            locationSelect.addEventListener('change', () => {
                locationSearch.value = locationSelect.value;
                locationSelect.style.display = "none"; // Hide the dropdown after selection
            });

            // Handle form submission
            document.getElementById('dataForm').addEventListener('submit', event => {
                event.preventDefault();
                const region = regionSelect.value;
                const location = locationSearch.value;

                // Validation check for empty location
                if (!location) {
                    alert('Please select a location before submitting.');
                    return;
                }

                const tableDiv = document.getElementById('pokemonTable');
                tableDiv.innerHTML = '<p>Loading...</p>';
                fetch(`/pokemons_data?region=${encodeURIComponent(region)}&location=${encodeURIComponent(location)}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Failed to fetch Pokémon data');
                        }
                        return response.json();
                    })
                    .then(pokemonData => {
                        updateTable(pokemonData);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('An error occurred while fetching Pokémon data.');
                    });
            });
        })
        .catch(error => {
            console.error('Error loading locations:', error);
            alert('An error occurred while loading location data.');
        });
});

function updateLocationOptions(region, locations) {
    const locationSelect = document.getElementById('location');
    locationSelect.innerHTML = ''; // Clear previous options

    if (locations[region]) {
        // Use a Set to store unique location names
        const uniqueLocations = new Set();

        // Iterate over locations and add filtered names to the Set
        locations[region].forEach(location => {
            // Use regex to remove parts within parentheses
            const cleanLocation = location.replace(/\s*\(.*?\)$/, '').trim();
            uniqueLocations.add(cleanLocation);
        });

        // Populate location dropdown with unique names
        uniqueLocations.forEach(location => {
            const option = document.createElement('option');
            option.value = location;
            option.textContent = location;
            locationSelect.appendChild(option);
        });
    }

    // Show the location list
    locationSelect.size = locationSelect.options.length;
    locationSelect.style.display = "block";
}

function updateTable(data) {
    const tableDiv = document.getElementById('pokemonTable');
    tableDiv.innerHTML = ''; // Clear previous table

    if (!Array.isArray(data) || data.length === 0) {
        tableDiv.innerHTML = '<p>No Pokémon found.</p>';
        return;
    }

    const groupedData = groupByNameAndId(data);

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tbody = document.createElement('tbody');

    // Create table header
    thead.innerHTML = `
        <tr>
            <th>Name</th>
            <th>ID</th>
            <th>Location Type</th>
            <th>Rarity</th>
            <th>Min Level - Max Level</th>
            <th>Held Item</th>
            <th>Day Time/Season</th>
        </tr>
    `;

    // Create table rows
    Object.keys(groupedData).forEach(nameId => {
        const group = groupedData[nameId];
        const [name, id] = nameId.split('|');

        // Main row for Pokémon name and ID
        const mainRow = document.createElement('tr');
        mainRow.innerHTML = `
            <td rowspan="${group.length}">${name}</td>
            <td rowspan="${group.length}">${id}</td>
            <td>${group[0].type || ''}</td>
            <td>${group[0].rarity || ''}</td>
            <td>${group[0].minLevel || ''} - ${group[0].maxLevel || ''}</td>
            <td>${group[0].heldItems || ''}</td>
            <td>${group[0].dayTimeSeason || ''}</td>
        `;
        tbody.appendChild(mainRow);

        // Additional rows for detailed information
        for (let i = 1; i < group.length; i++) {
            const detailRow = document.createElement('tr');
            detailRow.innerHTML = `
                <td>${group[i].type || ''}</td>
                <td>${group[i].rarity || ''}</td>
                <td>${group[i].minLevel || ''} - ${group[i].maxLevel || ''}</td>
                <td>${group[i].heldItems || ''}</td>
                <td>${group[i].dayTimeSeason || ''}</td>
            `;
            tbody.appendChild(detailRow);
        }
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    tableDiv.appendChild(table);
}

function groupByNameAndId(data) {
    return data.reduce((acc, item) => {
        const key = `${item.name}|${item.id}`;
        (acc[key] = acc[key] || []).push(item);
        return acc;
    }, {});
}
