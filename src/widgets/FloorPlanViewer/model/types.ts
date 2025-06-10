export interface Unit {
  id: string;
  number: string;
  status: string;
  floor: number;
  bedrooms?: number;
  price?: number;
  area?: number;
  windowView?: "sea" | "mountain" | "city" | "garden";
}

export interface FloorPlan {
  id: string;
  buildingId: string;
  floorNumber: number;
  imageUrl: string;
  name: string;
  status: string;
  svgData?: string;
  units?: Unit[];
  areas?: Array<{ unitId: string; svgPath: string; status?: string }>;
}

export interface FloorPlanViewerProps {
  projectId: string;
  floorPlans: FloorPlan[];
  selectedFloor: number;
  onFloorChange: (floor: number) => void;
  selectedUnitId?: string; // Для режима просмотра одного юнита
}

export type ViewMode = "list" | "floors" | "grid";

export interface SvgOverlayProps {
  svgData: any[];
  selectedPlan?: FloorPlan;
  hoveredUnit: Unit | null;
  pinnedUnit: Unit | null;
  onUnitHover: (unit: Unit | null) => void;
  onUnitClick: (unit: Unit | null) => void;
  isModal?: boolean;
}

export interface UnitInfoTooltipProps {
  unit: Unit | null;
  position: { x: number; y: number };
  isPinned: boolean;
  onClose: () => void;
  buildingId?: string;
  planImageUrl?: string;
  projectId: string;
}

export interface FloorSelectorProps {
  floors: FloorPlan[];
  selectedFloor: number;
  onFloorChange: (floor: number) => void;
  isMobile: boolean;
}

export interface ViewModeSelectorProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export interface UnitStatusColors {
  AVAILABLE: string;
  RESERVED: string;
  SOLD: string;
  UNAVAILABLE: string;
  [key: string]: string;
}
