import mongoose from "mongoose";
import Order from "../models/model.order";
import Table from "../models/model.table";
import MenuItem from "../models/model.menuItem";

// MongoDB холболт
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb+srv://togtoh:Random011021@cluster0.rds2ass.mongodb.net/menu"
    );
    console.log("MongoDB холбогдлоо");
  } catch (error) {
    console.error("MongoDB холболтын алдаа:", error);
    process.exit(1);
  }
};

// Жишээ захиалгууд үүсгэх
const seedOrders = async () => {
  try {
    // Хуучин захиалгуудыг устгах
    await Order.deleteMany({});
    console.log("Хуучин захиалгууд устгагдлаа");

    // Ширээ болон хоолны мэдээллийг авах
    const tables = await Table.find().limit(5); // Эхний 5 ширээ
    const menuItems = await MenuItem.find().limit(10); // Эхний 10 хоол

    if (tables.length === 0) {
      console.log("Ширээ олдсонгүй. Эхлээд ширээ үүсгэх хэрэгтэй.");
      return;
    }

    if (menuItems.length === 0) {
      console.log("Хоолны мэдээлэл олдсонгүй. Эхлээд хоол нэмэх хэрэгтэй.");
      return;
    }

    // Жишээ захиалгууд
    const sampleOrders = [
      {
        orderNumber: "ORD-0001",
        table: tables[0]._id,
        items: [
          {
            menuItem: menuItems[0]._id,
            quantity: 2,
            price: menuItems[0].price,
            specialInstructions: "Халуун байлгана уу",
          },
          {
            menuItem: menuItems[1]._id,
            quantity: 1,
            price: menuItems[1].price,
          },
        ],
        subtotal: menuItems[0].price * 2 + menuItems[1].price,
        tax: (menuItems[0].price * 2 + menuItems[1].price) * 0.1,
        total: (menuItems[0].price * 2 + menuItems[1].price) * 1.1,
        status: "pending",
        customerName: "Бат",
        customerPhone: "99001122",
        estimatedTime: 20,
      },
      {
        orderNumber: "ORD-0002",
        table: tables[1]._id,
        items: [
          {
            menuItem: menuItems[2]._id,
            quantity: 3,
            price: menuItems[2].price,
          },
        ],
        subtotal: menuItems[2].price * 3,
        tax: menuItems[2].price * 3 * 0.1,
        total: menuItems[2].price * 3 * 1.1,
        status: "preparing",
        customerName: "Сүхээ",
        customerPhone: "99003344",
        estimatedTime: 15,
      },
      {
        orderNumber: "ORD-0003",
        table: tables[2]._id,
        items: [
          {
            menuItem: menuItems[3]._id,
            quantity: 1,
            price: menuItems[3].price,
          },
          {
            menuItem: menuItems[1]._id,
            quantity: 2,
            price: menuItems[1].price,
            specialInstructions: "Хүйтэн байлгана уу",
          },
        ],
        subtotal: menuItems[3].price + menuItems[1].price * 2,
        tax: (menuItems[3].price + menuItems[1].price * 2) * 0.1,
        total: (menuItems[3].price + menuItems[1].price * 2) * 1.1,
        status: "serving",
        customerName: "Дэлгэр",
        customerPhone: "99005566",
        estimatedTime: 25,
      },
    ];

    // Захиалгууд үүсгэх
    const createdOrders = await Order.insertMany(sampleOrders);
    console.log(`${createdOrders.length} захиалга амжилттай үүсгэгдлээ`);

    // Ширээний статусыг шинэчлэх
    for (let i = 0; i < createdOrders.length; i++) {
      await Table.findByIdAndUpdate(tables[i]._id, {
        status: "reserved",
        currentOrder: createdOrders[i]._id,
      });
    }

    console.log("Ширээний статус шинэчлэгдлээ");

    // Үүсгэгдсэн захиалгуудын мэдээллийг харуулах
    const populatedOrders = await Order.find()
      .populate("table", "number location")
      .populate("items.menuItem", "name nameEn nameMn nameJp price")
      .sort({ createdAt: -1 });

    console.log("\nҮүсгэгдсэн захиалгууд:");
    populatedOrders.forEach((order) => {
      console.log(
        `Захиалга ${order.orderNumber} - Ширээ ${order.table.number} - Статус: ${order.status} - Нийт: ${order.total}₮`
      );
    });
  } catch (error) {
    console.error("Захиалга үүсгэхэд алдаа гарлаа:", error);
  }
};

// Үндсэн функц
const main = async () => {
  await connectDB();
  await seedOrders();
  await mongoose.connection.close();
  console.log("Seed data амжилттай дууслаа");
};

main();
