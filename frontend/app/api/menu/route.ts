import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import MenuItem from "@/models/MenuItem";

export async function GET(request: Request) {
  try {
    // MongoDB-тай холбогдох
    await dbConnect();
    
    // Query parameters-ийг авах
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    
    // MongoDB-с өгөгдөл авах
    let query: any = {};
    
    // Category-гаар шүүх
    if (category) {
      query.categoryNameEn = { $regex: category, $options: 'i' };
    }
    
    // Хайлтаар шүүх
    if (search) {
      query.$or = [
        { nameEn: { $regex: search, $options: 'i' } },
        { nameMn: { $regex: search, $options: 'i' } }
      ];
    }
    
    const menuItems = await MenuItem.find(query).sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: menuItems,
      total: menuItems.length,
    });
  } catch (error) {
    console.error("Error fetching menu from MongoDB:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "MongoDB-с өгөгдөл авахад алдаа гарлаа. Алдааны дэлгэрэнгүй мэдээлэл: " + error.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // MongoDB-тай холбогдох
    await dbConnect();
    
    const body = await request.json();
    
    // Шинэ бараа үүсгэх
    const newItem = new MenuItem(body);
    const savedItem = await newItem.save();
    
    return NextResponse.json({
      success: true,
      data: savedItem,
    });
  } catch (error) {
    console.error("Error creating menu item in MongoDB:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "MongoDB-д шинэ бараа үүсгэхэд алдаа гарлаа. Алдааны дэлгэрэнгүй мэдээлэл: " + error.message 
      },
      { status: 500 }
    );
  }
}
