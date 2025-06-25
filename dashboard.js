// Dashboard.js - Script for Joe's Life Dashboard that aggregates data from other applications

// Global variables
let refreshIntervalId;
let countdownIntervalId;
const REFRESH_INTERVAL = 60; // Seconds
let countdownValue = REFRESH_INTERVAL;

// DOM references
const dateDisplay = document.getElementById('dateDisplay');
const timeDisplay = document.getElementById('timeDisplay');
const refreshCountdown = document.getElementById('refresh-countdown');
const refreshNowButton = document.getElementById('refresh-now');
const lastRefreshTime = document.getElementById('last-refresh-time');

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', function() {
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Initial data fetch
    fetchAllData();
    
    // Set up auto-refresh
    startRefreshCountdown();
    
    // Set up refresh button
    refreshNowButton.addEventListener('click', handleManualRefresh);
});

// Update date and time displays
function updateDateTime() {
    const now = new Date();
    
    // Format date: Monday, June 20, 2025
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateDisplay.textContent = now.toLocaleDateString('en-US', dateOptions);
    
    // Format time: 5:57 AM
    const timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    timeDisplay.textContent = now.toLocaleTimeString('en-US', timeOptions);
}

// Start the countdown timer for auto-refresh
function startRefreshCountdown() {
    countdownValue = REFRESH_INTERVAL;
    refreshCountdown.textContent = countdownValue;
    
    clearInterval(countdownIntervalId);
    countdownIntervalId = setInterval(() => {
        countdownValue--;
        refreshCountdown.textContent = countdownValue;
        
        if (countdownValue <= 0) {
            fetchAllData();
            countdownValue = REFRESH_INTERVAL;
            refreshCountdown.textContent = countdownValue;
        }
    }, 1000);
}

// Handle manual refresh button click
function handleManualRefresh() {
    fetchAllData();
    startRefreshCountdown();
    
    // Visual feedback for the refresh button
    refreshNowButton.classList.add('refreshing');
    refreshNowButton.disabled = true;
    refreshNowButton.textContent = 'Refreshing...';
    
    setTimeout(() => {
        refreshNowButton.classList.remove('refreshing');
        refreshNowButton.disabled = false;
        refreshNowButton.textContent = 'Refresh Now';
    }, 1000);
}

// Main function to fetch all data from different applications
function fetchAllData() {
    fetchFastingData();
    fetchBudgetData();
    fetchChoreData();
    fetchBeetleData();
    fetchJobData();
    
    // Update last refresh time
    const now = new Date();
    const refreshTimeFormat = { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true };
    lastRefreshTime.textContent = now.toLocaleTimeString('en-US', refreshTimeFormat);
}

// Fetch data from Fasting Tracker
function fetchFastingData() {
    try {
        // Get fasting data from localStorage
        const fastingDataManager = getFastingDataManager();
        
        if (!fastingDataManager) {
            updateFastingCard({
                successRate: 'N/A',
                successfulFasts: 'N/A',
                totalMiles: 'N/A'
            });
            return;
        }
        
        const data = fastingDataManager.getEntries();
        const totalDays = data.length;
        const successfulFasts = data.filter(entry => entry.fasted).length;
        const successRate = totalDays > 0 ? Math.round((successfulFasts / totalDays) * 100) : 0;
        
        // Calculate fitness totals
        const totalMilesFromFasting = data.reduce((sum, entry) => sum + (entry.miles || 0), 0);
        
        updateFastingCard({
            successRate: `${successRate}%`,
            successfulFasts: successfulFasts,
            totalMiles: totalMilesFromFasting.toFixed(1)
        });
        
        // Update last updated timestamp
        document.getElementById('fasting-last-updated').textContent = formatLastUpdated(new Date());
    } catch (error) {
        console.error('Error fetching fasting data:', error);
        updateFastingCard({
            successRate: 'Error',
            successfulFasts: 'Error',
            totalMiles: 'Error'
        });
    }
}

