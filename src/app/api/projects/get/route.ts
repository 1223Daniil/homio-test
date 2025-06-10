import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DocumentCategory } from "@prisma/client";

/**
 * GET /api/projects/get
 * 
 * Retrieves a list of projects with their IDs, names, and price list document URLs.
 * 
 * @returns {Object} JSON response with projects data
 */
export async function GET(request: NextRequest) {
  try {
    console.log("Starting /api/projects/get request");
    
    // First, check if there are any documents in the database
    const allDocuments = await prisma.projectDocument.findMany({
      take: 10, // Limit to 10 for logging
      select: {
        id: true,
        projectId: true,
        title: true,
        type: true,
        category: true,
        fileUrl: true
      }
    });
    
    console.log(`Found ${allDocuments.length} documents in the database:`, 
      allDocuments.length > 0 ? allDocuments : "No documents found");
    
    // Fetch all projects with ALL their documents and priceLinks
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        priceLinks: true,
        documents: {
          select: {
            id: true,
            title: true,
            fileUrl: true,
            type: true,
            category: true
          }
        }
      }
    });
    
    console.log(`Found ${projects.length} projects`);
    
    // Log projects with documents
    const projectsWithDocs = projects.filter(p => p.documents && p.documents.length > 0);
    console.log(`Found ${projectsWithDocs.length} projects with documents`);
    
    // Log projects without documents
    const projectsWithoutDocs = projects.filter(p => !p.documents || p.documents.length === 0);
    console.log(`Found ${projectsWithoutDocs.length} projects without documents`);
    
    // For the specific project in question, log more details
    const specificProject = projects.find(p => p.id === "dd02500b-3fa2-4ab8-880b-92de1a03dff5");
    if (specificProject) {
      console.log("Specific project details:", {
        id: specificProject.id,
        name: specificProject.name,
        documentsCount: specificProject.documents ? specificProject.documents.length : 0,
        documents: specificProject.documents || [],
        priceLinks: specificProject.priceLinks
      });
    } else {
      console.log("Specific project not found");
    }

    // Transform the data to match the required format
    const formattedProjects = projects.map(project => {
      // Filter documents that are likely price lists
      const priceLists = project.documents ? project.documents.filter(doc => {
        const typeMatch = doc.type?.toLowerCase().includes('price') || doc.type?.toLowerCase().includes('list');
        const titleMatch = doc.title?.toLowerCase().includes('price') || doc.title?.toLowerCase().includes('list');
        const categoryMatch = doc.category === DocumentCategory.MARKETING;
        
        return typeMatch || titleMatch || categoryMatch;
      }) : [];
      
      // Extract price links from priceLinks field
      let priceLinks: { id: string; title: string; url: string; type: string; category: string }[] = [];
      
      try {
        // Проверяем поле priceLinks
        if (project.priceLinks) {
          const priceLinksData = project.priceLinks as any;
          
          if (Array.isArray(priceLinksData)) {
            priceLinks = priceLinksData.map((link: { url: string; title: string }, index: number) => ({
              id: `price-link-${index}`,
              title: link.title || "Price List",
              url: link.url,
              type: "price-link",
              category: "MARKETING"
            }));
          }
        }
      } catch (error) {
        console.error(`Error parsing price links for project ${project.id}:`, error);
      }
      
      // Combine document price lists and price links
      const allPriceLists = [
        ...priceLists.map(doc => ({
          id: doc.id,
          title: doc.title || "Document",
          url: doc.fileUrl,
          type: doc.type,
          category: doc.category
        })),
        ...priceLinks
      ];
      
      // If no price lists found but project has documents, include all documents
      const documentsToInclude = allPriceLists.length > 0 
        ? allPriceLists 
        : (project.documents || []).map(doc => ({
            id: doc.id,
            title: doc.title || "Document",
            url: doc.fileUrl,
            type: doc.type,
            category: doc.category
          }));
      
      return {
        "project-id": project.id,
        "project-name": project.name || "Unnamed Project",
        "allpricelists-urls": documentsToInclude
      };
    });

    return NextResponse.json(formattedProjects);
  } catch (error) {
    console.error("Error fetching projects and price lists:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects and price lists" },
      { status: 500 }
    );
  }
} 