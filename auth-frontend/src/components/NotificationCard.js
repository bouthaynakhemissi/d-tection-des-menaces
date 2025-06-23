import React from "react";
import { Card, CardContent, Typography, Chip } from "@mui/material";

function NotificationCard({ notif }) {
  return (
    <Card sx={{ mb: 2, background: notif.notif_type === "EMAIL" ? "#fffbe7" : notif.notif_type === "SMS" ? "#f5f5f5" : "#fffbe7" }}>
      <CardContent>
        <Typography variant="h6">{notif.message}</Typography>
        <Typography variant="body2" color="text.secondary">
          {new Date(notif.created_at).toLocaleString()}
        </Typography>
        <Chip label={notif.notif_type} sx={{ float: "right", mt: -4 }} color={
          notif.notif_type === "EMAIL" ? "primary" :
          notif.notif_type === "SMS" ? "success" : "warning"
        } />
      </CardContent>
    </Card>
  );
}

export default NotificationCard;