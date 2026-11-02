package database;

import models.Category;
import models.Product;
import models.Order;
import models.OrderItem;
import models.User;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Lớp quản lý dữ liệu cho Website Bán Hàng Tạp Hóa.
 * Tương thích mô hình CSDL theo file database.sql.
 */
public class DatabaseHelper {
    private static DatabaseHelper instance;

    private final Map<Integer, Category> categories = new ConcurrentHashMap<>();
    private final Map<Integer, Product> products = new ConcurrentHashMap<>();
    private final Map<Integer, Order> orders = new ConcurrentHashMap<>();
    private final Map<String, User> users = new ConcurrentHashMap<>();
    private final Map<String, Voucher> vouchers = new ConcurrentHashMap<>();
    private final List<Review> reviews = Collections.synchronizedList(new ArrayList<>());
    private final Map<Integer, Integer> userPoints = new ConcurrentHashMap<>();

    private final AtomicInteger productIdGen = new AtomicInteger(100);
    private final AtomicInteger orderIdGen = new AtomicInteger(10);
    private final AtomicInteger orderItemIdGen = new AtomicInteger(10);
    private final AtomicInteger userIdGen = new AtomicInteger(10);
    private final AtomicInteger reviewIdGen = new AtomicInteger(10);

    private DatabaseHelper() {
        initSampleData();
    }

    public static synchronized DatabaseHelper getInstance() {
        if (instance == null) {
            instance = new DatabaseHelper();
        }
        return instance;
    }

