// convert-with-dagre.js with flat loop layout and schedule interface support
import dagre from "dagre";

// A reusable-module reference is the single string `a|module::<handle>|`. The engine
// splices the module in before execution, but in the raw config YAML it sits verbatim
// wherever a typed value is expected — most visibly as an item in an interface's
// `actions` list. Detect it so the visualizer can draw a dedicated module node instead
// of a meaningless empty "Action N".
const MODULE_REF_RE = /^a\|module::([^|]+)\|$/;
function moduleRefHandle(value) {
  if (typeof value !== "string") return null;
  const m = MODULE_REF_RE.exec(value.trim());
  return m ? m[1] : null;
}

// Turn any module-ref string in an actions list into a lightweight pseudo-action object
// so the rest of the layout pipeline (node map, dependency edges) treats it like a normal
// named action. `__moduleRef` carries the handle; createActionNode renders the module skin.
function normalizeActions(list) {
  return (list || []).map((action) => {
    const handle = moduleRefHandle(action);
    return handle ? { name: `module::${handle}`, __moduleRef: handle } : action;
  });
}

// A module definition may be stored as the wrapped `{ type, spec }` form or as a bare spec.
// Return the underlying spec object for a handle, or null if unknown.
function moduleSpecFor(modules, handle) {
  const def = modules && modules[handle];
  if (!def) return null;
  if (def.spec !== undefined) return def.spec;
  return def;
}

// The marketplace stores a module file's CONTENT as the bare spec (the `type` lives in
// file metadata, not the YAML). Infer the module type from the spec's shape so we can
// render/resolve it. Order matters — check the most distinctive keys first.
function inferModuleType(spec) {
  const s = spec && typeof spec === "object" ? spec : {};
  if (s.driver || s.conn_string || s.dbname || s.document_operation)
    return "Database";
  if (Array.isArray(s.tests) || s.error_message || s.http_code_on_error)
    return "Assert";
  if (s.mode || s.ip || s.geo || s.rate_limit || s.on_deny)
    return "NetworkPolicy";
  if (s.cron || s.every || s.expression) return "Schedule";
  return "Action";
}

// Resolve `a|module::<handle>|` references in a config against a map of the pack's module
// definitions ({ handle: { type, spec } }). Rather than draw an opaque "reference", we
// INLINE the module's spec so the referencing action renders the module's real content —
// its assertions, transforms, DB driver, etc. A `__module*` tag is left behind so the node
// can still show a "from module: <handle>" badge. Refs with no known definition are left
// as-is (they fall back to a collapsed module node).
function resolveConfigModules(config, modules) {
  if (!modules || !config || typeof config !== "object") return config;
  const clone = JSON.parse(JSON.stringify(config));

  const tagged = (spec, handle, key) => ({ ...spec, [key]: handle });

  // global.databases.<name>: a|module::db-handle|  ->  inline the connection spec
  const gdbs = clone.global && clone.global.databases;
  if (gdbs && typeof gdbs === "object") {
    Object.keys(gdbs).forEach((name) => {
      const h = moduleRefHandle(gdbs[name]);
      const spec = h && moduleSpecFor(modules, h);
      if (spec && typeof spec === "object")
        gdbs[name] = tagged(spec, h, "__moduleHandle");
    });
  }

  const ifaces = clone.interfaces || {};
  Object.keys(ifaces).forEach((key) => {
    const iface = ifaces[key];
    if (!iface || typeof iface !== "object") return;

    const ah = moduleRefHandle(iface.assert);
    const aspec = ah && moduleSpecFor(modules, ah);
    if (aspec) iface.assert = tagged(aspec, ah, "__moduleHandle");

    const nh = moduleRefHandle(iface.network);
    const nspec = nh && moduleSpecFor(modules, nh);
    if (nspec) iface.network = tagged(nspec, nh, "__moduleHandle");

    if (Array.isArray(iface.actions)) {
      iface.actions = iface.actions.map((a) => {
        // list-item Action module -> inline the whole action (unpacked)
        const listH = moduleRefHandle(a);
        if (listH) {
          const spec = moduleSpecFor(modules, listH);
          return spec && typeof spec === "object"
            ? { ...spec, __moduleSource: listH }
            : a;
        }
        // action-level assert module -> inline the assert set (so tests show)
        if (a && typeof a === "object") {
          const asH = moduleRefHandle(a.assert);
          const asSpec = asH && moduleSpecFor(modules, asH);
          if (asSpec)
            return { ...a, assert: { ...asSpec }, __assertModule: asH };
        }
        return a;
      });
    }
  });

  return clone;
}

/**
 * Analyze conditions and dependencies
 */
