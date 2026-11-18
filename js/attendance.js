
/* =====================================================
   EAMS - EMPLOYEE ATTENDANCE MANAGEMENT SYSTEM
   ATTENDANCE.JS - COMPLETE FIXED VERSION
   STORAGE: eamsEmployees / eamsAttendance
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    "use strict";

    // ==========================================
    // 1. STORAGE
    // ==========================================

    const EMPLOYEE_KEY = "eamsEmployees";
    const ATTENDANCE_KEY = "eamsAttendance";
    const PAGE_SIZE = 10;

    function readStorage(key) {
        try {
            const data = JSON.parse(localStorage.getItem(key) || "[]");
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Storage error:", error);
            return [];
        }
    }

    function saveAttendance() {
        try {
            localStorage.setItem(
                ATTENDANCE_KEY,
                JSON.stringify(attendanceRecords)
            );
            return true;
        } catch (error) {
            alert("Unable to save attendance.");
            console.error(error);
            return false;
        }
    }


    let employees = readStorage(EMPLOYEE_KEY);
    let attendanceRecords = readStorage(ATTENDANCE_KEY);
    let currentPage = 1;

    
// =====================================================
// DEFAULT SAMPLE ATTENDANCE RECORDS
// Visible on every device when the website is opened
// =====================================================

function addDefaultAttendanceRecords() {

    const sampleAttendance = [

        {
            employeeId: "EMP001",
            employeeName: "Ahmad Faiz",
            department: "Human Resources",
            date: "2026-11-18",
            checkIn: "08:00",
            checkOut: "17:00",
            status: "Present"
        },

        {
            employeeId: "EMP002",
            employeeName: "Nur Aisyah",
            department: "Finance",
            date: "2026-11-18",
            checkIn: "08:05",
            checkOut: "17:00",
            status: "Present"
        },

        {
            employeeId: "EMP003",
            employeeName: "Daniel Lee",
            department: "Information Technology",
            date: "2026-11-18",
            checkIn: "08:25",
            checkOut: "17:00",
            status: "Late"
        },

        {
            employeeId: "EMP004",
            employeeName: "Siti Aminah",
            department: "Marketing",
            date: "2026-11-18",
            checkIn: "07:55",
            checkOut: "17:00",
            status: "Present"
        },

        {
            employeeId: "EMP005",
            employeeName: "Jason Tan",
            department: "Administration",
            date: "2026-11-18",
            checkIn: "-",
            checkOut: "-",
            status: "Absent"
        },

        {
            employeeId: "EMP006",
            employeeName: "Ariyana Aulia",
            department: "Admin",
            date: "2026-11-17",
            checkIn: "08:10",
            checkOut: "17:00",
            status: "Present"
        },

        {
            employeeId: "EMP007",
            employeeName: "Aishah",
            department: "Human Resources",
            date: "2026-11-17",
            checkIn: "08:40",
            checkOut: "17:00",
            status: "Late"
        },

        {
            employeeId: "EMP008",
            employeeName: "Nur Izzati",
            department: "Finance",
            date: "2026-11-17",
            checkIn: "08:00",
            checkOut: "17:00",
            status: "Present"
        },

        {
            employeeId: "EMP009",
            employeeName: "Adam Firdaus",
            department: "Information Technology",
            date: "2026-11-16",
            checkIn: "-",
            checkOut: "-",
            status: "Absent"
        },

        {
            employeeId: "EMP010",
            employeeName: "Sarah Lim",
            department: "Marketing",
            date: "2026-11-16",
            checkIn: "08:02",
            checkOut: "17:00",
            status: "Present"
        }

    ];

    let added = false;

    sampleAttendance.forEach(function (sample) {

        const exists = attendanceRecords.some(function (record) {

            return record.employeeId === sample.employeeId &&
                   record.date === sample.date;

        });

        if (!exists) {

            attendanceRecords.push(sample);

            added = true;

        }

    });

    if (added) {

        saveAttendance();

    }

}


    // ==========================================
    // 2. EMPLOYEE INFORMATION
    // ==========================================

    function employeeID(employee) {
        return String(
            employee.id ||
            employee.employeeID ||
            employee.employeeId ||
            ""
        ).trim();
    }

    function employeeName(employee) {
        return String(
            employee.name ||
            employee.employeeName ||
            employee.fullName ||
            "Unknown Employee"
        );
    }

    function employeeDepartment(employee) {
        return String(
            employee.department ||
            employee.departmentName ||
            "Unassigned"
        );
    }

    function isActive(employee) {
        return String(employee.status || "Active")
            .trim().toLowerCase() !== "inactive";
    }

    function getActiveEmployees() {
        return employees.filter(function (employee) {
            return employeeID(employee) && isActive(employee);
        });
    }

    // ==========================================
    // 3. DATE AND TIME
    // ==========================================

    function getToday() {
        const date = new Date();

        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, "0"),
            String(date.getDate()).padStart(2, "0")
        ].join("-");
    }

    function normalizeDate(date) {
        if (!date) return "";

        const value = String(date).trim();

        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return value;
        }

        if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
            const [day, month, year] = value.split("/");
            return `${year}-${month}-${day}`;
        }

        return "";
    }

    function formatDate(date) {
        const value = normalizeDate(date);

        if (!value) return "-";

        const [year, month, day] = value.split("-");

        return `${day}/${month}/${year}`;
    }

    function formatTime(time) {
        if (!time || time === "-") return "-";

        const value = String(time);

        if (/AM|PM/i.test(value)) return value;

        const [hours, minutes] = value.split(":");
        const hour = Number(hours);

        if (isNaN(hour)) return value;

        const period = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;

        return `${String(displayHour).padStart(2, "0")}:${minutes} ${period}`;
    }

    // ==========================================
    // 4. HTML ELEMENTS
    // ==========================================

    const table = document.getElementById("attendanceRecordsTable");

    const employeeSelect =
        document.getElementById("newAttendanceEmployee");

    const attendanceForm =
        document.getElementById("addAttendanceForm");

    const dateInput =
        document.getElementById("newAttendanceDate");

    const checkInInput =
        document.getElementById("newCheckIn");

    const checkOutInput =
        document.getElementById("newCheckOut");

    const statusInput =
        document.getElementById("newAttendanceStatus");

    const searchInput =
        document.getElementById("attendanceSearch");

    const departmentFilter =
        document.getElementById("departmentFilter");

    const statusFilter =
        document.getElementById("statusFilter");

    if (!table) {
        console.error("Attendance table not found.");
        return;
    }

    // ==========================================
    // 5. EMPLOYEE DROPDOWN - IMPORTANT FIX
    // ==========================================

    function populateEmployeeDropdown() {

        if (!employeeSelect) return;

        employeeSelect.innerHTML =
            '<option value="">-- Select Employee --</option>';

        const activeEmployees = getActiveEmployees();

        activeEmployees.forEach(function (employee) {

            const option = document.createElement("option");

            option.value = employeeID(employee);

            option.textContent =
                employeeID(employee) + " - " + employeeName(employee);

            employeeSelect.appendChild(option);

        });

        if (activeEmployees.length === 0) {
            const option = document.createElement("option");
            option.value = "";
            option.textContent = "No active employees available";
            employeeSelect.appendChild(option);
        }

        console.log(
            "Employees loaded into dropdown:",
            activeEmployees.length
        );
    }

    // ==========================================
    // 6. DEPARTMENT FILTER
    // ==========================================

    function populateDepartmentFilter() {

        if (!departmentFilter) return;

        const selected = departmentFilter.value;

        const departments = [
            ...new Set(
                employees.map(employeeDepartment)
            )
        ];

        departmentFilter.innerHTML =
            '<option value="">All Departments</option>';

        departments.sort().forEach(function (department) {

            const option = document.createElement("option");

            option.value = department;
            option.textContent = department;

            departmentFilter.appendChild(option);

        });

        departmentFilter.value = selected;
    }

    // ==========================================
    // 7. ADD ATTENDANCE
    // ==========================================

    function addAttendance(event) {

        event.preventDefault();

        const selectedID = employeeSelect.value;

        const selectedDate = normalizeDate(dateInput.value);

        const checkIn = checkInInput.value;
        const checkOut = checkOutInput.value;
        const status = statusInput.value;

        if (!selectedID) {
            alert("Please select an employee.");
            return;
        }

        const employee = employees.find(function (item) {
            return employeeID(item) === selectedID;
        });

        if (!employee) {
            alert("Employee not found.");
            return;
        }

        if (!selectedDate) {
            alert("Please select an attendance date.");
            return;
        }

        // Prevent duplicate employee attendance on the same date
        const duplicate = attendanceRecords.some(function (record) {

            return (
                String(record.employeeID || record.employeeId) === selectedID &&
                normalizeDate(record.date) === selectedDate
            );

        });

        if (duplicate) {
            alert("Attendance for this employee on this date already exists.");
            return;
        }

        if (status === "Absent") {

            if (checkIn || checkOut) {
                alert("Absent employees should not have check-in or check-out times.");
                return;
            }

        } else {

            if (!checkIn) {
                alert("Please enter check-in time.");
                return;
            }

            if (checkOut && checkOut <= checkIn) {
                alert("Check-out time must be later than check-in time.");
                return;
            }

        }

        const newRecord = {

            id: Date.now(),

            employeeID: employeeID(employee),

            employeeName: employeeName(employee),

            department: employeeDepartment(employee),

            date: selectedDate,

            checkIn: checkIn || "-",

            checkOut: checkOut || "-",

            status: status

        };

        attendanceRecords.unshift(newRecord);

        if (!saveAttendance()) {
            attendanceRecords.shift();
            return;
        }

        attendanceForm.reset();

        dateInput.value = getToday();

        renderAttendance();
        updateSummary();
        updateDonutChart();

        closeAttendanceModal();

        alert("Attendance record added successfully!");

    }

    // ==========================================
    // 8. CLOSE MODAL
    // ==========================================

    function closeAttendanceModal() {

        const modalElement =
            document.getElementById("addAttendanceModal");

        if (!modalElement) return;

        if (typeof bootstrap !== "undefined") {

            const modal =
                bootstrap.Modal.getInstance(modalElement);

            if (modal) {
                modal.hide();
            }

        }
    }

    // ==========================================
    // 9. FILTER ATTENDANCE
    // ==========================================

    function getFilteredRecords() {

        const keyword =
            (searchInput?.value || "").trim().toLowerCase();

        const department = departmentFilter?.value || "";

        const status =
            (statusFilter?.value || "").toLowerCase();

        return attendanceRecords.filter(function (record) {

            const matchesSearch =
                String(record.employeeID || "").toLowerCase().includes(keyword) ||
                String(record.employeeName || "").toLowerCase().includes(keyword);

            const matchesDepartment =
                !department || record.department === department;

            const matchesStatus =
                !status ||
                String(record.status || "").toLowerCase() === status;

            return matchesSearch && matchesDepartment && matchesStatus;

        }).sort(function (a, b) {

            return normalizeDate(b.date).localeCompare(
                normalizeDate(a.date)
            );

        });
    }

    // ==========================================
    // 10. EDIT ATTENDANCE
    // ==========================================

    function editAttendance(record) {

        const newDate = prompt(
            "Enter date (YYYY-MM-DD):",
            normalizeDate(record.date)
        );

        if (newDate === null) return;

        const validDate = normalizeDate(newDate);

        if (!validDate) {
            alert("Invalid date format.");
            return;
        }

        const newCheckIn = prompt(
            "Enter check-in time (HH:MM) or -:",
            record.checkIn
        );

        if (newCheckIn === null) return;

        const newCheckOut = prompt(
            "Enter check-out time (HH:MM) or -:",
            record.checkOut
        );

        if (newCheckOut === null) return;

        const newStatus = prompt(
            "Enter Present, Absent or Late:",
            record.status
        );

        if (newStatus === null) return;

        const validStatus = ["Present", "Absent", "Late"];

        const selectedStatus = validStatus.find(function (item) {
            return item.toLowerCase() === newStatus.trim().toLowerCase();
        });

        if (!selectedStatus) {
            alert("Invalid attendance status.");
            return;
        }

        const finalCheckIn =
            selectedStatus === "Absent" ? "-" : newCheckIn.trim();

        const finalCheckOut =
            selectedStatus === "Absent" ? "-" : newCheckOut.trim();

        if (selectedStatus !== "Absent") {

            if (!finalCheckIn || finalCheckIn === "-") {
                alert("Check-in time is required.");
                return;
            }

            if (
                finalCheckOut !== "-" &&
                finalCheckOut &&
                finalCheckOut <= finalCheckIn
            ) {
                alert("Check-out must be later than check-in.");
                return;
            }
        }

        const duplicate = attendanceRecords.some(function (item) {

            return item !== record &&
                String(item.employeeID) === String(record.employeeID) &&
                normalizeDate(item.date) === validDate;

        });

        if (duplicate) {
            alert("Another attendance record already exists for this date.");
            return;
        }

        record.date = validDate;
        record.checkIn = finalCheckIn || "-";
        record.checkOut = finalCheckOut || "-";
        record.status = selectedStatus;

        saveAttendance();

        renderAttendance();
        updateSummary();
        updateDonutChart();

        alert("Attendance updated successfully!");
    }

    // ==========================================
    // 11. DELETE ATTENDANCE
    // ==========================================

    function deleteAttendance(record) {

        if (!confirm("Are you sure you want to delete this record?")) {
            return;
        }

        attendanceRecords = attendanceRecords.filter(function (item) {
            return item !== record;
        });

        saveAttendance();

        renderAttendance();
        updateSummary();
        updateDonutChart();

        alert("Attendance deleted successfully!");
    }

    // ==========================================
    // 12. DISPLAY ATTENDANCE TABLE
    // ==========================================

    function renderAttendance() {

        const records = getFilteredRecords();

        const totalPages = Math.max(
            1,
            Math.ceil(records.length / PAGE_SIZE)
        );

        currentPage = Math.min(currentPage, totalPages);

        const start = (currentPage - 1) * PAGE_SIZE;

        const visibleRecords =
            records.slice(start, start + PAGE_SIZE);

        table.innerHTML = "";

        if (visibleRecords.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-muted py-4">
                        No attendance records found.
                    </td>
                </tr>
            `;

        } else {

            visibleRecords.forEach(function (record) {

                const row = document.createElement("tr");

                const details = [
                    record.employeeID,
                    record.employeeName,
                    record.department,
                    formatDate(record.date),
                    formatTime(record.checkIn),
                    formatTime(record.checkOut)
                ];

                details.forEach(function (value) {

                    const cell = document.createElement("td");
                    cell.textContent = value || "-";
                    row.appendChild(cell);

                });

                // Status
                const statusCell = document.createElement("td");

                const badge = document.createElement("span");

                badge.textContent = record.status;

                const normalized = String(record.status).toLowerCase();

                badge.className =
                    normalized === "present"
                        ? "status-present"
                        : normalized === "late"
                            ? "status-late"
                            : "status-absent";

                statusCell.appendChild(badge);
                row.appendChild(statusCell);

                // Actions
                const actionCell = document.createElement("td");

                const editButton = document.createElement("button");

                editButton.textContent = "Edit";
                editButton.className =
                    "btn btn-sm btn-outline-secondary me-1";

                editButton.addEventListener("click", function () {
                    editAttendance(record);
                });

                const deleteButton = document.createElement("button");

                deleteButton.textContent = "Delete";
                deleteButton.className =
                    "btn btn-sm btn-danger";

                deleteButton.addEventListener("click", function () {
                    deleteAttendance(record);
                });

                actionCell.appendChild(editButton);
                actionCell.appendChild(deleteButton);

                row.appendChild(actionCell);

                table.appendChild(row);

            });
        }

        // Pagination
        const paginationInfo =
            document.getElementById("paginationInfo");

        const currentPageLabel =
            document.getElementById("currentPage");

        const previousButton =
            document.getElementById("previousPage");

        const nextButton =
            document.getElementById("nextPage");

        if (paginationInfo) {
            paginationInfo.textContent = records.length
                ? `Showing ${start + 1} - ${Math.min(start + PAGE_SIZE, records.length)} of ${records.length} records`
                : "Showing 0 records";
        }

        if (currentPageLabel) {
            currentPageLabel.textContent =
                `${currentPage} / ${totalPages}`;
        }

        if (previousButton) {
            previousButton.disabled = currentPage <= 1;
        }

        if (nextButton) {
            nextButton.disabled = currentPage >= totalPages;
        }
    }

    // ==========================================
    // 13. UPDATE SUMMARY CARDS
    // ==========================================

    function updateSummary() {

        const todayRecords = attendanceRecords.filter(function (record) {
            return normalizeDate(record.date) === getToday();
        });

        const dailyMap = new Map();

        todayRecords.forEach(function (record) {
            dailyMap.set(String(record.employeeID), record);
        });

        let present = 0;
        let absent = 0;
        let late = 0;

        const active = getActiveEmployees();

        active.forEach(function (employee) {

            const record = dailyMap.get(employeeID(employee));

            if (!record || record.status === "Absent") {
                absent++;
            } else if (record.status === "Late") {
                late++;
            } else {
                present++;
            }
        });

        const total = active.length;

        const rate = total
            ? Math.round(((present + late) / total) * 100)
            : 0;

        const elements = {
            presentCount: present,
            notCheckedIn: absent,
            lateCount: late,
            attendancePercentage: rate + "%",
            totalEmployees: total
        };

        Object.keys(elements).forEach(function (id) {

            const element = document.getElementById(id);

            if (element) {
                element.textContent = elements[id];
            }
        });
    }

    // ==========================================
    // 14. UPDATE DONUT CHART
    // ==========================================

    function updateDonutChart() {

        const chart = document.getElementById("attendanceDonut");

        if (!chart) return;

        const active = getActiveEmployees();

        const total = active.length;

        const dailyRecords = attendanceRecords.filter(function (record) {
            return normalizeDate(record.date) === getToday();
        });

        const present = dailyRecords.filter(function (record) {
            return record.status === "Present";
        }).length;

        const late = dailyRecords.filter(function (record) {
            return record.status === "Late";
        }).length;

        const absent = Math.max(0, total - present - late);

        const presentPercent = total ? present / total * 100 : 0;
        const latePercent = total ? late / total * 100 : 0;

        chart.style.background = `
            conic-gradient(
                #829477 0% ${presentPercent}%,
                #D4A85F ${presentPercent}% ${presentPercent + latePercent}%,
                #B8756C ${presentPercent + latePercent}% 100%
            )
        `;

        const percentage = total
            ? Math.round(((present + late) / total) * 100)
            : 0;

        const elements = {
            chartPercentage: percentage + "%",
            chartPresent: present,
            chartAbsent: absent,
            chartLate: late,
            chartDate: "Attendance overview for " + formatDate(getToday())
        };

        Object.keys(elements).forEach(function (id) {

            const element = document.getElementById(id);

            if (element) {
                element.textContent = elements[id];
            }
        });
    }

    // ==========================================
    // 15. SEARCH AND FILTER EVENTS
    // ==========================================

    function refresh() {
        currentPage = 1;
        renderAttendance();
    }

    searchInput?.addEventListener("input", refresh);
    departmentFilter?.addEventListener("change", refresh);
    statusFilter?.addEventListener("change", refresh);

    // ==========================================
    // 16. PAGINATION
    // ==========================================

    document.getElementById("previousPage")
        ?.addEventListener("click", function () {

            if (currentPage > 1) {
                currentPage--;
                renderAttendance();
            }
        });

    document.getElementById("nextPage")
        ?.addEventListener("click", function () {

            const pages = Math.max(
                1,
                Math.ceil(getFilteredRecords().length / PAGE_SIZE)
            );

            if (currentPage < pages) {
                currentPage++;
                renderAttendance();
            }
        });

    // ==========================================
    // 17. EXPORT CSV
    // ==========================================

    document.getElementById("exportCsvBtn")
        ?.addEventListener("click", function () {

            const records = getFilteredRecords();

            if (!records.length) {
                alert("No attendance records available.");
                return;
            }

            const headers = [
                "Employee ID",
                "Employee Name",
                "Department",
                "Date",
                "Check-in",
                "Check-out",
                "Status"
            ];

            const rows = records.map(function (record) {
                return [
                    record.employeeID,
                    record.employeeName,
                    record.department,
                    formatDate(record.date),
                    formatTime(record.checkIn),
                    formatTime(record.checkOut),
                    record.status
                ];
            });

            const csv = [headers, ...rows].map(function (row) {
                return row.map(function (value) {
                    return '"' + String(value ?? "").replace(/"/g, '""') + '"';
                }).join(",");
            }).join("\r\n");

            const blob = new Blob(
                ["\uFEFF" + csv],
                { type: "text/csv;charset=utf-8;" }
            );

            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");

            link.href = url;
            link.download = "EAMS_Attendance_Records.csv";

            link.click();

            URL.revokeObjectURL(url);
        });

    // ==========================================
    // 18. PRINT
    // ==========================================

    document.getElementById("printBtn")
        ?.addEventListener("click", function () {
            window.print();
        });

    // ==========================================
    // 19. ADD ATTENDANCE FORM EVENT
    // ==========================================

    if (attendanceForm) {
        attendanceForm.addEventListener("submit", addAttendance);
    } else {
        console.error("addAttendanceForm not found in attendance.html");
    }

    // ==========================================
    // 20. REFRESH WHEN EMPLOYEE DATA CHANGES
    // ==========================================

    window.addEventListener("storage", function (event) {

        if (event.key === EMPLOYEE_KEY) {

            employees = readStorage(EMPLOYEE_KEY);

            populateEmployeeDropdown();
            populateDepartmentFilter();
            updateSummary();
            updateDonutChart();
        }

        if (event.key === ATTENDANCE_KEY) {

            attendanceRecords = readStorage(ATTENDANCE_KEY);

            renderAttendance();
            updateSummary();
            updateDonutChart();
        }
    });

    // ==========================================
    // 21. INITIALIZE
    // ==========================================

    if (dateInput) {
        dateInput.value = getToday();
    }

    populateEmployeeDropdown();
    populateDepartmentFilter();

    renderAttendance();
    updateSummary();
    updateDonutChart();

    console.log("EAMS Attendance System Ready");
    console.log("Employees:", employees.length);
    console.log("Active employees:", getActiveEmployees().length);
    console.log("Attendance records:", attendanceRecords.length);

});