// Helper function to access fasting data
function getFastingDataManager() {
    // Check if FastingDataManager exists in localStorage
    const rawData = localStorage.getItem('fastingData');
    if (!rawData) return null;
    
    // Mock the FastingDataManager object to access the data
    return {
        getEntries: function() {
            try {
                return JSON.parse(rawData);
            } catch (e) {
                return [];
            }
        }
    };
}

// Update the fasting tracker card with fetched data
function updateFastingCard(data) {
    document.getElementById('fasting-success-rate').textContent = data.successRate;
    document.getElementById('successful-fasts').textContent = data.successfulFasts;
    document.getElementById('total-miles').textContent = data.totalMiles;
}

// Fetch data from Budget Tracker
function fetchBudgetData() {
    try {
        // Get current year
        const currentYear = new Date().getFullYear();
        
        // Try to get budget data from localStorage
        const budgetDataKey = `budgetData_${currentYear}`;
        const rawData = localStorage.getItem(budgetDataKey);
        
        if (!rawData) {
            updateBudgetCard({
                savingsRate: 'N/A',
                netBalance: 'N/A',
                totalIncome: 'N/A'
            });
            return;
        }
        
        const budgetData = JSON.parse(rawData);
        
        // Calculate totals
        let totalIncome = 0;
        let totalExpenses = 0;
        
        // Calculate income
        if (budgetData.budget && budgetData.budget.revenue) {
            budgetData.budget.revenue.forEach(item => {
                totalIncome += item.values.reduce((sum, val) => sum + val, 0);
            });
        }
        
        // Calculate expenses from different categories
        const expenseCategories = ['home', 'daily-living', 'transportation', 'entertainment', 'financial'];
        expenseCategories.forEach(category => {
            if (budgetData.budget && budgetData.budget[category]) {
                budgetData.budget[category].forEach(item => {
                    totalExpenses += item.values.reduce((sum, val) => sum + val, 0);
                });
            }
        });
        
        // Calculate net balance and savings rate
        const netBalance = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? ((netBalance / totalIncome) * 100).toFixed(1) + '%' : '0%';
        
        updateBudgetCard({
            savingsRate: savingsRate,
            netBalance: formatCurrency(netBalance),
            totalIncome: formatCurrency(totalIncome)
        });
        
        // Update last updated timestamp
        document.getElementById('budget-last-updated').textContent = formatLastUpdated(new Date());
    } catch (error) {
        console.error('Error fetching budget data:', error);
        updateBudgetCard({
            savingsRate: 'Error',
            netBalance: 'Error',
            totalIncome: 'Error'
        });
    }
}

// Update the budget tracker card with fetched data
function updateBudgetCard(data) {
    document.getElementById('savings-rate').textContent = data.savingsRate;
    document.getElementById('net-balance').textContent = data.netBalance;
    document.getElementById('total-income').textContent = data.totalIncome;
}

// Format currency values
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

// Fetch data from Chore Manager
function fetchChoreData() {
    try {
        // Try to get chore data from localStorage
        const rawData = localStorage.getItem('choreData');
        
        if (!rawData) {
            updateChoresList([]);
            return;
        }
        
        const choreData = JSON.parse(rawData);
        
        // Get today's day of the week
        const today = new Date();
        const dayOfWeek = today.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        
        // Filter chores for today
        const todayChores = choreData.filter(chore => {
            return chore.schedule && 
                  (chore.schedule.toLowerCase() === 'daily' || 
                   chore.schedule.toLowerCase().includes(dayOfWeek));
        });
        
        updateChoresList(todayChores);
        
        // Update last updated timestamp
        document.getElementById('chores-last-updated').textContent = formatLastUpdated(new Date());
    } catch (error) {
        console.error('Error fetching chore data:', error);
        updateChoresList([]);
    }
}

