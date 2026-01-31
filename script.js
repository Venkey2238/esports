// Admin password (In production, this should be in environment variables)
// For Netlify deployment, we'll use Netlify Functions for real authentication
const ADMIN_PASSWORD = "RODY2024@AmongUs"; // Temporary password for demo

// Tournament data structure
let tournamentData = {
    players: [],
    adminLoggedIn: false
};

// DOM Elements
const adminModal = document.getElementById('adminModal');
const adminLoginBtn = document.getElementById('adminLoginBtn');
const closeModal = document.querySelector('.close');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');
const adminControls = document.getElementById('adminControls');
const pointsTable = document.getElementById('pointsTable');
const tableBody = document.getElementById('tableBody');
const newPlayerName = document.getElementById('newPlayerName');
const addPlayerBtn = document.getElementById('addPlayerBtn');
const resetBtn = document.getElementById('resetBtn');
const playerSelect = document.getElementById('playerSelect');
const calculateBtn = document.getElementById('calculateBtn');
const resultDiv = document.getElementById('result');
const successModal = document.getElementById('successModal');
const closeSuccess = document.querySelector('.close-success');
const successMessage = document.getElementById('successMessage');

// Initialize tournament data
function initTournamentData() {
    const savedData = localStorage.getItem('amongUsTournament');
    if (savedData) {
        tournamentData = JSON.parse(savedData);
    } else {
        // Default tournament data
        tournamentData = {
            players: [
                { name: "RODY", rounds: [0, 0, 0, 0, 0, 0, 0, 0] },
                { name: "Player 2", rounds: [0, 0, 0, 0, 0, 0, 0, 0] },
                { name: "Player 3", rounds: [0, 0, 0, 0, 0, 0, 0, 0] },
                { name: "Player 4", rounds: [0, 0, 0, 0, 0, 0, 0, 0] },
                { name: "Player 5", rounds: [0, 0, 0, 0, 0, 0, 0, 0] },
                { name: "Player 6", rounds: [0, 0, 0, 0, 0, 0, 0, 0] },
                { name: "Player 7", rounds: [0, 0, 0, 0, 0, 0, 0, 0] },
                { name: "Player 8", rounds: [0, 0, 0, 0, 0, 0, 0, 0] }
            ],
            adminLoggedIn: false
        };
        saveData();
    }
    
    updateTable();
    updatePlayerSelect();
    updateAdminUI();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('amongUsTournament', JSON.stringify(tournamentData));
}

