
/* ==========================================
   EAMS - EMPLOYEE DASHBOARD
   Employee Information
   Daily Attendance
   Check In / Check Out
   Attendance History
   24-Hour Time Format
========================================== */

document.addEventListener("DOMContentLoaded", function () {

    // ==========================================
    // 1. STORAGE
    // ==========================================

    const EMPLOYEE_KEY = "eamsEmployees";
    const ATTENDANCE_KEY = "eamsAttendance";
    const SESSION_KEY = "eamsSession";

    let session;
    let employees = [];
    let attendanceRecords = [];
    let currentEmployee = null;

    try {
        session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");

        employees = JSON.parse(localStorage.getItem(EMPLOYEE_KEY) || "[]");

        attendanceRecords = JSON.parse(
            localStorage.getItem(ATTENDANCE_KEY) || "[]"
        );

        if (!Array.isArray(employees)) employees = [];
        if (!Array.isArray(attendanceRecords)) attendanceRecords = [];

    } catch (error) {
        console.error("Storage error:", error);
        employees = [];
        attendanceRecords = [];
    }


    // ==========================================
    // 2. HTML ELEMENTS
    // ==========================================

    const welcomeEmployeeName =
        document.getElementById("welcomeEmployeeName");

    const employeeID =
        document.getElementById("employeeID");

    const employeeName =
        document.getElementById("employeeName");

    const employeeDepartment =
        document.getElementById("employeeDepartment");

    const employeePosition =
        document.getElementById("employeePosition");

    const todayStatus =
        document.getElementById("todayStatus");

    const checkInTime =
        document.getElementById("checkInTime");

    const checkOutTime =
        document.getElementById("checkOutTime");

    const checkInTimeInput =
        document.getElementById("checkInTimeInput");

    const checkOutTimeInput =
        document.getElementById("checkOutTimeInput");

    const checkInButton =
        document.getElementById("employeeCheckInBtn");

    const checkOutButton =
        document.getElementById("employeeCheckOutBtn");

    const attendanceMessage =
        document.getElementById("attendanceActionMessage");

    const attendanceTable =
        document.getElementById("employeeAttendanceTable");


    // ==========================================
    // 3. HELPER FUNCTIONS
    // ==========================================

    function saveAttendance() {

        localStorage.setItem(
            ATTENDANCE_KEY,
            JSON.stringify(attendanceRecords)
        );

    }


    function getTodayDate() {

        const today = new Date();

        const day = String(today.getDate()).padStart(2, "0");

        const month = String(today.getMonth() + 1).padStart(2, "0");

        const year = today.getFullYear();

        return `${day}/${month}/${year}`;

    }


    function normalizeDate(date) {

        if (!date) return "";

        const value = String(date).trim();

        // YYYY-MM-DD to DD/MM/YYYY
        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {

            const parts = value.split("-");

            return `${parts[2]}/${parts[1]}/${parts[0]}`;

        }

        return value;

    }


    function getDateValue(date) {

        const normalized = normalizeDate(date);

        const parts = normalized.split("/");

        if (parts.length !== 3) return 0;

        return new Date(
            Number(parts[2]),
            Number(parts[1]) - 1,
            Number(parts[0])
        ).getTime();

    }


    // Convert time into 24-hour format.
    function normalizeTime(time, isCheckout = false) {

        if (!time || time === "-") return "-";

        let value = String(time).trim().toUpperCase();

        const ampmMatch = value.match(
            /^(\d{1,2}):(\d{2})\s*(AM|PM)$/
        );

        if (ampmMatch) {

            let hours = Number(ampmMatch[1]);

            const minutes = ampmMatch[2];

            const period = ampmMatch[3];

            if (period === "PM" && hours !== 12) {
                hours += 12;
            }

            if (period === "AM" && hours === 12) {
                hours = 0;
            }

            value =
                String(hours).padStart(2, "0") +
                ":" +
                minutes;

        }

        // Correct old default checkout time.
        if (isCheckout && value === "05:00") {
            value = "17:00";
        }

        return value;

    }


    function validTime(time) {

        return /^([01]\d|2[0-3]):[0-5]\d$/.test(time);

    }


    function escapeHTML(value) {

        return String(value ?? "").replace(
            /[&<>"']/g,
            function (character) {

                return {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;"
                }[character];

            }
        );

    }


    function getRecordEmployeeID(record) {

        return String(
            record.employeeID ||
            record.employeeId ||
            record.id ||
            ""
        );

    }


    function getEmployeeID(employee) {

        return String(
            employee.id ||
            employee.employeeID ||
            employee.employeeId ||
            ""
        );

    }


    function getEmployeeName(employee) {

        return (
            employee.name ||
            employee.employeeName ||
            "Employee"
        );

    }


    function getTodayRecord() {

        const today = getTodayDate();

        return attendanceRecords.find(function (record) {

            return (
                getRecordEmployeeID(record) === getEmployeeID(currentEmployee) &&
                normalizeDate(record.date) === today
            );

        });

    }


    function showMessage(message, type) {

        attendanceMessage.textContent = message;

        attendanceMessage.className =
            "mt-3 mb-0 " +
            (type === "success"
                ? "message-success"
                : "message-error");

    }


    // ==========================================
    // 4. CHECK EMPLOYEE SESSION
    // ==========================================

    if (!session) {

        document.querySelector(".main-content").innerHTML = `
            <div class="table-card">
                <h4>Session Not Found</h4>
                <p>Please login again to access your employee dashboard.</p>
                <a href="index.html" class="btn btn-success">
                    Back to Login
                </a>
            </div>
        `;

        return;

    }


    const sessionEmployeeID = String(
        session.employeeID ||
        session.employeeId ||
        session.id ||
        session.employee?.employeeID ||
        session.employee?.id ||
        ""
    );


    currentEmployee = employees.find(function (employee) {

        return getEmployeeID(employee) === sessionEmployeeID;

    });


    if (!currentEmployee) {

        document.querySelector(".main-content").innerHTML = `
            <div class="table-card">
                <h4>Employee Not Found</h4>
                <p>Your employee information could not be found.</p>
                <a href="index.html" class="btn btn-success">
                    Back to Login
                </a>
            </div>
        `;

        return;

    }


    // ==========================================
    // 5. DISPLAY EMPLOYEE INFORMATION
    // ==========================================

    function displayEmployeeInformation() {

        const name = getEmployeeName(currentEmployee);

        welcomeEmployeeName.textContent = name;

        employeeID.textContent = getEmployeeID(currentEmployee);

        employeeName.textContent = name;

        employeeDepartment.textContent =
            currentEmployee.department || "-";

        employeePosition.textContent =
            currentEmployee.position || "-";

    }


    // ==========================================
    // 6. DISPLAY TODAY'S ATTENDANCE SUMMARY
    // ==========================================

    function updateAttendanceSummary() {

        const record = getTodayRecord();

        if (!record) {

            todayStatus.textContent = "Not Checked In";

            checkInTime.textContent = "--:--";

            checkOutTime.textContent = "--:--";

            checkInButton.disabled = false;

            checkOutButton.disabled = true;

            return;

        }


        const inTime = normalizeTime(record.checkIn);

        const outTime = normalizeTime(record.checkOut, true);

        // Update old checkout values.
        if (record.checkOut && record.checkOut !== outTime) {

            record.checkOut = outTime;

            saveAttendance();

        }


        todayStatus.textContent = record.status || "Present";

        checkInTime.textContent = inTime;

        checkOutTime.textContent = outTime;


        // Disable Check In after successful check-in.
        checkInButton.disabled = Boolean(record.checkIn);


        // Enable Check Out only after Check In.
        checkOutButton.disabled =
            !record.checkIn ||
            Boolean(record.checkOut);

    }


    // ==========================================
    // 7. EMPLOYEE CHECK IN
    // ==========================================

    checkInButton.addEventListener("click", function () {

        const selectedTime = checkInTimeInput.value.trim();

        if (!validTime(selectedTime)) {

            showMessage(
                "Please enter a valid check-in time (e.g. 08:00).",
                "error"
            );

            return;

        }


        let existingRecord = getTodayRecord();


        if (existingRecord && existingRecord.checkIn) {

            showMessage(
                "You have already checked in today.",
                "error"
            );

            return;

        }


        // Late after 08:00.
        const status =
            selectedTime > "08:00"
                ? "Late"
                : "Present";


        if (existingRecord) {

            existingRecord.checkIn = selectedTime;

            existingRecord.status = status;

        } else {

            const newRecord = {

                employeeID: getEmployeeID(currentEmployee),

                employeeName: getEmployeeName(currentEmployee),

                department: currentEmployee.department || "-",

                position: currentEmployee.position || "-",

                date: getTodayDate(),

                checkIn: selectedTime,

                checkOut: "",

                status: status

            };

            attendanceRecords.push(newRecord);

        }


        saveAttendance();

        updateAttendanceSummary();

        displayAttendanceHistory();

        showMessage(
            `Check-in successful! Your time is ${selectedTime}. Status: ${status}.`,
            "success"
        );

    });


    // ==========================================
    // 8. EMPLOYEE CHECK OUT
    // ==========================================

    checkOutButton.addEventListener("click", function () {

        const selectedTime = checkOutTimeInput.value.trim();

        if (!validTime(selectedTime)) {

            showMessage(
                "Please enter a valid check-out time (e.g. 17:00).",
                "error"
            );

            return;

        }


        const record = getTodayRecord();


        if (!record || !record.checkIn) {

            showMessage(
                "Please check in before checking out.",
                "error"
            );

            return;

        }


        if (record.checkOut) {

            showMessage(
                "You have already checked out today.",
                "error"
            );

            return;

        }


        if (selectedTime <= normalizeTime(record.checkIn)) {

            showMessage(
                "Check-out time must be later than check-in time.",
                "error"
            );

            return;

        }


        record.checkOut = selectedTime;


        saveAttendance();

        updateAttendanceSummary();

        displayAttendanceHistory();

        showMessage(
            `Check-out successful! Your time is ${selectedTime}.`,
            "success"
        );

    });


    // ==========================================
    // 9. DISPLAY ATTENDANCE HISTORY
    // ==========================================

    function displayAttendanceHistory() {

        const employeeIDValue = getEmployeeID(currentEmployee);


        const employeeRecords = attendanceRecords.filter(function (record) {

            return getRecordEmployeeID(record) === employeeIDValue;

        });


        // Sort newest date first.
        employeeRecords.sort(function (a, b) {

            return getDateValue(b.date) - getDateValue(a.date);

        });


        if (employeeRecords.length === 0) {

            attendanceTable.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center text-muted">
                        No attendance records found.
                    </td>
                </tr>
            `;

            return;

        }


        attendanceTable.innerHTML = employeeRecords.map(function (record) {

            const date = normalizeDate(record.date);

            const inTime = normalizeTime(record.checkIn);

            const outTime = normalizeTime(record.checkOut, true);

            // Keep stored historical checkout times in 24-hour format.
            if (record.checkOut && record.checkOut !== outTime) {

                record.checkOut = outTime;

            }


            const status = record.status || "Present";

            let statusClass = "status-present";

            if (status.toLowerCase() === "late") {
                statusClass = "status-late";
            }

            if (status.toLowerCase() === "absent") {
                statusClass = "status-absent";
            }


            return `
                <tr>

                    <td>${escapeHTML(date)}</td>

                    <td>${escapeHTML(inTime)}</td>

                    <td>${escapeHTML(outTime)}</td>

                    <td>
                        <span class="status-badge ${statusClass}">
                            ${escapeHTML(status)}
                        </span>
                    </td>

                </tr>
            `;

        }).join("");


        saveAttendance();

    }


    // ==========================================
    // 10. LOGOUT
    // ==========================================

    const logoutButton = document.getElementById("logoutBtn");

    if (logoutButton) {

        logoutButton.addEventListener("click", function () {

            sessionStorage.removeItem(SESSION_KEY);

        });

    }


    // ==========================================
    // 11. INITIALIZE DASHBOARD
    // ==========================================

    displayEmployeeInformation();

    updateAttendanceSummary();

    displayAttendanceHistory();

});

