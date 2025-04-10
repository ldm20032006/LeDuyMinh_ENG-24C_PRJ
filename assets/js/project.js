let users = [];

function getUsers() {
    let data = localStorage.getItem("users");
    if (data) {
        users = JSON.parse(data);
    } else {
        users = [];
    }

    // Kiểm tra xem tài khoản admin đã tồn tại chưa
    let adminExists = users.some(user => user.email === "admin1@gmail.com");
    if (!adminExists) {
        // Nếu chưa có tài khoản admin, thêm vào mảng users
        users.push({
            email: "admin1@gmail.com",
            password: "admin123",
            name: "Admin"
        });
        // Lưu lại vào localStorage
        localStorage.setItem("users", JSON.stringify(users));
    }

    console.log(users);
}

function login(event) {
    event.preventDefault();

    let email = document.getElementById("exampleInputEmail1").value;
    let password = document.getElementById("exampleInputPassword1").value;
    let checkEmail = document.getElementById("checkEmail");
    let checkPass = document.getElementById("checkPass");

    // Reset thông báo lỗi
    checkEmail.innerHTML = "";
    checkPass.innerHTML = "";

    let isValid = true;

    // Validate Email
    if (email === "") {
        checkEmail.innerHTML = "Email không được để trống";
        isValid = false;
    } else if (!isValidEmail(email)) {
        checkEmail.innerHTML = "Email không hợp lệ";
        isValid = false;
    }

    // Validate Password
    if (password === "") {
        checkPass.innerHTML = "Mật khẩu không được để trống";
        isValid = false;
    }

    // Kiểm tra thông tin đăng nhập nếu form hợp lệ
    if (isValid) {
        let userFound = false;
        let currentUser = null;
        for (let i = 0; i < users.length; i++) {
            if (users[i].email === email && users[i].password === password) {
                userFound = true;
                currentUser = users[i]; // Lưu thông tin người dùng hiện tại
                break;
            }
        }

        if (userFound) {
            // Lưu thông tin người dùng hiện tại vào localStorage
            localStorage.setItem("currentUser", JSON.stringify(currentUser));
            document.getElementById("loginForm").reset();

            // Kiểm tra nếu là tài khoản admin thì điều hướng sang admin1.html
            if (email === "admin1@gmail.com") {
                window.location.href = "admin1.html"; // Điều hướng sang trang admin
            } else {
                window.location.href = "home1.html"; // Điều hướng sang trang người dùng
            }
        } else {
            checkEmail.innerHTML = "Email hoặc mật khẩu không đúng";
        }
    }
}

// Hàm kiểm tra định dạng email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Gắn sự kiện submit cho form
document.getElementById("loginForm").onsubmit = login;
getUsers();