    private void initSampleData() {
        // 1. Khởi tạo danh mục hàng tạp hóa
        addCategory(new Category(1, "Mì gói & Thực phẩm khô", "🍜"));
        addCategory(new Category(2, "Nước giải khát & Sữa", "🥤"));
        addCategory(new Category(3, "Gia vị & Dầu ăn", "🧂"));
        addCategory(new Category(4, "Bánh kẹo & Snack", "🍪"));
        addCategory(new Category(5, "Hóa phẩm & Đồ gia dụng", "🧼"));

        // 2. Khởi tạo sản phẩm hàng tạp hóa mẫu
        addProductInternal(new Product(1, "Mì Hảo Hảo tôm chua cay 75g", 1, "Mì gói & Thực phẩm khô", "Gói", 4500, 250, "10/2027", "🍜", "Mì ăn liền quốc dân vị tôm chua cay đậm đà"));
        addProductInternal(new Product(2, "Mì Omachi sườn hầm ngũ quả 80g", 1, "Mì gói & Thực phẩm khô", "Gói", 8500, 120, "11/2027", "🍜", "Sợi mì khoai tây dai ngon, nước sốt sườn hầm đậm vị"));
        addProductInternal(new Product(3, "Phở bò Đệ Nhất gói 68g", 1, "Mì gói & Thực phẩm khô", "Gói", 9000, 80, "09/2027", "🍜", "Bánh phở dẻo mềm, nước cốt xương hầm thơm ngon"));
        addProductInternal(new Product(4, "Gạo ST25 Ông Cua túi 5kg", 1, "Mì gói & Thực phẩm khô", "Túi", 185000, 45, "12/2027", "🍚", "Gạo ngon nhất thế giới, hạt thon dài, dẻo thơm"));

        addProductInternal(new Product(5, "Nước ngọt Coca-Cola lon 320ml", 2, "Nước giải khát & Sữa", "Lon", 10000, 300, "06/2027", "🥤", "Nước giải khát có gas hương cola sảng khoái"));
        addProductInternal(new Product(6, "Nước tăng lực Sting dâu tây đỏ 330ml", 2, "Nước giải khát & Sữa", "Chai", 11000, 180, "08/2027", "🥤", "Nước tăng lực vị dâu thơm ngon, giải nhiệt"));
        addProductInternal(new Product(7, "Sữa tươi tiệt trùng Vinamilk 100% 1L", 2, "Nước giải khát & Sữa", "Hộp", 36000, 60, "05/2027", "🥛", "Sữa tươi nguyên chất có đường tiệt trùng bổ dưỡng"));
        addProductInternal(new Product(8, "Nước khoáng thiên nhiên Lavie 500ml", 2, "Nước giải khát & Sữa", "Chai", 6000, 200, "12/2028", "💧", "Nước khoáng thiên nhiên tinh khiết mỗi ngày"));

        addProductInternal(new Product(9, "Dầu ăn đậu nành Simply chai 1L", 3, "Gia vị & Dầu ăn", "Chai", 58000, 50, "12/2027", "🛢️", "Dầu đậu nành nguyên chất 100%, tốt cho tim mạch"));
        addProductInternal(new Product(10, "Nước mắm Nam Ngư Đệ Nhị chai 900ml", 3, "Gia vị & Dầu ăn", "Chai", 26000, 75, "01/2028", "🍶", "Nước mắm vị đậm đà, thơm ngon cho mọi bữa cơm"));
        addProductInternal(new Product(11, "Hạt nêm Knorr thịt thăn xương ống 400g", 3, "Gia vị & Dầu ăn", "Gói", 34000, 90, "08/2027", "🍲", "Hạt nêm chiết xuất từ thịt thăn và xương hầm"));
        addProductInternal(new Product(12, "Nước tương Tam Thái Tử Nhất Ca 500ml", 3, "Gia vị & Dầu ăn", "Chai", 16000, 110, "10/2027", "🥢", "Nước tương thanh ngọt dịu, chấm hay ướp đều ngon"));

        addProductInternal(new Product(13, "Bánh ChocoPie Orion hộp 12 cái 396g", 4, "Bánh kẹo & Snack", "Hộp", 55000, 40, "07/2027", "🍫", "Bánh xốp phủ sôcôla kẹp kem dẻo marshmallow"));
        addProductInternal(new Product(14, "Bánh quy bơ Cosy Kinh Đô 288g", 4, "Bánh kẹo & Snack", "Hộp", 42000, 60, "09/2027", "🍪", "Bánh quy thơm ngậy hương bơ sữa giòn rụm"));
        addProductInternal(new Product(15, "Snack khoai tây OStar vị tảo biển 90g", 4, "Bánh kẹo & Snack", "Gói", 22000, 85, "08/2027", "🥔", "Khoai tây tươi chiên giòn rụm rắc muối tảo biển"));

        addProductInternal(new Product(16, "Nước giặt OMO Matic cửa trên túi 3.6kg", 5, "Hóa phẩm & Đồ gia dụng", "Túi", 175000, 30, "12/2028", "🧴", "Xoáy bay vết bẩn cứng đầu, thơm ngát hương hoa"));
        addProductInternal(new Product(17, "Nước rửa chén Sunlight Chanh chai 750g", 5, "Hóa phẩm & Đồ gia dụng", "Chai", 28000, 65, "12/2028", "🍋", "Đánh bay dầu mỡ với chiết xuất chanh tươi thiên nhiên"));
        addProductInternal(new Product(18, "Nước lau sàn Sunlight hương hoa hạ 1kg", 5, "Hóa phẩm & Đồ gia dụng", "Chai", 32000, 45, "10/2028", "✨", "Sàn nhà sạch bóng kin kít, thơm ngát bền lâu"));

        // 3. Khởi tạo đơn hàng mẫu
        Order order1 = new Order();
        order1.setId(1);
        order1.setCustomerName("Nguyễn Văn An");
        order1.setPhone("0912345678");
        order1.setAddress("123 Nguyễn Huệ, Quận 1, TP.HCM");
        order1.setNote("Giao giờ hành chính");
        order1.setPaymentMethod("Tiền mặt khi nhận hàng (COD)");
        order1.setOrderDate("2026-10-28 09:15:00");
        order1.setStatus("Đã hoàn thành");
        order1.getItems().add(new OrderItem(1, "Mì Hảo Hảo tôm chua cay 75g", "Gói", 4500, 6));
        order1.setStatus("Hoàn thành");
        order1.setUserId(2);
        order1.getItems().add(new OrderItem(1, "Mì Hảo Hảo tôm chua cay 75g", "Gói", 4500, 6));
        order1.getItems().add(new OrderItem(5, "Nước ngọt Coca-Cola lon 320ml", "Lon", 10000, 5));
        order1.setTotalAmount(77000);
        orders.put(1, order1);

        Order order2 = new Order();
        order2.setId(2);
        order2.setUserId(2);
        order2.setCustomerName("Trần Thị Mai");
        order2.setPhone("0987654321");
        order2.setAddress("45 Lê Lợi, Phường Bến Nghé, Quận 1");
        order2.setNote("Giao trước 17h chiều");
        order2.setPaymentMethod("Chuyển khoản ngân hàng");
        order2.setOrderDate("2026-10-29 08:30:00");
        order2.setStatus("Đang giao hàng");
        order2.getItems().add(new OrderItem(4, "Gạo ST25 Ông Cua túi 5kg", "Túi", 185000, 1));
        order2.getItems().add(new OrderItem(9, "Dầu ăn đậu nành Simply chai 1L", "Chai", 58000, 1));
        order2.setTotalAmount(243000);
        orders.put(2, order2);

        // 4. Khởi tạo tài khoản mẫu
        users.put("admin", new User(1, "admin", "admin123", "Chủ Tiệm Tạp Hóa", "0900000001", "Cửa hàng Tạp Hóa Xanh", "ADMIN"));
        users.put("khachhang", new User(2, "khachhang", "123456", "Nguyễn Văn An", "0912345678", "123 Nguyễn Huệ, Quận 1, TP.HCM", "CUSTOMER"));
        userPoints.put(2, 45); // Khách có 45 điểm

        // 5. Khởi tạo mã giảm giá (Vouchers)
        vouchers.put("TAPHOA10", new Voucher("TAPHOA10", 10, 0, 50000, "Giảm 10% cho đơn từ 50k"));
        vouchers.put("FREESHIP", new Voucher("FREESHIP", 0, 15000, 100000, "Miễn phí ship (giảm 15k)"));
        vouchers.put("GIAM20K", new Voucher("GIAM20K", 0, 20000, 150000, "Giảm ngay 20.000đ cho đơn từ 150k"));
        vouchers.put("CHAOMUNG", new Voucher("CHAOMUNG", 15, 0, 80000, "Ưu đãi khách mới giảm 15%"));

        // 6. Khởi tạo đánh giá mẫu
        reviews.add(new Review(1, 1, 2, "Nguyễn Văn An", 1, 5, "Mì Hảo Hảo date mới tinh, giòn ngon, shop đóng gói cẩn thận!", "2026-10-28 14:20"));
        reviews.add(new Review(2, 5, 2, "Nguyễn Văn An", 1, 5, "Nước ngọt Coca ướp lạnh uống cực đã, giao hàng nhanh 30 phút.", "2026-10-28 14:22"));
        reviews.add(new Review(3, 4, 2, "Trần Thị Mai", 2, 5, "Gạo ST25 chuẩn Ông Cua thơm dẻo, cả nhà mình rất thích.", "2026-10-29 09:10"));
    }