function analyzeConditions(action, actionIndex, allActions) {
  const conditions = [];

  if (action.depends_on) {
    conditions.push({
      type: "depends_on",
      actions: Array.isArray(action.depends_on)
        ? action.depends_on
        : [action.depends_on]
    });
  }
  if (action.run_when_succeeded) {
    conditions.push({
      type: "run_when_succeeded",
      actions: Array.isArray(action.run_when_succeeded)
        ? action.run_when_succeeded
        : [action.run_when_succeeded]
    });
  }
  if (action.run_when_failed) {
    conditions.push({
      type: "run_when_failed",
      actions: Array.isArray(action.run_when_failed)
        ? action.run_when_failed
        : [action.run_when_failed]
    });
  }
  if (action.run_when_finished) {
    conditions.push({
      type: "run_when_finished",
      actions: Array.isArray(action.run_when_finished)
        ? action.run_when_finished
        : [action.run_when_finished]
    });
  }
  if (action.run_on_assertion && action.run_on_assertion.tests) {
    conditions.push({
      type: "run_on_assertion",
      tests: action.run_on_assertion.tests
    });
  }
  if (action.conditional_input) {
    conditions.push({
      type: "conditional_input",
      inputs: action.conditional_input
    });
  }

  const isComplex =
    conditions.length > 1 ||
    (conditions.length === 1 && conditions[0].type === "run_on_assertion");

  return {
    conditions,
    isComplex,
    summary: generateConditionSummary(conditions)
  };
}

/**
 * Generate a readable summary of conditions
 */
function generateConditionSummary(conditions) {
  if (conditions.length === 0) return "Sequential";
  if (conditions.length === 1) {
    const condition = conditions[0];
    switch (condition.type) {
      case "run_when_succeeded":
        return "On success";
      case "run_when_failed":
        return "On failure";
      case "run_when_finished":
        return "When finished";
      case "depends_on":
        return "Depends on";
      case "conditional_input":
        return "Conditional Input";
      case "run_on_assertion":
        return condition.tests && condition.tests.length > 1
          ? `${condition.tests.length} assertions`
          : "Assertion";
      default:
        return "Conditional";
    }
  }

  const types = conditions.map((c) => {
    switch (c.type) {
      case "run_when_succeeded":
        return "success";
      case "run_when_failed":
        return "failure";
      case "run_when_finished":
        return "finished";
      case "depends_on":
        return "depends";
      case "conditional_input":
        return "conditional";
      case "run_on_assertion":
        return "assertion";
      default:
        return c.type;
    }
  });

  return `${types.join(" + ")}`;
}

/**
 * Extract relevant configuration for the popover
 */
function extractRelevantConfig(originalAction, conditions) {
  const relevantConfig = {};

  conditions.forEach((condition) => {
    if (originalAction[condition.type]) {
      relevantConfig[condition.type] = originalAction[condition.type];
    }
  });

  return relevantConfig;
}

/**
 * Create an action node with appropriate styling
 */
function createActionNode(id, name, action, interfaceName, position) {
  let nodeColor = "#e2e8f0";
  let textColor = "#000";
  let nodeType = "defaultActionNode";

  const isModuleRef = !!action.__moduleRef;

  if (isModuleRef) {
    // Reuse the default action node but flag it — the node renders a "Module" badge,
    // the handle, and the a|module::…| marker with a violet accent.
    nodeColor = "#7c3aed";
    textColor = "#fff";
    nodeType = "defaultActionNode";
  } else if (action.conditional_input && action.conditional_input.length > 0) {
    nodeColor = "#8b5cf6";
    textColor = "#fff";
    nodeType = "conditionalNode";
  } else if (action.http) {
    nodeColor = "#3b82f6";
    textColor = "#fff";
    nodeType = "httpActionNode";
  } else if (action.command) {
    nodeColor = "#10b981";
    textColor = "#fff";
    nodeType = "command";
  } else if (action.email) {
    nodeColor = "#8b5cf6";
    textColor = "#fff";
    nodeType = "email";
  } else if (action.database || action.query || action.document_operation) {
    nodeColor = "#4a5568";
    textColor = "#fff";
    nodeType = "databaseActionNode";
  } else if (action.lookup) {
    nodeColor = "#d97706";
    textColor = "#fff";
    nodeType = "defaultActionNode";
  } else if (action.input) {
    nodeType = "defaultActionNode";
  }

  const nodeStyle = {
    backgroundColor: nodeColor,
    color: textColor,
    borderRadius: "8px",
    fontWeight: 500,
    minWidth: "230px",
    maxWidth: "260px",
    minHeight: "50px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center"
  };

  // An action whose `assert` came from a module (either an unresolved a|module::…|
  // ref, or a resolved+inlined spec tagged with the source handle).
  const assertModule = isModuleRef
    ? null
    : action.__assertModule ||
      moduleRefHandle(action.assert) ||
      action.assert?.__moduleHandle ||
      null;
  const moduleSource = action.__moduleSource || null;

  return {
    id,
    type: nodeType,
    position,
    data: {
      label: isModuleRef ? action.__moduleRef : name,
      action: action,
      nodeType: nodeType,
      interfaceName,
      isModule: isModuleRef,
      moduleHandle: action.__moduleRef || null,
      assertModule,
      moduleSource,
      // The module's resolved spec, so a badge hover-card can preview what the module
      // actually contains (its assertion tests, the inlined action's steps, …).
      assertModuleSpec:
        assertModule && action.assert && typeof action.assert === "object"
          ? action.assert
          : null,
      moduleSourceSpec: moduleSource ? action : null
    },
    style: nodeStyle
  };
}

