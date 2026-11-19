-- ==============================================================
-- CƠ SỞ DỮ LIỆU BÁN HÀNG TẠP HÓA (QLBanTapHoa)
-- Môn: Nhập môn mạng máy tính / Lập trình Web
-- Ngôn ngữ: Java + SQL Server + HTML5/CSS3/JavaScript
-- ==============================================================

-- 1. Tạo Database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'QLBanTapHoa')
BEGIN
    CREATE DATABASE QLBanTapHoa;
END
GO

USE QLBanTapHoa;
GO

-- 2. Xóa bảng cũ nếu tồn tại (theo thứ tự khóa ngoại để không bị lỗi ràng buộc)
IF OBJECT_ID('NhatKyDangNhap', 'U') IS NOT NULL DROP TABLE NhatKyDangNhap;
IF OBJECT_ID('ChiTietDonHang', 'U') IS NOT NULL DROP TABLE ChiTietDonHang;
IF OBJECT_ID('DonHang', 'U') IS NOT NULL DROP TABLE DonHang;
IF OBJECT_ID('SanPham', 'U') IS NOT NULL DROP TABLE SanPham;
IF OBJECT_ID('DanhMuc', 'U') IS NOT NULL DROP TABLE DanhMuc;
IF OBJECT_ID('TaiKhoan', 'U') IS NOT NULL DROP TABLE TaiKhoan;
GO

-- ==============================================================
-- TẠO CÁC BẢNG DỮ LIỆU
-- ==============================================================

-- 2.1. Bảng Tài Khoản (Đăng nhập / Đăng ký thành viên & Admin)
CREATE TABLE TaiKhoan (
    MaTK INT PRIMARY KEY IDENTITY(1,1),
    TenDangNhap VARCHAR(50) UNIQUE NOT NULL,
    MatKhau VARCHAR(100) NOT NULL,
    HoTen NVARCHAR(150) NOT NULL,
    Email VARCHAR(150) NULL,
    SoDienThoai VARCHAR(20) NULL,
    DiaChi NVARCHAR(300) NULL,
    Quyen VARCHAR(20) DEFAULT 'CUSTOMER', -- 'ADMIN' hoặc 'CUSTOMER'
    LanDangNhapCuoi DATETIME NULL,        -- Ghi nhận lần đăng nhập mới nhất
    NgayTao DATETIME DEFAULT GETDATE()
);
GO

-- 2.2. Bảng Nhật Ký Đăng Nhập (Lưu lịch sử ai đăng nhập vào hệ thống)
CREATE TABLE NhatKyDangNhap (
    MaNK INT PRIMARY KEY IDENTITY(1,1),
    MaTK INT FOREIGN KEY REFERENCES TaiKhoan(MaTK),
    TenDangNhap VARCHAR(50) NOT NULL,
    HoTen NVARCHAR(150) NOT NULL,
    ThoiGianDangNhap DATETIME DEFAULT GETDATE(),
    DiaChiIP VARCHAR(50) NULL,
    ThietBi NVARCHAR(255) NULL,
    TrangThai NVARCHAR(50) DEFAULT N'Thành công'
);
GO

-- 3. Bảng Danh Mục Tạp Hóa
CREATE TABLE DanhMuc (
    MaDM INT PRIMARY KEY IDENTITY(1,1),
    TenDM NVARCHAR(100) NOT NULL,
    Icon NVARCHAR(50) NULL
);
GO

-- 4. Bảng Sản Phẩm Tạp Hóa
CREATE TABLE SanPham (
    MaSP INT PRIMARY KEY IDENTITY(1,1),
    TenSP NVARCHAR(255) NOT NULL,
    MaDM INT FOREIGN KEY REFERENCES DanhMuc(MaDM),
    DonViTinh NVARCHAR(50) NOT NULL,    -- Gói, Chai, Lon, Hộp, Thùng, Kg, Bịch...
    GiaBan DECIMAL(18,0) NOT NULL,      -- Giá bán (VNĐ)
    SoLuongTon INT NOT NULL DEFAULT 0,  -- Số lượng tồn kho
    HanSuDung NVARCHAR(50) NULL,        -- Hạn sử dụng (VD: 12/2027)
    HinhAnh NVARCHAR(255) NULL,         -- Đường dẫn icon / ảnh
    MoTa NVARCHAR(500) NULL
);
GO

