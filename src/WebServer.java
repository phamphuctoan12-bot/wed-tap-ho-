import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;
import database.DatabaseHelper;
import models.Category;
import models.Order;
import models.OrderItem;
import models.Product;
import models.User;
import models.InventoryLog;

import java.io.*;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.util.*;

/**
 * WebServer Bán Hàng Tạp Hóa (Java Built-in HTTP Server)
 * Chạy trực tiếp với Java 17 mà không cần cài thêm Tomcat hay Maven.
 */
public class WebServer {
    private static final int PORT = 8080;
    private static final String PUBLIC_DIR = "public";

    private static final long SERVER_START_TIME = System.currentTimeMillis();
    private static final java.util.concurrent.atomic.AtomicLong totalRequests = new java.util.concurrent.atomic.AtomicLong(0);
    private static final java.util.concurrent.atomic.AtomicLong totalBytesSent = new java.util.concurrent.atomic.AtomicLong(0);

    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        
        DatabaseHelper db = DatabaseHelper.getInstance();

        // 1. Route phục vụ Static Files (HTML, CSS, JS)
        server.createContext("/", new StaticFileHandler());

        // 2. Route APIs
        server.createContext("/api/categories", exchange -> {
            if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                List<Category> list = db.getAllCategories();
                StringBuilder json = new StringBuilder("[");
                for (int i = 0; i < list.size(); i++) {
                    Category c = list.get(i);
                    json.append(String.format("{\"id\":%d,\"name\":\"%s\",\"icon\":\"%s\"}",
                            c.getId(), escapeJson(c.getName()), escapeJson(c.getIcon())));
                    if (i < list.size() - 1) json.append(",");
                }
                json.append("]");
                sendJsonResponse(exchange, 200, json.toString());
            } else {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
        });