/**
 * Flat loop layout: replaces container subflow pattern.
 * Creates a LoopHeader card + flat nested action nodes chained in dagre.
 * Returns a visual-only loop-back edge (not added to dagre to avoid cycles).
 */
function createFlatLookup(
  parentAction,
  loopHeaderNodeId,
  interfaceName,
  startingNodeId,
  actionNodeMap,
  dagreGraph,
  interfaceIndex
) {
  const flatNodes = [];
  const flatEdgeData = [];
  let currentNodeId = startingNodeId;

  const nestedActions = normalizeActions(parentAction.actions);

  // 1. Create LoopHeader node (same size as other nodes)
  const loopHeaderNode = {
    id: loopHeaderNodeId,
    type: "lookupSubflowNode",
    position: { x: 0, y: 0 },
    data: {
      label: parentAction.name || "Loop",
      action: parentAction,
      nodeType: "lookupSubflowNode",
      interfaceName,
      nestedActionsCount: nestedActions.length
    }
  };
  flatNodes.push(loopHeaderNode);

  // Add loopHeader to main dagreGraph with normal card size
  dagreGraph.setNode(loopHeaderNodeId, {
    width: 260,
    height: 120,
    interfaceIndex
  });

  // 2. Create nested action nodes as regular flat nodes with amber outline
  const nestedNodeIds = [];
  const nestedActionNodeMap = new Map();

  nestedActions.forEach((nestedAction, nestedIndex) => {
    const nestedNodeId = `nested-${currentNodeId++}`;
    nestedNodeIds.push(nestedNodeId);

    const nestedActionName = nestedAction.name || `Nested ${nestedIndex + 1}`;
    nestedActionNodeMap.set(nestedActionName, nestedNodeId);
    nestedActionNodeMap.set(nestedIndex.toString(), nestedNodeId);

    const nestedNode = createActionNode(
      nestedNodeId,
      nestedActionName,
      nestedAction,
      interfaceName,
      { x: 0, y: 0 }
    );

    // Mark as part of a loop and apply amber outline styling
    nestedNode.data.isInLoop = true;
    nestedNode.data.loopName = parentAction.name;
    nestedNode.style = {
      ...nestedNode.style,
      outline: "1.5px solid rgba(217,119,6,0.35)",
      outlineOffset: "3px",
      borderRadius: "14px"
    };

    flatNodes.push(nestedNode);

    // Add nested node to main dagreGraph
    dagreGraph.setNode(nestedNodeId, {
      width: 260,
      height: 90,
      interfaceIndex
    });
  });

  // 3. Chain in dagre: loopHeader → nested-0 → nested-1 → ... → nested-N
  if (nestedNodeIds.length > 0) {
    // loopHeader → first nested
    dagreGraph.setEdge(loopHeaderNodeId, nestedNodeIds[0]);
    flatEdgeData.push({
      type: "loop-entry",
      sourceId: loopHeaderNodeId,
      targetId: nestedNodeIds[0]
    });

    // Chain remaining nested nodes (respecting explicit deps if present)
    for (let i = 1; i < nestedNodeIds.length; i++) {
      const nestedAction = nestedActions[i];
      const dependencies = extractDependencies(nestedAction, i, nestedActions);

      if (dependencies.length > 0) {
        const conditionInfo = analyzeConditions(nestedAction, i, nestedActions);
        const dependenciesBySource = groupDependenciesBySource(
          dependencies,
          i,
          nestedActionNodeMap
        );

        dependenciesBySource.forEach(({ sourceNodeId, conditions }) => {
          if (sourceNodeId && sourceNodeId !== nestedNodeIds[i]) {
            dagreGraph.setEdge(sourceNodeId, nestedNodeIds[i]);
            flatEdgeData.push({
              type: "nested-dependency",
              sourceId: sourceNodeId,
              targetId: nestedNodeIds[i],
              conditions,
              conditionInfo,
              originalAction: nestedAction
            });
          }
        });
      } else {
        dagreGraph.setEdge(nestedNodeIds[i - 1], nestedNodeIds[i]);
        flatEdgeData.push({
          type: "nested-sequential",
          sourceId: nestedNodeIds[i - 1],
          targetId: nestedNodeIds[i],
          conditions: [],
          conditionInfo: {
            conditions: [],
            isComplex: false,
            summary: "Sequential"
          },
          originalAction: nestedActions[i]
        });
      }
    }
  }

  const lastNestedNodeId =
    nestedNodeIds.length > 0
      ? nestedNodeIds[nestedNodeIds.length - 1]
      : loopHeaderNodeId;

  // 4. Build visual-only loop-back edge (NOT added to dagre — would create a cycle)
  const loopBackEdge =
    nestedNodeIds.length > 0
      ? {
          id: `edge-loopback-${lastNestedNodeId}-${loopHeaderNodeId}`,
          source: lastNestedNodeId,
          target: loopHeaderNodeId,
          sourceHandle: "bottom-right",
          targetHandle: "right-center",
          type: "smoothstep",
          style: {
            stroke: "#d97706",
            strokeWidth: 1.5,
            strokeDasharray: "5,4"
          },
          animated: true,
          label: "↺ next iteration",
          labelStyle: { fontSize: "10px", fontWeight: 500, fill: "#d97706" },
          labelBgStyle: {
            fill: "rgba(217,119,6,0.1)",
            fillOpacity: 0.9,
            rx: 4
          },
          markerEnd: {
            type: "arrowclosed",
            color: "#d97706",
            width: 12,
            height: 12
          },
          data: { isLoopBack: true }
        }
      : null;

  return {
    nodes: flatNodes,
    edgeData: flatEdgeData,
    loopBackEdge,
    nextNodeId: currentNodeId,
    loopHeaderNodeId,
    lastNestedNodeId
  };
}