-- 5. Bảng Đơn Hàng (LƯU TÀI KHOẢN ĐĂNG NHẬP MUA HÀNG)
CREATE TABLE DonHang (
    MaDH INT PRIMARY KEY IDENTITY(1,1),
    MaTK INT NULL FOREIGN KEY REFERENCES TaiKhoan(MaTK), -- Khóa ngoại: Lưu ID tài khoản đã đăng nhập mua (NULL nếu là khách vãng lai)
    TenKhachHang NVARCHAR(150) NOT NULL,
    SoDienThoai VARCHAR(20) NOT NULL,
    DiaChi NVARCHAR(300) NOT NULL,
    GhiChu NVARCHAR(500) NULL,
    TongTien DECIMAL(18,0) NOT NULL,
    PhuongThucTT NVARCHAR(50) DEFAULT N'Tiền mặt khi nhận hàng (COD)',
    NgayDat DATETIME DEFAULT GETDATE(),
    TrangThai NVARCHAR(50) DEFAULT N'Chờ xử lý'
);
GO

-- 6. Bảng Chi Tiết Đơn Hàng
CREATE TABLE ChiTietDonHang (
    MaCT INT PRIMARY KEY IDENTITY(1,1),
    MaDH INT FOREIGN KEY REFERENCES DonHang(MaDH) ON DELETE CASCADE,
    MaSP INT,
    TenSP NVARCHAR(255) NOT NULL,
    DonViTinh NVARCHAR(50) NOT NULL,
    DonGia DECIMAL(18,0) NOT NULL,
    SoLuong INT NOT NULL,
    ThanhTien DECIMAL(18,0) NOT NULL
);
GO

-- ==============================================================
-- CHÈN DỮ LIỆU MẪU CỬA HÀNG TẠP HÓA
-- ==============================================================

-- 1. Tài khoản mẫu
INSERT INTO TaiKhoan (TenDangNhap, MatKhau, HoTen, Email, SoDienThoai, DiaChi, Quyen, LanDangNhapCuoi) VALUES
('phamphuctoan', 'phamphuctoan12@', N'Phạm Phúc Toàn (Chủ Tiệm)', 'phamphuctoan@gmail.com', '0862261874', N'123 Nguyễn Huệ, Quận 1, TP.HCM', 'ADMIN', GETDATE()),
('admin', 'admin123', N'Quản Trị Viên', 'admin@taphoa.vn', '0900000001', N'Cửa hàng Tạp Hóa', 'ADMIN', GETDATE()),
('khachhang', '123456', N'Nguyễn Văn An', 'nguyenvanan@gmail.com', '0912345678', N'123 Nguyễn Huệ, Quận 1, TP.HCM', 'CUSTOMER', GETDATE());
GO

-- 2. Nhật ký đăng nhập mẫu
INSERT INTO NhatKyDangNhap (MaTK, TenDangNhap, HoTen, ThoiGianDangNhap, DiaChiIP, ThietBi, TrangThai) VALUES
(1, 'phamphuctoan', N'Phạm Phúc Toàn (Chủ Tiệm)', DATEADD(MINUTE, -120, GETDATE()), '127.0.0.1', N'Chrome / Windows 10', N'Thành công'),
(3, 'khachhang', N'Nguyễn Văn An', DATEADD(MINUTE, -45, GETDATE()), '192.168.16.222', N'Mobile Safari / iOS', N'Thành công');
GO

-- 3. Danh mục
INSERT INTO DanhMuc (TenDM, Icon) VALUES
(N'Mì gói & Thực phẩm khô', '🍜'),
(N'Đồ uống, Bia & Rượu', '🍺'),
(N'Gia vị & Dầu ăn', '🧂'),
(N'Bánh kẹo & Snack', '🍪'),
(N'Hóa phẩm & Đồ gia dụng', '🧼');
GO

-- 4. Sản phẩm
INSERT INTO SanPham (TenSP, MaDM, DonViTinh, GiaBan, SoLuongTon, HanSuDung, HinhAnh, MoTa) VALUES
(N'Mì Hảo Hảo tôm chua cay 75g', 1, N'Gói', 4500, 250, '10/2027', '🍜', N'Mì ăn liền quốc dân vị tôm chua cay đậm đà'),
(N'Mì Omachi sườn hầm ngũ quả 80g', 1, N'Gói', 8500, 120, '11/2027', '🍜', N'Sợi mì khoai tây dai ngon, nước sốt sườn hầm đậm vị'),
(N'Phở bò Đệ Nhất gói 68g', 1, N'Gói', 9000, 80, '09/2027', '🍜', N'Bánh phở dẻo mềm, nước cốt xương hầm thơm ngon'),
(N'Gạo ST25 Ông Cua túi 5kg', 1, N'Túi', 185000, 45, '12/2027', '🍚', N'Gạo ngon nhất thế giới, hạt thon dài, dẻo thơm'),

