// ==========================================
// TIỆM TẠP HÓA - FRONTEND JAVASCRIPT
// ==========================================

let allProducts = [];
let cart = JSON.parse(localStorage.getItem('taphoa_cart') || '[]');
let currentCategoryId = 0;
let currentUser = JSON.parse(localStorage.getItem('taphoa_user') || 'null');
let appliedVoucher = null;
let appliedDiscount = 0;

// Format tiền tệ VNĐ
function formatMoney(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Khởi chạy khi tải trang
document.addEventListener('DOMContentLoaded', () => {
    renderUserNavbar();
    if (document.getElementById('productList')) {
        loadCategories();
        loadProducts();
        updateCartBadge();
        renderCart();
    }
});

// Render trạng thái đăng nhập trên Navbar
function renderUserNavbar() {
    const container = document.getElementById('userAuthContainer');
    if (!container) return;

    if (currentUser) {
        const isAdmin = currentUser.role === 'ADMIN';
        container.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-sm btn-outline-success rounded-pill px-3 dropdown-toggle fw-bold" type="button" data-bs-toggle="dropdown">
                    <i class="bi bi-person-check-fill text-success me-1"></i> ${currentUser.fullName || currentUser.username}
                </button>
                <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                    <li><h6 class="dropdown-header">Tài khoản: ${currentUser.username} (${isAdmin ? 'Chủ tiệm' : 'Khách hàng'})</h6></li>
                    ${isAdmin ? '<li><a class="dropdown-item text-danger fw-bold" href="/admin.html"><i class="bi bi-shield-lock me-2"></i>Trang Quản Trị</a></li>' : ''}
                    <li><button class="dropdown-item" onclick="openProfileModal()"><i class="bi bi-person-lines-fill me-2"></i>Hồ sơ & Sổ địa chỉ</button></li>
                    <li><button class="dropdown-item" onclick="openMyOrdersModal()"><i class="bi bi-bag-check me-2"></i>Đơn hàng của tôi</button></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><button class="dropdown-item text-danger" onclick="handleLogout()"><i class="bi bi-box-arrow-right me-2"></i>Đăng xuất</button></li>
                </ul>
            </div>
            ${isAdmin ? '<a href="/admin.html" class="btn btn-outline-danger btn-sm rounded-pill px-3 ms-1 fw-bold"><i class="bi bi-shield-lock me-1"></i>Admin</a>' : ''}
        `;
    } else {
        container.innerHTML = `
            <button class="btn btn-outline-success btn-sm rounded-pill px-3" data-bs-toggle="modal" data-bs-target="#authModal">
                <i class="bi bi-person-circle me-1"></i> Đăng Nhập / Đăng Ký
            </button>
        `;
    }
}

// Đăng nhập nhanh 1-chạm (Admin hoặc Khách hàng)
async function quickLogin(username, password) {
    const uInp = document.getElementById('loginUsername');
    const pInp = document.getElementById('loginPassword');
    if (uInp) uInp.value = username;
    if (pInp) pInp.value = password;
    const fakeEvent = { preventDefault: () => {} };
    await handleLogin(fakeEvent);
}

// Kiểm tra mật khẩu trực quan theo thời gian thực (Form Đăng Ký)
function checkPasswordStrength(pwd) {
    const hasLen = pwd.length >= 6;
    const hasLet = /[a-zA-Z]/.test(pwd);
    const hasDig = /[0-9]/.test(pwd);
    const hasSpc = /[^a-zA-Z0-9]/.test(pwd);

    const updateBadge = (id, ok) => {
        const el = document.getElementById(id);
        if (!el) return;
        const label = el.getAttribute('data-label') || '';
        if (ok) {
            el.className = 'badge bg-success';
            el.innerHTML = `<i class="bi bi-check-circle-fill me-1"></i>${label}`;
        } else {
            el.className = 'badge bg-secondary';
            el.innerHTML = `<i class="bi bi-circle me-1"></i>${label}`;
        }
    };
    updateBadge('chkLength', hasLen);
    updateBadge('chkLetter', hasLet);
    updateBadge('chkNumber', hasDig);
    updateBadge('chkSpecial', hasSpc);
}

// Kiểm tra mật khẩu (Form Quên Mật Khẩu)
function checkForgotPassStrength(pwd) {
    const hasLen = pwd.length >= 6;
    const hasLet = /[a-zA-Z]/.test(pwd);
    const hasDig = /[0-9]/.test(pwd);
    const hasSpc = /[^a-zA-Z0-9]/.test(pwd);

    const updateBadge = (id, ok) => {
        const el = document.getElementById(id);
        if (!el) return;
        const label = el.getAttribute('data-label') || '';
        if (ok) {
            el.className = 'badge bg-success';
            el.innerHTML = `<i class="bi bi-check-circle-fill me-1"></i>${label}`;
        } else {
            el.className = 'badge bg-secondary';
            el.innerHTML = `<i class="bi bi-circle me-1"></i>${label}`;
        }
    };
    updateBadge('fChkLength', hasLen);
    updateBadge('fChkLetter', hasLet);
    updateBadge('fChkNumber', hasDig);
    updateBadge('fChkSpecial', hasSpc);
}

// Chuyển sang màn hình Quên Mật Khẩu
function openForgotPasswordPane() {
    document.querySelectorAll('#authTabs .nav-link').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('#authTabsContent .tab-pane').forEach(pane => {
        pane.classList.remove('show', 'active');
    });
    const forgotPane = document.getElementById('forgotPane');
    if (forgotPane) forgotPane.classList.add('show', 'active');
    resetForgotForm();
}

// Quay lại màn hình Đăng Nhập
function showLoginTab() {
    document.querySelectorAll('#authTabsContent .tab-pane').forEach(pane => {
        pane.classList.remove('show', 'active');
    });
    const loginPane = document.getElementById('loginPane');
    if (loginPane) loginPane.classList.add('show', 'active');

    document.querySelectorAll('#authTabs .nav-link').forEach(btn => btn.classList.remove('active'));
    const tabLogin = document.getElementById('tab-login');
    if (tabLogin) tabLogin.classList.add('active');
}

// Reset form quên mật khẩu về Bước 1
function resetForgotForm() {
    const step1 = document.getElementById('forgotStep1');
    const step2 = document.getElementById('forgotStep2');
    if (step1) step1.classList.remove('d-none');
    if (step2) step2.classList.add('d-none');
    const otpInp = document.getElementById('forgotOtp');
    const newPass = document.getElementById('forgotNewPassword');
    const confPass = document.getElementById('forgotConfirmPassword');
    if (otpInp) otpInp.value = '';
    if (newPass) newPass.value = '';
    if (confPass) confPass.value = '';
}

// Xử lý gửi mã OTP khôi phục về Gmail
async function handleSendResetOtp(e) {
    if (e && e.preventDefault) e.preventDefault();
    const emailInput = document.getElementById('forgotEmail');
    const email = emailInput ? emailInput.value.trim() : '';

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        Swal.fire('Email không hợp lệ', 'Vui lòng nhập đúng định dạng Gmail (ví dụ: yourname@gmail.com)!', 'warning');
        return;
    }

    const btn = document.getElementById('btnSendOtp');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Đang gửi mã...';
    }

    try {
        const res = await fetch('/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const result = await res.json();

        if (result.success) {
            document.getElementById('forgotSentEmailText').innerText = email;
            document.getElementById('forgotStep1').classList.add('d-none');
            document.getElementById('forgotStep2').classList.remove('d-none');

            // Tự động điền mã OTP vào ô nếu có phản hồi để trải nghiệm mượt mà
            if (result.otp) {
                const otpInp = document.getElementById('forgotOtp');
                if (otpInp) otpInp.value = result.otp;
            }

            Swal.fire({
                icon: 'success',
                title: '📧 Đã gửi mã về Gmail!',
                html: `Hệ thống đã gửi mã xác nhận 6 số đến: <b>${email}</b><br><br>` +
                      `<div class="alert alert-info py-2 mb-0 font-monospace">Mã OTP của bạn: <b class="fs-5 text-danger">${result.otp || '123456'}</b></div>` +
                      `<small class="text-muted mt-2 d-block">Mã xác nhận có hiệu lực trong 15 phút.</small>`,
                confirmButtonColor: '#198754'
            });
        } else {
            Swal.fire('Không tìm thấy tài khoản', result.message || 'Không có tài khoản nào đăng ký với Gmail này!', 'error');
        }
    } catch (err) {
        console.error(err);
        Swal.fire('Lỗi', 'Không thể kết nối đến máy chủ!', 'error');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<i class="bi bi-send-fill me-1"></i> Gửi Mã Xác Nhận Về Gmail';
        }
    }
}

// Xử lý xác nhận đổi mật khẩu mới
async function handleResetPassword(e) {
    if (e && e.preventDefault) e.preventDefault();
    const email = document.getElementById('forgotEmail') ? document.getElementById('forgotEmail').value.trim() : '';
    const otp = document.getElementById('forgotOtp') ? document.getElementById('forgotOtp').value.trim() : '';
    const newPassword = document.getElementById('forgotNewPassword') ? document.getElementById('forgotNewPassword').value.trim() : '';
    const confirmPassword = document.getElementById('forgotConfirmPassword') ? document.getElementById('forgotConfirmPassword').value.trim() : '';

    if (!otp || otp.length < 6) {
        Swal.fire('Chú ý', 'Vui lòng nhập đầy đủ mã OTP 6 chữ số!', 'warning');
        return;
    }

    // Kiểm tra mật khẩu có chữ, số, ký tự đặc biệt
    const hasLen = newPassword.length >= 6;
    const hasLet = /[a-zA-Z]/.test(newPassword);
    const hasDig = /[0-9]/.test(newPassword);
    const hasSpc = /[^a-zA-Z0-9]/.test(newPassword);

    if (!hasLen || !hasLet || !hasDig || !hasSpc) {
        Swal.fire({
            icon: 'warning',
            title: 'Mật khẩu mới chưa đủ mạnh!',
            html: 'Mật khẩu phải từ <b>6 ký tự trở lên</b> và chứa đầy đủ:<br>' +
                  '• <b>Chữ cái</b> (a-z, A-Z)<br>' +
                  '• <b>Chữ số</b> (0-9)<br>' +
                  '• <b>Ký tự đặc biệt</b> (@, #, $, !, %, *, ?, &, ...)<br><br>' +
                  '<i>Ví dụ gợi ý: MatKhau@123</i>'
        });
        return;
    }

    if (newPassword !== confirmPassword) {
        Swal.fire('Lỗi xác nhận', 'Mật khẩu mới và mật khẩu nhập lại không khớp nhau!', 'warning');
        return;
    }

    try {
        const res = await fetch('/api/auth/reset-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp, newPassword })
        });
        const result = await res.json();

        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: '🎉 Đổi mật khẩu thành công!',
                text: 'Bạn có thể đăng nhập ngay với mật khẩu mới vừa đặt.',
                confirmButtonColor: '#198754'
            }).then(() => {
                showLoginTab();
                const loginUserInp = document.getElementById('loginUsername');
                const loginPassInp = document.getElementById('loginPassword');
                if (loginUserInp) loginUserInp.value = email;
                if (loginPassInp) loginPassInp.value = newPassword;
            });
        } else {
            Swal.fire('Lỗi đổi mật khẩu', result.message || 'Mã OTP không đúng hoặc đã hết hạn!', 'error');
        }
    } catch (err) {
        console.error(err);
        Swal.fire('Lỗi', 'Không thể kết nối đến máy chủ!', 'error');
    }
}

// Xử lý Đăng Nhập
async function handleLogin(e) {
    if (e && e.preventDefault) e.preventDefault();
    const uInput = document.getElementById('loginUsername');
    const pInput = document.getElementById('loginPassword');
    const username = uInput ? uInput.value.trim() : '';
    const password = pInput ? pInput.value.trim() : '';

    if (!username || !password) {
        Swal.fire('Chú ý', 'Vui lòng nhập tên đăng nhập (hoặc Gmail) và mật khẩu!', 'warning');
        return;
    }

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const result = await res.json();

        if (result.success) {
            currentUser = result.user;
            localStorage.setItem('taphoa_user', JSON.stringify(currentUser));

            // Đóng modal chắc chắn và dọn dẹp backdrop
            const modalEl = document.getElementById('authModal');
            if (modalEl) {
                const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
                if (modal) modal.hide();
                setTimeout(() => {
                    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
                    document.body.classList.remove('modal-open');
                    document.body.style = '';
                }, 300);
            }

            renderUserNavbar();

            if (currentUser && currentUser.role === 'ADMIN') {
                Swal.fire({
                    icon: 'success',
                    title: 'Đăng nhập ADMIN thành công!',
                    html: `<b>Chào mừng ${currentUser.fullName}!</b><br>Tài khoản Quản Trị Cửa Hàng đã được xác thực.<br><br>Bạn có muốn chuyển sang <b>Trang Quản Trị (Admin Dashboard)</b> ngay bây giờ không?`,
                    showCancelButton: true,
                    confirmButtonColor: '#198754',
                    cancelButtonColor: '#6c757d',
                    confirmButtonText: '<i class="bi bi-shield-lock me-1"></i> Đến Trang Quản Trị',
                    cancelButtonText: '<i class="bi bi-shop me-1"></i> Ở lại trang bán hàng'
                }).then((r) => {
                    if (r.isConfirmed) {
                        window.location.href = '/admin.html';
                    }
                });
            } else {
                Swal.fire({
                    icon: 'success',
                    title: 'Đăng nhập thành công!',
                    text: `Chào mừng ${currentUser.fullName} đến với Tiệm Tạp Hóa!`,
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        } else {
            Swal.fire('Lỗi đăng nhập', result.message || 'Sai tên đăng nhập/email hoặc mật khẩu!', 'error');
        }
    } catch (err) {
        console.error(err);
        Swal.fire('Lỗi kết nối', 'Không thể kết nối đến máy chủ! Vui lòng kiểm tra lại server.', 'error');
    }
}

// Xử lý Đăng Ký
async function handleRegister(e) {
    e.preventDefault();
    const fullName = document.getElementById('regFullName').value.trim();
    const email = document.getElementById('regEmail') ? document.getElementById('regEmail').value.trim() : '';
    const username = document.getElementById('regUsername').value.trim();
    const password = document.getElementById('regPassword').value.trim();
    const phone = document.getElementById('regPhone').value.trim();
    const address = document.getElementById('regAddress').value.trim();

    // 1. Kiểm tra Email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        Swal.fire('Email không hợp lệ', 'Vui lòng nhập đúng định dạng Gmail (ví dụ: yourname@gmail.com)!', 'warning');
        return;
    }

    // 2. Kiểm tra Mật khẩu bắt buộc: Chữ + Số + Ký tự đặc biệt, tối thiểu 6 ký tự
    const hasLen = password.length >= 6;
    const hasLet = /[a-zA-Z]/.test(password);
    const hasDig = /[0-9]/.test(password);
    const hasSpc = /[^a-zA-Z0-9]/.test(password);

    if (!hasLen || !hasLet || !hasDig || !hasSpc) {
        Swal.fire({
            icon: 'warning',
            title: 'Mật khẩu chưa đủ điều kiện bảo mật!',
            html: 'Để đảm bảo an toàn cho tài khoản, mật khẩu bắt buộc phải gồm:<br>' +
                  '• <b>Tối thiểu 6 ký tự</b><br>' +
                  '• <b>Chữ cái</b> (a-z, A-Z)<br>' +
                  '• <b>Chữ số</b> (0-9)<br>' +
                  '• <b>Ký tự đặc biệt</b> (@, #, $, !, %, *, ?, &, ...)<br><br>' +
                  '<i>Ví dụ hợp lệ: MatKhau@123, Nam@2026</i>'
        });
        return;
    }

    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fullName, username, password, email, phone, address })
        });
        const result = await res.json();

        if (result.success) {
            currentUser = result.user;
            localStorage.setItem('taphoa_user', JSON.stringify(currentUser));

            const modalEl = document.getElementById('authModal');
            if (modalEl) {
                const modal = bootstrap.Modal.getOrCreateInstance(modalEl);
                if (modal) modal.hide();
                setTimeout(() => {
                    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
                    document.body.classList.remove('modal-open');
                    document.body.style = '';
                }, 300);
            }

            renderUserNavbar();

            Swal.fire({
                icon: 'success',
                title: '🎉 Đăng ký thành công!',
                html: `Chào mừng <b>${currentUser.fullName}</b> đã trở thành thành viên!<br>Email đăng ký: <b>${currentUser.email || email}</b>`,
                timer: 3000
            });
        } else {
            Swal.fire('Lỗi đăng ký', result.message || 'Không thể tạo tài khoản!', 'error');
        }
    } catch (err) {
        console.error(err);
        Swal.fire('Lỗi', 'Không thể kết nối đến máy chủ!', 'error');
    }
}

// Đăng Xuất
function handleLogout() {
    currentUser = null;
    localStorage.removeItem('taphoa_user');
    renderUserNavbar();
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: 'Đã đăng xuất',
        showConfirmButton: false,
        timer: 1500
    });
}

// Quản lý Hồ sơ & Sổ địa chỉ
function openProfileModal() {
    if (!currentUser) return;
    document.getElementById('profFullName').value = currentUser.fullName || '';
    document.getElementById('profPhone').value = currentUser.phone || '';
    document.getElementById('profAddress').value = currentUser.address || '';
    document.getElementById('profRankBadge').innerText = currentUser.rank || 'Đồng';
    document.getElementById('profPointsDisplay').innerText = (currentUser.points || 0) + ' điểm';

    const modalEl = document.getElementById('profileModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

async function saveUserProfile(e) {
    e.preventDefault();
    if (!currentUser) return;
    const fullName = document.getElementById('profFullName').value.trim();
    const phone = document.getElementById('profPhone').value.trim();
    const address = document.getElementById('profAddress').value.trim();

    try {
        const res = await fetch('/api/users', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: currentUser.id, fullName, phone, address })
        });
        const result = await res.json();
        if (result.success) {
            currentUser.fullName = fullName;
            currentUser.phone = phone;
            currentUser.address = address;
            localStorage.setItem('taphoa_user', JSON.stringify(currentUser));
            renderUserNavbar();

            const modalEl = document.getElementById('profileModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();

            Swal.fire('Thành công', 'Đã cập nhật hồ sơ & sổ địa chỉ nhận hàng!', 'success');
        }
    } catch (err) {
        console.error(err);
    }
}

// Đánh giá sản phẩm
function openReviewModal(productId, productName, orderId) {
    document.getElementById('revProductId').value = productId;
    document.getElementById('revProductName').innerText = productName;
    document.getElementById('revOrderId').value = orderId;
    document.getElementById('revComment').value = '';
    setRating(5);

    const modalEl = document.getElementById('reviewModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

function setRating(rating) {
    document.getElementById('revRating').value = rating;
    const stars = document.querySelectorAll('#starContainer .star');
    stars.forEach((s, idx) => {
        if (idx < rating) {
            s.classList.add('selected');
        } else {
            s.classList.remove('selected');
        }
    });
}

async function submitReview(e) {
    e.preventDefault();
    if (!currentUser) return;
    const data = {
        productId: document.getElementById('revProductId').value,
        userId: currentUser.id,
        userName: currentUser.fullName || currentUser.username,
        orderId: document.getElementById('revOrderId').value,
        rating: document.getElementById('revRating').value,
        comment: document.getElementById('revComment').value.trim()
    };

    try {
        const res = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (result.success) {
            const modalEl = document.getElementById('reviewModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();

            Swal.fire('Cảm ơn bạn!', 'Đánh giá chất lượng món hàng của bạn đã được ghi nhận.', 'success');
        }
    } catch (err) {
        console.error(err);
    }
}

// Xem Đơn Hàng Của Tôi & Theo dõi thời gian thực (Stepper)
async function openMyOrdersModal() {
    if (!currentUser) return;

    const modalEl = document.getElementById('myOrdersModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    const container = document.getElementById('myOrdersContent');
    container.innerHTML = '<p class="text-center text-muted py-4">Đang tải lịch sử mua hàng...</p>';

    try {
        const res = await fetch(`/api/user/orders?userId=${currentUser.id}`);
        const orders = await res.json();
        myOrdersCache = orders;

        if (orders.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5 text-muted">
                    <i class="bi bi-bag-x fs-1"></i>
                    <p class="mt-2">Bạn chưa có đơn đặt hàng nào!</p>
                </div>`;
            return;
        }

        container.innerHTML = orders.map(o => {
            // Xác định bước tiến trình (Stepper 4 bước)
            let step = 1;
            if (o.status === 'Đang đóng gói') step = 2;
            else if (o.status === 'Đang giao' || o.status === 'Đang giao hàng') step = 3;
            else if (o.status === 'Hoàn thành' || o.status === 'Đã hoàn thành' || o.status === 'Đã xong') step = 4;
            else if (o.status === 'Đã hủy') step = 0;

            const isDone = step === 4;

            const itemsHtml = o.items.map(it => `
                <div class="d-flex justify-content-between align-items-center small py-1 border-bottom">
                    <span>${it.productName} <strong>x${it.quantity} ${it.unit}</strong></span>
                    <div>
                        <span class="text-success fw-bold me-2">${formatMoney(it.totalPrice)}</span>
                        ${isDone ? `<button class="btn btn-xs btn-outline-warning text-dark py-0 px-2" style="font-size: 0.75rem;" onclick="openReviewModal(${it.productId}, '${it.productName.replace(/'/g, "\\'")}', ${o.id})">⭐ Đánh giá</button>` : ''}
                    </div>
                </div>
            `).join('');

            const statusBadge = isDone ? 'bg-success' : (step === 3 ? 'bg-primary' : (step === 2 ? 'bg-info text-dark' : (step === 0 ? 'bg-secondary' : 'bg-warning text-dark')));

            return `
                <div class="card mb-3 shadow-sm border rounded-3 bg-white">
                    <div class="card-body p-3">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <span class="fw-bold text-primary fs-6">Đơn hàng #${o.id}</span>
                                <small class="text-muted ms-2">${o.orderDate || ''}</small>
                            </div>
                            <span class="badge ${statusBadge} px-2 py-1">${o.status}</span>
                        </div>

                        <!-- Stepper tiến trình theo dõi thời gian thực -->
                        ${step > 0 ? `
                        <div class="stepper-wrapper mb-3">
                            <div class="stepper-item ${step >= 1 ? (step === 1 ? 'active' : 'completed') : ''}">
                                <div class="stepper-circle">1</div>
                                <div class="stepper-title">Chờ xác nhận</div>
                            </div>
                            <div class="stepper-item ${step >= 2 ? (step === 2 ? 'active' : 'completed') : ''}">
                                <div class="stepper-circle">2</div>
                                <div class="stepper-title">Đang đóng gói</div>
                            </div>
                            <div class="stepper-item ${step >= 3 ? (step === 3 ? 'active' : 'completed') : ''}">
                                <div class="stepper-circle">3</div>
                                <div class="stepper-title">Đang giao hàng</div>
                            </div>
                            <div class="stepper-item ${step >= 4 ? 'completed' : ''}">
                                <div class="stepper-circle">4</div>
                                <div class="stepper-title">Hoàn thành</div>
                            </div>
                        </div>` : '<div class="alert alert-secondary py-1 text-center small mb-3">Đơn hàng này đã bị hủy.</div>'}

                        <div class="mb-2 bg-light p-2 rounded">
                            ${itemsHtml}
                        </div>
                        <div class="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                            <div>
                                <small class="text-muted d-block"><i class="bi bi-geo-alt"></i> ${o.address} (${o.paymentMethod})</small>
                                <button class="btn btn-sm btn-outline-success py-0 px-2 mt-1" style="font-size: 0.75rem;" onclick="viewMyOrderInvoice(${o.id})">
                                    <i class="bi bi-receipt me-1"></i> Xem Hóa Đơn
                                </button>
                            </div>
                            <span class="fw-bold fs-6 text-danger">Tổng: ${formatMoney(o.totalAmount)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

    } catch (err) {
        console.error(err);
        container.innerHTML = '<p class="text-center text-danger py-4">Lỗi khi tải đơn hàng!</p>';
    }
}

// 1. Tải danh mục
async function loadCategories() {
    try {
        const res = await fetch('/api/categories');
        const categories = await res.json();
        const container = document.getElementById('categoryContainer');
        if (!container) return;

        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'category-btn';
            btn.innerHTML = `${cat.icon} ${cat.name}`;
            btn.onclick = () => filterByCategory(cat.id, btn);
            container.appendChild(btn);
        });
    } catch (err) {
        console.error("Lỗi tải danh mục:", err);
    }
}

// 2. Tải sản phẩm
async function loadProducts(keyword = '', categoryId = 0) {
    try {
        const price = document.getElementById('priceFilter') ? document.getElementById('priceFilter').value : '';
        const sort = document.getElementById('sortBy') ? document.getElementById('sortBy').value : '';
        const url = `/api/products?keyword=${encodeURIComponent(keyword)}&category=${categoryId}&price=${encodeURIComponent(price)}&sort=${encodeURIComponent(sort)}`;
        const res = await fetch(url);
        allProducts = await res.json();
        renderProducts(allProducts);
    } catch (err) {
        console.error("Lỗi tải sản phẩm:", err);
    }
}

function applyFilters() {
    const kw = document.getElementById('searchInput') ? document.getElementById('searchInput').value : '';
    loadProducts(kw, currentCategoryId);
}

// 3. Hiển thị danh sách sản phẩm
function renderProducts(products) {
    const container = document.getElementById('productList');
    const countText = document.getElementById('productCountText');
    if (!container) return;

    countText.innerText = `Tìm thấy ${products.length} mặt hàng`;

    if (products.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="fs-1 text-muted">🔍</div>
                <h5 class="text-muted mt-2">Không tìm thấy món hàng nào phù hợp!</h5>
            </div>`;
        return;
    }

    container.innerHTML = products.map(p => {
        const isUrl = p.image && (p.image.startsWith('http://') || p.image.startsWith('https://') || p.image.startsWith('/'));
        const imgHtml = isUrl 
            ? `<img src="${p.image}" class="product-real-img" alt="${p.name}" onerror="this.onerror=null;this.parentElement.innerHTML='🛒';">`
            : `<span class="product-fallback-icon">${p.image || '🛒'}</span>`;

        return `
            <div class="col">
                <div class="product-card">
                    <div class="product-image-container cursor-pointer" onclick="openProductDetailModal(${p.id})">
                        ${imgHtml}
                    </div>
                    <div class="product-body">
                        <span class="product-unit">${p.unit}</span>
                        <h6 class="product-title cursor-pointer" title="${p.name}" onclick="openProductDetailModal(${p.id})">${p.name}</h6>
                        <div class="d-flex justify-content-between align-items-baseline mb-1">
                            <span class="product-price">${formatMoney(p.price)}</span>
                            <small class="text-muted">Còn: ${p.stock}</small>
                        </div>
                        <div class="d-flex justify-content-between align-items-center mb-1 small">
                            <span class="text-muted font-monospace" style="font-size: 0.72rem;"><i class="bi bi-upc me-1 text-success"></i>${p.barcode || ('89300000000' + p.id)}</span>
                            <button class="btn btn-sm btn-link p-0 text-success fw-bold text-decoration-none" style="font-size: 0.72rem;" onclick="event.stopPropagation(); showBarcodeViewerModal('${p.barcode || ('89300000000' + p.id)}', '${p.name.replace(/'/g, "\\'")}', ${p.price})" title="Xem mã vạch để quét bằng điện thoại">
                                <i class="bi bi-upc-scan"></i> Xem mã
                            </button>
                        </div>
                        <div class="product-expiry">
                            <i class="bi bi-calendar-check me-1"></i>HSD: ${p.expiryDate || 'Mới sản xuất'}
                        </div>
                        <div class="d-flex gap-1 mt-auto">
                            <button class="btn btn-outline-secondary btn-sm" onclick="openProductDetailModal(${p.id})" title="Xem chi tiết">
                                <i class="bi bi-eye"></i>
                            </button>
                            <button class="btn btn-add-cart" onclick="addToCart(${p.id})">
                                <i class="bi bi-cart-plus me-1"></i> Chọn mua
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 4. Lọc & Tìm kiếm
function filterByCategory(catId, btnElement) {
    currentCategoryId = catId;
    document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');
    const kw = document.getElementById('searchInput') ? document.getElementById('searchInput').value : '';
    loadProducts(kw, catId);
}

function performSearch() {
    const kw = document.getElementById('searchInput').value;
    loadProducts(kw, currentCategoryId);
}

if (document.getElementById('searchInput')) {
    document.getElementById('searchInput').addEventListener('keyup', (e) => {
        if (e.key === 'Enter') performSearch();
    });
}

// 4.1. Mở Modal Xem Chi Tiết Mặt Hàng
async function openProductDetailModal(productId) {
    const p = allProducts.find(item => item.id === productId);
    if (!p) return;

    document.getElementById('detailName').innerText = p.name;
    document.getElementById('detailPrice').innerText = formatMoney(p.price);
    document.getElementById('detailStock').innerText = `Còn: ${p.stock} ${p.unit}`;
    document.getElementById('detailCategory').innerText = p.categoryName || 'Tạp hóa';
    document.getElementById('detailUnit').innerText = p.unit;
    document.getElementById('detailExpiry').innerText = p.expiryDate || 'Mới sản xuất';
    document.getElementById('detailDesc').innerText = p.description || 'Sản phẩm chất lượng cao, an toàn cho cả gia đình.';

    const imgEl = document.getElementById('detailImg');
    const isUrl = p.image && (p.image.startsWith('http://') || p.image.startsWith('https://') || p.image.startsWith('/'));
    if (isUrl) {
        imgEl.src = p.image;
        imgEl.style.display = 'block';
    } else {
        imgEl.style.display = 'none';
    }

    const btnAdd = document.getElementById('detailBtnAddToCart');
    btnAdd.onclick = () => {
        addToCart(p.id);
        const modalEl = document.getElementById('productDetailModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
    };

    // Tải đánh giá thực tế của món hàng này
    const revContainer = document.getElementById('detailReviewsContainer');
    revContainer.innerHTML = '<em>Đang tải đánh giá...</em>';
    try {
        const res = await fetch(`/api/reviews?productId=${p.id}`);
        const reviews = await res.json();
        if (reviews.length === 0) {
            revContainer.innerHTML = '<em>Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên mua và đánh giá!</em>';
        } else {
            revContainer.innerHTML = reviews.map(r => `
                <div class="border-bottom py-2">
                    <div class="d-flex justify-content-between">
                        <strong>${r.userName}</strong>
                        <span class="text-warning">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
                    </div>
                    <p class="mb-0 text-dark">${r.comment}</p>
                    <small class="text-muted" style="font-size: 0.75rem;">${r.createdAt}</small>
                </div>
            `).join('');
        }
    } catch (err) {
        revContainer.innerHTML = '<em>Chưa có đánh giá.</em>';
    }

    const modalEl = document.getElementById('productDetailModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

// 5. Quản lý Giỏ Hàng
function saveCart() {
    localStorage.setItem('taphoa_cart', JSON.stringify(cart));
    updateCartBadge();
    renderCart();
}

function updateCartBadge() {
    const badge = document.getElementById('cartCountBadge');
    if (!badge) return;
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.innerText = totalQty;
}

function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    const existing = cart.find(item => item.productId === productId);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            productId: product.id,
            name: product.name,
            unit: product.unit,
            price: product.price,
            quantity: 1
        });
    }

    saveCart();

    // Thông báo nhanh
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `Đã thêm "${product.name}" vào giỏ`,
        showConfirmButton: false,
        timer: 1500
    });
}

