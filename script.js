let bugs = [];
let bugIdCounter = 1;
document.addEventListener('DOMContentLoaded', function() {
    loadBugsFromStorage();
    renderBugList();
    setupEventListeners();
});
function setupEventListeners() {
    document.getElementById('bugForm').addEventListener('submit', handleBugSubmit);
    document.getElementById('filterStatus').addEventListener('change', renderBugList);
    document.getElementById('filterSeverity').addEventListener('change', renderBugList);
    document.getElementById('clearFilters').addEventListener('click', clearFilters);
}
function handleBugSubmit(e) {
    e.preventDefault();
    const bug = {
        id: bugIdCounter++,
        title: document.getElementById('bugTitle').value,
        description: document.getElementById('bugDescription').value,
        stepsToReproduce: document.getElementById('stepsToReproduce').value,
        severity: document.getElementById('severity').value,
        status: document.getElementById('status').value,
        dateReported: new Date().toLocaleDateString(),
        timeReported: new Date().toLocaleTimeString()
    };
    bugs.push(bug);
    saveBugsToStorage();
    renderBugList();
    document.getElementById('bugForm').reset();
    showNotification('Bug reported successfully!');
}
function renderBugList() {
    const bugList = document.getElementById('bugList');
    const emptyState = document.getElementById('emptyState');
    const statusFilter = document.getElementById('filterStatus').value;
    const severityFilter = document.getElementById('filterSeverity').value;
    let filteredBugs = bugs.filter(bug => {
        const matchesStatus = statusFilter === 'All' || bug.status === statusFilter;
        const matchesSeverity = severityFilter === 'All' || bug.severity === severityFilter;
        return matchesStatus && matchesSeverity;
    });
    if (filteredBugs.length === 0) {
        bugList.style.display = 'none';
        emptyState.style.display = 'block';
        emptyState.innerHTML = bugs.length > 0 ? '<p>No bugs match the current filters.</p>' : '<p>No bugs reported yet. Submit your first bug report above!</p>';
        return;
    }
    bugList.style.display = 'grid';
    emptyState.style.display = 'none';
    bugList.innerHTML = filteredBugs.map(bug => createBugCard(bug)).join('');
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() { deleteBug(parseInt(this.dataset.bugId)); });
    });
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() { updateBugStatus(parseInt(this.dataset.bugId)); });
    });
}
function createBugCard(bug) {
    return `<div class="bug-card"><div class="bug-header"><h3 class="bug-title">${bug.title}</h3><div class="bug-badges"><span class="badge badge-${bug.severity.toLowerCase()}">${bug.severity}</span><span class="badge badge-${bug.status.toLowerCase().replace(' ', '-')}">${bug.status}</span></div></div><p class="bug-description">${bug.description}</p><div class="bug-steps"><h4>Steps to Reproduce:</h4><pre>${bug.stepsToReproduce}</pre></div><div class="bug-meta"><span>Reported: ${bug.dateReported} at ${bug.timeReported}</span><div class="bug-actions"><button class="btn-small btn-edit" data-bug-id="${bug.id}">Update Status</button><button class="btn-small btn-delete" data-bug-id="${bug.id}">Delete</button></div></div></div>`;
}
function updateBugStatus(bugId) {
    const bug = bugs.find(b => b.id === bugId);
    if (!bug) return;
    const statuses = ['Open', 'In Progress', 'Fixed'];
    const currentIndex = statuses.indexOf(bug.status);
    const nextIndex = (currentIndex + 1) % statuses.length;
    bug.status = statuses[nextIndex];
    saveBugsToStorage();
    renderBugList();
    showNotification(`Bug status updated to: ${bug.status}`);
}
function deleteBug(bugId) {
    if (confirm('Are you sure you want to delete this bug report?')) {
        bugs = bugs.filter(b => b.id !== bugId);
        saveBugsToStorage();
        renderBugList();
        showNotification('Bug deleted successfully');
    }
}
function clearFilters() {
    document.getElementById('filterStatus').value = 'All';
    document.getElementById('filterSeverity').value = 'All';
    renderBugList();
}
function saveBugsToStorage() {
    localStorage.setItem('bugs', JSON.stringify(bugs));
    localStorage.setItem('bugIdCounter', bugIdCounter.toString());
}
function loadBugsFromStorage() {
    const storedBugs = localStorage.getItem('bugs');
    const storedCounter = localStorage.getItem('bugIdCounter');
    if (storedBugs) bugs = JSON.parse(storedBugs);
    if (storedCounter) bugIdCounter = parseInt(storedCounter);
}
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = 'position:fixed;top:20px;right:20px;background:#28a745;color:white;padding:15px 25px;border-radius:6px;box-shadow:0 5px 15px rgba(0,0,0,0.3);z-index:1000;';
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}