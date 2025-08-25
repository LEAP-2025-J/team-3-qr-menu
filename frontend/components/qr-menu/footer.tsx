"use client";

import React from "react";
import { useLanguage } from "@/contexts/language-context";

interface FooterProps {
  restaurantName: string;
  restaurantData: any;
}

export function Footer({ restaurantName, restaurantData }: FooterProps) {
  const { getText } = useLanguage();

  return (
    <>
      {/* Simple footer */}
      <div className="pt-6 mt-12 text-sm text-center text-gray-500 border-t">
        <p className="mb-2">
          {getText(
            "Thank you for dining with us!",
            "Бидэнтэй хооллохдод баярлалаа!",
            "ご利用いただきありがとうございます！"
          )}
        </p>
        <p>
          {getText(
            "Please let your server know about any allergies or dietary restrictions",
            "Аллерги эсвэл хоолны хязгаарлалттай бол үйлчилгээний ажилтанд мэдэгдээрэй",
            "アレルギーや食事制限がある場合は、スタッフにお知らせください"
          )}
        </p>
        <div className="mt-4 text-xs">
          <p>WiFi: {restaurantName}_Guest | Password: sushi2024</p>
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
                Experience the perfect blend of tradition and innovation
              </p>
            </div>
            <div>
              <h4
                className="mb-3 font-semibold md:mb-4"
                style={{ color: "#8B4513" }}
              >
                Hours
              </h4>
              <div className="space-y-1 text-xs text-gray-700 md:text-sm">
                {restaurantData?.operatingHours ? (
                  restaurantData.operatingHours.map(
                    (hours: any, index: number) => (
                      <div key={index}>
                        {hours.day}: {hours.openTime} - {hours.closeTime}
                      </div>
                    )
                  )
                ) : (
                  <>
                    <div>Mon-Thu: 11:00 AM - 10:00 PM</div>
                    <div>Fri-Sat: 11:00 AM - 12:00 PM</div>
                    <div>Sunday: 12:00 PM - 9:00 PM</div>
                  </>
                )}
              </div>
            </div>
            <div>
              <h4
                className="mb-3 font-semibold md:mb-4"
                style={{ color: "#8B4513" }}
              >
                Location
              </h4>
              <div className="text-xs text-gray-700 md:text-sm">
                <div>{restaurantData?.addressEn || "123 Fusion Street"}</div>
                <div>Downtown District</div>
                <div>Phone: {restaurantData?.phone || "(555) 123-4567"}</div>
              </div>
            </div>
            <div>
              <h4
                className="mb-3 font-semibold md:mb-4"
                style={{ color: "#8B4513" }}
              >
                Follow Us
              </h4>
              <div className="flex space-x-3 text-xs md:space-x-4 md:text-sm">
                <a 
                  href="https://www.instagram.com/haku2025_mongolia?igsh=MXh1OTNkdWhnanR2cQ=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-600 cursor-pointer hover:text-pink-800 transition-colors duration-200"
                >
                  Instagram
                </a>
                <a 
                  href="https://www.facebook.com/share/179NxBioQM/?mibextid=wwXIfr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 cursor-pointer hover:text-blue-800 transition-colors duration-200"
                >
                  Facebook
                </a>
                
              </div>
            </div>
          </div>
          <div className="pt-6 mt-6 text-center border-t border-gray-400 md:mt-8 md:pt-8">
            <p className="text-xs text-gray-600 md:text-sm">
              © 2025 {restaurantName}. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </>
  );
} 