function changeQty(productId, delta) {
    const item = cart.find(i => i.productId === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
        cart = cart.filter(i => i.productId !== productId);
    }
    saveCart();
}

function removeFromCart(productId) {
    cart = cart.filter(i => i.productId !== productId);
    saveCart();
}

async function applyVoucherCode() {
    const input = document.getElementById('voucherCodeInput');
    const msg = document.getElementById('voucherMessage');
    if (!input || !msg) return;
    const code = input.value.trim().toUpperCase();
    if (!code) {
        msg.innerHTML = '<span class="text-danger">Vui lòng nhập mã giảm giá!</span>';
        return;
    }

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    try {
        const res = await fetch('/api/vouchers/apply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code, subtotal: subtotal })
        });
        const result = await res.json();
        if (result.valid) {
            appliedVoucher = result.code;
            appliedDiscount = result.discount;
            msg.innerHTML = `<span class="text-success"><i class="bi bi-check-circle me-1"></i>Áp dụng thành công mã <strong>${result.code}</strong> (${result.desc})</span>`;
            renderCart();
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: `Đã giảm ${formatMoney(appliedDiscount)}`,
                showConfirmButton: false,
                timer: 1500
            });
        } else {
            appliedVoucher = null;
            appliedDiscount = 0;
            msg.innerHTML = `<span class="text-danger"><i class="bi bi-x-circle me-1"></i>${result.message}</span>`;
            renderCart();
        }
    } catch (err) {
        console.error(err);
    }
}

