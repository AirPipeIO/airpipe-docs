import * as React from "react";
import Box from "@mui/material/Box";
import { Link } from "react-router-dom";
import CardActions from "@mui/material/CardActions";

import Button from "@mui/material/Button";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Typography,
} from "@mui/material";

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});
const cards = [
  { title: "Getting Started", url: "/docs/getting-started" },
  { title: "Configuration", url: "/docs/configuration" },
  { title: "Examples", url: "/docs/examples/http-example" },
];

export default function BasicCard() {
  return (
    <ThemeProvider theme={darkTheme}>
      <Grid container spacing={3}>
        {cards.map((card, index) => (
          <Grid item key={index} xs={12} sm={6} md={6} lg={3}>
            <Link to={card.url} style={{ textDecoration: "none" }}>
              <Card>
                <CardActionArea>
                  <CardContent>
                    <Typography variant="h6">{card.title}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      Description of the card goes here...
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>
    </ThemeProvider>
  );
}
