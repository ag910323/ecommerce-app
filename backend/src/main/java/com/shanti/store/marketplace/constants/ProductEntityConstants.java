package com.shanti.store.marketplace.constants;

public final class ProductEntityConstants {
    private ProductEntityConstants() {}

    public static final String TABLE_NAME = "products";

    public static final String COL_NAME = "name";
    public static final int LENGTH_NAME = 200;

    public static final String COL_DESCRIPTION = "description";
    public static final int LENGTH_DESCRIPTION = 1000;

    public static final String COL_PRICE = "price";

    public static final String COL_SKU = "sku";
    public static final int LENGTH_SKU = 50;

    public static final String COL_BRAND = "brand";
    public static final int LENGTH_BRAND = 100;

    public static final String COL_CATEGORY = "category";
    public static final int LENGTH_CATEGORY = 100;
    
    public static final String COL_CATEGORY_ID = "category_id";

    public static final String COL_STOCK = "stock_quantity";

    public static final String COL_STATUS = "status";
    public static final int LENGTH_STATUS = 50;

    public static final String COL_IMAGE_URL = "image_url";

    public static final String COL_RATING = "rating";
    public static final String COL_DISCOUNT_PERCENTAGE = "discount_percentage";
    
    public static final String COL_SELLER = "seller_account_id";
    public static final String MAPPED_BY_IMAGES = "product";
    
    public static final String COL_STOREHOUSE_ID = "storehouse_id";
    public static final String MAPPED_BY_REVIEWS = "product";

}