// Cập nhật mã VietQR động khi khách chọn thanh toán Chuyển khoản / QR
function updatePaymentQrCode() {
    const paymentEl = document.getElementById('custPayment');
    const box = document.getElementById('bankQrBox');
    if (!box || !paymentEl) return;

    const method = paymentEl.value;
    if (method.includes('Chuyển khoản') || method.includes('MoMo') || method.includes('ZaloPay')) {
        let subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        let shipping = subtotal >= 150000 || subtotal === 0 ? 0 : 15000;
        let discount = appliedDiscount;
        let total = Math.max(0, subtotal - discount + shipping);

        const phone = document.getElementById('custPhone') ? document.getElementById('custPhone').value.trim() : '';
        const note = phone ? `TAPHOA ${phone.slice(-4)}` : `TAPHOA ${Math.floor(1000 + Math.random() * 9000)}`;

        const amtEl = document.getElementById('qrCheckoutAmount');
        const noteEl = document.getElementById('qrCheckoutNote');
        const imgEl = document.getElementById('checkoutQrImage');

        if (amtEl) amtEl.innerText = formatMoney(total);
        if (noteEl) noteEl.innerText = note;

        if (imgEl) {
            imgEl.src = `https://img.vietqr.io/image/MB-0900000001-compact2.png?amount=${total}&addInfo=${encodeURIComponent(note)}&accountName=TIEM%20TAP%20HOA`;
        }

        box.classList.remove('d-none');
    } else {
        box.classList.add('d-none');
    }
}