    private void addCategory(Category c) {
        categories.put(c.getId(), c);
    }

    private void addProductInternal(Product p) {
        products.put(p.getId(), p);
    }

    public List<Category> getAllCategories() {
        return new ArrayList<>(categories.values());
    }

    public Category getCategoryById(int id) {
        return categories.get(id);
    }

    public List<Product> getProducts(String keyword, int categoryId) {
        return getProducts(keyword, categoryId, "", "");
    }

    public List<Product> getProducts(String keyword, int categoryId, String priceRange, String sortBy) {
        List<Product> result = new ArrayList<>();
        String kw = (keyword == null) ? "" : keyword.trim().toLowerCase();

        for (Product p : products.values()) {
            boolean matchCat = (categoryId <= 0) || (p.getCategoryId() == categoryId);
            boolean matchKw = kw.isEmpty() || p.getName().toLowerCase().contains(kw) || p.getDescription().toLowerCase().contains(kw);

            // Lọc theo khoảng giá
            boolean matchPrice = true;
            if ("<20k".equals(priceRange)) {
                matchPrice = p.getPrice() < 20000;
            } else if ("20k-50k".equals(priceRange)) {
                matchPrice = p.getPrice() >= 20000 && p.getPrice() <= 50000;
            } else if ("50k-100k".equals(priceRange)) {
                matchPrice = p.getPrice() > 50000 && p.getPrice() <= 100000;
            } else if (">100k".equals(priceRange)) {
                matchPrice = p.getPrice() > 100000;
            }

            if (matchCat && matchKw && matchPrice) {
                result.add(p);
            }
        }

        // Sắp xếp
        if ("price_asc".equals(sortBy)) {
            result.sort(Comparator.comparingDouble(Product::getPrice));
        } else if ("price_desc".equals(sortBy)) {
            result.sort((a, b) -> Double.compare(b.getPrice(), a.getPrice()));
        } else {
            result.sort(Comparator.comparingInt(Product::getId));
        }

        return result;
    }

