import XLSX from "xlsx";

import Product from "../models/product.js";
import Category from "../models/category.js";
import Brand from "../models/brand.js";
import { responseHandler } from "../utils/responseHandler.js";

// =================================================
// BULK PRODUCT IMPORT FROM EXCEL
// =================================================
export const importProductsFromExcel = async (req, res) => {
  try {
    // ---------------------------------------------
    // 1. CHECK FILE
    // ---------------------------------------------
    if (!req.file) {
      return responseHandler(
        res,
        400,
        false,
        "Excel file is required."
      );
    }

    // ---------------------------------------------
    // 2. READ EXCEL FILE
    // ---------------------------------------------
    const workbook = XLSX.read(req.file.buffer);

    const sheetName = workbook.SheetNames[0];

    const worksheet = workbook.Sheets[sheetName];

    const rows = XLSX.utils.sheet_to_json(
      worksheet,
      {
        defval: "",
      }
    );

    if (!rows.length) {
      return responseHandler(
        res,
        400,
        false,
        "Excel file is empty."
      );
    }

    // ---------------------------------------------
    // 3. REQUIRED COLUMNS
    // ---------------------------------------------
    const requiredFields = [
      "product_name",
      "category_id",
      "brand_id",
      "price",
      "quantity",
      "unit",
    ];

    const firstRow = rows[0];

    const missingFields =
      requiredFields.filter(
        (field) =>
          !(field in firstRow)
      );

    if (missingFields.length > 0) {
      return responseHandler(
        res,
        400,
        false,
        "Required Excel columns are missing.",
        {
          missingFields,
        }
      );
    }

    // ---------------------------------------------
    // 4. VALIDATE AND PREPARE PRODUCTS
    // ---------------------------------------------
    const products = [];

    const errors = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      const rowNumber = i + 2;

      const productName =
        String(
          row.product_name
        ).trim();

      const categoryId =
        String(
          row.category_id
        ).trim();

      const brandId =
        String(
          row.brand_id
        ).trim();

      const description =
        String(
          row.description || ""
        ).trim();

      const price =
        Number(row.price);

      const discountPrice =
        row.discount_price === ""
          ? 0
          : Number(
              row.discount_price
            );

      const quantity =
        Number(row.quantity);

      const unit =
        String(
          row.unit
        ).trim().toLowerCase();

      const status =
        row.status === ""
          ? true
          : String(
              row.status
            )
              .trim()
              .toLowerCase() ===
            "true";

      // -----------------------------------------
      // BASIC VALIDATION
      // -----------------------------------------
      if (!productName) {
        errors.push(
          `Row ${rowNumber}: product_name is required.`
        );
        continue;
      }

      if (!categoryId) {
        errors.push(
          `Row ${rowNumber}: category_id is required.`
        );
        continue;
      }

      if (!brandId) {
        errors.push(
          `Row ${rowNumber}: brand_id is required.`
        );
        continue;
      }

      if (
        isNaN(price) ||
        price < 0
      ) {
        errors.push(
          `Row ${rowNumber}: invalid price.`
        );
        continue;
      }

      if (
        isNaN(discountPrice) ||
        discountPrice < 0
      ) {
        errors.push(
          `Row ${rowNumber}: invalid discount_price.`
        );
        continue;
      }

      if (
        isNaN(quantity) ||
        quantity < 0
      ) {
        errors.push(
          `Row ${rowNumber}: invalid quantity.`
        );
        continue;
      }

      const allowedUnits = [
        "kg",
        "gm",
        "ltr",
        "ml",
        "pcs",
        "pack",
      ];

      if (
        !allowedUnits.includes(
          unit
        )
      ) {
        errors.push(
          `Row ${rowNumber}: invalid unit. Allowed: ${allowedUnits.join(", ")}`
        );
        continue;
      }

      // -----------------------------------------
      // CHECK CATEGORY
      // -----------------------------------------
      const category =
        await Category.findById(
          categoryId
        );

      if (!category) {
        errors.push(
          `Row ${rowNumber}: category not found (${categoryId}).`
        );
        continue;
      }

      // -----------------------------------------
      // CHECK BRAND
      // -----------------------------------------
      const brand =
        await Brand.findById(
          brandId
        );

      if (!brand) {
        errors.push(
          `Row ${rowNumber}: brand not found (${brandId}).`
        );
        continue;
      }

      // -----------------------------------------
      // CHECK DUPLICATE PRODUCT
      // -----------------------------------------
      const existingProduct =
        await Product.findOne({
          product_name:
            productName,
        });

      if (existingProduct) {
        errors.push(
          `Row ${rowNumber}: product already exists (${productName}).`
        );
        continue;
      }

      // -----------------------------------------
      // PREPARE PRODUCT
      // -----------------------------------------
      products.push({
        product_name:
          productName,

        category_id:
          categoryId,

        brand_id:
          brandId,

        description,

        price,

        discount_price:
          discountPrice,

        quantity,

        unit,

        images: [],

        status,
      });
    }

    // ---------------------------------------------
    // 5. IF NOTHING CAN BE INSERTED
    // ---------------------------------------------
    if (!products.length) {
      return responseHandler(
        res,
        400,
        false,
        "No valid products found in Excel.",
        {
          totalRows: rows.length,
          importedRows: 0,
          errors,
        }
      );
    }

    // ---------------------------------------------
    // 6. INSERT PRODUCTS
    // ---------------------------------------------
    const insertedProducts =
      await Product.insertMany(
        products
      );

    // ---------------------------------------------
    // 7. RESPONSE
    // ---------------------------------------------
    return responseHandler(
      res,
      201,
      true,
      "Products imported successfully.",
      {
        totalRows:
          rows.length,

        importedRows:
          insertedProducts.length,

        failedRows:
          errors.length,

        products:
          insertedProducts,

        errors,
      }
    );
  } catch (error) {
    console.error(
      "Excel Product Import Error:",
      error
    );

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error"
    );
  }
};