function renderCart() {
    const tbody = document.getElementById('cartTableBody');
    const emptyView = document.getElementById('emptyCartView');
    const contentView = document.getElementById('cartContentView');
    const totalDisplay = document.getElementById('cartTotalDisplay');

    if (!tbody) return;

    if (cart.length === 0) {
        emptyView.classList.remove('d-none');
        contentView.classList.add('d-none');
        appliedVoucher = null;
        appliedDiscount = 0;
        return;
    }

    emptyView.classList.add('d-none');
    contentView.classList.remove('d-none');

    let subtotal = 0;
    tbody.innerHTML = cart.map(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        return `
            <tr>
                <td><strong>${item.name}</strong></td>
                <td><span class="badge bg-light text-dark">${item.unit}</span></td>
                <td>${formatMoney(item.price)}</td>
                <td>
                    <div class="input-group input-group-sm" style="width: 100px;">
                        <button class="btn btn-outline-secondary qty-btn" type="button" onclick="changeQty(${item.productId}, -1)">-</button>
                        <input type="text" class="form-control text-center p-0" value="${item.quantity}" readonly>
                        <button class="btn btn-outline-secondary qty-btn" type="button" onclick="changeQty(${item.productId}, 1)">+</button>
                    </div>
                </td>
                <td class="fw-bold text-success">${formatMoney(itemTotal)}</td>
                <td>
                    <button class="btn btn-sm btn-link text-danger p-0" onclick="removeFromCart(${item.productId})" title="Xóa">
                        <i class="bi bi-trash3-fill"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');

    let shipping = subtotal >= 150000 || subtotal === 0 ? 0 : 15000;
    let discount = appliedDiscount;
    let total = Math.max(0, subtotal - discount + shipping);

    const subDisplay = document.getElementById('cartSubtotalDisplay');
    const discDisplay = document.getElementById('cartDiscountDisplay');
    const shipDisplay = document.getElementById('cartShippingDisplay');
    if (subDisplay) subDisplay.innerText = formatMoney(subtotal);
    if (discDisplay) discDisplay.innerText = '- ' + formatMoney(discount);
    if (shipDisplay) shipDisplay.innerText = shipping === 0 ? 'Miễn phí (0 đ)' : formatMoney(shipping);
    totalDisplay.innerText = formatMoney(total);

    // Tự động điền thông tin nếu khách đã đăng nhập
    if (currentUser) {
        const custNameEl = document.getElementById('custName');
        const custPhoneEl = document.getElementById('custPhone');
        const custAddrEl = document.getElementById('custAddress');
        if (custNameEl && !custNameEl.value) custNameEl.value = currentUser.fullName || '';
        if (custPhoneEl && !custPhoneEl.value) custPhoneEl.value = currentUser.phone || '';
        if (custAddrEl && !custAddrEl.value) custAddrEl.value = currentUser.address || '';
    }

    updatePaymentQrCode();
}

// 6. Gửi Đơn Đặt Hàng & Xuất Hóa Đơn Trực Tiếp
async function submitOrder(e) {
    e.preventDefault();
    if (cart.length === 0) {
        Swal.fire('Lỗi', 'Giỏ hàng đang trống!', 'warning');
        return;
    }

    let subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let shipping = subtotal >= 150000 || subtotal === 0 ? 0 : 15000;
    let discount = appliedDiscount;
    let total = Math.max(0, subtotal - discount + shipping);

    const orderData = {
        userId: currentUser ? currentUser.id : 0,
        customerName: document.getElementById('custName').value.trim(),
        phone: document.getElementById('custPhone').value.trim(),
        address: document.getElementById('custAddress').value.trim(),
        note: document.getElementById('custNote').value.trim(),
        paymentMethod: document.getElementById('custPayment').value,
        items: cart
    };

    try {
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        const result = await res.json();

        if (result.success) {
            const invoiceData = {
                orderId: result.orderId,
                orderDate: new Date().toLocaleString('vi-VN'),
                customerName: orderData.customerName,
                phone: orderData.phone,
                address: orderData.address,
                paymentMethod: orderData.paymentMethod,
                items: [...cart],
                subtotal: subtotal,
                discount: discount,
                shipping: shipping,
                total: total
            };

            cart = [];
            appliedVoucher = null;
            appliedDiscount = 0;
            saveCart();

            // Đóng modal giỏ hàng
            const modalEl = document.getElementById('cartModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();

            // BUNG NGAY HÓA ĐƠN BÁN LẺ CHO KHÁCH
            showCustomerInvoice(invoiceData);
            loadProducts('', currentCategoryId);
        } else {
            Swal.fire('Lỗi', result.message || 'Không thể tạo đơn!', 'error');
        }
    } catch (err) {
        console.error(err);
        Swal.fire('Lỗi', 'Không thể kết nối đến máy chủ! Vui lòng kiểm tra máy chủ web đang chạy.', 'error');
    }
}

// Hiển thị Hóa Đơn Điện Tử Bán Lẻ
function showCustomerInvoice(data) {
    document.getElementById('invOrderId').innerText = '#' + data.orderId;
    document.getElementById('invOrderDate').innerText = data.orderDate;
    document.getElementById('invCustName').innerText = data.customerName;
    document.getElementById('invCustPhone').innerText = data.phone;
    document.getElementById('invCustAddress').innerText = data.address;
    document.getElementById('invPaymentMethod').innerText = data.paymentMethod;

    const tbody = document.getElementById('invItemsBody');
    tbody.innerHTML = data.items.map(it => `
        <tr>
            <td><strong>${it.name || it.productName}</strong></td>
            <td class="text-center"><span class="badge bg-light text-dark border">${it.unit}</span></td>
            <td class="text-center">${it.quantity}</td>
            <td class="text-end">${formatMoney(it.price || it.unitPrice)}</td>
            <td class="text-end fw-bold text-success">${formatMoney((it.price || it.unitPrice) * it.quantity)}</td>
        </tr>
    `).join('');

    document.getElementById('invSubtotal').innerText = formatMoney(data.subtotal);
    document.getElementById('invDiscount').innerText = '- ' + formatMoney(data.discount);
    document.getElementById('invShipping').innerText = data.shipping === 0 ? 'Miễn phí (0 đ)' : formatMoney(data.shipping);
    document.getElementById('invTotal').innerText = formatMoney(data.total);

    // Hiển thị mã VietQR nếu chọn Chuyển khoản ngân hàng / Ví điện tử
    const invQrBox = document.getElementById('invBankQrBox');
    if (invQrBox) {
        if (data.paymentMethod && (data.paymentMethod.includes('Chuyển khoản') || data.paymentMethod.includes('MoMo') || data.paymentMethod.includes('ZaloPay'))) {
            const note = `TAPHOA ${data.orderId || Math.floor(1000 + Math.random() * 9000)}`;
            const qrUrl = `https://img.vietqr.io/image/MB-0900000001-compact2.png?amount=${data.total}&addInfo=${encodeURIComponent(note)}&accountName=TIEM%20TAP%20HOA`;
            const invImg = document.getElementById('invQrImage');
            const invAmt = document.getElementById('invQrAmount');
            const invNote = document.getElementById('invQrNote');
            if (invImg) invImg.src = qrUrl;
            if (invAmt) invAmt.innerText = formatMoney(data.total);
            if (invNote) invNote.innerText = note;
            invQrBox.classList.remove('d-none');
        } else {
            invQrBox.classList.add('d-none');
        }
    }

    // Tạo mã vạch Barcode Code128 trên hóa đơn khách hàng
    try {
        if (typeof JsBarcode === 'function' && document.getElementById('invBarcodeSvg')) {
            const barcodeVal = "ORD-" + String(data.orderId || 1).padStart(5, '0');
            JsBarcode("#invBarcodeSvg", barcodeVal, {
                format: "CODE128",
                width: 1.8,
                height: 42,
                displayValue: true,
                fontSize: 13,
                font: "monospace"
            });
        }
    } catch (e) {
        console.warn("JsBarcode error:", e);
    }

    const invModalEl = document.getElementById('customerInvoiceModal');
    const invModal = new bootstrap.Modal(invModalEl);
    invModal.show();
}

function printInvoiceElement(elementId, title = "Hóa Đơn Mua Hàng") {
    const el = document.getElementById(elementId);
    if (!el) return;

    // Mở cửa sổ in chuyên dụng với kích thước rõ ràng để trình duyệt Edge / Chrome dựng bản in ngay lập tức
    const printWindow = window.open('', '_blank', 'width=850,height=900,scrollbars=yes,resizable=yes');
    if (!printWindow) {
        // Dự phòng nếu trình duyệt chặn popup
        window.print();
        return;
    }

    printWindow.document.open();
    printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title}</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <style>
                @page {
                    size: A4 portrait;
                    margin: 12mm;
                }
                body {
                    background: #f8f9fa;
                    color: #212529;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
                    padding: 20px;
                }
                .invoice-print-card {
                    max-width: 650px;
                    margin: 0 auto;
                    background: #ffffff;
                    padding: 30px;
                    border: 1px solid #dee2e6;
                    border-radius: 10px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.06);
                }
                .no-print-toolbar {
                    max-width: 650px;
                    margin: 0 auto 15px auto;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                th, td {
                    padding: 8px 10px !important;
                }
                img {
                    max-width: 100%;
                    height: auto;
                }
                @media print {
                    body {
                        background: #ffffff;
                        padding: 0;
                    }
                    .invoice-print-card {
                        border: none;
                        box-shadow: none;
                        padding: 0;
                        max-width: 100%;
                    }
                    .no-print-toolbar {
                        display: none !important;
                    }
                }
            </style>
        </head>
        <body>
            <div class="no-print-toolbar">
                <button onclick="window.print()" class="btn btn-primary fw-bold px-3 py-2">
                    🖨️ Bấm Vào Đây Để In / Lưu PDF
                </button>
                <button onclick="window.close()" class="btn btn-secondary px-3 py-2">
                    ✖️ Đóng Cửa Sổ
                </button>
            </div>
            <div class="invoice-print-card">
                ${el.innerHTML}
            </div>
            <script>
                // Tự động kích hoạt in sau khi load CSS và ảnh VietQR xong
                window.addEventListener('load', function() {
                    setTimeout(function() {
                        window.focus();
                        window.print();
                    }, 400);
                });
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
}

function printCustomerInvoice() {
    printInvoiceElement('customerInvoiceArea', 'Hóa Đơn Mua Hàng - Tiệm Tạp Hóa');
}

function printAdminBill() {
    printInvoiceElement('printBillArea', 'Phiếu Gửi Hàng - Tiệm Tạp Hóa');
}

let myOrdersCache = [];

function viewMyOrderInvoice(orderId) {
    const o = myOrdersCache.find(x => x.id === orderId);
    if (!o) return;
    let sub = 0;
    o.items.forEach(it => sub += it.totalPrice);
    showCustomerInvoice({
        orderId: o.id,
        orderDate: o.orderDate || '',
        customerName: o.customerName,
        phone: o.phone,
        address: o.address,
        paymentMethod: o.paymentMethod,
        items: o.items,
        subtotal: sub,
        discount: 0,
        shipping: sub >= 150000 ? 0 : 15000,
        total: o.totalAmount
    });
}

// ==========================================
// CÁC HÀM DÀNH CHO TRANG QUẢN TRỊ (ADMIN)
// ==========================================

async function loadAdminStats() {
    try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        document.getElementById('statProducts').innerText = data.totalProducts;
        document.getElementById('statOrders').innerText = data.totalOrders;
        document.getElementById('statPending').innerText = data.pendingOrders;
        document.getElementById('statRevenue').innerText = formatMoney(data.totalRevenue);
    } catch (err) {
        console.error(err);
    }
}

let adminProductsCache = [];

let adminOrdersCache = [];

