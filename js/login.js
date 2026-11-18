
// ==========================================
// EAMS - ADMIN & EMPLOYEE LOGIN
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const loginForm = document.getElementById("loginForm");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const loginRole = document.getElementById("loginRole");
    const errorMessage = document.getElementById("errorMessage");
    const togglePassword = document.getElementById("togglePassword");

    // SHOW / HIDE PASSWORD
    togglePassword.addEventListener("click", function () {

        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            togglePassword.textContent = "Hide";
        } else {
            passwordInput.type = "password";
            togglePassword.textContent = "Show";
        }

    });


    // LOGIN FORM
    loginForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        const role = loginRole.value;

        errorMessage.textContent = "";


        // ADMIN LOGIN
        if (role === "admin") {

            if (username === "admin" && password === "admin123") {

                sessionStorage.setItem("eamsSession", JSON.stringify({
                    username: "admin",
                    role: "admin"
                }));

                window.location.href = "dashboard.html";
                return;

            }

            errorMessage.textContent =
                "Invalid administrator username or password.";

            return;
        }


        // EMPLOYEE LOGIN
        if (role === "employee") {

            let employees = [];

            try {
                employees = JSON.parse(
                    localStorage.getItem("eamsEmployees") || "[]"
                );
            } catch (error) {
                errorMessage.textContent =
                    "Unable to load employee records.";
                return;
            }


            // FIND EMPLOYEE BY ID
            const employee = employees.find(emp => {

                const savedID = String(
                    emp.id ||
                    emp.employeeID ||
                    emp.employeeId ||
                    ""
                ).trim().toUpperCase();

                return savedID === username.toUpperCase();

            });


            if (!employee) {

                errorMessage.textContent =
                    "Employee ID not found. Please contact the administrator.";

                return;
            }


            // CHECK EMPLOYEE PASSWORD
            const savedPassword = employee.password || "emp123";

            if (password !== savedPassword) {

                errorMessage.textContent =
                    "Incorrect employee password.";

                return;
            }


            // SAVE EMPLOYEE SESSION
            const employeeID =
                employee.id ||
                employee.employeeID ||
                employee.employeeId;

            sessionStorage.setItem("eamsSession", JSON.stringify({

                username: employeeID,
                employeeID: employeeID,
                role: "employee",

                name: employee.name ||
                      employee.employeeName ||
                      "",

                department: employee.department || "",
                position: employee.position || ""

            }));


            // GO TO EMPLOYEE DASHBOARD
            window.location.href = "employee-dashboard.html";
            return;

        }


        errorMessage.textContent =
            "Invalid username or password.";

    });

});

