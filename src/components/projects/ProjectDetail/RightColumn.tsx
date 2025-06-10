import dynamic from "next/dynamic";

// Динамический импорт компонента
const ViewingRequestComponent = dynamic(() =>
  import("@/components/projects/ViewingRequest").then(mod => mod.ViewingRequest)
);

interface RightColumnProps {
  project: any;
  currentTranslation: any;
  priceRange: string;
  t: any;
}

export default function RightColumn({
  project,
  currentTranslation,
  priceRange,
  t
}: RightColumnProps) {
  return (
    <div className="w-full lg:w-[280px] overflow-visible hidden md:block">
      {project && (
        <div className="overflow-visible">
          <ViewingRequestComponent
            projectName={currentTranslation?.name || "PROJECT UNTITLED"}
            location={`${project.location?.city || t("location.defaultCity")}, Thailand`}
            priceRange={priceRange || t("units.priceOnRequest")}
            projectId={project?.id as string}
          />
        </div>
      )}
    </div>
  );
}