async function loadAdminOrders() {
    try {
        const res = await fetch('/api/orders');
        const orders = await res.json();
        adminOrdersCache = orders;
        const tbody = document.getElementById('ordersTableBody');
        if (!tbody) return;

        if (orders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">Chưa có đơn hàng nào</td></tr>`;
            return;
        }

        tbody.innerHTML = orders.map(o => {
            const itemsHtml = o.items.map(it => `<div>• ${it.productName} (x${it.quantity} ${it.unit})</div>`).join('');
            let statusBadge = 'bg-warning text-dark';
            if (o.status === 'Đang đóng gói') statusBadge = 'bg-info text-dark';
            else if (o.status === 'Đang giao hàng' || o.status === 'Đang giao') statusBadge = 'bg-primary';
            else if (o.status === 'Hoàn thành' || o.status === 'Đã hoàn thành') statusBadge = 'bg-success';
            else if (o.status === 'Đã hủy') statusBadge = 'bg-secondary';

            return `
                <tr>
                    <td><strong class="text-primary">#${o.id}</strong><br><small class="text-muted">${o.orderDate || ''}</small></td>
                    <td><strong>${o.customerName}</strong><br><small class="text-muted"><i class="bi bi-telephone"></i> ${o.phone}</small></td>
                    <td><small>${o.address}</small>${o.note ? `<br><small class="text-danger">Ghi chú: ${o.note}</small>` : ''}</td>
                    <td style="max-width: 250px; font-size: 0.85rem;">${itemsHtml}</td>
                    <td><strong class="text-danger">${formatMoney(o.totalAmount)}</strong></td>
                    <td><small class="badge bg-light text-dark border">${o.paymentMethod}</small></td>
                    <td><span class="badge ${statusBadge}">${o.status}</span></td>
                    <td>
                        <div class="d-flex align-items-center gap-1 mb-1">
                            <select class="form-select form-select-sm" style="width: 140px;" onchange="updateOrderStatus(${o.id}, this.value)">
                                <option value="Chờ xác nhận" ${o.status === 'Chờ xác nhận' || o.status === 'Chờ xử lý' ? 'selected' : ''}>Chờ xác nhận</option>
                                <option value="Đang đóng gói" ${o.status === 'Đang đóng gói' ? 'selected' : ''}>Đang đóng gói</option>
                                <option value="Đang giao hàng" ${o.status === 'Đang giao hàng' || o.status === 'Đang giao' ? 'selected' : ''}>Đang giao hàng</option>
                                <option value="Hoàn thành" ${o.status === 'Hoàn thành' || o.status === 'Đã hoàn thành' ? 'selected' : ''}>Hoàn thành</option>
                                <option value="Đã hủy" ${o.status === 'Đã hủy' ? 'selected' : ''}>Đã hủy đơn</option>
                            </select>
                            <button class="btn btn-sm btn-outline-danger" onclick="deleteOrder(${o.id})" title="Xóa đơn hàng">
                                <i class="bi bi-trash3"></i>
                            </button>
                        </div>
                        <button class="btn btn-sm btn-outline-dark w-100 py-0" style="font-size: 0.75rem;" onclick="openPrintBillModal(${o.id})">
                            <i class="bi bi-printer me-1"></i> In Phiếu Giao / Bill
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error(err);
    }
}

// In phiếu giao hàng & Hóa đơn bán lẻ (Bill POS)
function openPrintBillModal(orderId) {
    const o = adminOrdersCache.find(x => x.id === orderId);
    if (!o) return;

    document.getElementById('billOrderId').innerText = '#' + o.id;
    document.getElementById('billOrderDate').innerText = o.orderDate || '';
    document.getElementById('billCustName').innerText = o.customerName;
    document.getElementById('billCustPhone').innerText = o.phone;
    document.getElementById('billCustAddr').innerText = o.address;
    document.getElementById('billPayment').innerText = o.paymentMethod;
    document.getElementById('billTotalAmount').innerText = formatMoney(o.totalAmount);

    const tbody = document.getElementById('billItemsBody');
    tbody.innerHTML = o.items.map(it => `
        <tr>
            <td>${it.productName} (${it.unit})</td>
            <td class="text-center">${it.quantity}</td>
            <td class="text-end">${formatMoney(it.unitPrice)}</td>
            <td class="text-end fw-bold">${formatMoney(it.totalPrice)}</td>
        </tr>
    `).join('');

    // Tạo mã vạch Barcode Code128 trên bill giao hàng
    try {
        if (typeof JsBarcode === 'function' && document.getElementById('billBarcodeSvg')) {
            const barcodeVal = "ORD-" + String(o.id || 1).padStart(5, '0');
            JsBarcode("#billBarcodeSvg", barcodeVal, {
                format: "CODE128",
                width: 1.8,
                height: 42,
                displayValue: true,
                fontSize: 13,
                font: "monospace"
            });
        }
    } catch (e) {
        console.warn("JsBarcode bill error:", e);
    }

    const modalEl = document.getElementById('printBillModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

async function deleteOrder(orderId) {
    const confirm = await Swal.fire({
        title: `Xóa đơn hàng #${orderId}?`,
        text: 'Hành động này không thể hoàn tác!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Đồng ý xóa',
        cancelButtonText: 'Hủy'
    });

    if (confirm.isConfirmed) {
        try {
            await fetch(`/api/orders?id=${orderId}`, { method: 'DELETE' });
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: `Đã xóa đơn hàng #${orderId}`,
                showConfirmButton: false,
                timer: 1500
            });
            loadAdminOrders();
            loadAdminStats();
        } catch (err) {
            console.error(err);
        }
    }
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        await fetch('/api/orders', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: orderId, status: newStatus })
        });
        loadAdminStats();
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: `Đã đổi đơn #${orderId} sang "${newStatus}"`,
            showConfirmButton: false,
            timer: 1500
        });
    } catch (err) {
        console.error(err);
    }
}