// Update points table
function updateTable() {
    tableBody.innerHTML = '';
    
    // Sort players by total points (descending)
    const sortedPlayers = [...tournamentData.players].sort((a, b) => {
        const totalA = a.rounds.reduce((sum, val) => sum + (parseInt(val) || 0), 0);
        const totalB = b.rounds.reduce((sum, val) => sum + (parseInt(val) || 0), 0);
        return totalB - totalA;
    });
    
    sortedPlayers.forEach((player, index) => {
        const row = document.createElement('tr');
        const total = player.rounds.reduce((sum, val) => sum + (parseInt(val) || 0), 0);
        
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>
                ${tournamentData.adminLoggedIn ? 
                    `<input type="text" class="player-name-input" value="${player.name}" data-index="${tournamentData.players.indexOf(player)}">` : 
                    player.name
                }
            </td>
            ${player.rounds.map((points, roundIndex) => `
                <td>
                    ${tournamentData.adminLoggedIn ? 
                        `<input type="number" min="0" value="${points}" 
                         data-player="${tournamentData.players.indexOf(player)}" 
                         data-round="${roundIndex}"
                         class="points-input">` : 
                        points
                    }
                </td>
            `).join('')}
            <td class="total-cell">${total}</td>
            <td class="admin-only">
                ${tournamentData.adminLoggedIn ? 
                    `<button class="btn-small danger delete-player" data-index="${tournamentData.players.indexOf(player)}">
                        <i class="fas fa-trash"></i>
                    </button>` : 
                    ''
                }
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Add event listeners for editable fields
    if (tournamentData.adminLoggedIn) {
        addEditListeners();
    }
}

// Update player select dropdown
function updatePlayerSelect() {
    playerSelect.innerHTML = '<option value="">Select Player</option>';
    tournamentData.players.forEach(player => {
        const option = document.createElement('option');
        option.value = player.name;
        option.textContent = player.name;
        playerSelect.appendChild(option);
    });
}

// Update admin UI based on login state
function updateAdminUI() {
    if (tournamentData.adminLoggedIn) {
        adminControls.style.display = 'block';
        adminLoginBtn.innerHTML = '<i class="fas fa-unlock"></i> Admin Logout';
        adminLoginBtn.style.background = 'linear-gradient(90deg, #00ff88, #00cc66)';
    } else {
        adminControls.style.display = 'none';
        adminLoginBtn.innerHTML = '<i class="fas fa-lock"></i> Admin Login';
        adminLoginBtn.style.background = 'linear-gradient(90deg, #ff3366, #ff0066)';
    }
}

// Add event listeners for editable fields
function addEditListeners() {
    // Player name inputs
    document.querySelectorAll('.player-name-input').forEach(input => {
        input.addEventListener('change', function() {
            const index = this.dataset.index;
            tournamentData.players[index].name = this.value;
            saveData();
            updateTable();
            updatePlayerSelect();
            showSuccess('Player name updated successfully!');
        });
    });
    
    // Points inputs
    document.querySelectorAll('.points-input').forEach(input => {
        input.addEventListener('change', function() {
            const playerIndex = this.dataset.player;
            const roundIndex = this.dataset.round;
            tournamentData.players[playerIndex].rounds[roundIndex] = parseInt(this.value) || 0;
            saveData();
            updateTable();
            showSuccess('Points updated successfully!');
        });
    });
    
    // Delete player buttons
    document.querySelectorAll('.delete-player').forEach(button => {
        button.addEventListener('click', function() {
            const index = this.dataset.index;
            if (confirm('Are you sure you want to delete this player?')) {
                tournamentData.players.splice(index, 1);
                saveData();
                updateTable();
                updatePlayerSelect();
                showSuccess('Player deleted successfully!');
            }
        });
    });
}

// Show success modal
function showSuccess(message) {
    successMessage.textContent = message;
    successModal.style.display = 'block';
}

// Event Listeners
adminLoginBtn.addEventListener('click', function() {
    if (tournamentData.adminLoggedIn) {
        // Logout
        tournamentData.adminLoggedIn = false;
        saveData();
        updateAdminUI();
        updateTable();
        showSuccess('Logged out successfully!');
    } else {
        // Show login modal
        adminModal.style.display = 'block';
    }
});

closeModal.addEventListener('click', () => {
    adminModal.style.display = 'none';
    loginError.textContent = '';
});

closeSuccess.addEventListener('click', () => {
    successModal.style.display = 'none';
});

loginBtn.addEventListener('click', () => {
    const password = document.getElementById('adminPassword').value;
    
    // In production, this would be an API call to Netlify Function
    if (password === ADMIN_PASSWORD) {
        tournamentData.adminLoggedIn = true;
        saveData();
        adminModal.style.display = 'none';
        updateAdminUI();
        updateTable();
        showSuccess('Admin login successful!');
        document.getElementById('adminPassword').value = '';
        loginError.textContent = '';
    } else {
        loginError.textContent = 'Invalid password! Contact RODY for admin access.';
    }
});

// Close modals when clicking outside
window.addEventListener('click', (event) => {
    if (event.target === adminModal) {
        adminModal.style.display = 'none';
        loginError.textContent = '';
    }
    if (event.target === successModal) {
        successModal.style.display = 'none';
    }
});

addPlayerBtn.addEventListener('click', () => {
    const name = newPlayerName.value.trim();
    if (name && tournamentData.players.length < 20) {
        tournamentData.players.push({
            name: name,
            rounds: [0, 0, 0, 0, 0, 0, 0, 0]
        });
        saveData();
        updateTable();
        updatePlayerSelect();
        newPlayerName.value = '';
        showSuccess(`Player "${name}" added successfully!`);
    } else if (tournamentData.players.length >= 20) {
        alert('Maximum 20 players allowed in tournament.');
    } else {
        alert('Please enter a valid player name.');
    }
});

resetBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all tournament data? This cannot be undone!')) {
        tournamentData.players = [
            { name: "RODY", rounds: [0, 0, 0, 0, 0, 0, 0, 0] },
            { name: "Player 2", rounds: [0, 0, 0, 0, 0, 0, 0, 0] },
            { name: "Player 3", rounds: [0, 0, 0, 0, 0, 0, 0, 0] },
            { name: "Player 4", rounds: [0, 0, 0, 0, 0, 0, 0, 0] },
            { name: "Player 5", rounds: [0, 0, 0, 0, 0, 0, 0, 0] },
            { name: "Player 6", rounds: [0, 0, 0, 0, 0, 0, 0, 0] },
            { name: "Player 7", rounds: [0, 0, 0, 0, 0, 0, 0, 0] },
            { name: "Player 8", rounds: [0, 0, 0, 0, 0, 0, 0, 0] }
        ];
        saveData();
        updateTable();
        updatePlayerSelect();
        showSuccess('Tournament data reset successfully!');
    }
});

calculateBtn.addEventListener('click', () => {
    const playerName = playerSelect.value;
    if (!playerName) {
        resultDiv.textContent = 'Please select a player first!';
        return;
    }
    
    const player = tournamentData.players.find(p => p.name === playerName);
    if (player) {
        const total = player.rounds.reduce((sum, val) => sum + (parseInt(val) || 0), 0);
        const roundDetails = player.rounds.map((points, index) => 
            `Round ${index + 1}: ${points} points`
        ).join('<br>');
        
        resultDiv.innerHTML = `
            <strong>${playerName}'s Tournament Points:</strong><br>
            ${roundDetails}<br>
            <span style="color: #ffcc00; font-size: 1.3rem;">Total: ${total} points</span>
        `;
    }
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', initTournamentData);