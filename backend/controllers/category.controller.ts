import { Request, Response } from "express";
import Category from "../models/model.category.js";

// POST /api/categories - Create new category
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { nameEn, nameMn, description, order } = req.body;

    // Validation
    if (!nameEn || !nameMn) {
      return res.status(400).json({
        success: false,
        error: "Нэр (Англи болон Монгол) заавал оруулах шаардлагатай",
      });
    }

    // Check if category with same name already exists
    const existingCategory = await Category.findOne({ nameEn });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        error: "Ийм нэртэй категори аль хэдийн байна",
      });
    }

    // Create new category
    const newCategory = new Category({
      name: nameEn, // nameEn-ийг name талбарт ашиглах
      nameEn,
      nameMn,
      description: description || "",
      order: order || 0,
    });

    const savedCategory = await newCategory.save();

    res.status(201).json({
      success: true,
      message: "Категори амжилттай нэмэгдлээ",
      data: savedCategory,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({
      success: false,
      error: "Категори нэмэхэд алдаа гарлаа: " + (error as Error).message,
    });
  }
};

// GET /api/categories - Get all categories
export const getAllCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find().sort({ order: 1 });

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({
      success: false,
      error: "Категориудыг авахад алдаа гарлаа: " + (error as Error).message,
    });
  }
};

// GET /api/categories/:id - Get single category
export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params["id"]);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Категори олдсонгүй",
      });
    }

    res.json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Error fetching category:", error);
    res.status(500).json({
      success: false,
      error: "Категори авахад алдаа гарлаа",
    });
  }
};

// DELETE /api/categories/:id - Delete category
export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params["id"]);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: "Категори олдсонгүй",
      });
    }

    await Category.findByIdAndDelete(req.params["id"]);

    res.json({
      success: true,
      message: "Категори амжилттай устгагдлаа",
    });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({
      success: false,
      error: "Категори устгахад алдаа гарлаа: " + (error as Error).message,
    });
  }
};
