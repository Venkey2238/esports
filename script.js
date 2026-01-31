// Tournament data structure
let tournamentData = {
    players: [],
    adminLoggedIn: false,
    adminToken: null
};

// DOM Elements (same as before)
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
        const parsedData = JSON.parse(savedData);
        tournamentData.players = parsedData.players || [];
        tournamentData.adminLoggedIn = parsedData.adminLoggedIn || false;
        tournamentData.adminToken = parsedData.adminToken || null;
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
            adminLoggedIn: false,
            adminToken: null
        };
        saveData();
    }
    
    updateTable();
    updatePlayerSelect();
    updateAdminUI();
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('amongUsTournament', JSON.stringify({
        players: tournamentData.players,
        adminLoggedIn: tournamentData.adminLoggedIn,
        adminToken: tournamentData.adminToken
    }));
}

// Update points table (same as before)
function updateTable() {
    tableBody.innerHTML = '';
    
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

// Authentication with Netlify Function
async function authenticateAdmin(password) {
    try {
        const response = await fetch('/.netlify/functions/admin-auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Store token for session
            tournamentData.adminToken = data.token;
            return { success: true };
        } else {
            return { success: false, error: data.error };
        }
    } catch (error) {
        console.error('Auth error:', error);
        // Fallback for development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            // Local development - use hardcoded password
            const DEV_PASSWORD = "rodyamongus123";
            if (password === DEV_PASSWORD) {
                tournamentData.adminToken = 'dev-token-' + Date.now();
                return { success: true };
            }
        }
        return { success: false, error: 'Network error. Please try again.' };
    }
}

// Event Listeners
adminLoginBtn.addEventListener('click', function() {
    if (tournamentData.adminLoggedIn) {
        // Logout
        tournamentData.adminLoggedIn = false;
        tournamentData.adminToken = null;
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

loginBtn.addEventListener('click', async () => {
    const password = document.getElementById('adminPassword').value;
    loginError.textContent = '';
    
    if (!password) {
        loginError.textContent = 'Please enter a password';
        return;
    }
    
    // Show loading state
    loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Authenticating...';
    loginBtn.disabled = true;
    
    const authResult = await authenticateAdmin(password);
    
    // Reset button state
    loginBtn.innerHTML = 'Login';
    loginBtn.disabled = false;
    
    if (authResult.success) {
        tournamentData.adminLoggedIn = true;
        saveData();
        adminModal.style.display = 'none';
        updateAdminUI();
        updateTable();
        showSuccess('Admin login successful!');
        document.getElementById('adminPassword').value = '';
        loginError.textContent = '';
    } else {
        loginError.textContent = authResult.error || 'Invalid password! Contact RODY for admin access.';
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
