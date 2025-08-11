import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import MenuItem from "@/models/MenuItem";

// Бүх цэсийн барааг авах
export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    let query: any = {};

    if (category) {
      query.categoryNameEn = { $regex: category, $options: "i" };
    }

    if (search) {
      query.$or = [
        { nameEn: { $regex: search, $options: "i" } },
        { nameMn: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [menuItems, total] = await Promise.all([
      MenuItem.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      MenuItem.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: menuItems,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return NextResponse.json(
      {
        success: false,
        error: "MongoDB-с өгөгдөл авахад алдаа гарлаа: " + error.message,
      },
      { status: 500 }
    );
  }
}

// Шинэ бараа үүсгэх
export async function POST(request: Request) {
  try {
    await dbConnect();

    const body = await request.json();

    // Validation
    if (!body.nameEn || !body.nameMn || !body.price || !body.categoryNameEn) {
      return NextResponse.json(
        { success: false, error: "Бүх талбарыг бөглөх шаардлагатай" },
        { status: 400 }
      );
    }

    const newItem = new MenuItem(body);
    const savedItem = await newItem.save();

    return NextResponse.json({
      success: true,
      data: savedItem,
      message: "Бараа амжилттай нэмэгдлээ",
    });
  } catch (error) {
    console.error("Error creating menu item:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Бараа үүсгэхэд алдаа гарлаа: " + error.message,
      },
      { status: 500 }
    );
  }
}