/**
 * Center and fit the layout to the container
 */
function centerAndFitLayout({ nodes, edges }, containerWidth, containerHeight) {
  if (nodes.length === 0) return { nodes, edges };

  const minX = Math.min(...nodes.map((n) => n.position.x));
  const maxX = Math.max(...nodes.map((n) => n.position.x));
  const minY = Math.min(...nodes.map((n) => n.position.y));
  const maxY = Math.max(...nodes.map((n) => n.position.y));

  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;
  const layoutCenterX = (minX + maxX) / 2;
  const layoutCenterY = (minY + maxY) / 2;

  const centeredNodes = nodes.map((node) => ({
    ...node,
    position: {
      x: centerX + (node.position.x - layoutCenterX),
      y: centerY + (node.position.y - layoutCenterY)
    }
  }));

  return { nodes: centeredNodes, edges };
}

/**
 * Extract all dependencies from an action
 */
function extractDependencies(action, actionIndex, allActions) {
  const dependencies = [];

  if (action.depends_on) {
    const deps = Array.isArray(action.depends_on)
      ? action.depends_on
      : action.depends_on.actions || [];
    deps.forEach((dep) => {
      dependencies.push({ type: "depends_on", action: dep });
    });
  }

  if (action.run_when_succeeded) {
    const deps = Array.isArray(action.run_when_succeeded)
      ? action.run_when_succeeded
      : action.run_when_succeeded.actions || [];
    deps.forEach((dep) => {
      dependencies.push({ type: "run_when_succeeded", action: dep });
    });
  }

  if (action.run_when_failed) {
    const deps = Array.isArray(action.run_when_failed)
      ? action.run_when_failed
      : action.run_when_failed.actions || [];
    deps.forEach((dep) => {
      dependencies.push({ type: "run_when_failed", action: dep });
    });
  }

  if (action.run_when_finished) {
    const deps = Array.isArray(action.run_when_finished)
      ? action.run_when_finished
      : action.run_when_finished.actions || [];
    deps.forEach((dep) => {
      dependencies.push({ type: "run_when_finished", action: dep });
    });
  }

  if (action.run_on_assertion && action.run_on_assertion.tests) {
    action.run_on_assertion.tests.forEach((test) => {
      if (test.action && test.action !== "previous") {
        dependencies.push({ type: "run_on_assertion", action: test.action });
      } else if (test.action === "previous" && actionIndex > 0) {
        const previousAction = allActions[actionIndex - 1];
        if (previousAction && previousAction.name) {
          dependencies.push({
            type: "run_on_assertion",
            action: previousAction.name
          });
        } else {
          dependencies.push({ type: "run_on_assertion", action: "previous" });
        }
      }
    });
  }

  if (action.conditional_input && Array.isArray(action.conditional_input)) {
    action.conditional_input.forEach((conditionalInput) => {
      if (typeof conditionalInput === "string") {
        dependencies.push({
          type: "conditional_input",
          action: conditionalInput
        });
      } else if (conditionalInput.input) {
        dependencies.push({
          type: "conditional_input",
          action: conditionalInput.input
        });
      }
    });
  }

  return dependencies;
}

/**
 * Resolve action reference to node ID.
 * Checks for __last exit point first (used by loop actions so downstream
 * deps connect from the last nested node, not the loop header).
 */
function resolveActionReference(actionRef, currentActionIndex, actionNodeMap) {
  if (actionRef === "previous") {
    if (currentActionIndex > 0) {
      const prevRef = (currentActionIndex - 1).toString();
      return (
        actionNodeMap.get(`${prevRef}__last`) || actionNodeMap.get(prevRef)
      );
    }
    return null;
  }

  return (
    actionNodeMap.get(`${actionRef}__last`) || actionNodeMap.get(actionRef)
  );
}

