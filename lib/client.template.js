window.__ModuleLoader__.load({
  id: "minecraft-ui",
  factory: () => {
    const module = { exports: {} };
    const THEME_CSS = "__MINECRAFT_CSS__";
    const THEME_ID = "minecraft";
    const STYLE_KEY = "minecraft-ui/theme";

    const themeDefinition = {
      id: THEME_ID,
      colorScheme: "dark",
      tokens: {
        "--dsw-alias-bg-base": "#171915",
        "--dsw-alias-bg-layer-1": "#252821",
        "--dsw-alias-bg-layer-2": "#34372f",
        "--dsw-alias-bg-overlay": "#20231d",
        "--dsw-alias-border-l1": "#4b5044",
        "--dsw-alias-border-l2": "#11130f",
        "--dsw-alias-brand-primary": "#78b94a",
        "--dsw-alias-label-primary": "#f1f1e8",
        "--dsw-alias-label-secondary": "#b9bcae",
        "--dsw-alias-state-error-primary": "#e05a47",
        "--dsw-alias-state-success-primary": "#78b94a",
        "--dsw-alias-state-warn-primary": "#e1b84b",
        "--dsw-specific-sidebar-fill": "#30271f"
      }
    };

    function apply(ctx) {
      ctx.effect(() => {
        const dispose = ctx.theme.register(themeDefinition);
        ctx.theme.setTheme(THEME_ID);
        return () => dispose();
      }, "minecraft-ui: theme registration");

      ctx.effect(() => {
        if (typeof document === "undefined") return () => {};
        const previous = document.querySelector(`style[data-plugin-css="${STYLE_KEY}"]`);
        if (previous) previous.remove();
        const tag = document.createElement("style");
        tag.dataset.plugin = "minecraft-ui";
        tag.dataset.pluginCss = STYLE_KEY;
        tag.textContent = THEME_CSS;
        document.head.appendChild(tag);
        if (document.body) document.body.classList.add("minecraft-ui-active");
        return () => {
          if (document.body) document.body.classList.remove("minecraft-ui-active");
          tag.remove();
        };
      }, "minecraft-ui: stylesheet");
    }

    module.exports.apply = apply;
    module.exports.inject = ["theme"];
    module.exports.themeDefinition = themeDefinition;
    return module.exports;
  }
});
