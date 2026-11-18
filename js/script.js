
/* =====================================================
   EMPLOYEE ATTENDANCE MANAGEMENT SYSTEM (EAMS)
   COMPLETE JAVASCRIPT
   THEME: ESPRESSO BROWN & BEIGE
   MAIN COLOUR: #4A2F08

   LOCAL STORAGE:
   eamsEmployees
   eamsAttendance
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    console.log("EAMS JavaScript loaded successfully!");

    const EMPLOYEE_KEY = "eamsEmployees";
    const ATTENDANCE_KEY = "eamsAttendance";

    let employees = [];

    // =====================================================
    // 1. GENERAL FUNCTIONS
    // =====================================================

    function normalizeStatus(status) {
        return String(status || "").trim().toLowerCase();
    }

    function getEmployeeID(employee) {
        return String(
            employee?.id ||
            employee?.employeeID ||
            employee?.employeeId ||
            ""
        ).trim();
    }

    function getRecordEmployeeID(record) {
        return String(
            record?.employeeID ||
            record?.employeeId ||
            record?.id ||
            ""
        ).trim();
    }

    function getEmployeeName(employee) {
        return employee?.name ||
            employee?.employeeName ||
            "-";
    }

    function getEmployees() {
        try {
            const data = JSON.parse(
                localStorage.getItem(EMPLOYEE_KEY) || "[]"
            );

            return Array.isArray(data) ? data : [];

        } catch (error) {
            console.error("Employee loading error:", error);
            return [];
        }
    }

    function getAttendance() {
        try {
            const data = JSON.parse(
                localStorage.getItem(ATTENDANCE_KEY) || "[]"
            );

            return Array.isArray(data) ? data : [];

        } catch (error) {
            console.error("Attendance loading error:", error);
            return [];
        }
    }

    function getLocalDate(date = new Date()) {
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();

        // Same format as attendance.js: DD/MM/YYYY
        return `${day}/${month}/${year}`;
    }

    // Supports both DD/MM/YYYY and YYYY-MM-DD
    function normalizeDate(date) {

        if (!date) return "";

        const value = String(date).trim();

        // ISO format: YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {

            const [year, month, day] = value.split("-");

            return `${day}/${month}/${year}`;
        }

        // Existing format: DD/MM/YYYY
        if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
            return value;
        }

        return value;
    }

    function isActiveEmployee(employee) {
        return normalizeStatus(employee.status || "Active") === "active";
    }

    function isCheckedIn(record) {
        return Boolean(
            record.checkIn &&
            String(record.checkIn).trim() !== "-"
        );
    }

    function getEmployeeDetails(record, employeeList = getEmployees()) {

        const employeeID = getRecordEmployeeID(record);

        const employee = employeeList.find(emp =>
            getEmployeeID(emp) === employeeID
        );

        return {
            employeeID:
                employeeID ||
                (employee ? getEmployeeID(employee) : "-"),

            employeeName:
                record.employeeName ||
                (employee ? getEmployeeName(employee) : "-"),

            department:
                record.department ||
                (employee ? employee.department : "-")
        };
    }

    // =====================================================
    // 2. ADMIN LOGIN
    // =====================================================

    const loginForm = document.getElementById("loginForm");

    if (loginForm) {

        loginForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const username =
                document.getElementById("username").value.trim();

            const password =
                document.getElementById("password").value;

            const errorMessage =
                document.getElementById("errorMessage");

            if (username === "admin" && password === "admin123") {

                alert("Login successful! Welcome to EAMS.");

                window.location.href = "dashboard.html";

            } else {

                if (errorMessage) {
                    errorMessage.textContent =
                        "Invalid username or password. Please try again.";
                }

            }

        });

    }

    // =====================================================
    // 3. DASHBOARD ATTENDANCE STATISTICS
    // =====================================================

    function updateDashboard() {

        const totalElement =
            document.getElementById("totalEmployees");

        const presentElement =
            document.getElementById("presentToday");

        const absentElement =
            document.getElementById("absentToday");

        // Correct ID from dashboard.html
        const lateElement =
            document.getElementById("lateToday");

        // Only run on Dashboard
        if (
            !totalElement &&
            !presentElement &&
            !absentElement &&
            !lateElement
        ) {
            return;
        }

        const allEmployees = getEmployees();

        const activeEmployees = allEmployees.filter(
            isActiveEmployee
        );

        const attendance = getAttendance();

        const today = getLocalDate();

        // Get today's attendance records
        const todayRecords = attendance.filter(record =>
            normalizeDate(record.date) === today
        );

        // Count Present records
        const present = todayRecords.filter(record =>
            normalizeStatus(record.status) === "present"
        ).length;

        // Count Late records
        const late = todayRecords.filter(record =>
            normalizeStatus(record.status) === "late"
        ).length;

        // Count explicitly Absent records
        const explicitlyAbsent = todayRecords.filter(record =>
            normalizeStatus(record.status) === "absent"
        ).length;

        // Get all employee IDs with attendance records
        const recordedEmployeeIDs = new Set(
            todayRecords.map(record =>
                getRecordEmployeeID(record)
            ).filter(Boolean)
        );

        // Count active employees without attendance records
        const notRecorded = activeEmployees.filter(employee => {

            const employeeID = getEmployeeID(employee);

            return !recordedEmployeeIDs.has(employeeID);

        }).length;

        // Same absent calculation as attendance.js
        const absent = explicitlyAbsent + notRecorded;

        // Update Dashboard cards
        if (totalElement) {
            totalElement.textContent = allEmployees.length;
        }

        if (presentElement) {
            presentElement.textContent = present;
        }

        if (absentElement) {
            absentElement.textContent = absent;
        }

        if (lateElement) {
            lateElement.textContent = late;
        }

        console.log("EAMS Dashboard Attendance:", {
            date: today,
            totalEmployees: allEmployees.length,
            activeEmployees: activeEmployees.length,
            present: present,
            absent: absent,
            late: late
        });

        // Update other dashboard sections
        updateRecentAttendance(todayRecords);

        updateWeeklyChart(activeEmployees.length, attendance);
    }

    // =====================================================
    // 4. RECENT ATTENDANCE TABLE
    // =====================================================

    function updateRecentAttendance(todayRecords) {

        const table =
            document.getElementById("recentAttendanceTable");

        if (!table) return;

        table.innerHTML = "";

        if (todayRecords.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted">
                        No attendance records for today.
                    </td>
                </tr>
            `;

            return;
        }

        // Show latest records first
        todayRecords.forEach(record => {

            const row = document.createElement("tr");

            const details = getEmployeeDetails(record);

            const values = [
                details.employeeID,
                details.employeeName,
                record.checkIn || "-"
            ];

            values.forEach(value => {

                const cell = document.createElement("td");

                cell.textContent = value;

                row.appendChild(cell);

            });

            // Status badge
            const statusCell = document.createElement("td");

            const badge = document.createElement("span");

            const status = normalizeStatus(record.status);

            if (status === "present") {

                badge.className = "status-present";
                badge.textContent = "Present";

            } else if (status === "late") {

                badge.className = "status-late";
                badge.textContent = "Late";

            } else {

                badge.className = "status-absent";
                badge.textContent = "Absent";

            }

            statusCell.appendChild(badge);

            row.appendChild(statusCell);

            table.appendChild(row);

        });

    }

    // =====================================================
    // 5. WEEKLY ATTENDANCE OVERVIEW CHART
    // =====================================================

    function updateWeeklyChart(activeCount, attendance) {

        const canvas =
            document.getElementById("attendanceChart");

        if (!canvas || typeof Chart === "undefined") return;

        const existingChart = Chart.getChart(canvas);

        if (existingChart) {
            existingChart.destroy();
        }

        const today = new Date();

        // Find Monday of current week
        const monday = new Date(today);

        const day = monday.getDay();

        monday.setDate(
            monday.getDate() - (day === 0 ? 6 : day - 1)
        );

        monday.setHours(0, 0, 0, 0);

        const labels = [];
        const presentData = [];
        const absentData = [];

        const dayNames = [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday"
        ];

        for (let i = 0; i < 7; i++) {

            const currentDay = new Date(monday);

            currentDay.setDate(monday.getDate() + i);

            currentDay.setHours(0, 0, 0, 0);

            const dateString = getLocalDate(currentDay);

            labels.push(dayNames[i]);

            // Future dates have no attendance yet
            if (currentDay > new Date(
                today.getFullYear(),
                today.getMonth(),
                today.getDate()
            )) {

                presentData.push(0);
                absentData.push(0);

                continue;
            }

            const dailyRecords = attendance.filter(record =>
                normalizeDate(record.date) === dateString
            );

            // Count unique employees with Present or Late status
            const checkedInIDs = new Set(
                dailyRecords
                    .filter(record =>
                        (
                            normalizeStatus(record.status) === "present" ||
                            normalizeStatus(record.status) === "late"
                        ) && isCheckedIn(record)
                    )
                    .map(record => getRecordEmployeeID(record))
                    .filter(Boolean)
            );

            const presentCount = checkedInIDs.size;

            const absentCount = Math.max(
                activeCount - presentCount,
                0
            );

            presentData.push(presentCount);

            absentData.push(absentCount);

        }

        new Chart(canvas, {

            type: "bar",

            data: {

                labels: labels,

                datasets: [

                    {
                        label: "Present",
                        data: presentData,
                        backgroundColor: "#829477",
                        borderRadius: 6
                    },

                    {
                        label: "Absent",
                        data: absentData,
                        backgroundColor: "#B8756C",
                        borderRadius: 6
                    }

                ]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        position: "top",

                        labels: {
                            color: "#4A2F08"
                        }

                    }

                },

                scales: {

                    y: {

                        beginAtZero: true,

                        ticks: {
                            color: "#8B6F52",
                            precision: 0,
                            stepSize: 1
                        },

                        grid: {
                            color: "#E9DDCA"
                        },

                        title: {

                            display: true,

                            text: "Number of Employees",

                            color: "#4A2F08"

                        }

                    },

                    x: {

                        ticks: {
                            color: "#4A2F08"
                        },

                        grid: {
                            display: false
                        },

                        title: {

                            display: true,

                            text: "Days",

                            color: "#4A2F08"

                        }

                    }

                }

            }

        });

    }

    // =====================================================
    // 6. MONTHLY ATTENDANCE REPORT CHART
    // =====================================================

    function updateMonthlyChart() {

        const canvas =
            document.getElementById("monthlyChart");

        if (!canvas || typeof Chart === "undefined") return;

        const existingChart = Chart.getChart(canvas);

        if (existingChart) {
            existingChart.destroy();
        }

        const today = new Date();

        const month = today.getMonth();

        const year = today.getFullYear();

        const attendance = getAttendance();

        const monthlyRecords = attendance.filter(record => {

            if (!record.date) return false;

            const normalized = normalizeDate(record.date);

            const parts = normalized.split("/");

            if (parts.length !== 3) return false;

            return Number(parts[1]) - 1 === month &&
                   Number(parts[2]) === year;

        });

        const present = monthlyRecords.filter(record =>
            normalizeStatus(record.status) === "present"
        ).length;

        const late = monthlyRecords.filter(record =>
            normalizeStatus(record.status) === "late"
        ).length;

        const absent = monthlyRecords.filter(record =>
            normalizeStatus(record.status) === "absent"
        ).length;

        new Chart(canvas, {

            type: "doughnut",

            data: {

                labels: ["Present", "Absent", "Late"],

                datasets: [{

                    data: [present, absent, late],

                    backgroundColor: [
                        "#829477",
                        "#B8756C",
                        "#D4A85F"
                    ],

                    borderWidth: 2,

                    borderColor: "#FFFFFF"

                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                plugins: {

                    legend: {

                        position: "bottom",

                        labels: {
                            color: "#4A2F08"
                        }

                    },

                    title: {

                        display: true,

                        text: "Monthly Attendance Distribution",

                        color: "#4A2F08"

                    }

                }

            }

        });

    }

    // =====================================================
    // 7. EMPLOYEE MANAGEMENT
    // ADD, EDIT, DELETE AND SEARCH
    // =====================================================

    const employeeTable =
        document.getElementById("employeeTable");

    const addEmployeeButton =
        document.getElementById("addEmployeeBtn");

    const employeeSearch =
        document.getElementById("employeeSearch");

    // LOAD EMPLOYEES
    function loadEmployees() {

        try {

            const saved = localStorage.getItem(EMPLOYEE_KEY);

            if (saved !== null) {

                const parsed = JSON.parse(saved);

                if (!Array.isArray(parsed)) {
                    throw new Error("Invalid employee data.");
                }

                employees = parsed;

            } else {

                // Import original employee records from HTML table
                employees = [];

                if (employeeTable) {

                    const rows =
                        employeeTable.querySelectorAll("tr");

                    rows.forEach(row => {

                        const cells =
                            row.querySelectorAll("td");

                        if (
                            cells.length >= 6 &&
                            /^EMP\d+$/i.test(
                                cells[0].textContent.trim()
                            )
                        ) {

                            employees.push({

                                id: cells[0].textContent.trim(),

                                name: cells[1].textContent.trim(),

                                department: cells[2].textContent.trim(),

                                position: cells[3].textContent.trim(),

                                email: cells[4].textContent.trim(),

                                status: cells[5].textContent.trim()

                            });

                        }

                    });

                }

                saveEmployees();

            }

        } catch (error) {

            console.error("Error loading employees:", error);

            employees = [];

        }

    }

    // SAVE EMPLOYEES
    function saveEmployees() {

        try {

            localStorage.setItem(
                EMPLOYEE_KEY,
                JSON.stringify(employees)
            );

            return true;

        } catch (error) {

            console.error("Error saving employees:", error);

            alert("Unable to save employee records.");

            return false;

        }

    }

    // UPDATE EMPLOYEE SUMMARY
    function updateEmployeeSummary() {

        const totalElement =
            document.getElementById("totalEmployees");

        const activeElement =
            document.getElementById("activeEmployees");

        const departmentElement =
            document.getElementById("totalDepartments");

        const activeCount = employees.filter(
            isActiveEmployee
        ).length;

        const departments = new Set(

            employees

                .map(employee =>
                    String(employee.department || "")
                        .trim()
                        .toLowerCase()
                )

                .filter(Boolean)

        );

        if (totalElement) {
            totalElement.textContent = employees.length;
        }

        if (activeElement) {
            activeElement.textContent = activeCount;
        }

        if (departmentElement) {
            departmentElement.textContent = departments.size;
        }

    }

    // DISPLAY EMPLOYEES
    function displayEmployees(searchValue = "") {

        if (!employeeTable) return;

        employeeTable.innerHTML = "";

        employees.forEach((employee, index) => {

            const searchText = [

                getEmployeeID(employee),

                getEmployeeName(employee),

                employee.department,

                employee.position,

                employee.email,

                employee.status

            ].join(" ").toLowerCase();

            if (!searchText.includes(searchValue.trim().toLowerCase())) {
                return;
            }

            const row = document.createElement("tr");

            const details = [

                getEmployeeID(employee),

                getEmployeeName(employee),

                employee.department,

                employee.position,

                employee.email

            ];

            details.forEach(detail => {

                const cell = document.createElement("td");

                cell.textContent = detail || "-";

                row.appendChild(cell);

            });

            // STATUS
            const statusCell = document.createElement("td");

            const statusLabel = document.createElement("span");

            statusLabel.className =
                normalizeStatus(employee.status || "Active") === "active"
                    ? "status-present"
                    : "status-absent";

            statusLabel.textContent =
                employee.status || "Active";

            statusCell.appendChild(statusLabel);

            row.appendChild(statusCell);

            // ACTIONS
            const actionCell = document.createElement("td");

            actionCell.className = "employee-actions";

            const editButton = document.createElement("button");

            editButton.type = "button";

            editButton.className = "btn btn-edit btn-sm";

            editButton.textContent = "Edit";

            editButton.dataset.index = index;

            editButton.dataset.action = "edit";

            const deleteButton = document.createElement("button");

            deleteButton.type = "button";

            deleteButton.className = "btn btn-delete btn-sm";

            deleteButton.textContent = "Delete";

            deleteButton.dataset.index = index;

            deleteButton.dataset.action = "delete";

            actionCell.appendChild(editButton);

            actionCell.appendChild(deleteButton);

            row.appendChild(actionCell);

            employeeTable.appendChild(row);

        });

        updateEmployeeSummary();

    }

    // GENERATE EMPLOYEE ID
    function generateEmployeeID() {

        const lastID = employees.reduce((max, employee) => {

            const number = parseInt(
                getEmployeeID(employee).replace("EMP", ""),
                10
            );

            return Math.max(max, number || 0);

        }, 0);

        return "EMP" + String(lastID + 1).padStart(3, "0");

    }

    // VALIDATE EMAIL
    function isValidEmail(email) {

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        return emailPattern.test(email);

    }

    // INITIALIZE EMPLOYEE PAGE
    if (employeeTable) {

        loadEmployees();

        displayEmployees();

    }

    // ADD EMPLOYEE
    if (addEmployeeButton && employeeTable) {

        addEmployeeButton.addEventListener("click", function () {

            const name = prompt("Enter employee name:");

            if (name === null) return;

            if (!name.trim()) {
                alert("Employee name is required!");
                return;
            }

            const department = prompt("Enter department:");

            if (department === null) return;

            if (!department.trim()) {
                alert("Department is required!");
                return;
            }

            const position = prompt("Enter employee position:");

            if (position === null) return;

            if (!position.trim()) {
                alert("Position is required!");
                return;
            }

            const email = prompt("Enter employee email:");

            if (email === null) return;

            if (!isValidEmail(email.trim())) {
                alert("Please enter a valid email address!");
                return;
            }

            const newEmployee = {

                id: generateEmployeeID(),

                name: name.trim(),

                department: department.trim(),

                position: position.trim(),

                email: email.trim(),

                status: "Active"

            };

            employees.push(newEmployee);

            if (!saveEmployees()) {

                employees.pop();

                return;

            }

            displayEmployees(
                employeeSearch ? employeeSearch.value : ""
            );

            alert(
                "Employee added successfully!\nEmployee ID: " +
                newEmployee.id
            );

        });

    }

    // EDIT AND DELETE EMPLOYEES
    if (employeeTable) {

        employeeTable.addEventListener("click", function (event) {

            const button =
                event.target.closest("button[data-action]");

            if (!button) return;

            const index = Number(button.dataset.index);

            const action = button.dataset.action;

            if (!Number.isInteger(index) || !employees[index]) return;

            const employee = employees[index];

            // EDIT EMPLOYEE
            if (action === "edit") {

                const newName = prompt(
                    "Edit employee name:",
                    getEmployeeName(employee)
                );

                if (newName === null) return;

                if (!newName.trim()) {
                    alert("Employee name cannot be empty!");
                    return;
                }

                const newDepartment = prompt(
                    "Edit department:",
                    employee.department
                );

                if (newDepartment === null) return;

                if (!newDepartment.trim()) {
                    alert("Department cannot be empty!");
                    return;
                }

                const newPosition = prompt(
                    "Edit employee position:",
                    employee.position
                );

                if (newPosition === null) return;

                if (!newPosition.trim()) {
                    alert("Position cannot be empty!");
                    return;
                }

                const newEmail = prompt(
                    "Edit employee email:",
                    employee.email
                );

                if (newEmail === null) return;

                if (!isValidEmail(newEmail.trim())) {
                    alert("Please enter a valid email address!");
                    return;
                }

                const newStatus = prompt(
                    "Enter status (Active or Inactive):",
                    employee.status || "Active"
                );

                if (newStatus === null) return;

                const status = normalizeStatus(newStatus);

                if (status !== "active" && status !== "inactive") {
                    alert("Status must be Active or Inactive!");
                    return;
                }

                const oldEmployee = { ...employee };

                employees[index] = {

                    ...employee,

                    name: newName.trim(),

                    department: newDepartment.trim(),

                    position: newPosition.trim(),

                    email: newEmail.trim(),

                    status: status === "active" ? "Active" : "Inactive"

                };

                if (!saveEmployees()) {

                    employees[index] = oldEmployee;

                    return;

                }

                displayEmployees(
                    employeeSearch ? employeeSearch.value : ""
                );

                alert("Employee information updated successfully!");

            }

            // DELETE EMPLOYEE
            if (action === "delete") {

                const confirmDelete = confirm(
                    "Are you sure you want to delete " +
                    getEmployeeName(employee) +
                    " (" + getEmployeeID(employee) + ")?"
                );

                if (!confirmDelete) return;

                const deletedEmployee = employees.splice(index, 1)[0];

                if (!saveEmployees()) {

                    employees.splice(index, 0, deletedEmployee);

                    return;

                }

                displayEmployees(
                    employeeSearch ? employeeSearch.value : ""
                );

                alert("Employee deleted successfully!");

            }

        });

    }

    // EMPLOYEE SEARCH
    if (employeeSearch && employeeTable) {

        employeeSearch.addEventListener("input", function () {

            displayEmployees(employeeSearch.value);

        });

    }

    // =====================================================
    // 8. ATTENDANCE TABLE SEARCH AND STATUS FILTER
    // =====================================================

    const attendanceSearch =
        document.getElementById("attendanceSearch");

    const statusFilter =
        document.getElementById("statusFilter");

    const attendanceTable =
        document.getElementById("attendanceRecordsTable") ||
        document.getElementById("attendanceTable");

    if (attendanceTable) {

        function filterAttendance() {

            const searchValue = attendanceSearch
                ? attendanceSearch.value.toLowerCase().trim()
                : "";

            const selectedStatus = statusFilter
                ? statusFilter.value.toLowerCase()
                : "";

            const rows = attendanceTable.querySelectorAll("tr");

            rows.forEach(row => {

                // Ignore empty/loading rows
                if (row.cells.length < 2) return;

                const employeeData =
                    row.textContent.toLowerCase();

                const statusCell =
                    row.cells[row.cells.length - 1];

                const status = statusCell
                    ? statusCell.textContent.trim().toLowerCase()
                    : "";

                const matchesSearch =
                    employeeData.includes(searchValue);

                const matchesStatus =
                    selectedStatus === "" ||
                    status.includes(selectedStatus);

                row.style.display =
                    matchesSearch && matchesStatus ? "" : "none";

            });

        }

        if (attendanceSearch) {
            attendanceSearch.addEventListener("input", filterAttendance);
        }

        if (statusFilter) {
            statusFilter.addEventListener("change", filterAttendance);
        }

    }

    // =====================================================
    // 9. LOGOUT CONFIRMATION
    // =====================================================

    const logoutLinks =
        document.querySelectorAll('a[href="index.html"]');

    logoutLinks.forEach(link => {

        link.addEventListener("click", function (event) {

            const confirmLogout = confirm(
                "Are you sure you want to logout?"
            );

            if (!confirmLogout) {
                event.preventDefault();
            }

        });

    });

    // =====================================================
    // 10. REFRESH DATA WHEN LOCAL STORAGE CHANGES
    // =====================================================

    window.addEventListener("storage", function (event) {

        if (
            event.key === EMPLOYEE_KEY ||
            event.key === ATTENDANCE_KEY ||
            event.key === null
        ) {

            updateDashboard();

            updateMonthlyChart();

            if (employeeTable) {

                employees = getEmployees();

                displayEmployees(
                    employeeSearch ? employeeSearch.value : ""
                );

            }

        }

    });

    // =====================================================
    // 11. INITIALIZE ALL SYSTEMS
    // =====================================================

    updateDashboard();

    updateMonthlyChart();

    console.log("All EAMS functions initialized successfully!");


// ==========================================
// EAMS - ADD EMPLOYEE FUNCTION
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const addEmployeeBtn = document.getElementById("addEmployeeBtn");
    const employeeTable = document.getElementById("employeeTable");

    if (!addEmployeeBtn || !employeeTable) return;

    const EMPLOYEE_KEY = "eamsEmployees";

    function getEmployees() {
        try {
            return JSON.parse(localStorage.getItem(EMPLOYEE_KEY)) || [];
        } catch (error) {
            return [];
        }
    }

    function saveEmployees(employees) {
        localStorage.setItem(EMPLOYEE_KEY, JSON.stringify(employees));
    }

    function updateEmployeeTable() {

        const employees = getEmployees();

        employeeTable.innerHTML = "";

        employees.forEach(function (employee) {

            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${employee.id}</td>
                <td>${employee.name}</td>
                <td>${employee.department}</td>
                <td>${employee.position}</td>
                <td>${employee.email}</td>
                <td>
                    <span class="status-present">
                        ${employee.status || "Active"}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-secondary">
                        Edit
                    </button>
                    <button class="btn btn-sm btn-danger">
                        Delete
                    </button>
                </td>
            `;

            employeeTable.appendChild(row);
        });

        // Update summary cards
        const total = employees.length;
        const active = employees.filter(
            emp => (emp.status || "Active").toLowerCase() === "active"
        ).length;

        const departments = [
            ...new Set(employees.map(emp => emp.department))
        ];

        document.getElementById("totalEmployees").textContent = total;
        document.getElementById("activeEmployees").textContent = active;
        document.getElementById("totalDepartments").textContent =
            departments.length;
    }

    // ADD EMPLOYEE BUTTON
    addEmployeeBtn.addEventListener("click", function () {

        const employees = getEmployees();

        const name = prompt("Enter Employee Name:");

        if (!name || !name.trim()) return;

        const department = prompt("Enter Department:");

        if (!department || !department.trim()) return;

        const position = prompt("Enter Position:");

        if (!position || !position.trim()) return;

        const email = prompt("Enter Email:");

        if (!email || !email.trim()) return;

        const nextNumber = employees.reduce(function (max, emp) {
            const number = parseInt(
                String(emp.id || "").replace("EMP", "")
            ) || 0;

            return Math.max(max, number);
        }, 0) + 1;

        const newEmployee = {
            id: "EMP" + String(nextNumber).padStart(3, "0"),
            name: name.trim(),
            department: department.trim(),
            position: position.trim(),
            email: email.trim(),
            status: "Active"
        };

        employees.push(newEmployee);

        saveEmployees(employees);

        updateEmployeeTable();

        alert("Employee added successfully!");
    });

    // INITIALIZE EMPLOYEE LIST
    updateEmployeeTable();

});


});