/**
 * Calculate the appropriate handle ID based on node positions
 */
function calculateHandlePositions(sourceNode, targetNode) {
  const sourceX = sourceNode.position.x + 130;
  const targetX = targetNode.position.x + 130;

  const xDiff = targetX - sourceX;
  const threshold = 100;

  let sourceHandleId = "bottom-center";

  if (xDiff > threshold) {
    sourceHandleId = "bottom-right";
  } else if (xDiff < -threshold) {
    sourceHandleId = "bottom-left";
  }

  return {
    sourceHandle: sourceHandleId,
    targetHandle: "top-center"
  };
}

/**
 * Create complex dependency edge with proper styling
 */
function createComplexDependencyEdge(
  sourceId,
  targetId,
  conditions,
  conditionInfo,
  originalAction,
  sourceNode,
  targetNode
) {
  let edgeStyle = { stroke: "#64748b", strokeWidth: 2 };
  let edgeLabel = conditionInfo.summary;
  let edgeType = "smoothstep";

  if (conditionInfo.isComplex) {
    edgeStyle.stroke = "#f59e0b";
    edgeStyle.strokeWidth = 3;
    edgeStyle.strokeDasharray = "8,4";
    edgeLabel = `⚙️ ${conditionInfo.summary}`;
  } else if (conditions.length === 1) {
    const condition = conditions[0];
    switch (condition.type) {
      case "run_when_succeeded":
        edgeStyle.stroke = "#10b981";
        edgeLabel = "On success";
        break;
      case "run_when_failed":
        edgeStyle.stroke = "#ef4444";
        edgeLabel = "On failure";
        break;
      case "run_when_finished":
        edgeStyle.stroke = "#8b5cf6";
        edgeLabel = "When finished";
        break;
      case "run_on_assertion":
        edgeStyle.stroke = "#f59e0b";
        edgeStyle.strokeDasharray = "5,5";
        edgeLabel = "Assertion";
        break;
      case "depends_on":
        edgeStyle.stroke = "#3b82f6";
        edgeLabel = "Depends on";
        break;
      case "conditional_input":
        edgeStyle.stroke = "#8b5cf6";
        edgeStyle.strokeDasharray = "4,4";
        edgeLabel = "Conditional Input";
        break;
      default:
        edgeLabel = "Sequential";
        edgeStyle.strokeDasharray = "2,2";
    }
  }

  const { sourceHandle, targetHandle } = calculateHandlePositions(
    sourceNode,
    targetNode
  );

  return {
    id: `edge-${sourceId}-${targetId}`,
    source: sourceId,
    target: targetId,
    sourceHandle: sourceHandle,
    targetHandle: targetHandle,
    type: edgeType,
    style: edgeStyle,
    label: edgeLabel,
    labelStyle: {
      fontSize: conditionInfo.isComplex ? "11px" : "12px",
      fontWeight: conditionInfo.isComplex ? 600 : 500,
      cursor: conditionInfo.isComplex ? "pointer" : "default"
    },
    labelBgStyle: {
      fill: conditionInfo.isComplex ? "#fef3c7" : "#ffffff",
      fillOpacity: 0.9,
      stroke: conditionInfo.isComplex ? "#f59e0b" : "transparent",
      strokeWidth: conditionInfo.isComplex ? 1 : 0,
      rx: 4
    },
    markerEnd: {
      type: "arrowclosed",
      color: edgeStyle.stroke
    },
    data: {
      isComplex: conditionInfo.isComplex,
      conditions: conditionInfo.conditions,
      originalAction: originalAction,
      conditionDetails: generateConditionDetails(
        conditionInfo.conditions,
        originalAction
      )
    }
  };
}

/**
 * Group dependencies by their source node
 */
function groupDependenciesBySource(
  dependencies,
  currentActionIndex,
  actionNodeMap
) {
  const grouped = new Map();

  dependencies.forEach((dep) => {
    const sourceNodeId = resolveActionReference(
      dep.action,
      currentActionIndex,
      actionNodeMap
    );
    if (sourceNodeId) {
      if (!grouped.has(sourceNodeId)) {
        grouped.set(sourceNodeId, []);
      }
      grouped.get(sourceNodeId).push(dep);
    }
  });

  return Array.from(grouped.entries()).map(([sourceNodeId, conditions]) => ({
    sourceNodeId,
    conditions
  }));
}

/**
 * Generate detailed condition information for popover
 */
function generateConditionDetails(conditions, originalAction) {
  const details = {
    summary: generateConditionSummary(conditions),
    conditions: conditions.map((condition) => {
      const detail = {
        type: condition.type,
        description: getConditionDescription(condition.type)
      };

      switch (condition.type) {
        case "run_when_succeeded":
        case "run_when_failed":
        case "run_when_finished":
        case "depends_on":
          detail.actions = condition.actions || [condition.action];
          break;
        case "conditional_input":
          detail.inputs = condition.inputs || [condition.input];
          break;
        case "run_on_assertion":
          detail.tests = condition.tests;
          break;
      }

      return detail;
    }),
    config: extractRelevantConfig(originalAction, conditions)
  };

  return details;
}

