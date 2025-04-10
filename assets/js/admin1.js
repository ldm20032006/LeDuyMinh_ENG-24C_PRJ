document.addEventListener("DOMContentLoaded", function () {
    const saveBookingButton = document.getElementById("saveBooking");
    const bookingForm = document.getElementById("bookingForm");
    const tableBody = document.getElementById("bookingTableBody");
    const addBookingButton = document.querySelector(
      '[data-bs-target="#bookingModal"]'
    ); //chọn phần tử đầu tiên
    let editingRow = null;
  
    // Hàm lấy tất cả lịch tập từ localStorage (tổng hợp từ tất cả người dùng)
    function getAllBookings() {
        const allBookings = [];
        // Quét tất cả các khóa trong localStorage
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            // Chỉ lấy các khóa có dạng bookings_<email>
            if (key.startsWith("bookings_")) {
                const bookings = JSON.parse(localStorage.getItem(key)) || [];
                allBookings.push(...bookings);
            }
        }
        // Sắp xếp tất cả lịch theo tên lớp
        allBookings.sort((a, b) => a.class.localeCompare(b.class));
        return allBookings;
    }

    // Hàm khởi tạo dữ liệu
    function initializeData() {
        const allBookings = getAllBookings();
        displayBookings(allBookings);
        updateChart();
        updateStats();
    }
  
    // Hàm hiển thị danh sách lịch tập
    function displayBookings(bookings) {
        tableBody.innerHTML = "";
        bookings.forEach((booking, index) => {
            const row = document.createElement("tr");
            row.setAttribute("data-index", index);
            row.setAttribute("data-email", booking.email); // Lưu email để biết lịch thuộc về ai
            row.innerHTML = `
                              <td>${booking.class}</td>
                              <td>${booking.date}</td>
                              <td>${booking.time}</td>
                              <td>${booking.name}</td>
                              <td>${booking.email}</td>
                              <td>
                                  <a href="#" class="text-primary edit-btn" style = "text-decoration: none;">Sửa</a>  
                                  <a href="#" class="text-danger delete-btn"style = "text-decoration: none;">Xóa</a>
                              </td>
                          `;
            tableBody.appendChild(row);
            addRowEventListeners(row);
        });
        updateChart();
        updateStats();
    }
  
    // Kiểm tra trùng lịch (kiểm tra trong lịch của người dùng tương ứng)
    function isDuplicateBooking(newBooking) {
        const userStorageKey = `bookings_${newBooking.email}`;
        let bookings = JSON.parse(localStorage.getItem(userStorageKey)) || [];
        return bookings.some(
            (booking) =>
                booking.class === newBooking.class &&
                booking.date === newBooking.date &&
                booking.time === newBooking.time
        );
    }
    
    // Hàm lưu dữ liệu vào localStorage (lưu vào đúng tài khoản người dùng)
    function saveToLocalStorage(booking) {
        const userStorageKey = `bookings_${booking.email}`;
        let bookings = JSON.parse(localStorage.getItem(userStorageKey)) || [];
        if (editingRow) {
            const index = editingRow.getAttribute("data-index");
            const allBookings = getAllBookings();
            const bookingToUpdate = allBookings[index];
            const oldStorageKey = `bookings_${bookingToUpdate.email}`;
            let oldBookings = JSON.parse(localStorage.getItem(oldStorageKey)) || [];
            oldBookings = oldBookings.filter((_, i) => i !== parseInt(index));
            localStorage.setItem(oldStorageKey, JSON.stringify(oldBookings));
            bookings.push(booking);
        } else {
            if (isDuplicateBooking(booking)) {
                Swal.fire({
                    icon: "error",
                    title: "Oops...",
                    text: "This schedule is duplicated for the user!"
                });
                return;
            }
            bookings.push(booking);
        }
        // Sắp xếp bookings theo tên lớp
        bookings.sort((a, b) => a.class.localeCompare(b.class));
        localStorage.setItem(userStorageKey, JSON.stringify(bookings));
        filterBookings();
    }
  
    // Khi nhấn "Đặt lịch mới", reset form và xóa thông báo lỗi
    addBookingButton.addEventListener("click", function () {
        bookingForm.reset();
        clearErrorMessages();
        editingRow = null;
    });
  
    // Xử lý sự kiện khi nhấn "Lưu"
    saveBookingButton.addEventListener("click", function () {
        const classValue = document.getElementById("classSelect").value;
        const dateValue = document.getElementById("dateInput").value;
        const timeValue = document.getElementById("timeSelect").value;
        const nameValue = document.getElementById("nameInput").value.trim();
        const emailValue = document.getElementById("emailInput").value.trim();
  
        // Lấy các phần tử hiển thị lỗi
        const checkClass = document.getElementById("checkClass");
        const checkDate = document.getElementById("checkDate");
        const checkTime = document.getElementById("checkTime");
        const checkName = document.getElementById("checkName");
        const checkEmail = document.getElementById("checkEmail");
  
        // Xóa thông báo lỗi cũ
        clearErrorMessages();
  
        // Kiểm tra và hiển thị lỗi
        let isValid = true;
  
        // Validate Class
        if (classValue === "") {
            checkClass.innerHTML = "Lớp học không được để trống";
            isValid = false;
        }
  
        // Validate Date
        if (dateValue === "") {
            checkDate.innerHTML = "Ngày tập không được để trống";
            isValid = false;
        }
  
        // Validate Time
        if (timeValue === "") {
            checkTime.innerHTML = "Khung giờ không được để trống";
            isValid = false;
        }
  
        // Validate Name
        if (nameValue === "") {
            checkName.innerHTML = "Họ và tên không được để trống";
            isValid = false;
        }
  
        // Validate Email
        if (emailValue === "") {
            checkEmail.innerHTML = "Email không được để trống";
            isValid = false;
        } else if (!isValidEmail(emailValue)) {
            checkEmail.innerHTML = "Email không hợp lệ";
            isValid = false;
        }
  
        if (!isValid) {
            return;
        }
  
        const booking = {
            class: classValue,
            date: dateValue,
            time: timeValue,
            name: nameValue,
            email: emailValue,
        };
  
        saveToLocalStorage(booking);
  
        const modal = bootstrap.Modal.getInstance(
            document.getElementById("bookingModal")
        );
        modal.hide();
        bookingForm.reset();
        clearErrorMessages();
        editingRow = null;
    });
  
    // Hàm kiểm tra định dạng email
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
  
    // Hàm xóa thông báo lỗi
    function clearErrorMessages() {
        document.getElementById("checkClass").innerHTML = "";
        document.getElementById("checkDate").innerHTML = "";
        document.getElementById("checkTime").innerHTML = "";
        document.getElementById("checkName").innerHTML = "";
        document.getElementById("checkEmail").innerHTML = "";
    }
  
    // Hàm thêm sự kiện cho từng dòng trong bảng
    function addRowEventListeners(row) {
        const deleteBtn = row.querySelector(".delete-btn");
        const editBtn = row.querySelector(".edit-btn");
  
        deleteBtn.addEventListener("click", function (event) {
            event.preventDefault();
  
            Swal.fire({
                title: "Are you sure you want to delete the schedule?",
                text: "Unable to recover after deletion!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Delete schedule!",
            }).then((result) => {
                if (result.isConfirmed) {
                    const email = row.getAttribute("data-email");
                    const userStorageKey = `bookings_${email}`;
                    let bookings = JSON.parse(localStorage.getItem(userStorageKey)) || [];
                    const index = row.getAttribute("data-index");
                    const allBookings = getAllBookings();
                    const bookingToDelete = allBookings[index];
                    const bookingIndex = bookings.findIndex(
                        (b) =>
                            b.class === bookingToDelete.class &&
                            b.date === bookingToDelete.date &&
                            b.time === bookingToDelete.time &&
                            b.email === bookingToDelete.email
                    );
                    if (bookingIndex !== -1) {
                        bookings.splice(bookingIndex, 1);
                        localStorage.setItem(userStorageKey, JSON.stringify(bookings));
                    }
                    filterBookings();
  
                    Swal.fire({
                        title: "Deleted successfully!",
                        text: "Schedule has been deleted.",
                        icon: "success",
                    });
                }
            });
        });

        editBtn.addEventListener("click", function () {
            const cells = row.querySelectorAll("td");
            document.getElementById("classSelect").value = cells[0].innerText;
            document.getElementById("dateInput").value = cells[1].innerText;
            document.getElementById("timeSelect").value = cells[2].innerText;
            document.getElementById("nameInput").value = cells[3].innerText;
            document.getElementById("emailInput").value = cells[4].innerText;
            clearErrorMessages();
            const modal = new bootstrap.Modal(
                document.getElementById("bookingModal")
            );
            modal.show();
            editingRow = row;
        });
    }

    // Thêm: Xử lý đăng xuất
    function logout() {
        localStorage.removeItem("currentUser");
        window.location.href = "project.html";
    }

    // Thêm: Hiển thị section tương ứng
    function showSection(sectionId) {
        console.log(`showSection called with sectionId: ${sectionId}`);
        document.querySelectorAll('.content').forEach(section => {
            section.style.display = 'none';
        });

        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = 'block';
        } else {
            console.error(`Section with ID ${sectionId} not found`);
        }

        document.querySelectorAll('.sidebar a').forEach(link => {
            link.classList.remove('active');
        });
        const activeLink = document.querySelector(`.sidebar a[id="${sectionId}Link"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        } else {
            console.error(`Link for section ${sectionId} not found`);
        }
    }

    // Thêm: Gắn sự kiện cho sidebar
    const scheduleLink = document.getElementById('scheduleLink');
    const servicesLink = document.getElementById('servicesLink');
    const homeLink = document.getElementById('homeLink');
    const logoutLink = document.getElementById('logoutLink');

    if (scheduleLink) {
        scheduleLink.addEventListener('click', function (e) {
            e.preventDefault();
            showSection('schedule');
        });
    }

    if (servicesLink) {
        servicesLink.addEventListener('click', function (e) {
            e.preventDefault();
            showSection('services');
        });
    }

    if (homeLink) {
        homeLink.addEventListener('click', function (e) {
            e.preventDefault();
            showSection('home');
        });
    }

    if (logoutLink) {
        logoutLink.addEventListener('click', function (e) {
            e.preventDefault();
            logout();
        });
    }

    // Thêm: Mặc định hiển thị section "Quản lý lịch" khi tải trang
    showSection('schedule');

    // Thêm: Khởi tạo và cập nhật biểu đồ
    const ctx = document.getElementById('myChart');
    let chartInstance = null;

    function updateChart() {
        const allBookings = getAllBookings();
        const gymCount = allBookings.filter(booking => booking.class === "Gym").length;
        const yogaCount = allBookings.filter(booking => booking.class === "Yoga").length;
        const zumbaCount = allBookings.filter(booking => booking.class === "Zumba").length;

        if (chartInstance) {
            chartInstance.destroy();
        }

        if (ctx) {
            chartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Gym', 'Yoga', 'Zumba'],
                    datasets: [{
                        label: 'Số lượng lịch tập',
                        data: [gymCount, yogaCount, zumbaCount],
                        borderWidth: 1,
                        backgroundColor: ['#ADC1F6', '#AFDAC2', '#C2B2F6'],
                        borderColor: ['#ADC1F6', '#AFDAC2', '#C2B2F6'],
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: true,
                            position: 'top',
                            labels: {
                                font: {
                                    size: 14
                                }
                            }
                        }
                    }
                }
            });
        } else {
            console.error('Canvas element with ID "myChart" not found');
        }
    }

    // Thêm: Cập nhật số liệu thống kê
    function updateStats() {
        const allBookings = getAllBookings();
        const gymCount = allBookings.filter(booking => booking.class === "Gym").length;
        const yogaCount = allBookings.filter(booking => booking.class === "Yoga").length;
        const zumbaCount = allBookings.filter(booking => booking.class === "Zumba").length;

        const gymStat = document.querySelector('.start-box:nth-child(1) strong');
        const yogaStat = document.querySelector('.start-box:nth-child(2) strong');
        const zumbaStat = document.querySelector('.start-box:nth-child(3) strong');

        if (gymStat && yogaStat && zumbaStat) {
            gymStat.innerText = gymCount;
            yogaStat.innerText = yogaCount;
            zumbaStat.innerText = zumbaCount;
        } else {
            console.error('Stats elements not found');
        }
    }

    // Thêm: Hàm lọc danh sách lịch tập
    function filterBookings() {
        let allBookings = getAllBookings();
        
        const classFilter = document.getElementById('filterClassSelect').value;
        const emailFilter = document.getElementById('emailFilter').value.trim().toLowerCase();
        const dateFilter = document.getElementById('dateFilter').value;

        let filteredBookings = allBookings.filter(booking => {
            const matchesClass = classFilter === "Tất cả" || booking.class === classFilter;
            const matchesEmail = emailFilter === "" || booking.email.toLowerCase().includes(emailFilter);
            const matchesDate = dateFilter === "" || booking.date === dateFilter;
            return matchesClass && matchesEmail && matchesDate;
        });

        displayBookings(filteredBookings);
    }

    // Thêm: Gắn sự kiện cho các trường bộ lọc
    const filterClassSelect = document.getElementById('filterClassSelect');
    const emailFilter = document.getElementById('emailFilter');
    const dateFilter = document.getElementById('dateFilter');

    if (filterClassSelect) {
        filterClassSelect.addEventListener('change', filterBookings);
    }

    if (emailFilter) {
        emailFilter.addEventListener('input', filterBookings);
    }

    if (dateFilter) {
        dateFilter.addEventListener('change', filterBookings);
    }

    // Khởi tạo dữ liệu khi tải trang
    initializeData();
});
let editingRow = null;

function showSection(sectionId) {
    const sections = document.querySelectorAll('.content');
    sections.forEach(section => section.style.display = 'none');
    const target = document.getElementById(sectionId);
    if (target) {
        target.style.display = 'block';
    }
}

// Gắn sự kiện khi trang load
window.addEventListener('DOMContentLoaded', function () {
    showSection('home'); // Mặc định vào trang chủ

    // Gắn lại sự kiện xóa và sửa cho các dòng có sẵn
    const deleteButtons = document.querySelectorAll('#services .btn-danger');
    deleteButtons.forEach(btn => attachDeleteEvent(btn));

    const editButtons = document.querySelectorAll('#services .btn-warning');
    editButtons.forEach(btn => attachEditEvent(btn));
});

function clearErrorMessage() {
    document.getElementById("checkName").innerHTML = "";
    document.getElementById("checkDes").innerHTML = "";
    document.getElementById("checkImg").innerHTML = "";
}

function saveService() {
    const name = document.getElementById('serviceName').value.trim();
    const description = document.getElementById('serviceDescription').value.trim();
    const imageUrl = document.getElementById('serviceImage').value.trim();

    const checkName = document.getElementById("checkName");
    const checkDes = document.getElementById("checkDes");
    const checkImg = document.getElementById("checkImg");

    clearErrorMessage();

    let isValid = true;

    if (name === "") {
        checkName.innerHTML = "Tên dịch vụ không được để trống";
        isValid = false;
    }

    if (description === "") {
        checkDes.innerHTML = "Mô tả dịch vụ không được để trống";
        isValid = false;
    }

    if (imageUrl === "") {
        checkImg.innerHTML = "Link ảnh không được để trống";
        isValid = false;
    }

    if (!isValid) return;

    const tableBody = document.querySelector('#services table tbody');

    if (editingRow) {
        // Cập nhật dòng đang sửa
        editingRow.children[0].textContent = name;
        editingRow.children[1].textContent = description;
        editingRow.children[2].innerHTML = `<img src="${imageUrl}" alt="${name}" style="width: 100px;">`;
        editingRow = null;
    } else {
        // Tạo dòng mới
        const newRow = document.createElement('tr');
        newRow.innerHTML = `
            <td>${name}</td>
            <td>${description}</td>
            <td><img src="${imageUrl}" alt="${name}" style="width: 100px;"></td>
            <td style="text-align: center;">
                <button class="btn btn-warning btn-sm">Sửa</button>
                <button class="btn btn-danger btn-sm">Xóa</button>
            </td>
        `;

        tableBody.appendChild(newRow);

        // Gắn sự kiện cho dòng mới
        const deleteBtn = newRow.querySelector('.btn-danger');
        const editBtn = newRow.querySelector('.btn-warning');
        attachDeleteEvent(deleteBtn);
        attachEditEvent(editBtn);
    }

    // Reset form
    document.getElementById('serviceName').value = "";
    document.getElementById('serviceDescription').value = "";
    document.getElementById('serviceImage').value = "";

    // Ẩn modal
    const modalEl = document.getElementById('addServiceModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();
}

function attachDeleteEvent(button) {
    button.addEventListener('click', function () {
        const row = button.closest('tr');
        Swal.fire({
            title: "Bạn có chắc chắn muốn xóa dịch vụ này?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "YES",
            cancelButtonText: "CANCEL"
        }).then((result) => {
            if (result.isConfirmed) {
                row.remove();
                Swal.fire("Xóa thành công!", "Đã xóa dịch vụ", "success");
            }
        });
    });
}

function attachEditEvent(button) {
    button.addEventListener('click', function () {
        editingRow = button.closest('tr');
        const name = editingRow.children[0].textContent;
        const description = editingRow.children[1].textContent;
        const img = editingRow.children[2].querySelector('img');
        const imageUrl = img ? img.getAttribute('src') : "";

        // Điền dữ liệu cũ vào form
        document.getElementById('serviceName').value = name;
        document.getElementById('serviceDescription').value = description;
        document.getElementById('serviceImage').value = imageUrl;

        // Xóa lỗi cũ nếu có
        clearErrorMessage();

        // Hiện modal
        const modal = new bootstrap.Modal(document.getElementById('addServiceModal'));
        modal.show();
    });
}
