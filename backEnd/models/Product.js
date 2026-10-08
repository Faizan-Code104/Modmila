import mongoose from "mongoose";

/* Modmila bedding categories — must match CATEGORIES names in the frontend src/storeInfo.js exactly */
export const PRODUCT_CATEGORIES = [
  "Duvet Cover Sets",
  "Quilts & Coverlets",
  "Sheet Sets",
  "Shams & Bed Skirts",
];

const getStockStatus = (stock) => {
  if (stock === 0) return "Out of Stock";
  if (stock <= 5) return "Low Stock";
  return "Active";
};

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 150,
    },

    category: {
      type: String,
      required: true,
      enum: PRODUCT_CATEGORIES,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      validate: {
        validator: Number.isSafeInteger,
        message: "Stock must be a whole number.",
      },
    },

    sku: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      uppercase: true,
    },

    material: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    weight: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    images: {
      type: [String],
      required: true,
      validate: {
        validator: (value) =>
          Array.isArray(value) &&
          value.length >= 1 &&
          value.length <= 4,
        message: "A product must have between 1 and 4 images.",
      },
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["Active", "Low Stock", "Out of Stock"],
      default: "Out of Stock",
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    reviews: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

productSchema.pre("save", function () {
  this.status = getStockStatus(this.stock);
});

productSchema.pre("findOneAndUpdate", function () {
  const update = this.getUpdate();

  if (!update || Array.isArray(update)) return;

  const stock = update.$set?.stock ?? update.stock;

  if (stock === undefined) return;

  const status = getStockStatus(Number(stock));

  if (update.$set) {
    update.$set.status = status;
  } else {
    update.status = status;
  }

  this.setUpdate(update);
});

const Product = mongoose.model("Product", productSchema);

export default Product;