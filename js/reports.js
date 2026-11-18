
/* =====================================================
   EAMS - ATTENDANCE REPORTS
   THEME: ESPRESSO BROWN & BEIGE

   SHARED LOCAL STORAGE:
   eamsEmployees
   eamsAttendance
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    console.log("EAMS Reports JavaScript Loaded");

    // 1. LOCAL STORAGE
    const EMPLOYEE_KEY = "eamsEmployees";
    const ATTENDANCE_KEY = "eamsAttendance";

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

    // 2. GENERAL FUNCTIONS

    function normalizeStatus(status) {
        return String(status || "").trim().toLowerCase();
    }

    function isActiveEmployee(employee) {
        return String(employee.status || "Active")
            .trim()
            .toLowerCase() === "active";
    }

    // Supports DD/MM/YYYY and YYYY-MM-DD
    function parseAttendanceDate(date) {

        if (!date) return null;

        const value = String(date).trim();
        let year, month, day;

        if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {

            const parts = value.split("/");

            day = Number(parts[0]);
            month = Number(parts[1]);
            year = Number(parts[2]);

        } else if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {

            const parts = value.split("-");

            year = Number(parts[0]);
            month = Number(parts[1]);
            day = Number(parts[2]);

        } else {
            return null;
        }

        const result = new Date(year, month - 1, day);

        if (
            result.getFullYear() !== year ||
            result.getMonth() !== month - 1 ||
            result.getDate() !== day
        ) {
            return null;
        }

        return result;
    }

    function getMonthKey(date) {
        return (
            date.getFullYear() + "-" +
            String(date.getMonth() + 1).padStart(2, "0")
        );
    }

    function getMonthName(monthKey) {

        const [year, month] = monthKey.split("-");

        const date = new Date(
            Number(year),
            Number(month) - 1,
            1
        );

        return date.toLocaleDateString("en-MY", {
            month: "long",
            year: "numeric"
        });
    }

    // 3. LOAD DATA

    const today = new Date();
    const currentMonthKey = getMonthKey(today);

    const employees = getEmployees().filter(isActiveEmployee);
    const attendanceRecords = getAttendance();

    // 4. CALCULATE ATTENDANCE

    function calculateMonthlyRecords(records) {

        const summary = {
            present: 0,
            absent: 0,
            late: 0,
            total: 0,
            attendanceRate: 0
        };

        records.forEach(function (record) {

            const status = normalizeStatus(record.status);

            if (
                status === "present" ||
                status === "absent" ||
                status === "late"
            ) {
                summary[status]++;
                summary.total++;
            }

        });

        // Present and Late count as attended
        summary.attendanceRate = summary.total > 0
            ? Math.round(
                ((summary.present + summary.late) /
                summary.total) * 100
            )
            : 0;

        return summary;
    }

    // 5. CURRENT MONTH RECORDS

    const currentMonthRecords = attendanceRecords.filter(
        function (record) {

            const date = parseAttendanceDate(record.date);

            return date &&
                getMonthKey(date) === currentMonthKey;
        }
    );

    const currentSummary = calculateMonthlyRecords(
        currentMonthRecords
    );

    // 6. UPDATE SUMMARY CARDS

    function updateSummaryCards() {

        const elements = {

            reportTotalEmployees: employees.length,

            reportAttendanceRate:
                currentSummary.attendanceRate + "%",

            reportPresent: currentSummary.present,

            reportAbsent: currentSummary.absent,

            reportLate: currentSummary.late

        };

        Object.keys(elements).forEach(function (id) {

            const element = document.getElementById(id);

            if (element) {
                element.textContent = elements[id];
            }

        });
    }

    // 7. MONTHLY ATTENDANCE CHART

    function updateMonthlyChart() {

        const canvas = document.getElementById("monthlyChart");

        if (!canvas || typeof Chart === "undefined") {
            return;
        }

        const existingChart = Chart.getChart(canvas);

        if (existingChart) {
            existingChart.destroy();
        }

        new Chart(canvas, {

            type: "doughnut",

            data: {

                labels: [
                    "Present",
                    "Absent",
                    "Late"
                ],

                datasets: [{

                    data: [
                        currentSummary.present,
                        currentSummary.absent,
                        currentSummary.late
                    ],

                    backgroundColor: [
                        "#829477",
                        "#B8756C",
                        "#D9A441"
                    ],

                    borderColor: "#FFFFFF",
                    borderWidth: 3,
                    hoverOffset: 8

                }]

            },

            options: {

                responsive: true,
                maintainAspectRatio: true,

                plugins: {

                    legend: {
                        position: "bottom",

                        labels: {
                            padding: 20
                        }
                    },

                    title: {

                        display: true,

                        text: "Monthly Attendance Distribution",

                        color: "#4A2F08",

                        font: {
                            size: 14,
                            weight: "bold"
                        },

                        padding: 15

                    },

                    tooltip: {

                        callbacks: {

                            label: function (context) {

                                return context.label +
                                    ": " + context.raw +
                                    " records";

                            }

                        }

                    }

                }

            }

        });

    }

    // 8. MONTHLY SUMMARY TABLE

    function updateMonthlyTable() {

        const table = document.getElementById(
            "monthlySummaryTable"
        );

        if (!table) return;

        table.innerHTML = "";

        const monthlyGroups = {};

        // Group records by month
        attendanceRecords.forEach(function (record) {

            const date = parseAttendanceDate(record.date);

            if (!date) return;

            const monthKey = getMonthKey(date);

            if (!monthlyGroups[monthKey]) {
                monthlyGroups[monthKey] = [];
            }

            monthlyGroups[monthKey].push(record);

        });

        // Include current month
        if (!monthlyGroups[currentMonthKey]) {
            monthlyGroups[currentMonthKey] = [];
        }

        // Sort newest month first
        const months = Object.keys(monthlyGroups).sort(
            function (a, b) {
                return b.localeCompare(a);
            }
        );

        if (months.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted">
                        No monthly attendance records found.
                    </td>
                </tr>
            `;

            return;
        }

        months.forEach(function (monthKey) {

            const summary = calculateMonthlyRecords(
                monthlyGroups[monthKey]
            );

            const row = document.createElement("tr");

            const values = [

                getMonthName(monthKey),

                summary.present,

                summary.absent,

                summary.late,

                summary.attendanceRate + "%"

            ];

            values.forEach(function (value) {

                const cell = document.createElement("td");

                cell.textContent = value;

                row.appendChild(cell);

            });

            table.appendChild(row);

        });

    }

    // 9. LOGOUT CONFIRMATION

    const logoutLinks = document.querySelectorAll(
        'a[href="index.html"]'
    );

    logoutLinks.forEach(function (link) {

        link.addEventListener("click", function (event) {

            const confirmLogout = confirm(
                "Are you sure you want to logout?"
            );

            if (!confirmLogout) {
                event.preventDefault();
            }

        });

    });

    // 10. INITIALIZE REPORTS

    updateSummaryCards();

    updateMonthlyChart();

    updateMonthlyTable();

    console.log("EAMS Monthly Reports Initialized", {

        totalEmployees: employees.length,

        currentMonth: currentMonthKey,

        present: currentSummary.present,

        absent: currentSummary.absent,

        late: currentSummary.late,

        attendanceRate: currentSummary.attendanceRate

    });

});