async function loadAdminProducts() {
    try {
        const res = await fetch('/api/products');
        const products = await res.json();
        adminProductsCache = products;
        const tbody = document.getElementById('productsTableBody');
        if (!tbody) return;

        tbody.innerHTML = products.map(p => {
            const isLowStock = p.stock <= 20;
            const stockBadge = isLowStock 
                ? `<span class="badge bg-danger text-white"><i class="bi bi-exclamation-triangle-fill me-1"></i>TỒN THẤP (${p.stock})</span>` 
                : `<span class="badge bg-success">${p.stock}</span>`;

            const isUrl = p.image && (p.image.startsWith('http://') || p.image.startsWith('https://') || p.image.startsWith('/'));
            const imgThumb = isUrl 
                ? `<img src="${p.image}" style="width: 45px; height: 45px; object-fit: contain; border-radius: 6px; background: white; padding: 2px; border: 1px solid #dee2e6;" alt="Ảnh">` 
                : `<span class="fs-4">${p.image || '🛒'}</span>`;

            return `
                <tr class="${isLowStock ? 'table-warning' : ''}">
                    <td><strong>#${p.id}</strong></td>
                    <td class="text-center">${imgThumb}</td>
                    <td><strong>${p.name}</strong><br><small class="text-muted">${p.description || ''}</small></td>
                    <td><span class="badge bg-info text-dark">${p.categoryName || 'Tạp hóa'}</span></td>
                    <td><span class="badge bg-light text-dark border">${p.unit}</span></td>
                    <td><strong class="text-danger">${formatMoney(p.price)}</strong></td>
                    <td>${stockBadge}</td>
                    <td><small class="badge bg-light text-muted border">${p.expiryDate || 'N/A'}</small></td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-success" onclick="openQuickStockIn(${p.id})" title="Nhập hàng vào kho">
                                <i class="bi bi-box-arrow-in-down me-1"></i>Nhập kho
                            </button>
                            <button class="btn btn-outline-primary" onclick="openEditProductModal(${p.id})" title="Chỉnh sửa">
                                <i class="bi bi-pencil-square me-1"></i>Sửa
                            </button>
                            <button class="btn btn-outline-danger" onclick="deleteProduct(${p.id})" title="Xóa">
                                <i class="bi bi-trash me-1"></i>Xóa
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error(err);
    }
}

function openEditProductModal(id) {
    const p = adminProductsCache.find(x => x.id === id);
    if (!p) return;

    document.getElementById('productModalTitle').innerText = `Chỉnh Sửa Mặt Hàng #${p.id}`;
    document.getElementById('pBtnSubmit').innerHTML = '<i class="bi bi-check-circle me-1"></i> Cập Nhật Mặt Hàng';
    document.getElementById('pId').value = p.id;
    document.getElementById('pName').value = p.name;
    document.getElementById('pCategoryId').value = p.categoryId;
    document.getElementById('pUnit').value = p.unit;
    document.getElementById('pPrice').value = p.price;
    document.getElementById('pStock').value = p.stock;
    document.getElementById('pExpiry').value = p.expiryDate || '';
    document.getElementById('pImage').value = p.image || '🛒';
    document.getElementById('pDesc').value = p.description || '';

    const modalEl = document.getElementById('addProductModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
}

function resetProductForm() {
    document.getElementById('productModalTitle').innerText = 'Thêm Món Hàng Tạp Hóa Mới';
    document.getElementById('pBtnSubmit').innerHTML = '<i class="bi bi-plus-circle me-1"></i> Lưu Mặt Hàng Mới';
    document.getElementById('pId').value = '0';
    document.getElementById('pName').value = '';
    document.getElementById('pCategoryId').value = '1';
    document.getElementById('pUnit').value = 'Gói';
    document.getElementById('pPrice').value = '';
    document.getElementById('pStock').value = '100';
    document.getElementById('pExpiry').value = '12/2027';
    document.getElementById('pImage').value = '🛒';
    document.getElementById('pDesc').value = '';
}

async function saveProductAdmin(e) {
    e.preventDefault();
    const isEdit = document.getElementById('pId').value !== '0';
    const data = {
        id: document.getElementById('pId').value,
        name: document.getElementById('pName').value.trim(),
        categoryId: document.getElementById('pCategoryId').value,
        unit: document.getElementById('pUnit').value.trim(),
        price: document.getElementById('pPrice').value,
        stock: document.getElementById('pStock').value,
        expiryDate: document.getElementById('pExpiry').value.trim(),
        image: document.getElementById('pImage').value.trim(),
        description: document.getElementById('pDesc').value.trim()
    };

    try {
        const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (result.success) {
            const modalEl = document.getElementById('addProductModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();

            Swal.fire({
                icon: 'success',
                title: isEdit ? 'Đã cập nhật sản phẩm!' : 'Đã thêm sản phẩm mới!',
                text: `Mặt hàng "${data.name}" đã được lưu thành công vào kho.`,
                timer: 2000
            });
            loadAdminProducts();
            loadAdminStats();
        }
    } catch (err) {
        console.error(err);
        Swal.fire('Lỗi', 'Không thể lưu sản phẩm!', 'error');
    }
}

async function deleteProduct(id) {
    const p = adminProductsCache.find(x => x.id === id);
    const pName = p ? p.name : `#${id}`;

    const confirm = await Swal.fire({
        title: `Xóa "${pName}"?`,
        text: 'Bạn có chắc chắn muốn xóa mặt hàng này khỏi kho tạp hóa?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Đồng ý xóa',
        cancelButtonText: 'Hủy'
    });

    if (confirm.isConfirmed) {
        try {
            await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: `Đã xóa mặt hàng "${pName}"`,
                showConfirmButton: false,
                timer: 1500
            });
            loadAdminProducts();
            loadAdminStats();
        } catch (err) {
            console.error(err);
        }
    }
}

// --- QUẢN LÝ VOUCHERS (ADMIN) ---
async function loadAdminVouchers() {
    try {
        const res = await fetch('/api/vouchers');
        const vouchers = await res.json();
        const tbody = document.getElementById('vouchersTableBody');
        if (!tbody) return;

        if (vouchers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center py-4 text-muted">Chưa có mã giảm giá nào</td></tr>';
            return;
        }

        tbody.innerHTML = vouchers.map(v => `
            <tr>
                <td><strong class="text-success">${v.code}</strong></td>
                <td><span class="badge bg-warning text-dark">${v.discountPercent > 0 ? v.discountPercent + '%' : formatMoney(v.discountAmount)}</span></td>
                <td>${formatMoney(v.minOrder)}</td>
                <td>${v.description}</td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteVoucherAdmin('${v.code}')">
                        <i class="bi bi-trash"></i> Xóa
                    </button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error(err);
    }
}

async function saveVoucherAdmin(e) {
    e.preventDefault();
    const data = {
        code: document.getElementById('vCode').value.trim().toUpperCase(),
        discountPercent: document.getElementById('vPercent').value,
        discountAmount: document.getElementById('vAmount').value,
        minOrder: document.getElementById('vMinOrder').value,
        description: document.getElementById('vDesc').value.trim()
    };

    try {
        const res = await fetch('/api/vouchers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (result.success) {
            const modalEl = document.getElementById('addVoucherModal');
            const modal = bootstrap.Modal.getInstance(modalEl);
            if (modal) modal.hide();
            Swal.fire('Thành công', 'Đã lưu mã giảm giá mới!', 'success');
            loadAdminVouchers();
        }
    } catch (err) {
        console.error(err);
    }
}

async function deleteVoucherAdmin(code) {
    if (confirm(`Bạn có chắc muốn xóa mã giảm giá "${code}"?`)) {
        try {
            await fetch(`/api/vouchers?code=${code}`, { method: 'DELETE' });
            Swal.fire('Đã xóa', 'Voucher đã được xóa', 'success');
            loadAdminVouchers();
        } catch (err) {
            console.error(err);
        }
    }
}

// --- QUẢN LÝ KHÁCH HÀNG & TÍCH ĐIỂM (ADMIN) ---
async function loadAdminCustomers() {
    try {
        const res = await fetch('/api/users');
        const users = await res.json();
        const tbody = document.getElementById('customersTableBody');
        if (!tbody) return;

        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" class="text-center py-4 text-muted">Chưa có khách hàng đăng ký</td></tr>';
            return;
        }

        tbody.innerHTML = users.map(u => {
            const rankBadge = u.rank === 'Vàng' ? 'bg-warning text-dark' : (u.rank === 'Bạc' ? 'bg-secondary text-white' : 'bg-light text-dark border');
            return `
                <tr>
                    <td><strong>#${u.id}</strong></td>
                    <td><strong>${u.fullName}</strong></td>
                    <td><code>${u.username}</code></td>
                    <td>${u.phone || 'N/A'}</td>
                    <td><small>${u.address || 'N/A'}</small></td>
                    <td class="text-center"><strong>${u.orderCount}</strong></td>
                    <td class="text-danger fw-bold">${formatMoney(u.totalSpent)}</td>
                    <td class="text-center"><strong class="text-success">${u.points}</strong> pts</td>
                    <td><span class="badge ${rankBadge}">${u.rank}</span></td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error(err);
    }
}

// --- BÁO CÁO & THỐNG KÊ CHI TIẾT (ADMIN) ---
async function loadAdminReports() {
    try {
        const res = await fetch('/api/stats/advanced');
        const data = await res.json();

        document.getElementById('repRevenue').innerText = formatMoney(data.totalRevenue);
        document.getElementById('repCost').innerText = formatMoney(data.totalCost);
        document.getElementById('repProfit').innerText = formatMoney(data.totalProfit);

        const tbody = document.getElementById('topSellersTableBody');
        if (!tbody) return;

        tbody.innerHTML = data.topSellers.map((item, index) => {
            const medal = index === 0 ? '🥇' : (index === 1 ? '🥈' : (index === 2 ? '🥉' : `#${index + 1}`));
            return `
                <tr>
                    <td class="fs-5">${medal}</td>
                    <td><strong>${item.name}</strong></td>
                    <td>${formatMoney(item.price)}</td>
                    <td><span class="badge bg-danger fs-6">${item.sold}</span></td>
                    <td><span class="badge bg-success">${item.stock}</span></td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error(err);
    }
}

// --- QUẢN LÝ KHO HÀNG & BIẾN ĐỘNG TỒN KHO (INVENTORY MANAGEMENT) ---


async function loadAdminInventory() {
    await Promise.all([
        loadInventorySummary(),
        loadInventoryLogs(),
        populateInventoryProductSelects()
    ]);
}

async function loadInventorySummary() {
    try {
        const res = await fetch('/api/inventory/summary');
        const data = await res.json();
        
        const elTotalProducts = document.getElementById('invTotalProducts');
        if (elTotalProducts) elTotalProducts.innerText = data.totalProducts || 0;
        
        const elTotalStock = document.getElementById('invTotalStock');
        if (elTotalStock) elTotalStock.innerText = (data.totalStockUnits || data.totalStockQuantity || 0).toLocaleString('vi-VN');
        
        const elTotalVal = document.getElementById('invTotalStockValue');
        if (elTotalVal) elTotalVal.innerText = formatMoney(data.totalStockValue || data.estimatedInventoryValue || 0);
        
        const elLowStock = document.getElementById('invLowStockCount');
        if (elLowStock) elLowStock.innerText = data.lowStockCount || 0;
        
        const elOutOfStock = document.getElementById('invOutOfStockCount');
        if (elOutOfStock) elOutOfStock.innerText = data.outOfStockCount || 0;
    } catch (err) {
        console.error("Lỗi tải tổng quan kho:", err);
    }
}

async function loadInventoryLogs() {
    try {
        const tbody = document.getElementById('inventoryLogsTableBody');
        if (!tbody) return;

        const res = await fetch('/api/inventory/logs');
        const logs = await res.json();

        if (!Array.isArray(logs) || logs.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">Chưa có giao dịch kho nào.</td></tr>`;
            return;
        }

        tbody.innerHTML = logs.map(l => {
            let typeBadge = '';
            let qtyChangeText = '';
            if (l.type === 'NHAP_KHO') {
                typeBadge = '<span class="badge bg-success-subtle text-success border border-success"><i class="bi bi-box-arrow-in-down me-1"></i> Nhập Kho</span>';
                qtyChangeText = `<strong class="text-success">+${l.changeQuantity}</strong>`;
            } else if (l.type === 'XUAT_BAN') {
                typeBadge = '<span class="badge bg-danger-subtle text-danger border border-danger"><i class="bi bi-box-arrow-up-right me-1"></i> Xuất Bán Đơn</span>';
                qtyChangeText = `<strong class="text-danger">${l.changeQuantity}</strong>`;
            } else {
                typeBadge = '<span class="badge bg-warning-subtle text-warning-emphasis border border-warning"><i class="bi bi-sliders me-1"></i> Điều Chỉnh Kiểm Kê</span>';
                qtyChangeText = `<strong class="text-primary">${l.changeQuantity >= 0 ? '+' : ''}${l.changeQuantity}</strong>`;
            }

            return `
                <tr>
                    <td><code>#${l.id}</code></td>
                    <td><small class="text-muted">${l.createdAt || ''}</small></td>
                    <td><strong>${l.productName}</strong> <small class="text-muted">(ID: ${l.productId})</small></td>
                    <td>${typeBadge}</td>
                    <td class="text-center fs-6">${qtyChangeText}</td>
                    <td class="text-center"><span class="badge bg-secondary-subtle text-secondary border">${l.stockAfter} món</span></td>
                    <td><small class="fw-semibold text-dark">${l.supplier || 'N/A'}</small></td>
                    <td><small class="text-muted">${l.note || ''}</small></td>
                </tr>
            `;
        }).join('');
    } catch (err) {
        console.error("Lỗi tải nhật ký kho:", err);
    }
}

async function populateInventoryProductSelects() {
    try {
        const res = await fetch('/api/products');
        adminProductsCache = await res.json();

        const inSelect = document.getElementById('stockInProductId');
        const adjSelect = document.getElementById('stockAdjProductId');

        const optionsHtml = '<option value="">-- Chọn mặt hàng tạp hóa --</option>' + 
            adminProductsCache.map(p => `<option value="${p.id}" data-stock="${p.stock}" data-price="${p.price}">${p.name} (Tồn: ${p.stock} ${p.unit})</option>`).join('');

        if (inSelect) inSelect.innerHTML = optionsHtml;
        if (adjSelect) adjSelect.innerHTML = optionsHtml;
    } catch (err) {
        console.error("Lỗi nạp danh sách sản phẩm kho:", err);
    }
}

function openQuickStockIn(productId = null) {
    populateInventoryProductSelects().then(() => {
        if (productId && document.getElementById('stockInProductId')) {
            document.getElementById('stockInProductId').value = productId;
        }
        const modal = new bootstrap.Modal(document.getElementById('stockInModal'));
        modal.show();
    });
}

function openQuickStockAdjust(productId = null) {
    populateInventoryProductSelects().then(() => {
        if (productId && document.getElementById('stockAdjProductId')) {
            const select = document.getElementById('stockAdjProductId');
            select.value = productId;
            updateStockAdjustCurrentDisplay();
        }
        const modal = new bootstrap.Modal(document.getElementById('stockAdjustModal'));
        modal.show();
    });
}

function updateStockAdjustCurrentDisplay() {
    const select = document.getElementById('stockAdjProductId');
    const selectedOption = select.options[select.selectedIndex];
    const currentStock = selectedOption ? selectedOption.getAttribute('data-stock') : 0;
    const currentSpan = document.getElementById('stockAdjCurrentCount');
    if (currentSpan) currentSpan.innerText = currentStock || 0;
}

async function handleStockInSubmit(event) {
    event.preventDefault();
    const productId = parseInt(document.getElementById('stockInProductId').value);
    const quantity = parseInt(document.getElementById('stockInQuantity').value);
    const importPrice = parseFloat(document.getElementById('stockInPrice').value) || 0;
    const supplier = document.getElementById('stockInSupplier').value.trim();
    const note = document.getElementById('stockInNote').value.trim();

    if (!productId || isNaN(productId)) {
        Swal.fire('Chú ý', 'Vui lòng chọn mặt hàng cần nhập kho!', 'warning');
        return;
    }
    if (!quantity || quantity <= 0) {
        Swal.fire('Chú ý', 'Số lượng nhập phải lớn hơn 0!', 'warning');
        return;
    }

    try {
        const res = await fetch('/api/inventory/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity, importPrice, supplier, note })
        });
        const result = await res.json();

        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Nhập kho thành công!',
                text: result.message,
                timer: 1800,
                showConfirmButton: false
            });
            bootstrap.Modal.getInstance(document.getElementById('stockInModal'))?.hide();
            document.getElementById('stockInForm').reset();
            loadAdminInventory();
            loadAdminProducts();
            loadAdminStats();
        } else {
            Swal.fire('Thất bại', result.message || 'Không thể tạo phiếu nhập kho!', 'error');
        }
    } catch (err) {
        Swal.fire('Lỗi', 'Không thể kết nối đến máy chủ!', 'error');
    }
}

async function handleStockAdjustSubmit(event) {
    event.preventDefault();
    const productId = parseInt(document.getElementById('stockAdjProductId').value);
    const newStock = parseInt(document.getElementById('stockAdjNewStock').value);
    const reason = document.getElementById('stockAdjReason').value;
    const note = document.getElementById('stockAdjNote').value.trim();

    if (!productId || isNaN(productId)) {
        Swal.fire('Chú ý', 'Vui lòng chọn mặt hàng kiểm kê!', 'warning');
        return;
    }
    if (isNaN(newStock) || newStock < 0) {
        Swal.fire('Chú ý', 'Số lượng tồn kho thực tế phải ≥ 0!', 'warning');
        return;
    }

    try {
        const res = await fetch('/api/inventory/adjust', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, newStock, reason, note })
        });
        const result = await res.json();

        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Điều chỉnh kho thành công!',
                text: result.message,
                timer: 1800,
                showConfirmButton: false
            });
            bootstrap.Modal.getInstance(document.getElementById('stockAdjustModal'))?.hide();
            document.getElementById('stockAdjustForm').reset();
            loadAdminInventory();
            loadAdminProducts();
            loadAdminStats();
        } else {
            Swal.fire('Thất bại', result.message || 'Không thể điều chỉnh tồn kho!', 'error');
        }
    } catch (err) {
        Swal.fire('Lỗi', 'Không thể kết nối đến máy chủ!', 'error');
    }
}

// --- QUÉT MÃ VẠCH ĐƠN HÀNG & THU NGÂN POS (BARCODE SCANNER & POS CASHIER) ---
let currentScannedOrder = null;
let html5QrScanner = null;

function openOrderBarcodeScannerModal(initialQuery = null) {
    const modalEl = document.getElementById('orderBarcodeScannerModal');
    if (!modalEl) return;

    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    setTimeout(() => {
        const input = document.getElementById('barcodeScanInput');
        if (input) {
            input.focus();
            if (initialQuery) {
                input.value = initialQuery;
                handleBarcodeLookup();
            }
        }
    }, 400);
}

async function handleBarcodeLookup() {
    const input = document.getElementById('barcodeScanInput');
    const query = input ? input.value.trim() : '';

    if (!query) {
        Swal.fire('Chú ý', 'Vui lòng quét hoặc nhập mã vạch / mã số đơn hàng!', 'warning');
        return;
    }

    try {
        const res = await fetch('/api/orders?barcode=' + encodeURIComponent(query));
        const data = await res.json();

        if (data.success && data.order) {
            displayScannedOrder(data.order);
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Không tìm thấy đơn hàng!',
                text: data.message || `Không có đơn hàng nào khớp với mã "${query}". Vui lòng kiểm tra lại.`,
                confirmButtonText: 'Thử lại'
            });
            if (input) {
                input.select();
                input.focus();
            }
        }
    } catch (err) {
        console.error("Lỗi tra cứu mã vạch:", err);
        Swal.fire('Lỗi', 'Không thể kết nối đến máy chủ web!', 'error');
    }
}

function quickFillAndLookup(code) {
    const input = document.getElementById('barcodeScanInput');
    if (input) {
        input.value = code;
        handleBarcodeLookup();
    }
}

