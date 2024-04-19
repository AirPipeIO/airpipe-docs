---
sidebar_position: 2
displayed_sidebar: documentationSidebar
slug: /getting-started
---

# Getting Started

import Cards from '../../../src/components/mdx-comps/Cards';
import { MDXProvider } from "@mdx-js/react";
import { IconClick, IconFiles } from "@tabler/icons-react";

export const desc = [
{
title: "Managed (Hosted)",
to: "/docs/getting-started/managed",
desc: "Get Started in 5 minutes",
icon: <IconFiles color="#007bff" />,
},
{
title: "Self Hosted",
to: "/docs/getting-started/self-hosted",
desc: "Get Started with Air Pipe Self Hosted",
icon: <IconClick color="#007bff" />,
},
{
title: "Webhooks",
to: "/docs/examples/http-example",
desc: "Built by Air Pipe and the community",
icon: <IconFiles color="#007bff" />,
},
]
export const col = "col--12"

<MDXProvider components={Cards}>

<Cards cards={desc} col={col}/>

</MDXProvider>
