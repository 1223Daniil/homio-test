import {
  Grid,
  Typography,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton
} from "@mui/material";
import { Project, ProjectDocument } from "@prisma/client";
import { useTranslations } from "next-intl";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

interface Props {
  formData: Partial<Project> & {
    documents?: ProjectDocument[];
  };
  setFormData: (data: Partial<Project> & {
    documents?: ProjectDocument[];
  }) => void;
}

export default function DocumentsSection({ formData, setFormData }: Props) {
  const t = useTranslations("pages.projects.form.documents");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newDocs = Array.from(files).map(file => ({
      projectId: formData.id!,
      type: 'GENERAL',
      status: 'ACTIVE',
      fileUrl: file.name, // В реальности здесь будет URL после загрузки
      title: file.name,
      category: 'GENERAL'
    } as ProjectDocument));

    setFormData({
      ...formData,
      documents: [...(formData.documents || []), ...newDocs]
    });
  };

  const handleDeleteDocument = (index: number) => {
    setFormData({
      ...formData,
      documents: formData.documents?.filter((_, i) => i !== index)
    });
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Box sx={{ mb: 3 }}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{ mr: 2 }}
          >
            {t("upload")}
            <input
              type="file"
              hidden
              multiple
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx"
            />
          </Button>
        </Box>

        <List>
          {formData.documents?.map((doc, index) => (
            <ListItem key={index}>
              <ListItemText primary={doc.title} />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => handleDeleteDocument(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Grid>
    </Grid>
  );
}