/**
 * Get human-readable description for condition type
 */
function getConditionDescription(type) {
  const descriptions = {
    run_when_succeeded: "Execute only after specified actions succeed",
    run_when_failed: "Execute only when specified actions fail",
    run_when_finished:
      "Execute after specified actions complete (regardless of success/failure)",
    depends_on: "Execute after specified actions complete",
    conditional_input: "Use input from the first available/valid action source",
    run_on_assertion: "Execute only when assertion tests pass"
  };

  return descriptions[type] || "Conditional execution";
}

/**
 * Main Dagre-based convert function.
 * Handles flat loop layout and schedule interface detection.
 */
function convertConfigToReactFlow(
  config,
  containerWidth = 1200,
  containerHeight = 800,
  options = {}
) {
  // A standalone module FILE is the wrapped form `{ type, spec }` (how the
  // marketplace / self-hosted `modules/` store a module) with no `interfaces`.
  // Render it as a single module node instead of an empty config.
  if (config && config.type && config.spec && !config.interfaces) {
    return convertModuleToReactFlow(
      config.type,
      config.spec,
      containerWidth,
      containerHeight
    );
  }

  // When the pack's module definitions are available, inline referenced modules so
  // each action renders the module's real assertions / transforms / connection.
  if (options.modules) {
    config = resolveConfigModules(config, options.modules);
  }

  const nodes = [];
  const edges = [];
  let nodeId = 0;

  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({
    rankdir: "TB",
    align: "DL",
    nodesep: 150,
    edgesep: 50,
    ranksep: 200,
    marginx: 40,
    marginy: 40,
    acyclicer: "greedy",
    ranker: "network-simplex"
  });

  const interfaces = Object.entries(config.interfaces || {});
  const interfaceSpacing = 200;

  // Module refs used as attribute VALUES (not action-list items) don't create their
  // own node, but we surface them as badges: module-backed database connections
  // (global.databases.<name>: a|module::…|) and a config-wide network policy.
  const globalDbModules = {};
  const globalDatabases = config.global?.databases || {};
  Object.entries(globalDatabases).forEach(([name, value]) => {
    // handle can be an unresolved string ref, or a resolved spec carrying __moduleHandle
    const handle = moduleRefHandle(value) || value?.__moduleHandle;
    if (handle) globalDbModules[name] = handle;
  });
  const configNetworkModule =
    moduleRefHandle(config.network) || config.network?.__moduleHandle;

  const edgeCreationData = [];
  const loopBackEdges = [];

  interfaces.forEach(([interfaceName, interfaceConfig], interfaceIndex) => {
    const actions = normalizeActions(interfaceConfig.actions);
    const actionNodeMap = new Map();

    // Detect schedule vs HTTP interface
    const isSchedule = !!interfaceConfig.schedule;
    const interfaceNodeId = `interface-${nodeId++}`;
    const interfaceNode = {
      id: interfaceNodeId,
      type: isSchedule ? "scheduleInterface" : "httpInterface",
      position: { x: 0, y: 0 },
      data: {
        interfaceName,
        method: interfaceConfig.method || "GET",
        route: interfaceConfig.route,
        schedule: interfaceConfig.schedule,
        // Module-backed attribute refs on this interface (rendered as badges).
        assertModule: moduleRefHandle(interfaceConfig.assert),
        networkModule:
          moduleRefHandle(interfaceConfig.network) || configNetworkModule,
        onEdit: (data) => console.log("Edit interface:", data),
        onDelete: (data) => console.log("Delete interface:", data)
      }
    };
    nodes.push(interfaceNode);

    dagreGraph.setNode(interfaceNodeId, {
      width: 250,
      height: 70,
      isInterface: true,
      interfaceIndex
    });

    // Process actions
    actions.forEach((action, actionIndex) => {
      const actionName = action.name || `Action ${actionIndex + 1}`;

      if (action.lookup && action.actions && action.actions.length > 0) {
        // Flat loop layout
        const loopHeaderNodeId = `node-${nodeId++}`;

        const flatResult = createFlatLookup(
          action,
          loopHeaderNodeId,
          interfaceName,
          nodeId,
          actionNodeMap,
          dagreGraph,
          interfaceIndex
        );

        nodeId = flatResult.nextNodeId;
        nodes.push(...flatResult.nodes);

        // Map actionName → loopHeaderNodeId for incoming edges (interface→loop, otherAction→loop)
        actionNodeMap.set(actionName, loopHeaderNodeId);
        actionNodeMap.set(actionIndex.toString(), loopHeaderNodeId);

        // Map __last entries so downstream actions resolve to the last nested node
        actionNodeMap.set(`${actionName}__last`, flatResult.lastNestedNodeId);
        actionNodeMap.set(`${actionIndex}__last`, flatResult.lastNestedNodeId);

        edgeCreationData.push(...flatResult.edgeData);

        if (flatResult.loopBackEdge) {
          loopBackEdges.push(flatResult.loopBackEdge);
        }
      } else {
        // Regular action
        const currentNodeId = `node-${nodeId++}`;

        actionNodeMap.set(actionName, currentNodeId);
        actionNodeMap.set(actionIndex.toString(), currentNodeId);

        const node = createActionNode(
          currentNodeId,
          actionName,
          action,
          interfaceName,
          { x: 0, y: 0 }
        );

        // A DB action using a module-backed connection (database: <name> where the
        // global connection is a|module::…|) gets a badge naming the module, plus the
        // resolved driver so the node shows the real engine (e.g. PostgreSQL) — the node
        // otherwise only sees the ORIGINAL global, where the value is still a module ref.
        const connName = action.database;
        if (node.data && typeof connName === "string") {
          if (globalDbModules[connName])
            node.data.connModule = globalDbModules[connName];
          const resolvedConn = config.global?.databases?.[connName];
          if (resolvedConn && typeof resolvedConn === "object") {
            if (resolvedConn.driver) node.data.connDriver = resolvedConn.driver;
            // Full connection spec for the badge hover-card preview.
            if (globalDbModules[connName])
              node.data.connModuleSpec = resolvedConn;
          }
        }

        nodes.push(node);

        dagreGraph.setNode(currentNodeId, {
          width: 260,
          height: 90,
          interfaceIndex,
          actionIndex
        });
      }
    });

    // Create edges for each action's incoming connections
    actions.forEach((action, originalIndex) => {
      const actionName = action.name || `Action ${originalIndex + 1}`;
      const currentNodeId = actionNodeMap.get(actionName);

      if (!currentNodeId) return;

      const dependencies = extractDependencies(action, originalIndex, actions);
      const conditionInfo = analyzeConditions(action, originalIndex, actions);

      if (dependencies.length === 0) {
        // No deps → connect from interface
        dagreGraph.setEdge(interfaceNodeId, currentNodeId);

        edgeCreationData.push({
          type: "interface",
          sourceId: interfaceNodeId,
          targetId: currentNodeId
        });
      } else {
        const dependenciesBySource = groupDependenciesBySource(
          dependencies,
          originalIndex,
          actionNodeMap
        );

        dependenciesBySource.forEach(({ sourceNodeId, conditions }) => {
          if (sourceNodeId && sourceNodeId !== currentNodeId) {
            dagreGraph.setEdge(sourceNodeId, currentNodeId);

            edgeCreationData.push({
              type: "action",
              sourceId: sourceNodeId,
              targetId: currentNodeId,
              conditions,
              conditionInfo,
              originalAction: action
            });
          }
        });
      }
    });
  });

  // Run dagre layout
  dagre.layout(dagreGraph);

  // Apply dagre positions to all nodes
  const interfaceOffsets = new Map();
  interfaces.forEach((_, interfaceIndex) => {
    interfaceOffsets.set(interfaceIndex, interfaceIndex * interfaceSpacing);
  });

  nodes.forEach((node) => {
    const dagreNode = dagreGraph.node(node.id);
    if (dagreNode) {
      const xOffset = interfaceOffsets.get(dagreNode.interfaceIndex) || 0;
      node.position = {
        x: dagreNode.x - dagreNode.width / 2 + xOffset,
        y: dagreNode.y - dagreNode.height / 2
      };
    }
  });

  // Post-process: pull interface nodes closer to their first connected action.
  // ranksep controls action-to-action spacing; we fix the interface gap separately.
  const interfaceFirstActionY = new Map();
  edgeCreationData.forEach((edgeData) => {
    if (edgeData.type === "interface") {
      const targetNode = nodes.find((n) => n.id === edgeData.targetId);
      if (targetNode) {
        const currentMin = interfaceFirstActionY.get(edgeData.sourceId);
        if (currentMin === undefined || targetNode.position.y < currentMin) {
          interfaceFirstActionY.set(edgeData.sourceId, targetNode.position.y);
        }
      }
    }
  });
  nodes.forEach((node) => {
    if (node.type === "httpInterface" || node.type === "scheduleInterface") {
      const firstActionTop = interfaceFirstActionY.get(node.id);
      if (firstActionTop !== undefined) {
        node.position = { ...node.position, y: firstActionTop - 70 - 110 };
      }
    }
  });

  // Build edge objects
  const nodeMap = new Map();
  nodes.forEach((node) => nodeMap.set(node.id, node));

  edgeCreationData.forEach((edgeData) => {
    if (edgeData.type === "interface") {
      edges.push({
        id: `edge-${edgeData.sourceId}-${edgeData.targetId}`,
        source: edgeData.sourceId,
        target: edgeData.targetId,
        sourceHandle: "bottom-center",
        targetHandle: "top-center",
        type: "smoothstep",
        style: { stroke: "#64748b", strokeWidth: 2 },
        markerEnd: { type: "arrowclosed", color: "#64748b" }
      });
    } else if (edgeData.type === "loop-entry") {
      // loopHeader → first nested node
      edges.push({
        id: `edge-${edgeData.sourceId}-${edgeData.targetId}`,
        source: edgeData.sourceId,
        target: edgeData.targetId,
        sourceHandle: "bottom-center",
        targetHandle: "top-center",
        type: "smoothstep",
        style: { stroke: "#d97706", strokeWidth: 1.5 },
        label: "for each",
        labelStyle: { fontSize: "10px", fontWeight: 500, fill: "#d97706" },
        labelBgStyle: { fill: "rgba(217,119,6,0.1)", fillOpacity: 0.9, rx: 4 },
        markerEnd: { type: "arrowclosed", color: "#d97706" }
      });
    } else if (edgeData.type === "action") {
      const sourceNode = nodeMap.get(edgeData.sourceId);
      const targetNode = nodeMap.get(edgeData.targetId);

      if (sourceNode && targetNode) {
        const edge = createComplexDependencyEdge(
          edgeData.sourceId,
          edgeData.targetId,
          edgeData.conditions,
          edgeData.conditionInfo,
          edgeData.originalAction,
          sourceNode,
          targetNode
        );
        edges.push(edge);
      }
    } else if (
      edgeData.type === "nested-sequential" ||
      edgeData.type === "nested-dependency"
    ) {
      const sourceNode = nodeMap.get(edgeData.sourceId);
      const targetNode = nodeMap.get(edgeData.targetId);

      if (sourceNode && targetNode) {
        const edge = createComplexDependencyEdge(
          edgeData.sourceId,
          edgeData.targetId,
          edgeData.conditions,
          edgeData.conditionInfo,
          edgeData.originalAction,
          sourceNode,
          targetNode
        );
        edges.push(edge);
      }
    }
  });

  // Add visual-only loop-back edges (not in dagre layout)
  edges.push(...loopBackEdges);

  return centerAndFitLayout({ nodes, edges }, containerWidth, containerHeight);
}

