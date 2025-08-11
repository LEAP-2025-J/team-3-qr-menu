import { Request, Response } from "express";
import MenuItem from "../models/model.menuItem.js";
import Category from "../models/model.category.js";

// GET /api/menu - Get all menu items
export const getAllMenuItems = async (req: Request, res: Response) => {
  try {
    const { category, available } = req.query;
    const query: any = {};

    if (category) {
      query.category = category;
    }

    if (available === "true") {
      query.isAvailable = true;
    }

    const menuItems = await MenuItem.find(query)
      .populate("category", "name nameEn nameMn")
      .sort({ order: 1, name: 1 })
      .lean();

    res.json({
      success: true,
      data: menuItems,
    });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch menu items" });
  }
};

// GET /api/menu/:id - Get single menu item
export const getMenuItemById = async (req: Request, res: Response) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id).populate(
      "category",
      "name nameEn nameMn"
    );

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: "Menu item not found",
      });
    }

    res.json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    console.error("Error fetching menu item:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch menu item",
    });
  }
};

// POST /api/menu - Create new menu item
export const createMenuItem = async (req: Request, res: Response) => {
  try {
    const menuItem = new MenuItem(req.body);
    await menuItem.save();

    const populatedItem = await MenuItem.findById(menuItem._id).populate(
      "category",
      "name nameEn nameMn"
    );

    res.status(201).json({
      success: true,
      data: populatedItem,
    });
  } catch (error) {
    console.error("Error creating menu item:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to create menu item" });
  }
};

// PUT /api/menu/:id - Update menu item
export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params.id,
      { ...req.body, name: req.body.nameEn || req.body.name },
      { new: true, runValidators: true }
    ).populate("category", "name nameEn nameMn");

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: "Menu item not found",
      });
    }

    res.json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    console.error("Error updating menu item:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update menu item",
    });
  }
};

// DELETE /api/menu/:id - Delete menu item
export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: "Menu item not found",
      });
    }

    res.json({
      success: true,
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete menu item",
    });
  }
};
