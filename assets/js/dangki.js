let acc = [];

function getAcc() {
    let data = localStorage.getItem('users');
    if (data) {
        acc = JSON.parse(data);
    } else {
        acc = [];
    }
    console.log(acc);
}

function submitForm(event) {
    event.preventDefault();
    
    let name = document.getElementById('name').value;
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let confirm = document.getElementById('confirm').value;
    
    let checkNameDiv = document.getElementById('checkName');
    let checkEmailDiv = document.getElementById('checkEmail');
    let checkPassDiv = document.getElementById('checkPass');
    let confirmPassDiv = document.getElementById('confirmPass');

    // Reset thông báo lỗi
    checkNameDiv.innerHTML = "";
    checkEmailDiv.innerHTML = "";
    checkPassDiv.innerHTML = "";
    confirmPassDiv.innerHTML = "";

    let isValid = true;

    // Validate Họ và tên
    if (name === "") {
        checkNameDiv.innerHTML = "Họ và tên không được để trống";
        isValid = false;
    }

    // Validate Email
    if (email === "") {
        checkEmailDiv.innerHTML = "Email không được để trống";
        isValid = false;
    } else if (!isValidEmail(email)) {
        checkEmailDiv.innerHTML = "Email không đúng định dạng";
        isValid = false;
    } else if (checkEmail(email)) {
        checkEmailDiv.innerHTML = "Email đã tồn tại";
        isValid = false;
    }

    // Validate Password
    if (password === "") {
        checkPassDiv.innerHTML = "Mật khẩu không được để trống";
        isValid = false;
    } else if (password.length < 8) {
        checkPassDiv.innerHTML = "Mật khẩu phải có ít nhất 8 ký tự";
        isValid = false;
    } else if (!isValidPasswordFormat(password)) {
        checkPassDiv.innerHTML = "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và kết thúc bằng số";
        isValid = false;
    }

    // Validate Confirm Password
    if (confirm === "") {
        confirmPassDiv.innerHTML = "Mật khẩu xác nhận không được để trống";
        isValid = false;
    } else if (password !== confirm) {
        confirmPassDiv.innerHTML = "Mật khẩu không trùng khớp";
        isValid = false;
    }

    // Nếu form hợp lệ thì lưu dữ liệu và điều hướng
    if (isValid) {
        let user = {
            name: name,
            email: email,
            password: password
        };

        acc.push(user);
        localStorage.setItem('users', JSON.stringify(acc));
        document.getElementById("form").reset();
        window.location.href = 'home.html'; // Điều hướng sang trang chủ
    }
}

// Hàm kiểm tra định dạng email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Hàm kiểm tra định dạng mật khẩu
function isValidPasswordFormat(password) {
    // Biểu thức chính quy kiểm tra:
    // - (?=\S*[A-Z]) : ít nhất 1 chữ hoa
    // - (?=\S*[a-z]) : ít nhất 1 chữ thường
    // - \d$ : kết thúc bằng số
    const passwordRegex = /^(?=\S*[A-Z])(?=\S*[a-z]).*\d$/;
    return passwordRegex.test(password);
}

// Hàm kiểm tra email đã tồn tại
function checkEmail(email) {
    for (let i = 0; i < acc.length; i++) {
        if (email === acc[i].email) {
            return true;
        }
    }
    return false;
}

// Gắn sự kiện submit cho form
document.getElementById("form").onsubmit = submitForm;
getAcc();