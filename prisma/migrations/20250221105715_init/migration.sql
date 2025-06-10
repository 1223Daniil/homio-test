-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'MIXED_USE', 'INFRASTRUCTURE');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'PLANNING', 'CONSTRUCTION', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ProjectClass" AS ENUM ('STANDARD', 'COMFORT', 'BUSINESS', 'PREMIUM', 'ELITE', 'LUXURY');

-- CreateEnum
CREATE TYPE "BuildingStatus" AS ENUM ('PLANNING', 'UNDER_CONSTRUCTION', 'COMPLETED');

-- CreateEnum
CREATE TYPE "BuildingType" AS ENUM ('RESIDENTIAL', 'COMMERCIAL', 'MIXED_USE');

-- CreateEnum
CREATE TYPE "UnitLayoutType" AS ENUM ('STUDIO', 'APARTMENT', 'PENTHOUSE', 'DUPLEX', 'TOWNHOUSE', 'VILLA');

-- CreateEnum
CREATE TYPE "UnitLayoutStatus" AS ENUM ('DRAFT', 'ACTIVE', 'INACTIVE', 'SOLD_OUT');

-- CreateEnum
CREATE TYPE "MediaCategory" AS ENUM ('BANNER', 'AMENITIES', 'DEVELOPMENT_PROGRESS', 'MASTER_PLAN', 'CONSTRUCTION_PROGRESS');

-- CreateEnum
CREATE TYPE "UnitStatus" AS ENUM ('AVAILABLE', 'DRAFT', 'ACTIVE', 'RESERVED', 'SOLD');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('NEW', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'DEVELOPER', 'AGENT', 'CLIENT');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('SALE', 'RENT', 'RENTAL', 'VIEWING_REQUEST');

-- CreateEnum
CREATE TYPE "CourseStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'TEXT', 'TRUE_FALSE');

-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('GENERAL', 'MARKETING', 'MASTER_PLAN');

-- CreateEnum
CREATE TYPE "BuildingMediaCategory" AS ENUM ('EXTERIOR', 'INTERIOR', 'CONSTRUCTION_PROGRESS', 'FLOOR_PLANS', 'LAYOUT_PLANS', 'AMENITIES');

