import React from "react";
import { MinecraftRoot } from "./game-root.jsx";
import CSS from "./generated-styles.js";

let services = null;

export const inject = ["slots", "sessions", "workspaces", "connection"];

export function apply(ctx) {
  services = { sessions: ctx.sessions, workspaces: ctx.workspaces, connection: ctx.connection, get modelDirectories(){ return ctx.get("modelDirectories"); } };
  ctx.effect(() => {
    const old = document.querySelector('style[data-plugin-css="minecraft-ui/game"]');
    if (old) old.remove();
    const tag = document.createElement("style");
    tag.dataset.pluginCss = "minecraft-ui/game";
    tag.textContent = CSS;
    document.head.appendChild(tag);
    document.body.classList.add("minecraft-game-active");
    return () => { document.body.classList.remove("minecraft-game-active"); tag.remove(); };
  }, "minecraft-ui: game stylesheet");
  ctx.slots.inject("root", () => ctx.slots.register({ name: "root", priority: -1000 }, (props) => React.createElement(MinecraftRoot, { ...props, services })));
}
