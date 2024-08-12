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

            // Populate region select
            for (const region of Object.keys(locations)) {
                const option = document.createElement('option');
                option.value = region;
                option.textContent = region;
                regionSelect.appendChild(option);
            }

            // Update location options based on selected region
            regionSelect.addEventListener('change', () => {
                const selectedRegion = regionSelect.value;
                locationSelect.innerHTML = ''; // Clear previous options

                if (locations[selectedRegion]) {
                    // Use a Set to store unique location names
                    const uniqueLocations = new Set();

                    // Iterate over locations and add filtered names to the Set
                    locations[selectedRegion].forEach(location => {
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
            });

            // Handle form submission
            document.getElementById('dataForm').addEventListener('submit', event => {
                event.preventDefault();
                const region = regionSelect.value;
                const location = locationSelect.value;
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

function updateTable(data) {
    const tableDiv = document.getElementById('pokemonTable');
    tableDiv.innerHTML = ''; // Clear previous table

    if (!Array.isArray(data) || data.length === 0) {
        tableDiv.innerHTML = '<p>No Pokémon found.</p>';
        return;
    }

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
    data.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.name || ''}</td>
            <td>${row.id || ''}</td>
            <td>${row.type || ''}</td>
            <td>${row.rarity || ''}</td>
            <td>${row.minLevel || ''} - ${row.maxLevel || ''}</td>
            <td>${row.heldItems || ''}</td>
            <td>${row.dayTimeSeason || ''}</td>
        `;
        tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    tableDiv.appendChild(table);
}