/**
 * Standalone-module layout.
 *
 * A module isn't a config — it has no `interfaces`, it's a single bare typed spec
 * (Action | Database | Assert | NetworkPolicy | Schedule). We render it as one
 * self-contained node so the module editors/list can preview it in the same
 * visualizer. The spec is shaped into a synthetic action so the existing
 * defaultActionNode picks the right icon (DB / assert / …) without a new node type.
 */
function convertModuleToReactFlow(
  moduleType,
  spec,
  // eslint-disable-next-line no-unused-vars
  containerWidth = 1200,
  // eslint-disable-next-line no-unused-vars
  containerHeight = 800
) {
  const s = spec && typeof spec === "object" ? spec : {};

  // Shape the spec into an action so the EXISTING node renderers show the module's real
  // content — Assert -> its assertion tests, Database -> its driver, Action -> its steps.
  let synthetic;
  let label;
  let forceType = null;
  switch (moduleType) {
    case "Action":
      synthetic = { ...s };
      label = s.name || "Action";
      break;
    case "Database":
      // Render as a real database node so getDatabaseTypeInfo resolves the driver.
      synthetic = {
        database: { driver: s.driver, dbname: s.dbname, host: s.host },
        query: s.query || ""
      };
      label = s.driver
        ? `Database (${s.driver})`
        : s.conn_string
        ? "Database connection"
        : "Database";
      forceType = "databaseActionNode";
      break;
    case "Assert":
      // Real assert set so the node's assertion count reflects the module's tests.
      synthetic = { name: "Assert", assert: s, description: s.error_message };
      label = "Assert";
      forceType = "defaultActionNode";
      break;
    case "NetworkPolicy":
      synthetic = {
        description: `mode: ${s.mode || "enforce"}${
          s.rate_limit ? ` · rate-limit ${s.rate_limit.requests || ""}` : ""
        }`
      };
      label = "Network policy";
      forceType = "defaultActionNode";
      break;
    case "Schedule":
      synthetic = {
        description: s.cron || s.every || s.expression || "schedule"
      };
      label = "Schedule";
      forceType = "defaultActionNode";
      break;
    default:
      synthetic = { ...s };
      label = moduleType || "Module";
      forceType = "defaultActionNode";
  }

  const node = createActionNode("module-node", label, synthetic, null, {
    x: 0,
    y: 0
  });
  if (forceType) {
    node.type = forceType;
    node.data.nodeType = forceType;
  }
  node.data = {
    ...node.data,
    isModule: true,
    standalone: true,
    moduleType,
    globalConfig: {}
  };
  // Leave positioning to fitView (a single node) — an absolute offset can land it
  // outside a small thumbnail viewport before the fit runs.
  node.position = { x: 0, y: 0 };

  return { nodes: [node], edges: [] };
}

export default convertConfigToReactFlow;
export { convertModuleToReactFlow, inferModuleType };
