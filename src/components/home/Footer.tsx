import Image from "next/image";
import { Link } from "@/config/i18n";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("Home.footer");
  const navLinks = [
    {
      label: t("developers"),
      href: "/developers"
    },
    {
      label: t("agencies"),
      href: "/developers"
    },
    {
      label: t("privacyPolicy"),
      href: "/developers"
    }
  ];

  return (
    <footer
      className={
        "mt-[80px] bg-gray-100 pb-12 rounded-t-[12px] max-md:mt-10 max-md:pb-8"
      }
    >
      <div className="max-w-[1406px] mx-auto pt-16 px-14 max-md:px-4 max-md:pt-8">
        <div className="flex justify-between max-md:flex-col max-md:gap-8">
          <div className="max-md:flex max-md:flex-col max-md:items-center">
            <div>
              <div className="relative w-[213px] h-[38px] max-md:w-[160px] max-md:h-[28px]">
                <Image
                  src="/images/logo.png"
                  alt="Homio.Pro"
                  fill
                  className="object-contain"
                />
              </div>

              <p className="text-gray-500 max-w-[324px] text-base leading-6 mt-8 max-md:text-center max-md:mt-4 max-md:text-sm">
                {t("title")}
              </p>
            </div>

            <div className="flex gap-8 mt-8 max-md:flex-wrap max-md:justify-center max-md:gap-4">
              {navLinks.map((link, inx) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 max-md:text-sm`}
                >
                  <p
                    className={`text-sm font-semibold ${inx !== 2 ? "text-[#3062B8]" : "text-gray-500"}`}
                  >
                    {link.label}
                  </p>
                  {inx !== 2 && (
                    <div className="w-4 h-4 relative">
                      <Image
                        src="/images/arrow-side.png"
                        alt="Side Arrow"
                        fill
                      />
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>

          <div className={"flex flex-col gap-4 max-md:items-center"}>
            <p
              className={
                "text-base leading-6 text-gray-900 font-semibold max-md:text-center"
              }
            >
              {t("getInTouch")}
            </p>

            <div className={"flex gap-4 max-md:justify-center"}>
              <a
                className={
                  "text-[#3062B8] text-base leading-6 font-semibold flex items-center gap-2"
                }
              >
                sales@homio.pro
                <div className="w-4 h-4 relative">
                  <Image src="/images/arrow-side.png" alt="Side Arrow" fill />
                </div>
              </a>
            </div>

            <div className={"gap-4 flex max-md:justify-center"}>
              {socialLinks.map((link, inx) => (
                <div key={link.href} className={"size-[40px] relative"}>
                  <Image src={`/images/${link.src}`} alt={link.src} fill />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className={
            "mt-16 pt-8 border-t flex items-center justify-between border-gray-200 max-md:flex-col max-md:gap-6 max-md:mt-8 max-md:pt-6"
          }
        >
          <p
            className={
              "text-gray-500 text-sm leading-6 max-md:text-center max-md:order-2"
            }
          >
            {t("copyright")}
          </p>

          <div className={"flex gap-4 max-md:order-1"}>
            <a className={"w-[135px] h-[40px] relative"}>
              <Image
                src="/images/appstore.png"
                alt="App Store"
                fill
                className="object-contain"
              />
            </a>
            <a className={"w-[135px] h-[40px] relative"}>
              <Image
                src="/images/google-play.png"
                alt="App Store"
                fill
                className="object-contain"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

const socialLinks = [
  {
    href: "https://t.me/homio_pro",
    src: "tg.png"
  },
  {
    href: "https://wa.me/homioprocontact",
    src: "whatsapp.png"
  },
  {
    href: "mailto:info@homio.pro",
    src: "mail.png"
  }
];
