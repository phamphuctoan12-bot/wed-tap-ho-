# 🏪 WEBSITE BÁN HÀNG TẠP HÓA (BÁCH HÓA ONLINE)

Dự án website bán hàng tạp hóa đơn giản, phục vụ môn học **Nhập Môn Mạng Máy Tính / Lập Trình Web**.

---

## 🛠️ Công Nghệ Sử Dụng

1. **Backend**:
   - Ngôn ngữ: **Java (JDK 17)**
   - Máy chủ HTTP: `com.sun.net.httpserver.HttpServer` (Tích hợp sẵn trong Java standard library, chạy trực tiếp mà không cần cài Tomcat).
   - Mô hình: **Client - Server** qua giao thức **HTTP (TCP/IP port 8080)**, RESTful API (GET, POST, PUT, DELETE).
2. **Cơ Sở Dữ Liệu**:
   - File kịch bản: `database.sql` (Chuẩn T-SQL cho Microsoft SQL Server / MySQL).
   - Các bảng chính: `DanhMuc`, `SanPham`, `DonHang`, `ChiTietDonHang`.
   - Có sẵn bộ dữ liệu mẫu phong phú các mặt hàng tạp hoá (Mì gói, nước giải khát, dầu ăn, gia vị, bánh kẹo, hóa phẩm).
3. **Frontend**:
   - **HTML5, CSS3, JavaScript** (ES6).
   - **Bootstrap 5 & Bootstrap Icons**: Giao diện chuẩn Bách Hóa Xanh, hiển thị đẹp mắt trên máy tính và điện thoại.
   - **SweetAlert2**: Thông báo đặt hàng, thêm giỏ hàng sinh động.

---

## 📂 Cấu Trúc Thư Mục Dự Án

```
d:\nhập môn mạng\WebBanTapHoa\
│
├── run.bat                     <- File click đúp chuột để chạy trang web
├── database.sql                <- File kịch bản tạo CSDL và dữ liệu mẫu
├── README.md                   <- Hướng dẫn sử dụng
│
├── bin/                        <- Thư mục chứa mã byte-code sau khi compile
│
├── src/                        <- Mã nguồn Java
│   ├── models/
│   │   ├── Category.java       <- Đối tượng danh mục hàng
│   │   ├── Product.java        <- Đối tượng sản phẩm tạp hoá (ĐVT, giá, HSD, tồn kho)
│   │   ├── Order.java          <- Đối tượng đơn đặt hàng
│   │   └── OrderItem.java      <- Đối tượng chi tiết đơn hàng
│   ├── database/
│   │   └── DatabaseHelper.java <- Quản lý dữ liệu, tồn kho, tính tiền
│   └── WebServer.java          <- Máy chủ web, xử lý HTTP request/response & API
│
└── public/                     <- Giao diện Web (HTML, CSS, JS)
    ├── index.html              <- Trang chủ mua sắm của khách hàng
    ├── admin.html              <- Trang quản trị cho chủ tiệm tạp hóa
    ├── css/
    │   └── style.css           <- Giao diện phong cách siêu thị bách hóa xanh
    └── js/
        └── app.js              <- Xử lý giỏ hàng, tìm kiếm, đặt hàng, gọi API
```

---

## 🚀 Hướng Dẫn Chạy Trang Web

### Cách 1: Chạy bằng file `run.bat` (Đơn giản nhất)
1. Mở thư mục `d:\nhập môn mạng\WebBanTapHoa`.
2. Click đúp vào file **`run.bat`**.
3. Hệ thống sẽ tự động biên dịch Java và mở trình duyệt lên tại:
   - **Trang mua hàng**: `http://localhost:8080/`
   - **Trang quản trị**: `http://localhost:8080/admin.html`

### Cách 2: Chạy bằng lệnh trong Terminal / PowerShell
```powershell
cd "d:\nhập môn mạng\WebBanTapHoa"
javac -encoding UTF-8 -d bin src/models/*.java src/database/*.java src/WebServer.java
java -cp bin WebServer
```

---

## 🛒 Các Tính Năng Đã Cài Đặt

### 1. Dành cho Khách mua hàng (`/` hoặc `/index.html`)
* **Xem danh mục hàng tạp hóa**:
  * 🍜 Mì gói & Thực phẩm khô
  * 🥤 Nước giải khát & Sữa
  * 🧂 Gia vị & Dầu ăn
  * 🍪 Bánh kẹo & Snack
  * 🧼 Hóa phẩm & Đồ gia dụng
* **Thông tin sản phẩm đầy đủ**: Tên sản phẩm, Đơn vị tính (*Gói, Chai, Lon, Hộp, Túi, Kg*), Giá tiền VNĐ, Tồn kho, Hạn sử dụng (HSD).
* **Tìm kiếm & Lọc**: Gõ tên món hàng hoặc bấm vào danh mục để lọc nhanh.
* **Giỏ hàng**: Thêm sản phẩm, tăng/giảm số lượng, xóa sản phẩm, tính tổng tiền tự động.
* **Đặt hàng**: Nhập thông tin người nhận, địa chỉ, chọn hình thức thanh toán (Tiền mặt COD hoặc Chuyển khoản). Tự động cập nhật giảm số lượng tồn kho.

### 2. Dành cho Chủ tiệm (`/admin.html`)
* **Thống kê nhanh**: Tổng số mặt hàng, tổng đơn hàng, đơn chờ duyệt, tổng doanh thu.
* **Quản lý đơn hàng**: Xem chi tiết người mua, danh sách món hàng đã mua, chuyển trạng thái đơn (*Chờ xử lý* -> *Đang giao* -> *Đã hoàn thành*).
* **Quản lý kho hàng**: Thêm mặt hàng tạp hóa mới, xóa mặt hàng khỏi kho.
