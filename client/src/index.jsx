import React from "react";
import { MinecraftRoot } from "./game-root.jsx";
import CSS from "./generated-styles.js";

let services = null;
class MinecraftBoundary extends React.Component {
  constructor(props){ super(props); this.state={error:null}; }
  static getDerivedStateFromError(error){ return {error}; }
  componentDidCatch(error,info){ console.error("minecraft-ui root crashed",error,info); }
  render(){ if(this.state.error)return React.createElement("main",{className:"mc-fatal"},React.createElement("h1",null,"DSHcraft 遇到错误"),React.createElement("pre",null,String(this.state.error?.stack||this.state.error)),React.createElement("button",{onClick:()=>location.reload()},"重新载入世界")); return this.props.children; }
}

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
    const blockContextMenu=event=>{if(event.target?.closest?.(".mc-game-root"))event.preventDefault()};document.addEventListener("contextmenu",blockContextMenu,true);
    return () => { document.removeEventListener("contextmenu",blockContextMenu,true);document.body.classList.remove("minecraft-game-active"); tag.remove(); };
  }, "minecraft-ui: game stylesheet");
  ctx.effect(() => ctx.slots.inject("shell.overlay", () => ctx.slots.register({ name: "shell.overlay", id: "minecraft-world", order: -1000 }, (props) => React.createElement(MinecraftBoundary, null, React.createElement(MinecraftRoot, { ...props, services })))), "minecraft-ui: world overlay on native shell");
}
