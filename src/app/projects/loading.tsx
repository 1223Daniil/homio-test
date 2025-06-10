import React from "react";
import { Grid, Skeleton } from "@mui/material";

export default function Loading() {
  return (
    <Grid container spacing={3}>
      {[1, 2, 3, 4, 5, 6].map(key => (
        <Grid item xs={12} md={4} key={key}>
          <Skeleton
            variant="rectangular"
            height={200}
            sx={{ borderRadius: 1 }}
          />
        </Grid>
      ))}
    </Grid>
  );
}
