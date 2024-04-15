import * as React from "react";
import "@mantine/core/styles.css";
import {
  Card,
  Image,
  Text,
  SimpleGrid,
  Badge,
  Group,
  MantineProvider,
} from "@mantine/core";
import { IconClick, IconFiles } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import card from "./card.css";
export default function BasicCard() {
  return (
    <MantineProvider defaultColorScheme="dark">
      <SimpleGrid cols={2}>
        <Link
          to="/docs/getting-started"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Card
            withBorder
            shadow="sm"
            radius="md"
            padding="xl"
            className="custom-card"
          >
            <Card.Section>
              <Group justify="center" mt="md" mb="xs">
                <Text
                  variant="gradient"
                  gradient={{ from: "#007bff", to: "#007bff", deg: 90 }}
                  ta="center"
                  fw={500}
                >
                  Getting Started
                </Text>
                <IconClick color="#007bff" />
              </Group>
            </Card.Section>

            <Group justify="center" mt="md" mb="xs">
              <Text c="white">
                Learn how to easily run Air Pipe configurations
              </Text>
            </Group>
            <Card.Section></Card.Section>
          </Card>
        </Link>
        <Link
          to="/docs/configuration"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Card
            withBorder
            shadow="sm"
            radius="md"
            padding="xl"
            className="custom-card"
          >
            <Card.Section>
              <Group justify="center" mt="md" mb="xs">
                <Text
                  variant="gradient"
                  gradient={{ from: "#007bff", to: "#007bff", deg: 90 }}
                  ta="center"
                  fw={500}
                >
                  Configuration
                </Text>
                <IconFiles color="#007bff" />
              </Group>
            </Card.Section>
            <Card.Section></Card.Section>
          </Card>
        </Link>

        <Link
          to="/docs/examples/http-example"
          style={{ textDecoration: "none", color: "inherit" }}
        >
          <Card
            withBorder
            shadow="sm"
            radius="md"
            padding="xl"
            className="custom-card"
          >
            <Card.Section>
              <Group justify="center" mt="md" mb="xs">
                <Text
                  t
                  variant="gradient"
                  gradient={{ from: "#007bff", to: "#007bff", deg: 90 }}
                  ta="center"
                  fw={500}
                >
                  Examples
                </Text>
                <IconFiles color="#007bff" />
              </Group>
            </Card.Section>
            <Card.Section></Card.Section>
          </Card>
        </Link>
      </SimpleGrid>
    </MantineProvider>
  );
}