(N'Nước ngọt Coca-Cola lon 320ml', 2, N'Lon', 10000, 300, '06/2027', '🥤', N'Nước giải khát có gas hương cola sảng khoái'),
(N'Nước tăng lực Sting dâu tây đỏ 330ml', 2, N'Chai', 11000, 180, '08/2027', '🥤', N'Nước tăng lực có gas vị dâu tây thơm ngon, giải nhiệt'),
(N'Sữa tươi tiệt trùng Vinamilk 100% 1L', 2, N'Hộp', 36000, 60, '05/2027', '🥛', N'Sữa tươi nguyên chất có đường tiệt trùng bổ dưỡng'),
(N'Nước khoáng thiên nhiên Lavie 500ml', 2, N'Chai', 6000, 200, '12/2028', '💧', N'Nước khoáng thiên nhiên tinh khiết mỗi ngày'),

(N'Dầu ăn đậu nành Simply chai 1L', 3, N'Chai', 58000, 50, '12/2027', '🛢️', N'Dầu đậu nành nguyên chất 100%, tốt cho tim mạch'),
(N'Nước mắm Nam Ngư Đệ Nhị chai 900ml', 3, N'Chai', 26000, 75, '01/2028', '🍶', N'Nước mắm vị đậm đà, thơm ngon cho mọi bữa ăn gia đình'),
(N'Hạt nêm Knorr thịt thăn xương ống 400g', 3, N'Gói', 34000, 90, '08/2027', '🍲', N'Hạt nêm chiết xuất từ thịt thăn và xương ống hầm'),
(N'Nước tương Tam Thái Tử Nhất Ca 500ml', 3, N'Chai', 16000, 110, '10/2027', '🥢', N'Nước tương thanh ngọt dịu, chấm hay ướp đều ngon'),

(N'Bánh ChocoPie Orion hộp 12 cái 396g', 4, N'Hộp', 55000, 40, '07/2027', '🍫', N'Bánh xốp phủ sôcôla kẹp kem dẻo marshmallow dẻo dai'),
(N'Bánh quy bơ Cosy Kinh Đô 288g', 4, N'Hộp', 42000, 60, '09/2027', '🍪', N'Bánh quy thơm ngậy hương bơ sữa giòn rụm'),
(N'Snack khoai tây OStar vị tảo biển 90g', 4, N'Gói', 22000, 85, '08/2027', '🥔', N'Khoai tây tươi chiên giòn rụm rắc muối tảo biển thơm ngon'),

(N'Nước giặt OMO Matic cửa trên túi 3.6kg', 5, N'Túi', 175000, 30, '12/2028', '🧴', N'Xoáy bay vết bẩn cứng đầu, thơm hương hoa tươi mát'),
(N'Nước rửa chén Sunlight Chanh chai 750g', 5, N'Chai', 28000, 65, '12/2028', '🍋', N'Đánh bay dầu mỡ nhanh chóng với chiết xuất chanh tươi'),
(N'Nước lau sàn Sunlight hương hoa hạ 1kg', 5, N'Chai', 32000, 45, '10/2028', '✨', N'Sàn nhà sạch bóng, thơm dịu ngát hương hoa'),

-- Các mặt hàng Bia & Rượu mẫu
(N'Bia Larue lon 330ml', 2, N'Lon', 12500, 240, '12/2027', '/images/sp19_larue.jpg', N'Bia Larue vị êm đậm đà thơm mát, chất lượng vàng từ 1909'),
(N'Bia Tiger Crystal lon cao 330ml', 2, N'Lon', 19500, 300, '11/2027', '/images/sp20_tiger.jpg', N'Bia Tiger Crystal lọc lạnh ở -1°C tạo vị sảng khoái tột đỉnh'),
(N'Bia Heineken Silver lon cao 330ml', 2, N'Lon', 21500, 250, '10/2027', '/images/sp21_heineken.jpg', N'Bia Heineken Silver hương vị nhẹ êm sang trọng chuẩn quốc tế'),
(N'Bia Sài Gòn Special lon 330ml', 2, N'Lon', 16500, 180, '12/2027', '/images/sp22_saigon.jpg', N'Bia Sài Gòn Special 100% đại mạch hảo hạng đậm đà bản sắc Việt'),
(N'Rượu Vang Đà Lạt Classic đỏ 750ml', 2, N'Chai', 95000, 50, '05/2030', '/images/sp23_vangdalat.jpg', N'Rượu vang đỏ Đà Lạt lên men từ nho Cardinal và quả dâu tằm'),
(N'Rượu Vodka Hà Nội chai 700ml 39.5 độ', 2, N'Chai', 85000, 65, '12/2035', '/images/sp24_vodka.jpg', N'Vodka Hà Nội tinh khiết chưng cất từ gạo nếp qua tháp lọc bạc Halico'),
(N'Rượu Soju Jinro Chamisul chai 360ml', 2, N'Chai', 65000, 90, '12/2035', '/images/sp25_soju.jpg', N'Rượu Soju truyền thống Hàn Quốc lọc qua than tre tự nhiên êm dịu');
GO

