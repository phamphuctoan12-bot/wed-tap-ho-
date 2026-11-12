package models;

public class InventoryLog {
    private int id;
    private int productId;
    private String productName;
    private String type; // NHAP_KHO, XUAT_BAN, DIEU_CHINH
    private int changeQuantity;
    private int stockAfter;
    private double importPrice;
    private String supplier;
    private String note;
    private String createdAt;

    public InventoryLog() {}

    public InventoryLog(int id, int productId, String productName, String type, 
                        int changeQuantity, int stockAfter, double importPrice, 
                        String supplier, String note, String createdAt) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.type = type;
        this.changeQuantity = changeQuantity;
        this.stockAfter = stockAfter;
        this.importPrice = importPrice;
        this.supplier = supplier;
        this.note = note;
        this.createdAt = createdAt;
    }

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }

    public int getProductId() { return productId; }
    public void setProductId(int productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public int getChangeQuantity() { return changeQuantity; }
    public void setChangeQuantity(int changeQuantity) { this.changeQuantity = changeQuantity; }

    public int getStockAfter() { return stockAfter; }
    public void setStockAfter(int stockAfter) { this.stockAfter = stockAfter; }

    public double getImportPrice() { return importPrice; }
    public void setImportPrice(double importPrice) { this.importPrice = importPrice; }

    public String getSupplier() { return supplier; }
    public void setSupplier(String supplier) { this.supplier = supplier; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}
