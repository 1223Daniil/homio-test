import { Box, Grid, Paper, Typography, Chip } from "@mui/material";
import { Amenity, ProjectAmenity } from "@prisma/client";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import ApartmentIcon from "@mui/icons-material/Apartment";

interface AmenitiesSectionProps {
  amenities: (ProjectAmenity & {
    amenity: Amenity;
  })[];
}

export default function AmenitiesSection({ amenities }: AmenitiesSectionProps) {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Amenities & Features
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {amenities.map((amenity) => (
              <Chip key={amenity.id} label={amenity.amenity.name} />
            ))}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}
