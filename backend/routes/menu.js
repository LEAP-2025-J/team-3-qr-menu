const express = require("express")
const { body, validationResult } = require("express-validator")
const MenuItem = require("../models/MenuItem")
const Category = require("../models/Category")

const router = express.Router()

// GET /api/menu - Get all menu items
router.get("/", async (req, res) => {
  try {
    const { category, available, search, page = 1, limit = 50 } = req.query

    const query = {}

    if (category) {
      query.category = category
    }

    if (available === "true") {
      query.isAvailable = true
    }

    if (search) {
      query.$text = { $search: search }
    }

    const menuItems = await MenuItem.find(query)
      .populate("category", "name nameEn nameMn")
      .sort({ order: 1, name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean()

    const total = await MenuItem.countDocuments(query)

    res.json({
      success: true,
      data: menuItems,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching menu items:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch menu items",
    })
  }
})

// GET /api/menu/:id - Get single menu item
router.get("/:id", async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate("category", "name nameEn nameMn")

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: "Menu item not found",
      })
    }

    res.json({
      success: true,
      data: menuItem,
    })
  } catch (error) {
    console.error("Error fetching menu item:", error)
    res.status(500).json({
      success: false,
      error: "Failed to fetch menu item",
    })
  }
})

// POST /api/menu - Create new menu item
router.post(
  "/",
  [
    body("nameEn").notEmpty().withMessage("English name is required"),
    body("nameMn").notEmpty().withMessage("Mongolian name is required"),
    body("descriptionEn").notEmpty().withMessage("English description is required"),
    body("descriptionMn").notEmpty().withMessage("Mongolian description is required"),
    body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
    body("category").isMongoId().withMessage("Valid category ID is required"),
    body("preparationTime").isInt({ min: 1 }).withMessage("Preparation time must be at least 1 minute"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: errors.array(),
        })
      }

      // Check if category exists
      const category = await Category.findById(req.body.category)
      if (!category) {
        return res.status(400).json({
          success: false,
          error: "Category not found",
        })
      }

      const menuItem = new MenuItem({
        ...req.body,
        name: req.body.nameEn, // Set default name to English
      })

      await menuItem.save()

      const populatedItem = await MenuItem.findById(menuItem._id).populate("category", "name nameEn nameMn")

      res.status(201).json({
        success: true,
        data: populatedItem,
      })
    } catch (error) {
      console.error("Error creating menu item:", error)
      res.status(500).json({
        success: false,
        error: "Failed to create menu item",
      })
    }
  },
)

// PUT /api/menu/:id - Update menu item
router.put(
  "/:id",
  [
    body("nameEn").optional().notEmpty().withMessage("English name cannot be empty"),
    body("nameMn").optional().notEmpty().withMessage("Mongolian name cannot be empty"),
    body("price").optional().isFloat({ min: 0 }).withMessage("Price must be a positive number"),
    body("category").optional().isMongoId().withMessage("Valid category ID is required"),
    body("preparationTime").optional().isInt({ min: 1 }).withMessage("Preparation time must be at least 1 minute"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: errors.array(),
        })
      }

      const menuItem = await MenuItem.findByIdAndUpdate(
        req.params.id,
        { ...req.body, name: req.body.nameEn || req.body.name },
        { new: true, runValidators: true },
      ).populate("category", "name nameEn nameMn")

      if (!menuItem) {
        return res.status(404).json({
          success: false,
          error: "Menu item not found",
        })
      }

      res.json({
        success: true,
        data: menuItem,
      })
    } catch (error) {
      console.error("Error updating menu item:", error)
      res.status(500).json({
        success: false,
        error: "Failed to update menu item",
      })
    }
  },
)

// DELETE /api/menu/:id - Delete menu item
router.delete("/:id", async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id)

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: "Menu item not found",
      })
    }

    res.json({
      success: true,
      message: "Menu item deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting menu item:", error)
    res.status(500).json({
      success: false,
      error: "Failed to delete menu item",
    })
  }
})

module.exports = router