-- 5. Thêm đơn hàng mẫu (Kèm MaTK để biết ai đã đăng nhập mua)
INSERT INTO DonHang (MaTK, TenKhachHang, SoDienThoai, DiaChi, GhiChu, TongTien, PhuongThucTT, TrangThai) VALUES
(3, N'Nguyễn Văn An', '0912345678', N'123 Nguyễn Huệ, Quận 1, TP.HCM', N'Giao giờ hành chính', 77000, N'Tiền mặt khi nhận hàng (COD)', N'Đã hoàn thành'),
(3, N'Nguyễn Văn An', '0912345678', N'123 Nguyễn Huệ, Quận 1, TP.HCM', N'Giao tận tay', 233000, N'Chuyển khoản MoMo', N'Chờ xử lý'),
(NULL, N'Trần Thị Mai (Khách vãng lai)', '0987654321', N'45 Lê Lợi, Phường Bến Nghé, Quận 1', N'Giao hàng tận cửa', 140000, N'Chuyển khoản MoMo', N'Chờ xử lý');
GO

-- 6. Chi tiết từng đơn hàng
INSERT INTO ChiTietDonHang (MaDH, MaSP, TenSP, DonViTinh, DonGia, SoLuong, ThanhTien) VALUES
(1, 1, N'Mì Hảo Hảo tôm chua cay 75g', N'Gói', 4500, 6, 27000),
(1, 5, N'Nước ngọt Coca-Cola lon 320ml', N'Lon', 10000, 5, 50000),
(2, 4, N'Gạo ST25 Ông Cua túi 5kg', N'Túi', 185000, 1, 185000),
(2, 9, N'Dầu ăn đậu nành Simply chai 1L', N'Chai', 48000, 1, 48000),
(3, 20, N'Bia Tiger Crystal lon cao 330ml', N'Lon', 19500, 6, 117000),
(3, 14, N'Snack khoai tây OStar vị tảo biển 90g', N'Gói', 22000, 1, 22000);
GO

-- ==============================================================
-- CÁC CÂU LỆNH TRUY VẤN MẪU (BÁO CÁO SQL CHO GIẢNG VIÊN)
-- ==============================================================

-- 📌 CÂU 1: Xem tất cả đơn hàng kèm tên tài khoản đã đăng nhập mua
-- (Nếu là khách vãng lai không đăng nhập, cột TenDangNhap sẽ hiển thị 'Khách vãng lai')
SELECT 
    dh.MaDH,
    ISNULL(tk.TenDangNhap, N'Khách vãng lai') AS TenDangNhap,
    ISNULL(tk.HoTen, dh.TenKhachHang) AS HoTenTaiKhoan,
    dh.TenKhachHang AS NguoiNhanHang,
    dh.SoDienThoai,
    dh.TongTien,
    dh.PhuongThucTT,
    dh.NgayDat,
    dh.TrangThai
FROM DonHang dh
LEFT JOIN TaiKhoan tk ON dh.MaTK = tk.MaTK
ORDER BY dh.NgayDat DESC;
GO

-- 📌 CÂU 2: Thống kê chi tiết tài khoản 'khachhang' đã đăng nhập và mua những món gì
SELECT 
    tk.TenDangNhap,
    tk.HoTen,
    dh.MaDH,
    dh.NgayDat,
    ct.TenSP,
    ct.DonViTinh,
    ct.DonGia,
    ct.SoLuong,
    ct.ThanhTien
FROM TaiKhoan tk
JOIN DonHang dh ON tk.MaTK = dh.MaTK
JOIN ChiTietDonHang ct ON dh.MaDH = ct.MaDH
WHERE tk.TenDangNhap = 'khachhang'
ORDER BY dh.NgayDat DESC;
GO

-- 📌 CÂU 3: Xem nhật ký ai vừa đăng nhập vào hệ thống gần đây nhất
SELECT 
    nk.MaNK,
    nk.TenDangNhap,
    nk.HoTen,
    nk.ThoiGianDangNhap,
    nk.DiaChiIP,
    nk.ThietBi,
    nk.TrangThai
FROM NhatKyDangNhap nk
ORDER BY nk.ThoiGianDangNhap DESC;
GO

-- 📌 CÂU 4: Tổng hợp doanh số mua hàng của từng tài khoản khách hàng
SELECT 
    ISNULL(tk.TenDangNhap, N'Khách vãng lai') AS TaiKhoan,
    COUNT(dh.MaDH) AS SoDonDaDat,
    SUM(dh.TongTien) AS TongTienDaMua
FROM DonHang dh
LEFT JOIN TaiKhoan tk ON dh.MaTK = tk.MaTK
GROUP BY tk.TenDangNhap;
GO