        server.createContext("/api/products", exchange -> {
            String method = exchange.getRequestMethod().toUpperCase();
            if ("GET".equals(method)) {
                Map<String, String> query = parseQuery(exchange.getRequestURI().getQuery());
                String kw = query.getOrDefault("keyword", "");
                int catId = 0;
                try {
                    catId = Integer.parseInt(query.getOrDefault("category", "0"));
                } catch (Exception ignored) {}
                String priceRange = query.getOrDefault("price", "");
                String sortBy = query.getOrDefault("sort", "");

                List<Product> list = db.getProducts(kw, catId, priceRange, sortBy);
                StringBuilder json = new StringBuilder("[");
                for (int i = 0; i < list.size(); i++) {
                    Product p = list.get(i);
                    json.append(productToJson(p));
                    if (i < list.size() - 1) json.append(",");
                }
                json.append("]");
                sendJsonResponse(exchange, 200, json.toString());

            } else if ("POST".equals(method)) {
                String body = readBody(exchange);
                Product p = parseProductJson(body);
                db.saveProduct(p);
                sendJsonResponse(exchange, 200, "{\"success\":true,\"message\":\"Lưu sản phẩm thành công\",\"id\":" + p.getId() + "}");

            } else if ("DELETE".equals(method)) {
                Map<String, String> query = parseQuery(exchange.getRequestURI().getQuery());
                int id = Integer.parseInt(query.getOrDefault("id", "0"));
                boolean ok = db.deleteProduct(id);
                sendJsonResponse(exchange, 200, "{\"success\":" + ok + "}");

            } else {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
        });

        server.createContext("/api/orders", exchange -> {
            String method = exchange.getRequestMethod().toUpperCase();
            if ("GET".equals(method)) {
                Map<String, String> query = parseQuery(exchange.getRequestURI().getQuery());
                if (query.containsKey("barcode") || query.containsKey("code") || query.containsKey("id") || query.containsKey("query")) {
                    String q = query.getOrDefault("barcode", query.getOrDefault("code", query.getOrDefault("id", query.get("query"))));
                    Order o = db.findOrderByBarcodeOrQuery(q);
                    if (o != null) {
                        sendJsonResponse(exchange, 200, "{\"success\":true,\"order\":" + orderToJson(o) + "}");
                    } else {
                        sendJsonResponse(exchange, 404, "{\"success\":false,\"message\":\"Không tìm thấy đơn hàng theo mã vạch: " + escapeJson(q) + "\"}");
                    }
                    return;
                }

                List<Order> list = db.getAllOrders();
                StringBuilder json = new StringBuilder("[");
                for (int i = 0; i < list.size(); i++) {
                    Order o = list.get(i);
                    json.append(orderToJson(o));
                    if (i < list.size() - 1) json.append(",");
                }
                json.append("]");
                sendJsonResponse(exchange, 200, json.toString());

            } else if ("POST".equals(method)) {
                String body = readBody(exchange);
                Order order = parseOrderJson(body, db);
                if (order == null || order.getItems().isEmpty()) {
                    sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"Giỏ hàng trống hoặc thông tin không hợp lệ!\"}");
                    return;
                }
                db.createOrder(order);
                sendJsonResponse(exchange, 200, "{\"success\":true,\"message\":\"Đặt hàng thành công!\",\"orderId\":" + order.getId() + "}");

            } else if ("PUT".equals(method)) {
                String body = readBody(exchange);
                Map<String, String> data = parseSimpleJson(body);
                int orderId = Integer.parseInt(data.getOrDefault("orderId", "0"));
                String newStatus = data.getOrDefault("status", "Chờ xử lý");
                boolean ok = db.updateOrderStatus(orderId, newStatus);
                sendJsonResponse(exchange, 200, "{\"success\":" + ok + "}");

            } else if ("DELETE".equals(method)) {
                Map<String, String> query = parseQuery(exchange.getRequestURI().getQuery());
                int orderId = Integer.parseInt(query.getOrDefault("id", "0"));
                boolean ok = db.deleteOrder(orderId);
                sendJsonResponse(exchange, 200, "{\"success\":" + ok + "}");

            } else {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
        });

        server.createContext("/api/stats", exchange -> {
            if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                Map<String, Object> stats = db.getStats();
                String json = String.format("{\"totalProducts\":%s,\"totalOrders\":%s,\"totalRevenue\":%.0f,\"pendingOrders\":%s}",
                        stats.get("totalProducts"), stats.get("totalOrders"), (Double) stats.get("totalRevenue"), stats.get("pendingOrders"));
                sendJsonResponse(exchange, 200, json);
            } else {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
        });

        // 3. API Đăng Nhập & Đăng Ký
        server.createContext("/api/auth/login", exchange -> {
            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                String body = readBody(exchange);
                Map<String, String> data = parseSimpleJson(body);
                String u = data.getOrDefault("username", "");
                String p = data.getOrDefault("password", "");
                User user = db.loginUser(u, p);
                if (user != null) {
                    String userJson = String.format("{\"id\":%d,\"username\":\"%s\",\"fullName\":\"%s\",\"phone\":\"%s\",\"address\":\"%s\",\"role\":\"%s\"}",
                            user.getId(), escapeJson(user.getUsername()), escapeJson(user.getFullName()),
                            escapeJson(user.getPhone()), escapeJson(user.getAddress()), user.getRole());
                    sendJsonResponse(exchange, 200, "{\"success\":true,\"message\":\"Đăng nhập thành công!\",\"user\":" + userJson + "}");
                } else {
                    sendJsonResponse(exchange, 401, "{\"success\":false,\"message\":\"Sai tên đăng nhập hoặc mật khẩu!\"}");
                }
            } else {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
        });

        server.createContext("/api/auth/register", exchange -> {
            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                String body = readBody(exchange);
                Map<String, String> data = parseSimpleJson(body);
                String u = data.getOrDefault("username", "");
                String p = data.getOrDefault("password", "");
                String fn = data.getOrDefault("fullName", "");
                String ph = data.getOrDefault("phone", "");
                String addr = data.getOrDefault("address", "");

                User newUser = db.registerUser(u, p, fn, ph, addr);
                if (newUser != null) {
                    String userJson = String.format("{\"id\":%d,\"username\":\"%s\",\"fullName\":\"%s\",\"phone\":\"%s\",\"address\":\"%s\",\"role\":\"%s\"}",
                            newUser.getId(), escapeJson(newUser.getUsername()), escapeJson(newUser.getFullName()),
                            escapeJson(newUser.getPhone()), escapeJson(newUser.getAddress()), newUser.getRole());
                    sendJsonResponse(exchange, 200, "{\"success\":true,\"message\":\"Đăng ký tài khoản thành công!\",\"user\":" + userJson + "}");
                } else {
                    sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"Tên đăng nhập đã tồn tại hoặc không hợp lệ!\"}");
                }
            } else {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
        });

