// Hiển thị tên người dùng khi trang tải
let currentUser = localStorage.getItem("currentUser");
if (currentUser) {
    currentUser = JSON.parse(currentUser);
    document.getElementById("userName").innerHTML = `Xin chào, ${currentUser.name}`;
}

// Xử lý đăng xuất
function logout() {
    localStorage.removeItem("currentUser");
    window.location.href = "project.html"; // Điều hướng về trang đăng nhập
}