    public Product getProductById(int id) {
        return products.get(id);
    }

    public Product saveProduct(Product p) {
        if (p.getId() <= 0) {
            p.setId(productIdGen.incrementAndGet());
        }
        Category cat = categories.get(p.getCategoryId());
        if (cat != null) {
            p.setCategoryName(cat.getName());
        }
        products.put(p.getId(), p);
        return p;
    }

    public boolean deleteProduct(int id) {
        return products.remove(id) != null;
    }

    public Order createOrder(Order order) {
        int orderId = orderIdGen.incrementAndGet();
        order.setId(orderId);
        
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        order.setOrderDate(LocalDateTime.now().format(dtf));
        if (order.getStatus() == null || order.getStatus().isEmpty()) {
            order.setStatus("Chờ xử lý");
        }

        double total = 0;
        for (OrderItem item : order.getItems()) {
            item.setOrderId(orderId);
            item.setId(orderItemIdGen.incrementAndGet());
            total += item.getTotalPrice();

            // Trừ số lượng tồn kho của sản phẩm tạp hóa
            Product p = products.get(item.getProductId());
            if (p != null) {
                p.setStock(Math.max(0, p.getStock() - item.getQuantity()));
            }
        }
        order.setTotalAmount(total);
        orders.put(orderId, order);
        return order;
    }

    public boolean deleteOrder(int orderId) {
        return orders.remove(orderId) != null;
    }

    public List<Order> getAllOrders() {
        List<Order> list = new ArrayList<>(orders.values());
        list.sort((a, b) -> Integer.compare(b.getId(), a.getId())); // đơn mới nhất lên đầu
        return list;
    }

    public boolean updateOrderStatus(int orderId, String newStatus) {
        Order o = orders.get(orderId);
        if (o != null) {
            o.setStatus(newStatus);
            return true;
        }
        return false;
    }

    public Map<String, Object> getStats() {
        Map<String, Object> map = new HashMap<>();
        map.put("totalProducts", products.size());
        map.put("totalOrders", orders.size());
        
        double revenue = 0;
        int pendingOrders = 0;
        for (Order o : orders.values()) {
            revenue += o.getTotalAmount();
            if ("Chờ xử lý".equalsIgnoreCase(o.getStatus())) {
                pendingOrders++;
            }
        }
        map.put("totalRevenue", revenue);
        map.put("pendingOrders", pendingOrders);
        return map;
    }