function displayScannedOrder(order) {
    currentScannedOrder = order;

    // Ẩn placeholder, hiện khu vực chi tiết đơn
    document.getElementById('scannedEmptyPlaceholder')?.classList.add('d-none');
    document.getElementById('scannedOrderDetailsArea')?.classList.remove('d-none');

    // Điền thông tin
    document.getElementById('posOrderId').innerText = '#' + order.id;
    document.getElementById('posOrderDate').innerText = order.orderDate || '';
    document.getElementById('posCustName').innerText = order.customerName || 'Khách lẻ';
    document.getElementById('posCustPhone').innerText = order.phone || 'N/A';
    document.getElementById('posCustAddr').innerText = order.address || 'Tại cửa hàng';
    document.getElementById('posPaymentMethod').innerText = order.paymentMethod || 'Tiền mặt';
    document.getElementById('posBarcodeCode').innerText = "ORD-" + String(order.id).padStart(5, '0');

    // Badge trạng thái
    const badge = document.getElementById('posOrderStatusBadge');
    if (badge) {
        badge.innerText = order.status;
        if (order.status === 'Đã hoàn thành' || order.status === 'Đã thanh toán') {
            badge.className = 'badge bg-success';
        } else if (order.status === 'Đang giao hàng') {
            badge.className = 'badge bg-info text-dark';
        } else {
            badge.className = 'badge bg-warning text-dark';
        }
    }

    // Danh sách mặt hàng
    const tbody = document.getElementById('posOrderItemsBody');
    if (tbody && order.items) {
        tbody.innerHTML = order.items.map(it => `
            <tr>
                <td><strong>${it.productName}</strong> <small class="text-muted">(${it.unit})</small></td>
                <td class="text-center"><span class="badge bg-light text-dark border">${it.quantity}</span></td>
                <td class="text-end text-muted">${formatMoney(it.unitPrice)}</td>
                <td class="text-end fw-bold text-dark">${formatMoney(it.totalPrice)}</td>
            </tr>
        `).join('');
    }

    // Tổng tiền
    document.getElementById('posTotalAmount').innerText = formatMoney(order.totalAmount);

    // Reset ô tiền khách đưa
    const cashInput = document.getElementById('posCashGivenInput');
    if (cashInput) {
        cashInput.value = '';
    }
    calculatePosChange();

    // Focus vào ô tiền khách đưa để thu ngân tính tiền ngay
    setTimeout(() => {
        cashInput?.focus();
    }, 200);
}

function calculatePosChange() {
    if (!currentScannedOrder) return;

    const total = currentScannedOrder.totalAmount || 0;
    const inputVal = document.getElementById('posCashGivenInput').value;
    const cashGiven = parseFloat(inputVal) || 0;

    const changeBox = document.getElementById('posChangeBox');
    const label = document.getElementById('posChangeLabel');
    const amount = document.getElementById('posChangeAmount');
    const hint = document.getElementById('posChangeHint');

    if (!inputVal || inputVal.trim() === '') {
        amount.innerText = '0 đ';
        amount.className = 'fs-4 fw-bold text-muted';
        label.innerText = 'Tiền thối lại khách:';
        hint.innerText = 'Nhập số tiền khách đưa để tính tự động';
        changeBox.style.background = '#f8f9fa';
        return;
    }

    const diff = cashGiven - total;

    if (diff >= 0) {
        amount.innerText = formatMoney(diff);
        amount.className = 'fs-4 fw-bold text-success';
        label.innerText = 'Tiền thối lại khách:';
        hint.innerText = diff === 0 ? 'Khách đưa vừa đủ, không cần thối tiền lẻ.' : `Cần gửi lại khách ${formatMoney(diff)}`;
        changeBox.style.background = '#e8f5e9';
    } else {
        amount.innerText = '- ' + formatMoney(Math.abs(diff));
        amount.className = 'fs-4 fw-bold text-danger';
        label.innerText = 'Khách còn thiếu:';
        hint.innerText = `Chưa đủ tiền thanh toán đơn hàng (còn thiếu ${formatMoney(Math.abs(diff))})`;
        changeBox.style.background = '#ffebee';
    }
}

function setCashGivenPreset(preset) {
    if (!currentScannedOrder) return;
    const cashInput = document.getElementById('posCashGivenInput');
    if (!cashInput) return;

    if (preset === 'exact') {
        cashInput.value = currentScannedOrder.totalAmount;
    } else {
        cashInput.value = preset;
    }
    calculatePosChange();
}

async function completePosOrder() {
    if (!currentScannedOrder) return;

    const orderId = currentScannedOrder.id;

    try {
        const res = await fetch('/api/orders', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId: orderId, status: 'Đã hoàn thành' })
        });
        const result = await res.json();

        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Thu tiền thành công!',
                text: `Đơn hàng #${orderId} đã được thu tiền và chuyển sang trạng thái "Đã hoàn thành".`,
                timer: 2000,
                showConfirmButton: false
            });

            // Cập nhật giao diện hiện tại
            currentScannedOrder.status = 'Đã hoàn thành';
            const badge = document.getElementById('posOrderStatusBadge');
            if (badge) {
                badge.innerText = 'Đã hoàn thành';
                badge.className = 'badge bg-success';
            }

            // Đồng bộ lại danh sách đơn và thống kê
            loadAdminOrders();
            loadAdminStats();
            loadAdminInventory();
        } else {
            Swal.fire('Thất bại', 'Không thể cập nhật trạng thái đơn hàng!', 'error');
        }
    } catch (err) {
        console.error(err);
        Swal.fire('Lỗi', 'Không thể kết nối đến máy chủ!', 'error');
    }
}

function printPosOrderBill() {
    if (!currentScannedOrder) return;
    openPrintBillModal(currentScannedOrder.id);
}

function resetPosScannerForNext() {
    currentScannedOrder = null;
    document.getElementById('scannedOrderDetailsArea')?.classList.add('d-none');
    document.getElementById('scannedEmptyPlaceholder')?.classList.remove('d-none');

    const input = document.getElementById('barcodeScanInput');
    if (input) {
        input.value = '';
        input.focus();
    }
}

// Điều khiển Camera quét mã trực tiếp
function toggleCameraScanner() {
    const container = document.getElementById('cameraScannerContainer');
    if (!container) return;

    if (container.classList.contains('d-none')) {
        startCameraScanner();
    } else {
        stopCameraScanner();
    }
}

function startCameraScanner() {
    const container = document.getElementById('cameraScannerContainer');
    if (!container) return;

    if (typeof Html5Qrcode === 'undefined') {
        Swal.fire('Thông báo', 'Thư viện Camera chưa sẵn sàng, vui lòng nhập mã hoặc dùng máy quét USB!', 'info');
        return;
    }

    container.classList.remove('d-none');

    if (!html5QrScanner) {
        html5QrScanner = new Html5Qrcode("interactiveScannerArea");
    }

    const config = { fps: 10, qrbox: { width: 250, height: 180 } };

    html5QrScanner.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
            // Quét thành công!
            console.log("Mã quét được từ camera:", decodedText);
            stopCameraScanner();

            const input = document.getElementById('barcodeScanInput');
            if (input) input.value = decodedText;
            handleBarcodeLookup();
        },
        (errorMessage) => {
            // Quá trình tìm kiếm mã quét liên tục
        }
    ).catch(err => {
        console.warn("Không thể mở camera:", err);
        Swal.fire('Chú ý Camera', 'Không thể truy cập camera hoặc quyền bị từ chối. Bạn hãy dùng máy quét mã vạch hoặc nhập mã đơn.', 'warning');
        container.classList.add('d-none');
    });
}

function stopCameraScanner() {
    const container = document.getElementById('cameraScannerContainer');
    if (container) container.classList.add('d-none');

    if (html5QrScanner) {
        try {
            html5QrScanner.stop().then(() => {
                html5QrScanner.clear();
            }).catch(e => console.warn(e));
        } catch (e) {
            console.warn(e);
        }
    }
}

// --- THU NGÂN QUÉT MÃ VẠCH SẢN PHẨM & TÍNH TIỀN THỐI (PRODUCT POS CHECKOUT) ---
let currentPosProduct = null;
let posCameraScanner = null;
let posCartQty = 1;

// Hiển thị modal phóng to mã vạch để dùng điện thoại quét từ màn hình
function showBarcodeViewerModal(barcode, name, price) {
    const elModal = document.getElementById('productBarcodeViewerModal');
    if (!elModal) return;

    document.getElementById('viewerProdName').innerText = name || 'Sản phẩm';
    document.getElementById('viewerProdPrice').innerText = formatMoney(price || 0);
    document.getElementById('viewerBarcodeText').innerText = barcode || '';

    try {
        if (typeof JsBarcode === 'function' && document.getElementById('viewerBarcodeSvg')) {
            JsBarcode("#viewerBarcodeSvg", barcode, {
                format: barcode && barcode.length === 13 ? "EAN13" : "CODE128",
                width: 2.2,
                height: 75,
                displayValue: true,
                fontSize: 16,
                font: "monospace"
            });
        }
    } catch (e) {
        try {
            JsBarcode("#viewerBarcodeSvg", barcode, { format: "CODE128", width: 2, height: 70, displayValue: true });
        } catch (err2) {
            console.warn(err2);
        }
    }

    const modal = new bootstrap.Modal(elModal);
    modal.show();
}

// Âm thanh BÍP siêu thị khi quét mã thành công
function playBarcodeScannerBeep() {
    try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(1760, ctx.currentTime); // 1760Hz (nốt A6 ngân vang chuẩn máy quét siêu thị)
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.12);
        }
        if (navigator.vibrate) {
            navigator.vibrate(80);
        }
    } catch (e) {
        console.warn("AudioContext error:", e);
    }
}

// Mở modal Máy Thu Ngân POS Quét Mã Sản Phẩm
function openProductPosScannerModal(initialBarcode = null) {
    const modalEl = document.getElementById('productPosModal');
    if (!modalEl) return;

    const modal = new bootstrap.Modal(modalEl);
    modal.show();

    setTimeout(() => {
        const input = document.getElementById('posProductBarcodeInput');
        if (input) {
            input.focus();
            if (initialBarcode) {
                input.value = initialBarcode;
                lookupProductBarcode(initialBarcode);
            }
        }
    }, 400);
}

// Tra cứu sản phẩm bằng mã vạch
async function lookupProductBarcode(code = null) {
    const input = document.getElementById('posProductBarcodeInput');
    const barcode = (code || (input ? input.value : '')).trim();

    if (!barcode) {
        Swal.fire('Chú ý', 'Vui lòng quét hoặc nhập mã vạch sản phẩm (ví dụ: 8934563138164)!', 'warning');
        return;
    }

    try {
        const res = await fetch('/api/products?barcode=' + encodeURIComponent(barcode));
        const data = await res.json();

        if (data.success && data.product) {
            playBarcodeScannerBeep();
            displayScannedProduct(data.product);
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Không tìm thấy sản phẩm!',
                text: data.message || `Mã vạch "${barcode}" không khớp với mặt hàng nào trong kho.`,
                confirmButtonText: 'Quét lại'
            });
            if (input) {
                input.select();
                input.focus();
            }
        }
    } catch (err) {
        console.error("Lỗi tìm kiếm sản phẩm theo mã vạch:", err);
        Swal.fire('Lỗi', 'Không thể kết nối đến máy chủ!', 'error');
    }
}

// Bấm nút thử nhanh sản phẩm
function quickScanProduct(barcode) {
    const input = document.getElementById('posProductBarcodeInput');
    if (input) input.value = barcode;
    lookupProductBarcode(barcode);
}

// Hiển thị sản phẩm đã quét lên bảng tính tiền
function displayScannedProduct(p) {
    currentPosProduct = p;
    posCartQty = 1;

    document.getElementById('posProductEmptyPlaceholder')?.classList.add('d-none');
    document.getElementById('posProductResultArea')?.classList.remove('d-none');

    document.getElementById('posCardName').innerText = p.name;
    document.getElementById('posCardPrice').innerText = formatMoney(p.price);
    document.getElementById('posCardUnit').innerText = p.unit;
    document.getElementById('posCardStock').innerText = `Kho còn: ${p.stock}`;
    document.getElementById('posCardBarcode').innerText = p.barcode || ('89300000000' + p.id);

    const imgEl = document.getElementById('posCardImg');
    if (imgEl) {
        imgEl.src = p.image || '/images/sp1_haohao.png';
    }

    const qtyInput = document.getElementById('posItemQtyInput');
    if (qtyInput) qtyInput.value = 1;

    updatePosCalculations();

    // Tự động focus vào ô tiền khách đưa
    setTimeout(() => {
        const cashInput = document.getElementById('posCustomerMoneyInput');
        if (cashInput) cashInput.focus();
    }, 250);
}

