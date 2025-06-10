import { PrismaClient, UnitStatus } from '@prisma/client';

const prisma = new PrismaClient();

const BUILDING_ID = "cm7eo9asm0001vyw2y9fq40fy";
const PROJECT_ID = "9eb5dced-6dfa-430f-b1c4-cf0533f00a8d";

function generateUnits(floorNumber: number, basePrice: number) {
  const units = [];
  const unitsPerFloor = 6; // 6 units per floor

  for (let i = 0; i < unitsPerFloor; i++) {
    const unitNumber = `${floorNumber.toString().padStart(2, '0')}${(i + 1).toString().padStart(2, '0')}`;
    
    // Randomize unit types
    const bedrooms = Math.floor(Math.random() * 4); // 0-3 bedrooms
    const bathrooms = bedrooms + 1; // At least one bathroom
    const area = 35 + (bedrooms * 20); // Base area 35m2 + 20m2 per bedroom
    const price = basePrice + (area * 1000) + (floorNumber * 5000); // Higher floors cost more

    units.push({
      name: `${bedrooms === 0 ? 'Studio' : `${bedrooms}BR`} ${unitNumber}`,
      number: unitNumber,
      floor: floorNumber,
      price,
      area,
      bathrooms,
      bedrooms,
      status: UnitStatus.AVAILABLE,
      projectId: PROJECT_ID,
      buildingId: BUILDING_ID,
      description: `${bedrooms === 0 ? 'Studio' : `${bedrooms} Bedroom`} unit with ${bathrooms} bathroom${bathrooms > 1 ? 's' : ''} and ${area}m² of living space`
    });
  }

  return units;
}

async function seedFloorPlansUnits() {
  try {
    console.log("Starting to seed floor plans and units...");

    // Get all floor plans for the building
    const floorPlans = await prisma.floorPlan.findMany({
      where: {
        buildingId: BUILDING_ID
      }
    });

    console.log(`Found ${floorPlans.length} floor plans`);

    // Delete existing units for this building
    await prisma.unit.deleteMany({
      where: {
        buildingId: BUILDING_ID
      }
    });

    console.log("Deleted existing units");

    // Base price for units
    const basePrice = 150000; // Base price in USD

    // Create units for each floor plan
    for (const floorPlan of floorPlans) {
      const units = generateUnits(floorPlan.floorNumber, basePrice);
      
      // Create units with floor plan connection
      for (const unit of units) {
        await prisma.unit.create({
          data: {
            ...unit,
            floorPlanId: floorPlan.id
          }
        });
      }

      console.log(`Created ${units.length} units for floor ${floorPlan.floorNumber}`);
    }

    console.log("Seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding data:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the function
seedFloorPlansUnits()
  .catch((error) => {
    console.error("Error executing seed:", error);
    process.exit(1);
  });

export default seedFloorPlansUnits; 