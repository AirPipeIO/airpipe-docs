---
sidebar_position: 1
displayed_sidebar: documentationSidebar
slug: /
---

import Cards from '../../src/components/mdx-comps/Cards';
import { MDXProvider } from "@mdx-js/react";
import { IconClick, IconFiles } from "@tabler/icons-react";

# Introduction

export const desc = [
{
title: "Getting Started",
to: "/docs/getting-started",
desc: "Get up and running in 5 minutes",
icon: <IconClick color="#007bff" />,
},
{
title: "Configuration",
to: "/docs/configuration",
desc: "Learn the all features needed to create configuration files",
icon: <IconFiles color="#007bff" />,
},
{
title: "Examples",
to: "/docs/examples/http-example",
desc: "Built by Air Pipe and the community",
icon: <IconFiles color="#007bff" />,
},
]
export const col = "col--6"

**Air Pipe** is a **zero code** **high performance** service which supports building **APIs**, **integrations**, **workflows** anywhere. We offer SaaS Managed and Self Hosted options.

<MDXProvider components={Cards}>

<Cards cards={desc} col={col}/>

</MDXProvider>
