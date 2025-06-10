"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";

export default function CallToActionSection() {
  const t = useTranslations("Home.cta");
  return (
    <div className="mt-20 w-full max-md:mt-10 px-4">
      <div className="max-w-[1407px] mx-auto">
        <div className="bg-blue-900 rounded-3xl shadow-sm overflow-hidden">
          <div className="pl-14 pr-0 max-md:px-4 max-md:pt-8 max-md:pb-0">
            <div className="flex gap-5 max-md:flex-col">
              <div className="w-[59%] max-md:w-full flex items-center">
                <div className="w-full font-semibold">
                  <h2 className="text-4xl leading-10 text-white max-w-[533px] max-md:text-2xl max-md:leading-8">
                    {t("title")}
                  </h2>
                  <p className="mt-2.5 text-base font-normal leading-6 text-white text-ellipsis max-w-[535px] max-md:text-sm">
                    {t("subtitle")}
                  </p>
                  <div className="flex flex-wrap gap-6 items-center mt-6 max-md:mt-4 max-md:gap-4">
                    <button className="flex items-start text-white rounded-lg">
                      <div className="flex overflow-hidden gap-3 justify-center items-center px-7 py-4 bg-blue-800 rounded-lg border border-solid shadow-sm border-[#3062B8] max-md:px-5 max-md:py-3">
                        <span className="text-lg max-md:text-base">{t("telegram")}</span>
                        <Image
                          src="https://cdn.builder.io/api/v1/image/assets/TEMP/fa079bb5a88355154105d63c89b6ada34e2a0de9a7e35336ab58a8fbb227794c?placeholderIfAbsent=true"
                          alt="Telegram"
                          width={24}
                          height={24}
                          className="object-contain"
                        />
                      </div>
                    </button>
                    <button className="flex items-start text-blue-800 rounded-lg">
                      <div className="flex overflow-hidden gap-3 justify-center items-center px-7 py-4 bg-indigo-50 rounded-lg border border-solid shadow-sm border-[#EBF2FF] max-md:px-5 max-md:py-3">
                        <span className="text-lg max-md:text-base">{t("whatsapp")}</span>
                        <Image
                          src="https://cdn.builder.io/api/v1/image/assets/TEMP/1fe0f02e5bd90271616306733633c5e291918a8b08f4d4efef6be042335fe794?placeholderIfAbsent=true"
                          alt="WhatsApp"
                          width={24}
                          height={24}
                          className="object-contain"
                        />
                      </div>
                    </button>
                  </div>
                </div>
              </div>
              <div className="w-[41%] max-md:w-full max-md:-mb-1">
                <Image
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/42d86885b9193bcfd7efaa500754610062793a172f40faba9c36f7a0ababf68a?placeholderIfAbsent=true"
                  alt="Platform preview"
                  width={500}
                  height={400}
                  className="object-contain w-full"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
