import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link
} from "@mui/material";
import { ProjectDocument } from "@prisma/client";
import DescriptionIcon from "@mui/icons-material/Description";

interface DocumentsSectionProps {
  documents: ProjectDocument[];
}

export default function DocumentsSection({ documents }: DocumentsSectionProps) {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Legal Documents
      </Typography>

      <List>
        {documents.map((doc, index) => (
          <ListItem key={doc.id}>
            <ListItemIcon>
              <DescriptionIcon />
            </ListItemIcon>
            <ListItemText>
              <Link href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                {doc.title || `Document ${index + 1}`}
              </Link>
            </ListItemText>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
