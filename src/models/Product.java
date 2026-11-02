package models;

public class Product {
    private int id;
    private String name;
    private int categoryId;
    private String categoryName;
    private String unit;          // Đơn vị tính: Gói, Chai, Lon, Hộp, Thùng, Kg
    private double price;         // Giá bán (VNĐ)
    private int stock;            // Số lượng tồn
    private String expiryDate;    // Hạn sử dụng (HSD)
    private String image;         // Icon hoặc đường dẫn ảnh
    private String description;   // Mô tả

    public Product() {}

    public Product(int id, String name, int categoryId, String categoryName, String unit, double price, int stock, String expiryDate, String image, String description) {
        this.id = id;
        this.name = name;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.unit = unit;
        this.price = price;
        this.stock = stock;
        this.expiryDate = expiryDate;
        this.image = image;
        this.description = description;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getCategoryId() { return categoryId; }
    public void setCategoryId(int categoryId) { this.categoryId = categoryId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }

    public String getExpiryDate() { return expiryDate; }
    public void setExpiryDate(String expiryDate) { this.expiryDate = expiryDate; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