    // --- QUẢN LÝ NGƯỜI DÙNG & XÁC THỰC ---
    public User registerUser(String username, String password, String fullName, String phone, String address) {
        if (username == null || username.trim().isEmpty() || password == null || password.trim().isEmpty()) {
            return null;
        }
        String u = username.trim().toLowerCase();
        if (users.containsKey(u)) {
            return null; // Tên đăng nhập đã tồn tại
        }
        int id = userIdGen.incrementAndGet();
        User newUser = new User(id, u, password.trim(), fullName, phone, address, "CUSTOMER");
        users.put(u, newUser);
        return newUser;
    }

    public User loginUser(String username, String password) {
        if (username == null || password == null) return null;
        String u = username.trim().toLowerCase();
        User user = users.get(u);
        if (user != null && user.getPassword().equals(password.trim())) {
            return user;
        }
        return null;
    }

    public User getUserById(int id) {
        for (User u : users.values()) {
            if (u.getId() == id) return u;
        }
        return null;
    }

    public List<Order> getOrdersByUserId(int userId) {
        List<Order> list = new ArrayList<>();
        for (Order o : orders.values()) {
            if (o.getUserId() == userId) {
                list.add(o);
            }
        }
        list.sort((a, b) -> Integer.compare(b.getId(), a.getId()));
        return list;
    }

    // --- QUẢN LÝ VOUCHER & KHUYẾN MÃI ---
    public static class Voucher {
        public String code;
        public int discountPercent;
        public double discountAmount;
        public double minOrder;
        public String description;

        public Voucher(String code, int discountPercent, double discountAmount, double minOrder, String description) {
            this.code = code;
            this.discountPercent = discountPercent;
            this.discountAmount = discountAmount;
            this.minOrder = minOrder;
            this.description = description;
        }
    }

    public List<Voucher> getAllVouchers() {
        return new ArrayList<>(vouchers.values());
    }

    public Voucher getVoucher(String code) {
        if (code == null) return null;
        return vouchers.get(code.trim().toUpperCase());
    }

    public void addVoucher(Voucher v) {
        if (v != null && v.code != null) {
            vouchers.put(v.code.trim().toUpperCase(), v);
        }
    }

    public boolean deleteVoucher(String code) {
        if (code == null) return false;
        return vouchers.remove(code.trim().toUpperCase()) != null;
    }

    public double calculateDiscount(String code, double subtotal) {
        Voucher v = getVoucher(code);
        if (v == null || subtotal < v.minOrder) return 0;
        if (v.discountPercent > 0) {
            return (subtotal * v.discountPercent) / 100.0;
        }
        return Math.min(v.discountAmount, subtotal);
    }

    // --- QUẢN LÝ ĐÁNH GIÁ (REVIEWS) ---
    public static class Review {
        public int id;
        public int productId;
        public int userId;
        public String userName;
        public int orderId;
        public int rating; // 1 -> 5
        public String comment;
        public String createdAt;

        public Review(int id, int productId, int userId, String userName, int orderId, int rating, String comment, String createdAt) {
            this.id = id;
            this.productId = productId;
            this.userId = userId;
            this.userName = userName;
            this.orderId = orderId;
            this.rating = rating;
            this.comment = comment;
            this.createdAt = createdAt;
        }
    }

    public Review addReview(int productId, int userId, String userName, int orderId, int rating, String comment) {
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        Review r = new Review(reviewIdGen.incrementAndGet(), productId, userId, userName, orderId, rating, comment, LocalDateTime.now().format(dtf));
        reviews.add(r);
        return r;
    }

    public List<Review> getReviewsForProduct(int productId) {
        List<Review> list = new ArrayList<>();
        for (Review r : reviews) {
            if (productId <= 0 || r.productId == productId) {
                list.add(r);
            }
        }
        list.sort((a, b) -> Integer.compare(b.id, a.id));
        return list;
    }

    // --- QUẢN LÝ KHÁCH HÀNG & ĐIỂM TÍCH LŨY ---
    public int getUserPoints(int userId) {
        return userPoints.getOrDefault(userId, 0);
    }

    public void addPoints(int userId, int points) {
        userPoints.put(userId, getUserPoints(userId) + points);
    }

