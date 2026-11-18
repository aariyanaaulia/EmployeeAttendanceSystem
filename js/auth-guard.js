
document.addEventListener("DOMContentLoaded", function () {

    const session = JSON.parse(
        sessionStorage.getItem("eamsSession") || "null"
    );

    const page = window.location.pathname.split("/").pop();

    // Allow access to login page
    if (page === "index.html" || page === "") {
        return;
    }

    // Require login
    if (!session) {
        window.location.replace("index.html");
        return;
    }

    const adminPages = [
        "dashboard.html",
        "employees.html",
        "attendance.html",
        "reports.html"
    ];

    // Employee cannot access admin pages
    if (adminPages.includes(page) && session.role !== "admin") {
        window.location.replace("employee-dashboard.html");
        return;
    }

    // Admin cannot access employee dashboard
    if (page === "employee-dashboard.html" &&
        session.role !== "employee") {
        window.location.replace("dashboard.html");
        return;
    }

    // Logout
    document.querySelectorAll('a[href="index.html"]').forEach(link => {
        link.addEventListener("click", function (event) {
            event.preventDefault();

            sessionStorage.removeItem("eamsSession");

            window.location.href = "index.html";
        });
    });

});
