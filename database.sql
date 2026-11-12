-- ==============================================================
-- CƠ SỞ DỮ LIỆU BÁN HÀNG TẠP HÓA (QLBanTapHoa)
-- Môn: Nhập môn mạng máy tính / Lập trình Web
-- Ngôn ngữ: Java + SQL + HTML/CSS/JS
-- ==============================================================

-- 1. Tạo Database
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'QLBanTapHoa')
BEGIN
    CREATE DATABASE QLBanTapHoa;
END
GO

USE QLBanTapHoa;
GO

-- 2. Xóa bảng cũ nếu tồn tại (để chạy lại script không bị lỗi)
IF OBJECT_ID('ChiTietDonHang', 'U') IS NOT NULL DROP TABLE ChiTietDonHang;
IF OBJECT_ID('DonHang', 'U') IS NOT NULL DROP TABLE DonHang;
IF OBJECT_ID('SanPham', 'U') IS NOT NULL DROP TABLE SanPham;
IF OBJECT_ID('DanhMuc', 'U') IS NOT NULL DROP TABLE DanhMuc;
IF OBJECT_ID('TaiKhoan', 'U') IS NOT NULL DROP TABLE TaiKhoan;
GO

-- 2.1. Tạo bảng Tài Khoản (Đăng nhập / Đăng ký)
CREATE TABLE TaiKhoan (
    MaTK INT PRIMARY KEY IDENTITY(1,1),
    TenDangNhap VARCHAR(50) UNIQUE NOT NULL,
    MatKhau VARCHAR(100) NOT NULL,
    HoTen NVARCHAR(150) NOT NULL,
    SoDienThoai VARCHAR(20) NULL,
    DiaChi NVARCHAR(300) NULL,
    Quyen VARCHAR(20) DEFAULT 'CUSTOMER', -- 'ADMIN' hoặc 'CUSTOMER'
    NgayTao DATETIME DEFAULT GETDATE()
);
GO

-- 3. Tạo bảng Danh Mục Tạp Hóa
CREATE TABLE DanhMuc (
    MaDM INT PRIMARY KEY IDENTITY(1,1),
    TenDM NVARCHAR(100) NOT NULL,
    Icon NVARCHAR(50) NULL
);
GO

-- 4. Tạo bảng Sản Phẩm Tạp Hóa
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

-- 5. Tạo bảng Đơn Hàng
CREATE TABLE DonHang (
    MaDH INT PRIMARY KEY IDENTITY(1,1),
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

-- 6. Tạo bảng Chi Tiết Đơn Hàng
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

-- Tài khoản mẫu (admin / khachhang)
INSERT INTO TaiKhoan (TenDangNhap, MatKhau, HoTen, SoDienThoai, DiaChi, Quyen) VALUES
('admin', 'admin123', N'Chủ Tiệm Tạp Hóa', '0900000001', N'Cửa hàng Tạp Hóa', 'ADMIN'),
('khachhang', '123456', N'Nguyễn Văn An', '0912345678', N'123 Nguyễn Huệ, Quận 1, TP.HCM', 'CUSTOMER');
GO

-- Danh mục
INSERT INTO DanhMuc (TenDM, Icon) VALUES
(N'Mì gói & Thực phẩm khô', '🍜'),
(N'Nước giải khát & Sữa', '🥤'),
(N'Gia vị & Dầu ăn', '🧂'),
(N'Bánh kẹo & Snack', '🍪'),
(N'Hóa phẩm & Đồ gia dụng', '🧼');
GO

-- Sản phẩm
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
(N'Nước lau sàn Sunlight hương hoa hạ 1kg', 5, N'Chai', 32000, 45, '10/2028', '✨', N'Sàn nhà sạch bóng, thơm dịu ngát hương hoa');
GO

-- Thêm đơn hàng mẫu
INSERT INTO DonHang (TenKhachHang, SoDienThoai, DiaChi, GhiChu, TongTien, PhuongThucTT, TrangThai) VALUES
(N'Nguyễn Văn An', '0912345678', N'123 Nguyễn Huệ, Quận 1, TP.HCM', N'Giao giờ hành chính', 77000, N'Tiền mặt khi nhận hàng (COD)', N'Đã hoàn thành'),
(N'Trần Thị Mai', '0987654321', N'45 Lê Lợi, Phường Bến Nghé, Quận 1', N'Giao hàng tận cửa', 233000, N'Chuyển khoản ngân hàng', N'Chờ xử lý');
GO

INSERT INTO ChiTietDonHang (MaDH, MaSP, TenSP, DonViTinh, DonGia, SoLuong, ThanhTien) VALUES
(1, 1, N'Mì Hảo Hảo tôm chua cay 75g', N'Gói', 4500, 6, 27000),
(1, 5, N'Nước ngọt Coca-Cola lon 320ml', N'Lon', 10000, 5, 50000),
(2, 4, N'Gạo ST25 Ông Cua túi 5kg', N'Túi', 185000, 1, 185000),
(2, 9, N'Dầu ăn đậu nành Simply chai 1L', N'Chai', 48000, 1, 48000);
GO