    public String getUserRank(int points) {
        if (points >= 150) return "Vàng";
        if (points >= 50) return "Bạc";
        return "Đồng";
    }

    public boolean updateUser(int id, String fullName, String phone, String address) {
        User u = getUserById(id);
        if (u != null) {
            if (fullName != null && !fullName.trim().isEmpty()) u.setFullName(fullName.trim());
            if (phone != null && !phone.trim().isEmpty()) u.setPhone(phone.trim());
            if (address != null && !address.trim().isEmpty()) u.setAddress(address.trim());
            return true;
        }
        return false;
    }

    public List<Map<String, Object>> getAllUsersInfo() {
        List<Map<String, Object>> list = new ArrayList<>();
        for (User u : users.values()) {
            if ("ADMIN".equals(u.getRole())) continue;
            Map<String, Object> m = new HashMap<>();
            m.put("id", u.getId());
            m.put("username", u.getUsername());
            m.put("fullName", u.getFullName());
            m.put("phone", u.getPhone());
            m.put("address", u.getAddress());
            int pts = getUserPoints(u.getId());
            m.put("points", pts);
            m.put("rank", getUserRank(pts));
            
            // Tính số đơn và tổng chi tiêu
            int countOrders = 0;
            double spent = 0;
            for (Order o : orders.values()) {
                if (o.getUserId() == u.getId()) {
                    countOrders++;
                    spent += o.getTotalAmount();
                }
            }
            m.put("orderCount", countOrders);
            m.put("totalSpent", spent);
            list.add(m);
        }
        return list;
    }

    // --- BÁO CÁO & THỐNG KÊ CHI TIẾT ---
    public Map<String, Object> getAdvancedStats() {
        Map<String, Object> map = new HashMap<>();
        double revenue = 0;
        int completed = 0;
        int pending = 0;

        // Thống kê số lượng bán của từng sản phẩm
        Map<Integer, Integer> soldCountMap = new HashMap<>();
        for (Order o : orders.values()) {
            if (!"Đã hủy".equalsIgnoreCase(o.getStatus())) {
                revenue += o.getTotalAmount();
            }
            if ("Hoàn thành".equalsIgnoreCase(o.getStatus()) || "Đã hoàn thành".equalsIgnoreCase(o.getStatus())) {
                completed++;
            } else if (!"Đã hủy".equalsIgnoreCase(o.getStatus())) {
                pending++;
            }
            for (OrderItem it : o.getItems()) {
                soldCountMap.put(it.getProductId(), soldCountMap.getOrDefault(it.getProductId(), 0) + it.getQuantity());
            }
        }

        double cost = revenue * 0.68; // Chi phí vốn ước tính 68%
        double profit = revenue - cost; // Lợi nhuận ước tính 32%

        map.put("totalRevenue", revenue);
        map.put("totalCost", cost);
        map.put("totalProfit", profit);
        map.put("totalOrders", orders.size());
        map.put("completedOrders", completed);
        map.put("pendingOrders", pending);
        map.put("totalProducts", products.size());

        // Lọc sản phẩm tồn kho thấp (<= 20)
        List<Product> lowStock = new ArrayList<>();
        for (Product p : products.values()) {
            if (p.getStock() <= 20) {
                lowStock.add(p);
            }
        }
        map.put("lowStockCount", lowStock.size());

        // Xếp hạng bán chạy nhất
        List<Map<String, Object>> topSellers = new ArrayList<>();
        for (Product p : products.values()) {
            int sold = soldCountMap.getOrDefault(p.getId(), 0);
            Map<String, Object> sm = new HashMap<>();
            sm.put("id", p.getId());
            sm.put("name", p.getName());
            sm.put("unit", p.getUnit());
            sm.put("price", p.getPrice());
            sm.put("sold", sold);
            sm.put("stock", p.getStock());
            topSellers.add(sm);
        }
        topSellers.sort((a, b) -> Integer.compare((Integer) b.get("sold"), (Integer) a.get("sold")));
        map.put("topSellers", topSellers);

        return map;
    }
}