// Update the chores list with fetched data
function updateChoresList(chores) {
    const choresList = document.getElementById('today-chores-list');
    
    if (!chores || chores.length === 0) {
        choresList.innerHTML = '<li class="no-data-message">No chores for today</li>';
        return;
    }
    
    choresList.innerHTML = '';
    
    // Sort chores by priority
    chores.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    
    // Create list items for each chore
    chores.forEach(chore => {
        const listItem = document.createElement('li');
        
        const statusElement = document.createElement('span');
        statusElement.className = chore.completed ? 'chore-status completed' : 'chore-status';
        
        const textElement = document.createElement('span');
        textElement.className = 'chore-text';
        textElement.textContent = chore.name;
        
        const priorityElement = document.createElement('span');
        priorityElement.className = `chore-priority ${chore.priority}`;
        priorityElement.textContent = chore.priority;
        
        listItem.appendChild(statusElement);
        listItem.appendChild(textElement);
        listItem.appendChild(priorityElement);
        
        choresList.appendChild(listItem);
    });
}

// Fetch data from VW Beetle Tracker
function fetchBeetleData() {
    try {
        // Try to get service schedule data from localStorage
        const rawData = localStorage.getItem('vwBeetleServiceData');
        
        if (!rawData) {
            updateBeetleCard({
                oilStatus: 'Unknown',
                tuneStatus: 'Unknown',
                alerts: []
            });
            return;
        }
        
        const serviceData = JSON.parse(rawData);
        
        // Process oil change status
        const oilStatus = processServiceStatus(serviceData.oil);
        
        // Process tune-up status
        const tuneStatus = processServiceStatus(serviceData.tune);
        
        // Generate alerts for overdue or upcoming services
        const alerts = [];
        
        if (oilStatus.statusText === 'Overdue') {
            alerts.push({
                message: 'Oil change is overdue!',
                critical: true
            });
        } else if (oilStatus.statusText === 'Due Soon') {
            alerts.push({
                message: 'Oil change due soon',
                critical: false
            });
        }
        
        if (tuneStatus.statusText === 'Overdue') {
            alerts.push({
                message: 'Tune-up is overdue!',
                critical: true
            });
        } else if (tuneStatus.statusText === 'Due Soon') {
            alerts.push({
                message: 'Tune-up due soon',
                critical: false
            });
        }
        
        updateBeetleCard({
            oilStatus: oilStatus,
            tuneStatus: tuneStatus,
            alerts: alerts
        });
        
        // Update last updated timestamp
        document.getElementById('beetle-last-updated').textContent = formatLastUpdated(new Date());
    } catch (error) {
        console.error('Error fetching beetle data:', error);
        updateBeetleCard({
            oilStatus: { statusText: 'Error', className: '' },
            tuneStatus: { statusText: 'Error', className: '' },
            alerts: []
        });
    }
}

// Process service status based on dates
function processServiceStatus(serviceInfo) {
    if (!serviceInfo || !serviceInfo.nextDue) {
        return { statusText: 'Unknown', className: '' };
    }
    
    const nextDueDate = new Date(serviceInfo.nextDue);
    const today = new Date();
    
    // Calculate difference in days
    const timeDiff = nextDueDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff < 0) {
        return { statusText: 'Overdue', className: 'overdue' };
    } else if (daysDiff <= 14) {
        return { statusText: 'Due Soon', className: 'due-soon' };
    } else {
        return { statusText: 'OK', className: 'ok' };
    }
}

// Update the VW Beetle card with fetched data
function updateBeetleCard(data) {
    // Update service statuses
    const oilServiceElement = document.getElementById('service-oil');
    const oilStatusElement = oilServiceElement.querySelector('.service-status');
    oilStatusElement.textContent = data.oilStatus.statusText;
    oilStatusElement.className = `service-status ${data.oilStatus.className}`;
    
    const tuneServiceElement = document.getElementById('service-tune');
    const tuneStatusElement = tuneServiceElement.querySelector('.service-status');
    tuneStatusElement.textContent = data.tuneStatus.statusText;
    tuneStatusElement.className = `service-status ${data.tuneStatus.className}`;
    
    // Update alerts
    const alertContainer = document.getElementById('service-alert-container');
    
    if (data.alerts.length === 0) {
        alertContainer.innerHTML = '<div class="no-data-message">No service alerts</div>';
        return;
    }
    
    alertContainer.innerHTML = '';
    
    data.alerts.forEach(alert => {
        const alertElement = document.createElement('div');
        alertElement.className = alert.critical ? 'alert-message critical' : 'alert-message';
        alertElement.textContent = alert.message;
        alertContainer.appendChild(alertElement);
    });
    
    // Add critical class to container if any alerts are critical
    if (data.alerts.some(alert => alert.critical)) {
        alertContainer.classList.add('critical');
    } else {
        alertContainer.classList.remove('critical');
    }
}

