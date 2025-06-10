import { Box, Paper, Typography } from "@mui/material";
import { Location } from "@prisma/client";
import LocationOnIcon from "@mui/icons-material/LocationOn";

interface LocationSectionProps {
  location: Location;
}

export default function LocationSection({ location }: LocationSectionProps) {
  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <LocationOnIcon sx={{ mr: 1 }} />
        <Typography variant="h6">Location Details</Typography>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body1">{location.district}</Typography>
        <Typography variant="body2" color="text.secondary">
          {location.city}, {location.country}
        </Typography>
      </Box>

      <Box sx={{ width: "100%", height: "400px", bgcolor: "grey.200" }}>
        {/* Здесь будет карта */}
        <Typography variant="body2" sx={{ p: 2 }}>
          Coordinates: {location.latitude}, {location.longitude}
        </Typography>
        <Typography variant="body2" sx={{ p: 2 }}>
          Distance to beach: {location.beachDistance}km
          {location.centerDistance && `, to center: ${location.centerDistance}km`}
        </Typography>
      </Box>
    </Paper>
  );
}
