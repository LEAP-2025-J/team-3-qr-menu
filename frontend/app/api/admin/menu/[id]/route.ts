import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import MenuItem from "@/models/MenuItem";

// Барааны дэлгэрэнгүй мэдээл авах
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const menuItem = await MenuItem.findById(params.id);

    if (!menuItem) {
      return NextResponse.json(
        { success: false, error: "Бараа олдсонгүй" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    console.error("Error fetching menu item:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Барааны мэдээл авахад алдаа гарлаа: " + error.message,
      },
      { status: 500 }
    );
  }
}

// Бараа засах
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const updatedItem = await MenuItem.findByIdAndUpdate(params.id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedItem) {
      return NextResponse.json(
        { success: false, error: "Бараа олдсонгүй" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedItem,
      message: "Бараа амжилттай шинэчлэгдлээ",
    });
  } catch (error) {
    console.error("Error updating menu item:", error);
    return NextResponse.json(
      { success: false, error: "Бараа засахад алдаа гарлаа: " + error.message },
      { status: 500 }
    );
  }
}

// Бараа устгах
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const deletedItem = await MenuItem.findByIdAndDelete(params.id);

    if (!deletedItem) {
      return NextResponse.json(
        { success: false, error: "Бараа олдсонгүй" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Бараа амжилттай устгагдлаа",
    });
  } catch (error) {
    console.error("Error deleting menu item:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Бараа устгахад алдаа гарлаа: " + error.message,
      },
      { status: 500 }
    );
  }
}