// Fetch data from Job Tracker
function fetchJobData() {
    try {
        // Try to get job application data from localStorage
        const rawData = localStorage.getItem('jobApplications');
        
        if (!rawData) {
            updateJobCard({
                upcomingInterviews: 0,
                interviews: []
            });
            return;
        }
        
        const jobData = JSON.parse(rawData);
        
        // Filter for upcoming interviews
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today
        
        const upcomingInterviews = jobData.filter(job => {
            if (job.status !== 'interview' || !job.interviewDate) return false;
            
            const interviewDate = new Date(job.interviewDate);
            interviewDate.setHours(0, 0, 0, 0);
            
            return interviewDate >= today;
        });
        
        // Sort by interview date (earliest first)
        upcomingInterviews.sort((a, b) => {
            return new Date(a.interviewDate) - new Date(b.interviewDate);
        });
        
        // Format interview data for display
        const formattedInterviews = upcomingInterviews.map(job => {
            const interviewDate = new Date(job.interviewDate);
            const formattedDate = interviewDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
            });
            
            const formattedTime = job.interviewTime || 'Time TBD';
            
            return {
                company: job.company,
                position: job.jobTitle,
                date: formattedDate,
                time: formattedTime,
                type: job.interviewType || 'Interview'
            };
        });
        
        updateJobCard({
            upcomingInterviews: upcomingInterviews.length,
            interviews: formattedInterviews.slice(0, 3) // Limit to 3 for display
        });
        
        // Update last updated timestamp
        document.getElementById('job-last-updated').textContent = formatLastUpdated(new Date());
    } catch (error) {
        console.error('Error fetching job data:', error);
        updateJobCard({
            upcomingInterviews: 'Error',
            interviews: []
        });
    }
}

// Update the job tracker card with fetched data
function updateJobCard(data) {
    document.getElementById('upcoming-interviews').textContent = data.upcomingInterviews;
    
    const interviewListContainer = document.getElementById('interview-list-container');
    
    if (!data.interviews || data.interviews.length === 0) {
        interviewListContainer.innerHTML = '<div class="no-data-message">No upcoming interviews</div>';
        return;
    }
    
    interviewListContainer.innerHTML = '';
    
    // Create list items for each interview
    data.interviews.forEach(interview => {
        const interviewItem = document.createElement('div');
        interviewItem.className = 'interview-item';
        
        const companyElement = document.createElement('span');
        companyElement.className = 'interview-company';
        companyElement.textContent = `${interview.company} - ${interview.position}`;
        
        const detailsElement = document.createElement('div');
        detailsElement.className = 'interview-details';
        
        const dateElement = document.createElement('span');
        dateElement.textContent = `${interview.date} (${interview.type})`;
        
        const timeElement = document.createElement('span');
        timeElement.className = 'interview-time';
        timeElement.textContent = interview.time;
        
        detailsElement.appendChild(dateElement);
        detailsElement.appendChild(timeElement);
        
        interviewItem.appendChild(companyElement);
        interviewItem.appendChild(detailsElement);
        
        interviewListContainer.appendChild(interviewItem);
    });
}

// Format "last updated" timestamp
function formatLastUpdated(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 60) {
        return 'Just now';
    } else if (diffSec < 3600) {
        const minutes = Math.floor(diffSec / 60);
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
        return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
}
