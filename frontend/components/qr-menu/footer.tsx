"use client";

import React from "react";
import { useLanguage } from "@/contexts/language-context";

interface FooterProps {
  restaurantName: string;
  restaurantData: any;
}

export function Footer({ restaurantName, restaurantData }: FooterProps) {
  const { getText } = useLanguage();

  // Day translation mapping
  const dayTranslations: { [key: string]: { mn: string; jp: string } } = {
    Monday: { mn: "Даваа", jp: "月曜日" },
    Tuesday: { mn: "Мягмар", jp: "火曜日" },
    Wednesday: { mn: "Лхагва", jp: "水曜日" },
    Thursday: { mn: "Пүрэв", jp: "木曜日" },
    Friday: { mn: "Баасан", jp: "金曜日" },
    Saturday: { mn: "Бямба", jp: "土曜日" },
    Sunday: { mn: "Ням", jp: "日曜日" },
    Mon: { mn: "Да", jp: "月" },
    Tue: { mn: "Мя", jp: "火" },
    Wed: { mn: "Лх", jp: "水" },
    Thu: { mn: "Пү", jp: "木" },
    Fri: { mn: "Ба", jp: "金" },
    Sat: { mn: "Бя", jp: "土" },
    Sun: { mn: "Ня", jp: "日" },
  };

  // Function to translate day names
  const translateDay = (day: string) => {
    const translations = dayTranslations[day];
    if (translations) {
      return getText(day, translations.mn, translations.jp);
    }
    return day; // fallback to original if no translation found
  };

  return (
    <>
      {/* Simple footer */}
      <div className="pt-6 mt-12 text-sm text-center text-gray-500 border-t">
        <p className="mb-2">
          {getText(
            "Thank you for dining with us!",
            "Манайд хооллосонд баярлалаа!",
            "ご利用いただきありがとうございます！"
          )}
        </p>
        <p>
          {getText(
            "Please let your server know about any allergies or dietary restrictions",
            "Харшил эсвэл хоолны хязгаарлалттай бол үйлчилгээний ажилтанд мэдэгдээрэй",
            "アレルギーや食事制限がある場合は、スタッフにお知らせください"
          )}
        </p>
        <div className="mt-4 text-xs">
          <p>WiFi: {restaurantName}_Guest | Password: sushi2024</p>
          <p>Email: haku.jsw@gmail.com</p>
        </div>
      </div>

      {/* Detailed footer */}
      <div className="mt-12 md:mt-16" style={{ backgroundColor: "#FFD09B" }}>
        <div className="container px-4 py-8 mx-auto md:py-12">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 md:gap-8">
            <div>
              <h3
                className="mb-3 text-lg font-bold md:text-xl md:mb-4"
                style={{ color: "#8B4513" }}
              >
                {restaurantName}
              </h3>
              <p className="text-xs text-gray-700 md:text-sm">
                {getText(
                  "Experience the perfect blend of tradition and innovation",
                  "Уламжлал, шинэчлэлийн төгс хослолыг мэдрээрэй",
                  "伝統と革新の完璧な調和をお楽しみください"
                )}
              </p>
            </div>
            <div>
              <h4
                className="mb-3 font-semibold md:mb-4"
                style={{ color: "#8B4513" }}
              >
                {getText("Hours", "Цагийн хуваарь", "営業時間")}
              </h4>
              <div className="space-y-1 text-xs text-gray-700 md:text-sm">
                {restaurantData?.operatingHours ? (
                  restaurantData.operatingHours.map(
                    (hours: any, index: number) => (
                      <div key={index}>
                        {translateDay(hours.day)}: {hours.openTime} -{" "}
                        {hours.closeTime}
                      </div>
                    )
                  )
                ) : (
                  <>
                    <div>
                      {getText("Mon-Thu", "Да-Бя", "月-木")}: 11:00 AM - 10:00
                      PM
                    </div>
                    <div>
                      {getText("Fri-Sat", "Ба-Бя", "金-土")}: 11:00 AM - 12:00
                      PM
                    </div>
                    <div>
                      {getText("Sunday", "Ням", "日")}: 12:00 PM - 9:00 PM
                    </div>
                  </>
                )}
              </div>
            </div>
            <div>
              <h4
                className="mb-3 font-semibold md:mb-4"
                style={{ color: "#8B4513" }}
              >
                {getText("Location", "Байршил", "所在地")}
              </h4>
              <div className="text-xs text-gray-700 md:text-sm">
                <div>
                  {getText(
                    restaurantData?.addressEn || "123 Fusion Street",
                    restaurantData?.addressMn || "123 Fusion Street",
                    restaurantData?.addressJp ||
                      "1nd Floor, Building 38, Paris Street, 1 Khoroo, Sukhbaatar district, Ulaanbaatar. Mongolia"
                  )}
                </div>
                <div>{getText("", "", "")}</div>
                <div>
                  {getText("Phone", "Утас", "電話")}:{" "}
                  {restaurantData?.phone || "(555) 123-4567"}
                </div>
              </div>
            </div>
            <div>
              <h4
                className="mb-3 font-semibold md:mb-4"
                style={{ color: "#8B4513" }}
              >
                {getText("Follow Us", "Биднийг дага", "フォローする")}
              </h4>
              <div className="flex space-x-3 text-xs md:space-x-4 md:text-sm">
                <a
                  href="https://www.instagram.com/haku2025_mongolia?igsh=MXh1OTNkdWhnanR2cQ=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-600 transition-colors duration-200 cursor-pointer hover:text-pink-800"
                >
                  Instagram
                </a>
                <a
                  href="https://www.facebook.com/share/179NxBioQM/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 transition-colors duration-200 cursor-pointer hover:text-blue-800"
                >
                  Facebook
                </a>
              </div>
            </div>
          </div>
          <div className="pt-6 mt-6 text-center border-t border-gray-400 md:mt-8 md:pt-8">
            <p className="text-xs text-gray-600 md:text-sm">
              © 2025 {restaurantName}.{" "}
              {getText(
                "All rights reserved.",
                "Бүх эрх хуулиар хамгаалагдсан.",
                "All rights reserved."
              )}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
