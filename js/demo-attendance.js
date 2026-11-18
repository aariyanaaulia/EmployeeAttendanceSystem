
// ==========================================
// EAMS - DEMO ATTENDANCE RECORDS
// Sample records for lecturer demonstration
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    // Get employee data
    let employees = [];

    try {
        employees = JSON.parse(
            localStorage.getItem("eamsEmployees") || "[]"
        );
    } catch (error) {
        employees = [];
    }

    if (!Array.isArray(employees) || employees.length === 0) {
        console.log("Please load employee records first.");
        return;
    }

    // Get existing attendance records
    let attendance = [];

    try {
        attendance = JSON.parse(
            localStorage.getItem("eamsAttendance") || "[]"
        );
    } catch (error) {
        attendance = [];
    }

    if (!Array.isArray(attendance)) {
        attendance = [];
    }

    // Get last 5 working days
    function getWorkingDays() {

        const dates = [];
        const currentDate = new Date();

        while (dates.length < 5) {

            const day = currentDate.getDay();

            if (day !== 0 && day !== 6) {

                const year = currentDate.getFullYear();
                const month = String(
                    currentDate.getMonth() + 1
                ).padStart(2, "0");

                const date = String(
                    currentDate.getDate()
                ).padStart(2, "0");

                dates.push(
                    `${year}-${month}-${date}`
                );
            }

            currentDate.setDate(
                currentDate.getDate() - 1
            );
        }

        return dates.reverse();
    }

    // Attendance status examples
    const statusPatterns = [
        ["Present", "Present", "Present", "Present", "Present",
         "Late", "Late", "Absent", "Absent", "Present"],

        ["Present", "Present", "Late", "Present", "Present",
         "Present", "Absent", "Late", "Present", "Absent"],

        ["Present", "Late", "Present", "Present", "Absent",
         "Present", "Present", "Late", "Present", "Absent"],

        ["Present", "Present", "Present", "Late", "Present",
         "Absent", "Present", "Late", "Absent", "Present"],

        ["Present", "Present", "Present", "Present", "Late",
         "Present", "Late", "Absent", "Present", "Absent"]
    ];

    const workingDays = getWorkingDays();

    // Generate sample attendance
    workingDays.forEach(function (date, dayIndex) {

        employees.slice(0, 10).forEach(function (employee, index) {

            const employeeID = String(
                employee.id ||
                employee.employeeID ||
                employee.employeeId ||
                ""
            ).trim();

            if (!employeeID) return;

            // Prevent duplicate attendance
            const alreadyExists = attendance.some(function (record) {

                const recordID = String(
                    record.employeeID ||
                    record.employeeId ||
                    record.id ||
                    ""
                ).trim().toUpperCase();

                let recordDate = String(
                    record.date || ""
                );

                if (recordDate.includes("/")) {
                    const parts = recordDate.split("/");
                    recordDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
                }

                return (
                    recordID === employeeID.toUpperCase() &&
                    recordDate === date
                );

            });

            if (alreadyExists) return;

            const status = statusPatterns[dayIndex][index];

            let checkIn = "";
            let checkOut = "";

            if (status === "Present") {
                checkIn = "08:00";
                checkOut = "17:00";
            }

            else if (status === "Late") {
                checkIn = "09:15";
                checkOut = "17:15";
            }

            // Save attendance record
            attendance.push({

                employeeID: employeeID,

                employeeName:
                    employee.name ||
                    employee.employeeName ||
                    "",

                department: employee.department || "",

                date: date,

                checkIn: checkIn,

                checkOut: checkOut,

                status: status

            });

        });

    });

    // Save all attendance records
    localStorage.setItem(
        "eamsAttendance",
        JSON.stringify(attendance)
    );

    console.log("Demo attendance records successfully loaded.");

});