        server.createContext("/api/user/orders", exchange -> {
            if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                Map<String, String> query = parseQuery(exchange.getRequestURI().getQuery());
                int userId = Integer.parseInt(query.getOrDefault("userId", "0"));
                List<Order> list = db.getOrdersByUserId(userId);
                StringBuilder json = new StringBuilder("[");
                for (int i = 0; i < list.size(); i++) {
                    Order o = list.get(i);
                    json.append(orderToJson(o));
                    if (i < list.size() - 1) json.append(",");
                }
                json.append("]");
                sendJsonResponse(exchange, 200, json.toString());
            } else {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
        });

        // 4. API Mã Giảm Giá (Vouchers)
        server.createContext("/api/vouchers", exchange -> {
            String method = exchange.getRequestMethod().toUpperCase();
            if ("GET".equals(method)) {
                List<DatabaseHelper.Voucher> list = db.getAllVouchers();
                StringBuilder json = new StringBuilder("[");
                for (int i = 0; i < list.size(); i++) {
                    DatabaseHelper.Voucher v = list.get(i);
                    json.append(String.format("{\"code\":\"%s\",\"discountPercent\":%d,\"discountAmount\":%.0f,\"minOrder\":%.0f,\"description\":\"%s\"}",
                            escapeJson(v.code), v.discountPercent, v.discountAmount, v.minOrder, escapeJson(v.description)));
                    if (i < list.size() - 1) json.append(",");
                }
                json.append("]");
                sendJsonResponse(exchange, 200, json.toString());
            } else if ("POST".equals(method)) {
                String body = readBody(exchange);
                Map<String, String> data = parseSimpleJson(body);
                String code = data.getOrDefault("code", "").trim();
                int pct = 0;
                double amt = 0, min = 0;
                try { pct = Integer.parseInt(data.getOrDefault("discountPercent", "0")); } catch (Exception ignored) {}
                try { amt = Double.parseDouble(data.getOrDefault("discountAmount", "0")); } catch (Exception ignored) {}
                try { min = Double.parseDouble(data.getOrDefault("minOrder", "0")); } catch (Exception ignored) {}
                String desc = data.getOrDefault("description", "");
                db.addVoucher(new DatabaseHelper.Voucher(code, pct, amt, min, desc));
                sendJsonResponse(exchange, 200, "{\"success\":true}");
            } else if ("DELETE".equals(method)) {
                Map<String, String> q = parseQuery(exchange.getRequestURI().getQuery());
                String code = q.getOrDefault("code", "");
                boolean ok = db.deleteVoucher(code);
                sendJsonResponse(exchange, 200, "{\"success\":" + ok + "}");
            } else {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
        });

        server.createContext("/api/vouchers/apply", exchange -> {
            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                String body = readBody(exchange);
                Map<String, String> data = parseSimpleJson(body);
                String code = data.getOrDefault("code", "").trim();
                double subtotal = 0;
                try { subtotal = Double.parseDouble(data.getOrDefault("subtotal", "0")); } catch (Exception ignored) {}
                DatabaseHelper.Voucher v = db.getVoucher(code);
                if (v == null) {
                    sendJsonResponse(exchange, 200, "{\"valid\":false,\"message\":\"Mã giảm giá không tồn tại!\"}");
                } else if (subtotal < v.minOrder) {
                    sendJsonResponse(exchange, 200, String.format("{\"valid\":false,\"message\":\"Đơn hàng tối thiểu phải từ %.0f đ để áp dụng mã này!\"}", v.minOrder));
                } else {
                    double disc = db.calculateDiscount(code, subtotal);
                    sendJsonResponse(exchange, 200, String.format("{\"valid\":true,\"discount\":%.0f,\"code\":\"%s\",\"desc\":\"%s\"}", disc, escapeJson(v.code), escapeJson(v.description)));
                }
            } else {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
        });

        // 5. API Đánh Giá & Phản Hồi (Reviews)
        server.createContext("/api/reviews", exchange -> {
            String method = exchange.getRequestMethod().toUpperCase();
            if ("GET".equals(method)) {
                Map<String, String> q = parseQuery(exchange.getRequestURI().getQuery());
                int pId = Integer.parseInt(q.getOrDefault("productId", "0"));
                List<DatabaseHelper.Review> list = db.getReviewsForProduct(pId);
                StringBuilder json = new StringBuilder("[");
                for (int i = 0; i < list.size(); i++) {
                    DatabaseHelper.Review r = list.get(i);
                    json.append(String.format("{\"id\":%d,\"productId\":%d,\"userName\":\"%s\",\"rating\":%d,\"comment\":\"%s\",\"createdAt\":\"%s\"}",
                            r.id, r.productId, escapeJson(r.userName), r.rating, escapeJson(r.comment), escapeJson(r.createdAt)));
                    if (i < list.size() - 1) json.append(",");
                }
                json.append("]");
                sendJsonResponse(exchange, 200, json.toString());
            } else if ("POST".equals(method)) {
                String body = readBody(exchange);
                Map<String, String> data = parseSimpleJson(body);
                int pId = Integer.parseInt(data.getOrDefault("productId", "0"));
                int uId = Integer.parseInt(data.getOrDefault("userId", "0"));
                String uName = data.getOrDefault("userName", "Khách hàng");
                int oId = Integer.parseInt(data.getOrDefault("orderId", "0"));
                int rating = Integer.parseInt(data.getOrDefault("rating", "5"));
                String comment = data.getOrDefault("comment", "");
                DatabaseHelper.Review rev = db.addReview(pId, uId, uName, oId, rating, comment);
                sendJsonResponse(exchange, 200, "{\"success\":true,\"id\":" + rev.id + "}");
            } else {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
        });

        // 6. API Khách Hàng (Users & Điểm tích lũy)
        server.createContext("/api/users", exchange -> {
            String method = exchange.getRequestMethod().toUpperCase();
            if ("GET".equals(method)) {
                List<Map<String, Object>> list = db.getAllUsersInfo();
                StringBuilder json = new StringBuilder("[");
                for (int i = 0; i < list.size(); i++) {
                    Map<String, Object> u = list.get(i);
                    json.append(String.format("{\"id\":%s,\"username\":\"%s\",\"fullName\":\"%s\",\"phone\":\"%s\",\"address\":\"%s\",\"points\":%s,\"rank\":\"%s\",\"orderCount\":%s,\"totalSpent\":%.0f}",
                            u.get("id"), escapeJson((String)u.get("username")), escapeJson((String)u.get("fullName")),
                            escapeJson((String)u.get("phone")), escapeJson((String)u.get("address")),
                            u.get("points"), escapeJson((String)u.get("rank")), u.get("orderCount"), (Double)u.get("totalSpent")));
                    if (i < list.size() - 1) json.append(",");
                }
                json.append("]");
                sendJsonResponse(exchange, 200, json.toString());
            } else if ("PUT".equals(method)) {
                String body = readBody(exchange);
                Map<String, String> data = parseSimpleJson(body);
                int id = Integer.parseInt(data.getOrDefault("id", "0"));
                String fn = data.getOrDefault("fullName", "");
                String ph = data.getOrDefault("phone", "");
                String addr = data.getOrDefault("address", "");
                boolean ok = db.updateUser(id, fn, ph, addr);
                sendJsonResponse(exchange, 200, "{\"success\":" + ok + "}");
            } else {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
        });

        // 7. API Thống Kê Nâng Cao (Biểu đồ, Doanh thu, Chi phí, Lợi nhuận, Bán chạy)
        server.createContext("/api/stats/advanced", exchange -> {
            if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                Map<String, Object> stats = db.getAdvancedStats();
                List<Map<String, Object>> tops = (List<Map<String, Object>>) stats.get("topSellers");
                StringBuilder topJson = new StringBuilder("[");
                for (int i = 0; i < Math.min(tops.size(), 5); i++) {
                    Map<String, Object> t = tops.get(i);
                    topJson.append(String.format("{\"id\":%s,\"name\":\"%s\",\"sold\":%s,\"stock\":%s,\"price\":%.0f}",
                            t.get("id"), escapeJson((String)t.get("name")), t.get("sold"), t.get("stock"), (Double)t.get("price")));
                    if (i < Math.min(tops.size(), 5) - 1) topJson.append(",");
                }
                topJson.append("]");

                String json = String.format("{\"totalRevenue\":%.0f,\"totalCost\":%.0f,\"totalProfit\":%.0f,\"totalOrders\":%s,\"completedOrders\":%s,\"pendingOrders\":%s,\"totalProducts\":%s,\"lowStockCount\":%s,\"topSellers\":%s}",
                        (Double)stats.get("totalRevenue"), (Double)stats.get("totalCost"), (Double)stats.get("totalProfit"),
                        stats.get("totalOrders"), stats.get("completedOrders"), stats.get("pendingOrders"),
                        stats.get("totalProducts"), stats.get("lowStockCount"), topJson.toString());
                sendJsonResponse(exchange, 200, json);
            } else {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
        });

        // 8. API Quản Lý Kho Hàng (Inventory Management)
        server.createContext("/api/inventory/summary", exchange -> {
            if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                Map<String, Object> sum = db.getInventorySummary();
                String json = String.format(Locale.US,
                    "{\"totalProducts\":%s,\"totalStockUnits\":%s,\"totalStockValue\":%.0f,\"lowStockCount\":%s,\"outOfStockCount\":%s}",
                    sum.get("totalProducts"), sum.get("totalStockUnits"), (Double)sum.get("totalStockValue"),
                    sum.get("lowStockCount"), sum.get("outOfStockCount")
                );
                sendJsonResponse(exchange, 200, json);
            } else {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
        });

        server.createContext("/api/inventory/logs", exchange -> {
            if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                List<InventoryLog> logs = db.getAllInventoryLogs();
                StringBuilder json = new StringBuilder("[");
                for (int i = 0; i < logs.size(); i++) {
                    InventoryLog log = logs.get(i);
                    json.append(String.format(Locale.US,
                        "{\"id\":%d,\"productId\":%d,\"productName\":\"%s\",\"type\":\"%s\",\"changeQuantity\":%d,\"stockAfter\":%d,\"importPrice\":%.0f,\"supplier\":\"%s\",\"note\":\"%s\",\"createdAt\":\"%s\"}",
                        log.getId(), log.getProductId(), escapeJson(log.getProductName()), log.getType(),
                        log.getChangeQuantity(), log.getStockAfter(), log.getImportPrice(),
                        escapeJson(log.getSupplier()), escapeJson(log.getNote()), log.getCreatedAt()
                    ));
                    if (i < logs.size() - 1) json.append(",");
                }
                json.append("]");
                sendJsonResponse(exchange, 200, json.toString());
            } else {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
        });

        server.createContext("/api/inventory/import", exchange -> {
            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                String body = readBody(exchange);
                Map<String, String> data = parseSimpleJson(body);
                int productId = Integer.parseInt(data.getOrDefault("productId", "0"));
                int quantity = Integer.parseInt(data.getOrDefault("quantity", "0"));
                double importPrice = Double.parseDouble(data.getOrDefault("importPrice", "0"));
                String supplier = data.getOrDefault("supplier", "");
                String note = data.getOrDefault("note", "");

                boolean ok = db.importStock(productId, quantity, importPrice, supplier, note);
                if (ok) {
                    Product p = db.getProductById(productId);
                    sendJsonResponse(exchange, 200, String.format("{\"success\":true,\"message\":\"Nhập kho thành công!\",\"newStock\":%d}", p != null ? p.getStock() : 0));
                } else {
                    sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"Không tìm thấy sản phẩm hoặc số lượng nhập không hợp lệ!\"}");
                }
            } else {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
        });

        server.createContext("/api/inventory/adjust", exchange -> {
            if ("POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                String body = readBody(exchange);
                Map<String, String> data = parseSimpleJson(body);
                int productId = Integer.parseInt(data.getOrDefault("productId", "0"));
                int newStock = Integer.parseInt(data.getOrDefault("newStock", "0"));
                String reason = data.getOrDefault("reason", "Kiểm kê điều chỉnh kho");

                boolean ok = db.adjustStock(productId, newStock, reason);
                if (ok) {
                    sendJsonResponse(exchange, 200, "{\"success\":true,\"message\":\"Điều chỉnh tồn kho thành công!\"}");
                } else {
                    sendJsonResponse(exchange, 400, "{\"success\":false,\"message\":\"Không tìm thấy sản phẩm hoặc số lượng tồn không hợp lệ!\"}");
                }
            } else {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
        });

        // 9. API Giám sát Server & Mạng (Server Health & Network Metrics)
        server.createContext("/api/server/status", exchange -> {
            if ("GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                long uptimeSec = (System.currentTimeMillis() - SERVER_START_TIME) / 1000;
                long hours = uptimeSec / 3600;
                long mins = (uptimeSec % 3600) / 60;
                long secs = uptimeSec % 60;
                String uptimeStr = String.format("%d giờ %d phút %d giây", hours, mins, secs);

                Runtime rt = Runtime.getRuntime();
                long totalMem = rt.totalMemory() / (1024 * 1024);
                long freeMem = rt.freeMemory() / (1024 * 1024);
                long usedMem = totalMem - freeMem;

                List<String> ips = new ArrayList<>();
                try {
                    Enumeration<java.net.NetworkInterface> ifaces = java.net.NetworkInterface.getNetworkInterfaces();
                    while (ifaces.hasMoreElements()) {
                        java.net.NetworkInterface iface = ifaces.nextElement();
                        if (iface.isLoopback() || !iface.isUp()) continue;
                        Enumeration<java.net.InetAddress> addrs = iface.getInetAddresses();
                        while (addrs.hasMoreElements()) {
                            java.net.InetAddress addr = addrs.nextElement();
                            if (addr instanceof java.net.Inet4Address && !addr.isLoopbackAddress()) {
                                ips.add("\"" + addr.getHostAddress() + " (" + iface.getName() + ")\"");
                            }
                        }
                    }
                } catch (Exception ignored) {}

                String json = String.format(Locale.US,
                    "{\"status\":\"ONLINE\",\"tcpPort\":%d,\"uptimeSeconds\":%d,\"uptime\":\"%s\"," +
                    "\"totalRequests\":%d,\"totalBytesSent\":%d,\"memoryUsedMb\":%d,\"memoryTotalMb\":%d," +
                    "\"javaVersion\":\"%s\",\"os\":\"%s\",\"ipAddresses\":[%s]}",
                    PORT, uptimeSec, uptimeStr, totalRequests.get(), totalBytesSent.get(),
                    usedMem, totalMem, System.getProperty("java.version"),
                    escapeJson(System.getProperty("os.name") + " " + System.getProperty("os.arch")),
                    String.join(",", ips)
                );
                sendJsonResponse(exchange, 200, json);
            } else {
                sendJsonResponse(exchange, 405, "{\"error\":\"Method not allowed\"}");
            }
        });

        server.setExecutor(null);
        server.start();
        System.out.println("=================================================================");
        System.out.println("       WEBSITE BÁN HÀNG TẠP HÓA ĐANG HOẠT ĐỘNG!                  ");
        System.out.println("=================================================================");
        System.out.println("  [1] Địa chỉ IP mạng LAN thực tế (Thầy giáo chấm điểm & máy khác):");
        try {
            Enumeration<java.net.NetworkInterface> interfaces = java.net.NetworkInterface.getNetworkInterfaces();
            while (interfaces.hasMoreElements()) {
                java.net.NetworkInterface iface = interfaces.nextElement();
                if (iface.isLoopback() || !iface.isUp()) continue;
                Enumeration<java.net.InetAddress> addresses = iface.getInetAddresses();
                while (addresses.hasMoreElements()) {
                    java.net.InetAddress addr = addresses.nextElement();
                    if (addr instanceof java.net.Inet4Address && !addr.isLoopbackAddress()) {
                        System.out.println("      * " + iface.getDisplayName() + ":");
                        System.out.println("        -> http://" + addr.getHostAddress() + ":" + PORT + "/");
                        System.out.println("        * Admin: http://" + addr.getHostAddress() + ":" + PORT + "/admin.html");
                    }
                }
            }
        } catch (Exception ignored) {}
        System.out.println();
        System.out.println("  [2] Tên miền riêng (Không hiện localhost):");
        System.out.println("      * Khách mua hàng: http://taphoa.local:" + PORT + "/");
        System.out.println("      * Chủ tiệm Admin: http://taphoa.local:" + PORT + "/admin.html");
        System.out.println("=================================================================");
    }

    // Static file handler (HTML, CSS, JS, Images)
    static class StaticFileHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();
            if (path == null || path.equals("/") || path.isEmpty()) {
                path = "/index.html";
            }
            if (path.equals("/admin")) {
                path = "/admin.html";
            }

            File file = new File(PUBLIC_DIR + path);
            if (!file.exists() || file.isDirectory()) {
                String response = "<h1>404 Không tìm thấy trang</h1><p><a href='/'>Quay lại trang chủ</a></p>";
                exchange.getResponseHeaders().set("Content-Type", "text/html; charset=UTF-8");
                byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
                exchange.sendResponseHeaders(404, bytes.length);
                OutputStream os = exchange.getResponseBody();
                os.write(bytes);
                os.close();
                return;
            }

            String mimeType = "text/plain";
            String lower = file.getName().toLowerCase();
            if (lower.endsWith(".html")) mimeType = "text/html; charset=UTF-8";
            else if (lower.endsWith(".css")) mimeType = "text/css; charset=UTF-8";
            else if (lower.endsWith(".js")) mimeType = "application/javascript; charset=UTF-8";
            else if (lower.endsWith(".json")) mimeType = "application/json; charset=UTF-8";
            else if (lower.endsWith(".png")) mimeType = "image/png";
            else if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) mimeType = "image/jpeg";
            else if (lower.endsWith(".svg")) mimeType = "image/svg+xml";

            exchange.getResponseHeaders().set("Content-Type", mimeType);
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
            byte[] bytes = Files.readAllBytes(file.toPath());
            totalRequests.incrementAndGet();
            totalBytesSent.addAndGet(bytes.length);
            exchange.sendResponseHeaders(200, bytes.length);
            OutputStream os = exchange.getResponseBody();
            os.write(bytes);
            os.close();
        }
    }

    // Helper methods
    private static void sendJsonResponse(HttpExchange exchange, int statusCode, String json) throws IOException {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        totalRequests.incrementAndGet();
        totalBytesSent.addAndGet(bytes.length);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=UTF-8");
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        OutputStream os = exchange.getResponseBody();
        os.write(bytes);
        os.close();
    }

    private static String readBody(HttpExchange exchange) throws IOException {
        try (InputStream is = exchange.getRequestBody();
             ByteArrayOutputStream bos = new ByteArrayOutputStream()) {
            byte[] buf = new byte[1024];
            int r;
            while ((r = is.read(buf)) != -1) {
                bos.write(buf, 0, r);
            }
            return bos.toString(StandardCharsets.UTF_8);
        }
    }

    private static Map<String, String> parseQuery(String query) {
        Map<String, String> map = new HashMap<>();
        if (query == null || query.isEmpty()) return map;
        String[] pairs = query.split("&");
        for (String pair : pairs) {
            int idx = pair.indexOf("=");
            if (idx > 0) {
                try {
                    String k = URLDecoder.decode(pair.substring(0, idx), "UTF-8");
                    String v = URLDecoder.decode(pair.substring(idx + 1), "UTF-8");
                    map.put(k, v);
                } catch (Exception ignored) {}
            }
        }
        return map;
    }

    private static String productToJson(Product p) {
        return String.format("{\"id\":%d,\"name\":\"%s\",\"categoryId\":%d,\"categoryName\":\"%s\",\"unit\":\"%s\",\"price\":%.0f,\"stock\":%d,\"expiryDate\":\"%s\",\"image\":\"%s\",\"description\":\"%s\"}",
                p.getId(),
                escapeJson(p.getName()),
                p.getCategoryId(),
                escapeJson(p.getCategoryName()),
                escapeJson(p.getUnit()),
                p.getPrice(),
                p.getStock(),
                escapeJson(p.getExpiryDate()),
                escapeJson(p.getImage()),
                escapeJson(p.getDescription()));
    }

    private static String orderToJson(Order o) {
        StringBuilder sb = new StringBuilder();
        sb.append(String.format("{\"id\":%d,\"userId\":%d,\"customerName\":\"%s\",\"phone\":\"%s\",\"address\":\"%s\",\"note\":\"%s\",\"totalAmount\":%.0f,\"paymentMethod\":\"%s\",\"orderDate\":\"%s\",\"status\":\"%s\",\"items\":[",
                o.getId(),
                o.getUserId(),
                escapeJson(o.getCustomerName()),
                escapeJson(o.getPhone()),
                escapeJson(o.getAddress()),
                escapeJson(o.getNote()),
                o.getTotalAmount(),
                escapeJson(o.getPaymentMethod()),
                escapeJson(o.getOrderDate()),
                escapeJson(o.getStatus())));

        for (int i = 0; i < o.getItems().size(); i++) {
            OrderItem it = o.getItems().get(i);
            sb.append(String.format("{\"id\":%d,\"productId\":%d,\"productName\":\"%s\",\"unit\":\"%s\",\"unitPrice\":%.0f,\"quantity\":%d,\"totalPrice\":%.0f}",
                    it.getId(), it.getProductId(), escapeJson(it.getProductName()), escapeJson(it.getUnit()), it.getUnitPrice(), it.getQuantity(), it.getTotalPrice()));
            if (i < o.getItems().size() - 1) sb.append(",");
        }
        sb.append("]}");
        return sb.toString();
    }

    private static String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r");
    }

    private static Map<String, String> parseSimpleJson(String json) {
        Map<String, String> map = new HashMap<>();
        if (json == null) return map;
        json = json.trim();
        if (json.startsWith("{") && json.endsWith("}")) {
            json = json.substring(1, json.length() - 1);
        }
        // Tách các cặp key-value
        String[] pairs = json.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
        for (String pair : pairs) {
            String[] kv = pair.split(":(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");
            if (kv.length == 2) {
                String k = kv[0].trim().replace("\"", "");
                String v = kv[1].trim().replace("\"", "");
                map.put(k, v);
            }
        }
        return map;
    }

    private static Product parseProductJson(String json) {
        Map<String, String> map = parseSimpleJson(json);
        Product p = new Product();
        try { p.setId(Integer.parseInt(map.getOrDefault("id", "0"))); } catch (Exception ignored) {}
        p.setName(map.getOrDefault("name", ""));
        try { p.setCategoryId(Integer.parseInt(map.getOrDefault("categoryId", "1"))); } catch (Exception ignored) {}
        p.setUnit(map.getOrDefault("unit", "Gói"));
        try { p.setPrice(Double.parseDouble(map.getOrDefault("price", "0"))); } catch (Exception ignored) {}
        try { p.setStock(Integer.parseInt(map.getOrDefault("stock", "0"))); } catch (Exception ignored) {}
        p.setExpiryDate(map.getOrDefault("expiryDate", "12/2027"));
        p.setImage(map.getOrDefault("image", "🛒"));
        p.setDescription(map.getOrDefault("description", ""));
        return p;
    }

    private static Order parseOrderJson(String json, DatabaseHelper db) {
        try {
            Order order = new Order();
            // Lấy các trường cơ bản
            Map<String, String> map = parseSimpleJson(json);
            try { order.setUserId(Integer.parseInt(map.getOrDefault("userId", "0"))); } catch (Exception ignored) {}
            order.setCustomerName(map.getOrDefault("customerName", ""));
            order.setPhone(map.getOrDefault("phone", ""));
            order.setAddress(map.getOrDefault("address", ""));
            order.setNote(map.getOrDefault("note", ""));
            order.setPaymentMethod(map.getOrDefault("paymentMethod", "Tiền mặt khi nhận hàng (COD)"));

            // Parse items array: "items":[{"productId":1,"quantity":2},...]
            int itemsIdx = json.indexOf("\"items\":");
            if (itemsIdx != -1) {
                int start = json.indexOf("[", itemsIdx);
                int end = json.lastIndexOf("]");
                if (start != -1 && end != -1) {
                    String arr = json.substring(start + 1, end).trim();
                    if (!arr.isEmpty()) {
                        String[] rawItems = arr.split("\\},\\s*\\{");
                        for (String raw : rawItems) {
                            raw = raw.replace("{", "").replace("}", "");
                            Map<String, String> itemMap = parseSimpleJson("{" + raw + "}");
                            int pId = Integer.parseInt(itemMap.getOrDefault("productId", "0"));
                            int qty = Integer.parseInt(itemMap.getOrDefault("quantity", "1"));
                            Product p = db.getProductById(pId);
                            if (p != null && qty > 0) {
                                order.getItems().add(new OrderItem(p.getId(), p.getName(), p.getUnit(), p.getPrice(), qty));
                            }
                        }
                    }
                }
            }
            return order;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}
