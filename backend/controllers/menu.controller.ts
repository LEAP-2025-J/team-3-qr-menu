import { Request, Response } from "express";
import MenuItem from "../models/model.menuItem.js";
import Category from "../models/model.category.js";
import {
  uploadToCloudinary,
  uploadBufferToCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

// GET /api/menu - Get all menu items
export const getAllMenuItems = async (req: Request, res: Response) => {
  try {
    const { category, search, page, limit } = req.query;
    const query: any = {};

    // Category-гаар шүүх
    if (category) {
      query.categoryNameEn = { $regex: category, $options: "i" };
    }

    // Хайлтаар шүүх
    if (search) {
      query.$or = [
        { nameEn: { $regex: search, $options: "i" } },
        { nameMn: { $regex: search, $options: "i" } },
      ];
    }

    // Pagination - идэвхгүй болгосон (бүх item-ийг буцаана)
    // const pageNum = parseInt(page as string) || 1;
    // const limitNum = parseInt(limit as string) || 10;
    // const skip = (pageNum - 1) * limitNum;

    const [menuItems, total] = await Promise.all([
      MenuItem.find(query)
        .populate("category", "name nameEn nameMn")
        .sort({ createdAt: -1 }),
      // .skip(skip)
      // .limit(limitNum),
      MenuItem.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: menuItems,
      total,
      // page: pageNum,
      // totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    res.status(500).json({
      success: false,
      error:
        "MongoDB-с өгөгдөл авахад алдаа гарлаа. Алдааны дэлгэрэнгүй мэдээлэл: " +
        (error as Error).message,
    });
  }
};

// GET /api/menu/:id - Get single menu item
export const getMenuItemById = async (req: Request, res: Response) => {
  try {
    const menuItem = await MenuItem.findById(req.params["id"]).populate(
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
    const body = req.body;

    // Validation
    if (!body.nameEn || !body.nameMn || !body.price || !body.categoryNameEn) {
      return res.status(400).json({
        success: false,
        error: "Бүх талбарыг бөглөх шаардлагатай",
      });
    }

    // Category-г олох
    const category = await Category.findOne({ nameEn: body.categoryNameEn });
    if (!category) {
      return res.status(400).json({
        success: false,
        error: "Категори олдсонгүй",
      });
    }

    // Зураг upload хийх (хэрэв файл байвал)
    let imageUrl = "";
    let imagePublicId = "";

    if (req.file) {

      let uploadResult;
      if (req.file.buffer) {
        // Upload from memory buffer
        uploadResult = await uploadBufferToCloudinary(
          req.file.buffer,
          req.file.originalname || "image"
        );
      } else if (req.file.path) {
        // Upload from file path (fallback)
        uploadResult = await uploadToCloudinary(req.file.path);
      } else {
        return res.status(400).json({
          success: false,
          error: "No file data available for upload",
        });
      }



      if (uploadResult.success) {
        imageUrl = uploadResult.url;
        imagePublicId = uploadResult.public_id || "";
      } else {
        return res.status(400).json({
          success: false,
          error: uploadResult.error,
        });
      }
    }

    // Хамгийн их order утгыг олох
    const maxOrderItem = await MenuItem.findOne().sort({ order: -1 });
    const nextOrder = maxOrderItem ? maxOrderItem.order + 1 : 1;

    // MenuItem-ийн data бэлтгэх
    const menuItemData = {
      name: body.nameEn, // name талбарт nameEn-ийг хадгалах
      nameEn: body.nameEn,
      nameMn: body.nameMn,
      nameJp: body.nameJp,
      description: body.description || body.nameEn, // description талбарт description эсвэл nameEn
      descriptionEn: body.descriptionEn || body.description || body.nameEn, // descriptionEn талбарт descriptionEn эсвэл description эсвэл nameEn
      descriptionMn: body.descriptionMn || body.description || body.nameMn, // descriptionMn талбарт descriptionMn эсвэл description эсвэл nameMn
      descriptionJp: body.descriptionJp || body.description || body.nameJp, // descriptionJp талбарт descriptionJp эсвэл description эсвэл nameJp
      price: parseFloat(body.price) || 0, // string-ийг number болгож хөрвүүлэх
      category: category._id, // ObjectId хадгалах
      image: imageUrl,
      imagePublicId: imagePublicId, // Cloudinary public_id хадгалах
      ingredients: body.ingredients || [],
      isAvailable:
        body.isAvailable === "true" ||
        body.isAvailable === true ||
        body.isAvailable === undefined, // string эсвэл boolean болгож хөрвүүлэх
      preparationTime: parseInt(body.preparationTime) || 15, // string-ийг number болгож хөрвүүлэх
      order: nextOrder,
    };

    const menuItem = new MenuItem(menuItemData);
    await menuItem.save();

    const populatedItem = await MenuItem.findById(menuItem._id).populate(
      "category",
      "name nameEn nameMn"
    );

    res.status(201).json({
      success: true,
      data: populatedItem,
      message: "Бараа амжилттай нэмэгдлээ",
    });
  } catch (error) {
    console.error("Error creating menu item:", error);
    res.status(500).json({
      success: false,
      error: "Бараа үүсгэхэд алдаа гарлаа: " + (error as Error).message,
    });
  }
};

// PUT /api/menu/:id - Update menu item
export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // Validation
    if (!body.nameEn || !body.nameMn || !body.price || !body.categoryNameEn) {
      return res.status(400).json({
        success: false,
        error: "Бүх талбарыг бөглөх шаардлагатай",
      });
    }

    // Category-г олох
    const category = await Category.findOne({ nameEn: body.categoryNameEn });
    if (!category) {
      return res.status(400).json({
        success: false,
        error: "Категори олдсонгүй",
      });
    }

    // Зураг upload хийх (хэрэв файл байвал)
    let imageUrl = "";
    let imagePublicId = "";

    // if (req.file) {
    //   const uploadResult = await uploadToCloudinary(req.file.path);
    //   if (uploadResult.success) {
    //     imageUrl = uploadResult.url;
    //     imagePublicId = uploadResult.public_id || "";
    //   } else {
    //     return res.status(400).json({
    //       success: false,
    //       error: uploadResult.error,
    //     });
    //   }
    // }
    if (req.file) {

      let uploadResult;
      if (req.file.buffer) {
        // Upload from memory buffer
        uploadResult = await uploadBufferToCloudinary(
          req.file.buffer,
          req.file.originalname || "image"
        );
      } else if (req.file.path) {
        // Upload from file path (fallback)
        uploadResult = await uploadToCloudinary(req.file.path);
      } else {
        return res.status(400).json({
          success: false,
          error: "No file data available for upload",
        });
      }



      if (uploadResult.success) {
        imageUrl = uploadResult.url;
        imagePublicId = uploadResult.public_id || "";
      } else {
        return res.status(400).json({
          success: false,
          error: uploadResult.error,
        });
      }
    }

    // MenuItem-ийн data бэлтгэх
    const updateData: any = {
      name: body.nameEn, // name талбарт nameEn-ийг хадгалах
      nameEn: body.nameEn,
      nameMn: body.nameMn,
      nameJp: body.nameJp,
      description: body.description || body.nameEn, // description талбарт description эсвэл nameEn
      descriptionEn: body.descriptionEn || body.description || body.nameEn, // descriptionEn талбарт descriptionEn эсвэл description эсвэл nameEn
      descriptionMn: body.descriptionMn || body.description || body.nameMn, // descriptionMn талбарт descriptionMn эсвэл description эсвэл nameMn
      descriptionJp: body.descriptionJp || body.description || body.nameJp, // descriptionJp талбарт descriptionJp эсвэл description эсвэл nameJp
      price: parseFloat(body.price) || 0,
      category: category._id, // ObjectId хадгалах
      ingredients: body.ingredients || [],
      isAvailable:
        body.isAvailable === "true" ||
        body.isAvailable === true ||
        body.isAvailable === undefined,
      preparationTime: parseInt(body.preparationTime) || 15,
      order: body.order || 0,
    };

    // Only update image fields if there's a new image
    if (req.file) {
      updateData.image = imageUrl;
      updateData.imagePublicId = imagePublicId;
    }

    const menuItem = await MenuItem.findByIdAndUpdate(
      req.params["id"],
      updateData,
      { new: true, runValidators: true }
    ).populate("category", "name nameEn nameMn");

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: "Бараа олдсонгүй",
      });
    }

    res.json({
      success: true,
      data: menuItem,
      message: "Бараа амжилттай шинэчлэгдлээ",
    });
  } catch (error) {
    console.error("Error updating menu item:", error);
    res.status(500).json({
      success: false,
      error: "Бараа засахад алдаа гарлаа: " + (error as Error).message,
    });
  }
};

// DELETE /api/menu/:id - Delete menu item
export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    const menuItem = await MenuItem.findByIdAndDelete(req.params["id"]);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        error: "Бараа олдсонгүй",
      });
    }

    res.json({
      success: true,
      message: "Бараа амжилттай устгагдлаа",
    });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    res.status(500).json({
      success: false,
      error: "Бараа устгахад алдаа гарлаа: " + (error as Error).message,
    });
  }
};