-- CreateEnum
CREATE TYPE "UnitMediaCategory" AS ENUM ('GALLERY', 'FLOOR_PLAN', 'INTERIOR');

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" "UserRole" NOT NULL,
    "permissions" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "roleId" TEXT NOT NULL,
    "developerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "phone" TEXT,
    "avatar" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "developers" (
    "id" TEXT NOT NULL,
    "logo" TEXT,
    "website" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "address" TEXT,
    "establishedYear" INTEGER,
    "completedUnits" INTEGER,
    "completedProjects" INTEGER,
    "ongoingUnits" INTEGER,
    "ongoingProjects" INTEGER,
    "deliveryRate" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "developers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeveloperTranslation" (
    "id" TEXT NOT NULL,
    "developerId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeveloperTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agency" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agents" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "agencyId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "slug" TEXT,
    "description" TEXT,
    "type" "ProjectType" NOT NULL,
    "completionDate" TIMESTAMP(3),
    "constructionStatus" INTEGER,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "phase" INTEGER DEFAULT 1,
    "class" "ProjectClass" NOT NULL DEFAULT 'STANDARD',
    "totalLandArea" DOUBLE PRECISION,
    "infrastructureArea" DOUBLE PRECISION,
    "totalBuildings" INTEGER,
    "totalUnits" INTEGER,
    "locationId" TEXT,
    "publicTransport" INTEGER,
    "amenitiesLevel" INTEGER,
    "climateConditions" INTEGER,
    "beachAccess" INTEGER,
    "rentalDemand" INTEGER,
    "safetyLevel" INTEGER,
    "noiseLevel" INTEGER,
    "schoolsAvailable" INTEGER,
    "masterPlan" TEXT,
    "marketingAssets" TEXT,
    "tour3d" TEXT,
    "purchaseConditions" TEXT,
    "specialOffers" JSONB DEFAULT '[]',
    "ownership" TEXT[],
    "promotions" JSONB,
    "furniturePackages" JSONB,
    "currency" TEXT DEFAULT 'USD',
    "developerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectTranslation" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "name" TEXT,
    "number" TEXT,
    "floor" INTEGER NOT NULL,
    "status" "UnitStatus" NOT NULL DEFAULT 'AVAILABLE',
    "area" DOUBLE PRECISION,
    "bathrooms" INTEGER NOT NULL DEFAULT 1,
    "bedrooms" INTEGER NOT NULL DEFAULT 0,
    "price" DOUBLE PRECISION NOT NULL,
    "pricePerSqm" DOUBLE PRECISION,
    "currencyId" TEXT,
    "discountPrice" DOUBLE PRECISION,
    "discountCurrencyId" TEXT,
    "priceHistory" JSONB,
    "view" TEXT,
    "location" TEXT,
    "coordinates" TEXT,
    "description" TEXT,
    "searchVector" vector(1536),
    "layoutId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "floorPlanId" TEXT,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitLayout" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "type" "UnitLayoutType" NOT NULL,
    "description" TEXT,
    "status" "UnitLayoutStatus" NOT NULL DEFAULT 'DRAFT',
    "totalArea" DOUBLE PRECISION NOT NULL,
    "livingArea" DOUBLE PRECISION,
    "balconyArea" DOUBLE PRECISION,
    "ceilingHeight" DOUBLE PRECISION,
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" INTEGER NOT NULL,
    "windowCount" INTEGER,
    "orientation" TEXT,
    "energyClass" TEXT,
    "mainImage" TEXT,
    "images" JSONB,
    "planImage" TEXT,
    "tour3d" TEXT,
    "features" JSONB,
    "furniture" JSONB,
    "finishes" JSONB,
    "floor" INTEGER,
    "order" INTEGER NOT NULL DEFAULT 0,
    "advantages" TEXT[],
    "tags" TEXT[],
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoKeywords" TEXT[],
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "popularity" INTEGER NOT NULL DEFAULT 0,
    "searchVector" vector(1536),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnitLayout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION,
    "address" TEXT,
    "developerId" TEXT,
    "agencyId" TEXT,
    "agentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT,
    "unitId" TEXT,
    "projectId" TEXT,
    "projectName" TEXT,
    "name" TEXT,
    "phone" TEXT,
    "buyerId" TEXT,
    "agentId" TEXT,
    "userId" TEXT NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'NEW',
    "amount" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "date" TIMESTAMP(3),
    "type" "TransactionType" NOT NULL,
    "comments" JSONB[] DEFAULT ARRAY[]::JSONB[],

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectAmenity" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "category" TEXT,
    "projectId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "amenityId" TEXT NOT NULL,

    CONSTRAINT "ProjectAmenity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentPlan" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deposit" DOUBLE PRECISION NOT NULL,
    "installments" JSONB NOT NULL,
    "currencyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropertyType" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currencyId" TEXT NOT NULL,
    "bedrooms" INTEGER NOT NULL,
    "bathrooms" INTEGER NOT NULL,
    "floorPlan" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PropertyType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectMedia" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "category" "MediaCategory" NOT NULL DEFAULT 'BANNER',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Moderation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Moderation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Log" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favorite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "address" TEXT NOT NULL DEFAULT '',
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "beachDistance" DOUBLE PRECISION,
    "centerDistance" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectYield" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "guaranteed" DOUBLE PRECISION NOT NULL,
    "potential" DOUBLE PRECISION NOT NULL,
    "occupancy" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "years" TEXT NOT NULL,

    CONSTRAINT "ProjectYield_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectPricing" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "basePrice" DOUBLE PRECISION NOT NULL,
    "currencyId" TEXT NOT NULL,
    "pricePerSqm" DOUBLE PRECISION NOT NULL,
    "maintenanceFee" DOUBLE PRECISION,
    "maintenanceFeePeriod" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectPricing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT',
    "imageUrl" TEXT,
    "developerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "marketContext" TEXT,
    "sources" TEXT[],

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modules" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT',
    "imageUrl" TEXT,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lessons" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT',
    "imageUrl" TEXT,
    "moduleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lessons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tests" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "CourseStatus" NOT NULL DEFAULT 'DRAFT',
    "imageUrl" TEXT,
    "moduleId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionType" "QuestionType" NOT NULL,
    "correctAnswer" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_sessions" (
    "id" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "totalDuration" INTEGER,
    "progressPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "SessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analytics_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_materials" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "timeSpent" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analytics_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_questions" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "timeToAnswer" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "timeSpent" INTEGER NOT NULL DEFAULT 0,
    "lastAccessed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lesson_completions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lesson_completions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_attempts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "xpReward" INTEGER NOT NULL,
    "conditions" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "progressId" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "achieved" BOOLEAN NOT NULL DEFAULT false,
    "achievedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quizzes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "lessonId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_questions" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_options" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "questionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quiz_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectVideo" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'video',
    "url" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectDocument" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "title" TEXT,
    "category" "DocumentCategory" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterPlanPoint" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "svgPath" TEXT,
    "coordinates" JSONB,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'BUILDING',
    "style" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MasterPlanPoint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Building" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "floors" INTEGER NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'DRAFT',
    "description" TEXT,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Building_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuildingMedia" (
    "id" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'image',
    "url" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "category" "BuildingMediaCategory" NOT NULL DEFAULT 'EXTERIOR',
    "layoutPlan" TEXT,
    "floorPlan" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuildingMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitMedia" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'image',
    "url" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "category" "UnitMediaCategory" NOT NULL DEFAULT 'GALLERY',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnitMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Amenity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT DEFAULT 'default',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Amenity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProjectEmbedding" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "embedding" vector(1536) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Currency" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "isBaseCurrency" BOOLEAN NOT NULL DEFAULT false,
    "defaultForRegions" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnitFeature" (
    "id" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UnitFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "context" JSONB,
    "embedding" vector(1536),

    CONSTRAINT "ChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "embedding" vector(1536),
    "metadata" JSONB,

    CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserContext" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "lastSessionId" TEXT,
    "searchHistory" JSONB[],
    "preferences" JSONB,
    "embedding" vector(1536),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserContext_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FloorPlan" (
    "id" TEXT NOT NULL,
    "buildingId" TEXT NOT NULL,
    "floorNumber" INTEGER NOT NULL,
    "name" TEXT,
    "imageUrl" TEXT NOT NULL,
    "svgData" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FloorPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FloorArea" (
    "id" TEXT NOT NULL,
    "floorPlanId" TEXT NOT NULL,
    "unitId" TEXT,
    "svgPath" TEXT NOT NULL,
    "coordinates" JSONB NOT NULL,
    "area" DOUBLE PRECISION,
    "type" TEXT NOT NULL,
    "name" TEXT,
    "description" TEXT,
    "style" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FloorArea_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProjectToUserContext" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_ChatMessageToProject" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_roleId_idx" ON "users"("roleId");

-- CreateIndex
CREATE INDEX "users_developerId_idx" ON "users"("developerId");

-- CreateIndex
CREATE INDEX "DeveloperTranslation_language_idx" ON "DeveloperTranslation"("language");

-- CreateIndex
CREATE UNIQUE INDEX "DeveloperTranslation_developerId_language_key" ON "DeveloperTranslation"("developerId", "language");

-- CreateIndex
CREATE UNIQUE INDEX "agents_email_key" ON "agents"("email");

-- CreateIndex
CREATE UNIQUE INDEX "agents_userId_key" ON "agents"("userId");

-- CreateIndex
CREATE INDEX "agents_agencyId_idx" ON "agents"("agencyId");

-- CreateIndex
CREATE UNIQUE INDEX "Client_email_key" ON "Client"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Client_userId_key" ON "Client"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Project_locationId_key" ON "Project"("locationId");

-- CreateIndex
CREATE INDEX "Project_developerId_idx" ON "Project"("developerId");

-- CreateIndex
CREATE INDEX "Project_name_idx" ON "Project"("name");

-- CreateIndex
CREATE INDEX "Project_description_idx" ON "Project"("description");

-- CreateIndex
CREATE INDEX "ProjectTranslation_language_idx" ON "ProjectTranslation"("language");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectTranslation_projectId_language_key" ON "ProjectTranslation"("projectId", "language");

-- CreateIndex
CREATE INDEX "Unit_projectId_idx" ON "Unit"("projectId");

-- CreateIndex
CREATE INDEX "Unit_buildingId_idx" ON "Unit"("buildingId");

-- CreateIndex
CREATE INDEX "Unit_currencyId_idx" ON "Unit"("currencyId");

-- CreateIndex
CREATE INDEX "Unit_discountCurrencyId_idx" ON "Unit"("discountCurrencyId");

-- CreateIndex
CREATE INDEX "Unit_layoutId_idx" ON "Unit"("layoutId");

-- CreateIndex
CREATE INDEX "Unit_floorPlanId_idx" ON "Unit"("floorPlanId");

-- CreateIndex
CREATE UNIQUE INDEX "UnitLayout_slug_key" ON "UnitLayout"("slug");

-- CreateIndex
CREATE INDEX "UnitLayout_projectId_idx" ON "UnitLayout"("projectId");

-- CreateIndex
CREATE INDEX "UnitLayout_slug_idx" ON "UnitLayout"("slug");

-- CreateIndex
CREATE INDEX "UnitLayout_type_idx" ON "UnitLayout"("type");

-- CreateIndex
CREATE INDEX "UnitLayout_status_idx" ON "UnitLayout"("status");

-- CreateIndex
CREATE INDEX "Property_developerId_idx" ON "Property"("developerId");

-- CreateIndex
CREATE INDEX "Property_agencyId_idx" ON "Property"("agencyId");

-- CreateIndex
CREATE INDEX "Property_agentId_idx" ON "Property"("agentId");

-- CreateIndex
CREATE INDEX "Transaction_propertyId_idx" ON "Transaction"("propertyId");

-- CreateIndex
CREATE INDEX "Transaction_unitId_idx" ON "Transaction"("unitId");

-- CreateIndex
CREATE INDEX "Transaction_buyerId_idx" ON "Transaction"("buyerId");

-- CreateIndex
CREATE INDEX "Transaction_agentId_idx" ON "Transaction"("agentId");

-- CreateIndex
CREATE INDEX "Transaction_projectId_idx" ON "Transaction"("projectId");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- CreateIndex
CREATE INDEX "ProjectAmenity_projectId_idx" ON "ProjectAmenity"("projectId");

-- CreateIndex
CREATE INDEX "ProjectAmenity_amenityId_idx" ON "ProjectAmenity"("amenityId");

-- CreateIndex
CREATE INDEX "PaymentPlan_projectId_idx" ON "PaymentPlan"("projectId");

-- CreateIndex
CREATE INDEX "PaymentPlan_currencyId_idx" ON "PaymentPlan"("currencyId");

-- CreateIndex
CREATE INDEX "PropertyType_projectId_idx" ON "PropertyType"("projectId");

-- CreateIndex
CREATE INDEX "PropertyType_currencyId_idx" ON "PropertyType"("currencyId");

-- CreateIndex
CREATE INDEX "ProjectMedia_projectId_idx" ON "ProjectMedia"("projectId");

-- CreateIndex
CREATE INDEX "Moderation_userId_idx" ON "Moderation"("userId");

-- CreateIndex
CREATE INDEX "Log_userId_idx" ON "Log"("userId");

-- CreateIndex
CREATE INDEX "Notification_recipientId_idx" ON "Notification"("recipientId");

-- CreateIndex
CREATE INDEX "Favorite_userId_idx" ON "Favorite"("userId");

-- CreateIndex
CREATE INDEX "Favorite_propertyId_idx" ON "Favorite"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "Favorite_userId_propertyId_key" ON "Favorite"("userId", "propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectYield_projectId_key" ON "ProjectYield"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectPricing_projectId_key" ON "ProjectPricing"("projectId");

-- CreateIndex
CREATE INDEX "ProjectPricing_projectId_idx" ON "ProjectPricing"("projectId");

-- CreateIndex
CREATE INDEX "ProjectPricing_currencyId_idx" ON "ProjectPricing"("currencyId");

-- CreateIndex
CREATE UNIQUE INDEX "user_progress_userId_courseId_key" ON "user_progress"("userId", "courseId");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_completions_userId_lessonId_key" ON "lesson_completions"("userId", "lessonId");

-- CreateIndex
CREATE INDEX "user_achievements_userId_idx" ON "user_achievements"("userId");

-- CreateIndex
CREATE INDEX "user_achievements_achievementId_idx" ON "user_achievements"("achievementId");

-- CreateIndex
CREATE INDEX "user_achievements_progressId_idx" ON "user_achievements"("progressId");

-- CreateIndex
CREATE UNIQUE INDEX "user_achievements_userId_achievementId_key" ON "user_achievements"("userId", "achievementId");

-- CreateIndex
CREATE UNIQUE INDEX "quizzes_lessonId_key" ON "quizzes"("lessonId");

-- CreateIndex
CREATE INDEX "ProjectVideo_projectId_idx" ON "ProjectVideo"("projectId");

-- CreateIndex
CREATE INDEX "ProjectDocument_projectId_idx" ON "ProjectDocument"("projectId");

-- CreateIndex
CREATE INDEX "ProjectDocument_type_idx" ON "ProjectDocument"("type");

-- CreateIndex
CREATE INDEX "ProjectDocument_category_idx" ON "ProjectDocument"("category");

-- CreateIndex
CREATE INDEX "MasterPlanPoint_projectId_idx" ON "MasterPlanPoint"("projectId");

-- CreateIndex
CREATE INDEX "Building_projectId_idx" ON "Building"("projectId");

-- CreateIndex
CREATE INDEX "BuildingMedia_buildingId_idx" ON "BuildingMedia"("buildingId");

-- CreateIndex
CREATE INDEX "UnitMedia_unitId_idx" ON "UnitMedia"("unitId");

-- CreateIndex
CREATE UNIQUE INDEX "Amenity_name_key" ON "Amenity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectEmbedding_projectId_key" ON "ProjectEmbedding"("projectId");

-- CreateIndex
CREATE UNIQUE INDEX "Currency_code_key" ON "Currency"("code");

-- CreateIndex
CREATE INDEX "UnitFeature_unitId_idx" ON "UnitFeature"("unitId");

-- CreateIndex
CREATE UNIQUE INDEX "UserContext_userId_key" ON "UserContext"("userId");

-- CreateIndex
CREATE INDEX "FloorPlan_buildingId_idx" ON "FloorPlan"("buildingId");

-- CreateIndex
CREATE UNIQUE INDEX "FloorPlan_buildingId_floorNumber_key" ON "FloorPlan"("buildingId", "floorNumber");

-- CreateIndex
CREATE INDEX "FloorArea_floorPlanId_idx" ON "FloorArea"("floorPlanId");

-- CreateIndex
CREATE INDEX "FloorArea_unitId_idx" ON "FloorArea"("unitId");

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectToUserContext_AB_unique" ON "_ProjectToUserContext"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectToUserContext_B_index" ON "_ProjectToUserContext"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ChatMessageToProject_AB_unique" ON "_ChatMessageToProject"("A", "B");

-- CreateIndex
CREATE INDEX "_ChatMessageToProject_B_index" ON "_ChatMessageToProject"("B");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "developers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeveloperTranslation" ADD CONSTRAINT "DeveloperTranslation_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "developers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agents" ADD CONSTRAINT "agents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "developers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectTranslation" ADD CONSTRAINT "ProjectTranslation_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_discountCurrencyId_fkey" FOREIGN KEY ("discountCurrencyId") REFERENCES "Currency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_layoutId_fkey" FOREIGN KEY ("layoutId") REFERENCES "UnitLayout"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_floorPlanId_fkey" FOREIGN KEY ("floorPlanId") REFERENCES "FloorPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitLayout" ADD CONSTRAINT "UnitLayout_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_agencyId_fkey" FOREIGN KEY ("agencyId") REFERENCES "Agency"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "developers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAmenity" ADD CONSTRAINT "ProjectAmenity_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectAmenity" ADD CONSTRAINT "ProjectAmenity_amenityId_fkey" FOREIGN KEY ("amenityId") REFERENCES "Amenity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentPlan" ADD CONSTRAINT "PaymentPlan_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentPlan" ADD CONSTRAINT "PaymentPlan_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyType" ADD CONSTRAINT "PropertyType_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropertyType" ADD CONSTRAINT "PropertyType_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectMedia" ADD CONSTRAINT "ProjectMedia_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Moderation" ADD CONSTRAINT "Moderation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Log" ADD CONSTRAINT "Log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectYield" ADD CONSTRAINT "ProjectYield_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectPricing" ADD CONSTRAINT "ProjectPricing_currencyId_fkey" FOREIGN KEY ("currencyId") REFERENCES "Currency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectPricing" ADD CONSTRAINT "ProjectPricing_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_developerId_fkey" FOREIGN KEY ("developerId") REFERENCES "developers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modules" ADD CONSTRAINT "modules_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lessons" ADD CONSTRAINT "lessons_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tests" ADD CONSTRAINT "tests_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "modules"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_testId_fkey" FOREIGN KEY ("testId") REFERENCES "tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_sessions" ADD CONSTRAINT "analytics_sessions_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_sessions" ADD CONSTRAINT "analytics_sessions_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_materials" ADD CONSTRAINT "analytics_materials_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_materials" ADD CONSTRAINT "analytics_materials_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "analytics_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_questions" ADD CONSTRAINT "analytics_questions_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "analytics_questions" ADD CONSTRAINT "analytics_questions_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "analytics_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_completions" ADD CONSTRAINT "lesson_completions_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lesson_completions" ADD CONSTRAINT "lesson_completions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "achievements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_progressId_fkey" FOREIGN KEY ("progressId") REFERENCES "user_progress"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quizzes" ADD CONSTRAINT "quizzes_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "lessons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quiz_options" ADD CONSTRAINT "quiz_options_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "quiz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectVideo" ADD CONSTRAINT "ProjectVideo_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectDocument" ADD CONSTRAINT "ProjectDocument_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterPlanPoint" ADD CONSTRAINT "MasterPlanPoint_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Building" ADD CONSTRAINT "Building_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuildingMedia" ADD CONSTRAINT "BuildingMedia_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitMedia" ADD CONSTRAINT "UnitMedia_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectEmbedding" ADD CONSTRAINT "ProjectEmbedding_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitFeature" ADD CONSTRAINT "UnitFeature_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ChatSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FloorPlan" ADD CONSTRAINT "FloorPlan_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FloorArea" ADD CONSTRAINT "FloorArea_floorPlanId_fkey" FOREIGN KEY ("floorPlanId") REFERENCES "FloorPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FloorArea" ADD CONSTRAINT "FloorArea_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToUserContext" ADD CONSTRAINT "_ProjectToUserContext_A_fkey" FOREIGN KEY ("A") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToUserContext" ADD CONSTRAINT "_ProjectToUserContext_B_fkey" FOREIGN KEY ("B") REFERENCES "UserContext"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatMessageToProject" ADD CONSTRAINT "_ChatMessageToProject_A_fkey" FOREIGN KEY ("A") REFERENCES "ChatMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChatMessageToProject" ADD CONSTRAINT "_ChatMessageToProject_B_fkey" FOREIGN KEY ("B") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
