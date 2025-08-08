import express, { Request, Response } from "express"
import { body, validationResult } from "express-validator"
import MenuItem from "../models1/MenuItems.js"
import Category from "../models1/Category.js"

const router = express.Router()

// GET /api/menu - Get all menu items
router.get("/", async (req: Request, res: Response) => {
  try {
    const { category, available } = req.query
    const query: any = {}

    if (category) {
      query.category = category
    }

    if (available === "true") {
      query.isAvailable = true
    }

    const menuItems = await (MenuItem as any).find(query)
      .populate("category", "name nameEn nameMn")
      .sort({ order: 1, name: 1 })
      .lean()

    res.json({
      success: true,
      data: menuItems,
    })
  } catch (error) {
    console.error("Error fetching menu items:", error)
    res.status(500).json({ success: false, error: "Failed to fetch menu items" })
  }
})

// GET /api/menu/:id - Get single menu item
router.get("/:id", async (req, res) => {
  try {
    const menuItem = await (MenuItem as any).findById(req.params.id).populate("category", "name nameEn nameMn")

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
router.post("/", async (req: Request, res: Response) => {
  try {
    const menuItem = new MenuItem(req.body)
    await menuItem.save()

    const populatedItem = await (MenuItem as any).findById(menuItem._id).populate("category", "name nameEn nameMn")

    res.status(201).json({
      success: true,
      data: populatedItem,
    })
  } catch (error) {
    console.error("Error creating menu item:", error)
    res.status(500).json({ success: false, error: "Failed to create menu item" })
  }
})

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
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: errors.array(),
        })
      }

      const menuItem = await (MenuItem as any).findByIdAndUpdate(
        req.params['id'],
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
    const menuItem = await (MenuItem as any).findByIdAndDelete(req.params.id)

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

export default router
