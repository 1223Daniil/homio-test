"use client";

import { Button, Card, CardBody, Skeleton } from "@heroui/react";
import {
  IconCalendar,
  IconChevronLeft,
  IconChevronRight,
  IconMapPin,
  IconShield
} from "@tabler/icons-react";

import { ViewingRequestModal } from "@/components/projects/ViewingRequestModal";
import { useState } from "react";
import { useTranslations } from "next-intl";

interface ViewingRequestProps {
  projectName: string;
  location: string;
  priceRange: string;
  isLoading?: boolean;
  projectId: string;
  onRequestViewing?: () => void;
}

export function ViewingRequest({
  projectName,
  location,
  priceRange,
  isLoading = false,
  projectId,
  onRequestViewing
}: ViewingRequestProps) {
  const t = useTranslations("ViewingRequest");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isViewingRequestOpen, setIsViewingRequestOpen] = useState(false);

  const getDates = () => {
    const dates = [];
    for (let i = 0; i < 4; i++) {
      const date = new Date(currentDate);
      date.setDate(currentDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const formatDate = (date: Date) => {
    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const months = [
      "JAN",
      "FEB",
      "MAR",
      "APR",
      "MAY",
      "JUN",
      "JUL",
      "AUG",
      "SEP",
      "OCT",
      "NOV",
      "DEC"
    ];

    return {
      day: t(`days.${days[date.getDay()]}`).slice(0, 3),
      date: date.getDate(),
      month: t(`months.${months[date.getMonth()]}`).slice(0, 3)
    };
  };

  const handlePrevDate = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNextDate = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const handleRequestViewing = () => {
    if (onRequestViewing) {
      onRequestViewing();
    } else {
      setIsViewingRequestOpen(true);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full bg-white dark:bg-[#2C2C2C] shadow-small">
        <CardBody className="p-6">
          <div className="space-y-4">
            <Skeleton className="rounded-lg">
              <div className="h-6 w-3/4"></div>
            </Skeleton>
            <Skeleton className="rounded-lg">
              <div className="h-8 w-1/2"></div>
            </Skeleton>
            <Skeleton className="rounded-lg">
              <div className="h-12 w-full"></div>
            </Skeleton>
            <div className="h-[1px] bg-default-200 my-4"></div>
            <Skeleton className="rounded-lg">
              <div className="h-[100px] w-full"></div>
            </Skeleton>
            <Skeleton className="rounded-lg">
              <div className="h-12 w-full"></div>
            </Skeleton>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full bg-white dark:bg-[#2C2C2C] shadow-small">
        <CardBody className="p-6">
          <div className="space-y-4">
            {/* Project info */}
            <div className="space-y-2">
              <h3 className="text-xl font-semibold">{projectName}</h3>
              <p className="text-2xl font-semibold">{priceRange}</p>
              <div className="flex items-center gap-2 text-default-600">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <IconCalendar className="w-6 h-6 text-primary" />
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <IconMapPin className="text-primary" size={16} />
                  <p>{location}</p>
                </div>
              </div>
            </div>

            <div className="h-[1px] bg-default-200 my-4"></div>

            <div>
              <p className="text-sm text-default-600 mb-2">
                {t("desiredDate")}
              </p>
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onClick={handlePrevDate}
                  className="flex-shrink-0 h-[100px] hover:bg-default-100 dark:hover:bg-[#2C2C2C]"
                >
                  <IconChevronLeft size={18} />
                </Button>

                <div className="flex-1 flex gap-2 min-w-0">
                  {getDates().map((date, index) => {
                    const formattedDate = formatDate(date);
                    const isSelected =
                      date.toDateString() === selectedDate.toDateString();

                    return (
                      <button
                        key={date.toISOString()}
                        onClick={() => setSelectedDate(date)}
                        className={`flex-1 min-w-[80px] p-2 rounded-lg text-center transition-all ${
                          isSelected
                            ? "bg-primary text-white"
                            : "hover:bg-default-100 dark:hover:bg-[#2C2C2C]"
                        }`}
                      >
                        <div className="text-xs font-medium">
                          {formattedDate.day}
                        </div>
                        <div className="text-lg font-semibold">
                          {formattedDate.date}
                        </div>
                        <div className="text-xs">{formattedDate.month}</div>
                      </button>
                    );
                  })}
                </div>

                <Button
                  isIconOnly
                  variant="light"
                  size="sm"
                  onClick={handleNextDate}
                  className="flex-shrink-0 h-[100px] hover:bg-default-100 dark:hover:bg-[#2C2C2C]"
                >
                  <IconChevronRight size={18} />
                </Button>
              </div>
            </div>

            <div className="mt-8">
              <Button
                color="primary"
                className="w-full"
                size="lg"
                onPress={handleRequestViewing}
              >
                {t("requestViewing")}
              </Button>
            </div>

            {/* Additional info */}
            <p className="text-xs text-center text-default-600">
              <IconShield
                className="inline-block mr-1 text-primary"
                size={14}
              />
              {t("freeCancel")}
            </p>
          </div>
        </CardBody>
      </Card>

      <ViewingRequestModal
        isOpen={isViewingRequestOpen}
        onClose={() => setIsViewingRequestOpen(false)}
        projectId={projectId}
        projectName={projectName}
      />
    </>
  );
}
