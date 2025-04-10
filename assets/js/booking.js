document.addEventListener("DOMContentLoaded", function () {
  const saveBookingButton = document.getElementById("saveBooking");
  const bookingForm = document.getElementById("bookingForm");
  const tableBody = document.getElementById("bookingTableBody");
  const addBookingButton = document.querySelector(
    '[data-bs-target="#bookingModal"]'
  ); //chọn phần tử đầu tiên
  let editingRow = null;

  // Dữ liệu mẫu ban đầu (dùng khi tài khoản chưa có lịch)
  const initialData = [
    {
      class: "Gym",
      date: "2024-04-05",
      time: "2:00 - 4:00 PM",
      name: "Lê Văn A",
      email: "lea@gmail.com",
    },
  ];

  // Thêm: Lấy thông tin tài khoản đăng nhập từ localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || { name: "", email: "" };
  if (!currentUser.email) {
    // Nếu không có tài khoản đăng nhập, chuyển hướng về trang đăng nhập
    window.location.href = "home1.html";
    return;
  }

  // Thêm: Tạo khóa lưu trữ riêng cho từng tài khoản dựa trên email
  const storageKey = `bookings_${currentUser.email}`;

  // Hàm khởi tạo dữ liệu từ localStorage hoặc sử dụng dữ liệu mẫu
  function initializeData() {
    let bookings = JSON.parse(localStorage.getItem(storageKey));
    if (!bookings || bookings.length === 0) {
      // Nếu tài khoản chưa có lịch, khởi tạo dữ liệu trống
      bookings = [];
      localStorage.setItem(storageKey, JSON.stringify(bookings));
    }
    // Sắp xếp bookings theo tên lớp
    bookings.sort((a, b) => a.class.localeCompare(b.class));
    displayBookings(bookings);
  }

  // Hàm hiển thị danh sách lịch tập
  function displayBookings(bookings) {
    tableBody.innerHTML = "";
    bookings.forEach((booking, index) => {
      const row = document.createElement("tr");
      row.setAttribute("data-index", index);
      row.innerHTML = `
                        <td>${booking.class}</td>
                        <td>${booking.date}</td>
                        <td>${booking.time}</td>
                        <td>${booking.name}</td>
                        <td>${booking.email}</td>
                        <td>
                            <a href="#" class="text-primary edit-btn">Sửa</a>  
                            <a href="#" class="text-danger delete-btn">Xóa</a>
                        </td>
                    `;
      tableBody.appendChild(row);
      addRowEventListeners(row);
    });
  }

  // Kiểm tra trùng lịch (chỉ kiểm tra lịch của tài khoản hiện tại)
  function isDuplicateBooking(newBooking) {
    let bookings = JSON.parse(localStorage.getItem(storageKey)) || [];
    return bookings.some(
      (booking) =>
        booking.class === newBooking.class &&
        booking.date === newBooking.date &&
        booking.time === newBooking.time
    );
  }

  // Hàm lưu dữ liệu vào localStorage (riêng cho tài khoản hiện tại)
  function saveToLocalStorage(booking) {
    let bookings = JSON.parse(localStorage.getItem(storageKey)) || [];
    if (editingRow) {
      const index = editingRow.getAttribute("data-index");
      bookings[index] = booking;
    } else {
      if (isDuplicateBooking(booking)) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Your schedule is duplicated!"
        });
        return;
      }
      bookings.push(booking);
    }
    // Sắp xếp bookings theo tên lớp
    bookings.sort((a, b) => a.class.localeCompare(b.class));
    localStorage.setItem(storageKey, JSON.stringify(bookings));
    displayBookings(bookings);
  }

  // Khi nhấn "Đặt lịch mới", reset form, điền thông tin tài khoản, và xóa thông báo lỗi
  addBookingButton.addEventListener("click", function () {
    bookingForm.reset();
    clearErrorMessages();
    editingRow = null;
    // Điền thông tin tài khoản đăng nhập
    document.getElementById("nameInput").value = currentUser.name || "";
    document.getElementById("emailInput").value = currentUser.email || "";
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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; //biểu thức chính quy kiểm tra định dạng email
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
          let bookings = JSON.parse(localStorage.getItem(storageKey));
          const index = row.getAttribute("data-index");
          bookings.splice(index, 1);
          localStorage.setItem(storageKey, JSON.stringify(bookings));
          displayBookings(bookings);

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
      document.getElementById("classSelect").value = cells[0].innerText; //cells: ô trong hàng
      document.getElementById("dateInput").value = cells[1].innerText;
      document.getElementById("timeSelect").value = cells[2].innerText;
      // Giữ nguyên giá trị name và email của tài khoản hiện tại
      document.getElementById("nameInput").value = currentUser.name || cells[3].innerText;
      document.getElementById("emailInput").value = currentUser.email || cells[4].innerText;
      clearErrorMessages();
      const modal = new bootstrap.Modal(
        document.getElementById("bookingModal")
      );
      modal.show();
      editingRow = row;
    });
  }

  // Khởi tạo dữ liệu khi tải trang
  initializeData();
});