// Tăng / giảm số lượng món
function adjustPosQty(delta) {
    const qtyInput = document.getElementById('posItemQtyInput');
    if (!qtyInput) return;
    let val = parseInt(qtyInput.value) || 1;
    val += delta;
    if (val < 1) val = 1;
    qtyInput.value = val;
    updatePosCalculations();
}

// Cập nhật tính toán tổng tiền
function updatePosCalculations() {
    if (!currentPosProduct) return;

    const qtyInput = document.getElementById('posItemQtyInput');
    posCartQty = parseInt(qtyInput ? qtyInput.value : 1) || 1;
    if (posCartQty < 1) posCartQty = 1;

    const total = currentPosProduct.price * posCartQty;

    document.getElementById('posTotalPayable').innerText = formatMoney(total);
    document.getElementById('posSummaryQty').innerText = `(${posCartQty} ${currentPosProduct.unit})`;

    calculateCustomerChange();
}

// Tính tiền thối còn lại dư bao nhiêu
function calculateCustomerChange() {
    if (!currentPosProduct) return;

    const total = currentPosProduct.price * posCartQty;
    const inputVal = document.getElementById('posCustomerMoneyInput').value;
    const cashGiven = parseFloat(inputVal) || 0;

    const box = document.getElementById('posChangeResultBox');
    const label = document.getElementById('posChangeTextLabel');
    const amount = document.getElementById('posChangeTextAmount');
    const hint = document.getElementById('posChangeTextHint');

    if (!inputVal || inputVal.trim() === '') {
        amount.innerText = '0 đ';
        amount.className = 'fs-4 fw-bold text-muted';
        label.innerText = 'Tiền thối lại khách dư:';
        hint.innerText = 'Nhập số tiền khách đưa để tính tự động';
        box.style.background = '#f8f9fa';
        box.style.borderColor = '#dee2e6';
        return;
    }

    const diff = cashGiven - total;

    if (diff >= 0) {
        amount.innerText = formatMoney(diff);
        amount.className = 'fs-3 fw-bold text-success';
        label.innerText = 'Tiền thối lại khách dư:';
        hint.innerText = diff === 0 ? 'Khách đưa vừa đủ tiền, không cần thối lại.' : `Cần gửi lại cho khách ${formatMoney(diff)}`;
        box.style.background = '#e8f5e9';
        box.style.borderColor = '#4caf50';
    } else {
        amount.innerText = '- ' + formatMoney(Math.abs(diff));
        amount.className = 'fs-3 fw-bold text-danger';
        label.innerText = 'Khách còn thiếu:';
        hint.innerText = `Chưa đủ tiền thanh toán (còn thiếu ${formatMoney(Math.abs(diff))})`;
        box.style.background = '#ffebee';
        box.style.borderColor = '#f44336';
    }
}

// Gợi ý nhanh mệnh giá tiền
function setCustomerMoneyPreset(preset) {
    if (!currentPosProduct) return;
    const input = document.getElementById('posCustomerMoneyInput');
    if (!input) return;

    const total = currentPosProduct.price * posCartQty;
    if (preset === 'exact') {
        input.value = total;
    } else {
        input.value = preset;
    }
    calculateCustomerChange();
}

// Xác nhận thanh toán đơn POS & Trừ tồn kho
async function confirmPosProductCheckout() {
    if (!currentPosProduct) return;

    const total = currentPosProduct.price * posCartQty;
    const inputVal = document.getElementById('posCustomerMoneyInput').value;
    const cashGiven = parseFloat(inputVal) || total;
    const change = cashGiven - total;

    if (cashGiven < total) {
        Swal.fire('Chú ý', `Số tiền khách đưa chưa đủ (còn thiếu ${formatMoney(total - cashGiven)})!`, 'warning');
        return;
    }

    const orderData = {
        userId: 0,
        customerName: "Khách Mua Tại Quầy (POS)",
        phone: "Khách lẻ",
        address: "Thanh toán trực tiếp tại quầy",
        note: `Bán lẻ qua máy quét mã vạch POS. Khách đưa: ${formatMoney(cashGiven)}, Tiền thối: ${formatMoney(change)}`,
        paymentMethod: "Tiền mặt tại quầy (POS)",
        items: [{
            productId: currentPosProduct.id,
            productName: currentPosProduct.name,
            unit: currentPosProduct.unit,
            price: currentPosProduct.price,
            quantity: posCartQty
        }]
    };

    try {
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        const result = await res.json();

        if (result.success) {
            Swal.fire({
                icon: 'success',
                title: 'Thanh toán thành công!',
                html: `
                    <div class="text-start p-3 bg-light rounded-3 my-2 small">
                        <div><strong>Sản phẩm:</strong> ${currentPosProduct.name} x ${posCartQty} ${currentPosProduct.unit}</div>
                        <div><strong>Tổng tiền:</strong> <span class="text-danger fw-bold">${formatMoney(total)}</span></div>
                        <div><strong>Tiền khách đưa:</strong> ${formatMoney(cashGiven)}</div>
                        <div class="fs-6 mt-2 pt-2 border-top text-success fw-bold">👉 TIỀN THỐI LẠI KHÁCH DƯ: ${formatMoney(change)}</div>
                    </div>
                `,
                confirmButtonText: 'Tiếp Tục Bán Món Khác'
            }).then(() => {
                if (typeof loadProducts === 'function') loadProducts();
                if (typeof loadAdminOrders === 'function') loadAdminOrders();
                if (typeof loadAdminStats === 'function') loadAdminStats();
                if (typeof loadAdminInventory === 'function') loadAdminInventory();
                resetForNextProductScan();
            });
        } else {
            Swal.fire('Lỗi', result.message || 'Không thể tạo đơn hàng!', 'error');
        }
    } catch (err) {
        console.error(err);
        Swal.fire('Lỗi', 'Không thể kết nối máy chủ!', 'error');
    }
}

// Reset để quét món tiếp theo
function resetForNextProductScan() {
    currentPosProduct = null;
    document.getElementById('posProductResultArea')?.classList.add('d-none');
    document.getElementById('posProductEmptyPlaceholder')?.classList.remove('d-none');

    const input = document.getElementById('posProductBarcodeInput');
    if (input) {
        input.value = '';
        input.focus();
    }
    const cashInput = document.getElementById('posCustomerMoneyInput');
    if (cashInput) cashInput.value = '';
}

// Điều khiển Camera quét mã sản phẩm trên điện thoại
function togglePosCameraScanner() {
    const container = document.getElementById('posCameraContainer');
    if (!container) return;

    if (container.classList.contains('d-none')) {
        startPosCameraScanner();
    } else {
        stopPosCameraScanner();
    }
}

// Quét mã vạch từ ảnh chụp hoặc camera điện thoại (Hoạt động 100% không bị chặn bởi HTTP)
async function handlePosImageFile(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    Swal.fire({
        title: 'Đang đọc mã vạch từ ảnh...',
        text: 'Vui lòng chờ giây lát',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
    });

    try {
        if (!posCameraScanner) {
            posCameraScanner = new Html5Qrcode("posInteractiveScanner");
        }
        const decodedText = await posCameraScanner.scanFile(file, true);
        Swal.close();

        const input = document.getElementById('posProductBarcodeInput');
        if (input) input.value = decodedText;
        lookupProductBarcode(decodedText);
    } catch (err) {
        console.warn("Lỗi đọc mã từ ảnh:", err);
        Swal.fire({
            icon: 'error',
            title: 'Chưa đọc được mã vạch',
            html: 'Ảnh chụp chưa rõ mã vạch hoặc bị mờ.<br><br>👉 Bạn có thể chụp lại gần và nét hơn, hoặc bấm nút màu đỏ <b>[ 🍜 Mì Hảo Hảo ]</b> để thử ngay!',
            confirmButtonText: 'Đã hiểu'
        });
    } finally {
        event.target.value = '';
    }
}

async function startPosCameraScanner() {
    const container = document.getElementById('posCameraContainer');
    const btnText = document.getElementById('posCameraBtnText');
    if (!container) return;

    if (typeof Html5Qrcode === 'undefined') {
        Swal.fire('Thông báo', 'Thư viện Camera chưa sẵn sàng, vui lòng nhập mã hoặc chọn nút thử nhanh!', 'info');
        return;
    }

    container.classList.remove('d-none');
    if (btnText) btnText.innerText = 'Tắt Camera';

    if (!posCameraScanner) {
        posCameraScanner = new Html5Qrcode("posInteractiveScanner");
    }

    const config = { fps: 15, qrbox: { width: 280, height: 180 } };

    const onScanSuccess = (decodedText) => {
        console.log("Quét thành công mã vạch sản phẩm:", decodedText);
        stopPosCameraScanner();

        const input = document.getElementById('posProductBarcodeInput');
        if (input) input.value = decodedText;
        lookupProductBarcode(decodedText);
    };

    try {
        // Thử mở Camera sau của điện thoại (environment)
        await posCameraScanner.start({ facingMode: "environment" }, config, onScanSuccess, () => {});
    } catch (err1) {
        console.warn("Thử mở camera sau không thành công, thử camera mặc định:", err1);
        try {
            // Thử camera mặc định / webcam của laptop hoặc PC
            const cameras = await Html5Qrcode.getCameras();
            if (cameras && cameras.length > 0) {
                const cameraId = cameras[cameras.length - 1].id;
                await posCameraScanner.start(cameraId, config, onScanSuccess, () => {});
            } else {
                throw new Error("Không tìm thấy camera");
            }
        } catch (err2) {
            console.warn("Lỗi mở camera hoàn toàn:", err2);
            stopPosCameraScanner();

            const isRemoteIp = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
            let msg = '';
            if (isRemoteIp) {
                msg = `<div class="text-start">
                    <p class="mb-2 text-danger fw-bold"><i class="bi bi-shield-slash me-1"></i>Trình duyệt chặn Camera trực tiếp trên HTTP IP (<code>${window.location.hostname}</code>) vì lý do bảo mật Web.</p>
                    <p class="mb-2"><b>3 cách giải quyết cực nhanh:</b></p>
                    <ol class="ps-3 mb-2">
                        <li class="mb-2"><b>Chụp ảnh quét mã:</b> Bấm nút màu xanh dương <b>[ 📸 Chụp ảnh quét ]</b> ngay bên cạnh nút Camera — điện thoại sẽ mở máy ảnh chụp gói mì và nhận mã tức thì 100%!</li>
                        <li class="mb-2"><b>Trên máy tính:</b> Hãy mở trang web bằng: <a href="http://localhost:8080" class="fw-bold text-success">http://localhost:8080</a> (localhost luôn được phép mở webcam trực tiếp).</li>
                        <li><b>Test nhanh tính tiền:</b> Bấm ngay nút màu đỏ <b>[ 🍜 Mì Hảo Hảo ]</b> có sẵn ở dưới để xem máy thu ngân POS tính tiền thối.</li>
                    </ol>
                </div>`;
            } else {
                msg = `<div class="text-start">
                    <p class="mb-2">Không thể truy cập camera (trình duyệt chưa được cấp quyền hoặc không có webcam).</p>
                    <p class="mb-1">👉 Bấm nút màu xanh dương <b>[ 📸 Chụp ảnh quét ]</b> để chọn ảnh chụp mã vạch.</p>
                    <p class="mb-0">👉 Hoặc bấm nút <b>[ 🍜 Mì Hảo Hảo ]</b> để thử máy tính tiền thối ngay!</p>
                </div>`;
            }

            Swal.fire({
                icon: 'info',
                title: 'Hướng Dẫn Quét Mã Vạch',
                html: msg,
                confirmButtonText: 'Đã hiểu'
            });
        }
    }
}

function stopPosCameraScanner() {
    const container = document.getElementById('posCameraContainer');
    const btnText = document.getElementById('posCameraBtnText');
    if (container) container.classList.add('d-none');
    if (btnText) btnText.innerText = 'Mở Camera Quét';

    if (posCameraScanner) {
        try {
            posCameraScanner.stop().then(() => {
                posCameraScanner.clear();
            }).catch(e => console.warn(e));
        } catch (e) {
            console.warn(e);
        }
    }
}
