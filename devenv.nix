{ pkgs, ... }:

{
  # Node 22 to match package.json engines (">=22.12.0").
  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_22;
    pnpm.enable = true;
  };

  packages = [ pkgs.git ];

  # Git hooks run the repo's own pnpm scripts, so eslint/prettier/astro
  # config in the project stays the single source of truth (rather than
  # devenv's built-in hooks, which would use their own config).
  #
  # pass_filenames = false: each script already operates on the whole
  # project. `files` just decides whether the hook fires for a given commit
  # based on what's staged.
  git-hooks.hooks = {
    format = {
      enable = true;
      name = "prettier (format:check)";
      entry = "pnpm format:check";
      pass_filenames = false;
      files = "\\.(astro|ts|mjs|js|json|jsonc|md|css|yml|yaml)$";
    };
    lint = {
      enable = true;
      name = "eslint";
      entry = "pnpm lint";
      pass_filenames = false;
      files = "\\.(astro|ts|mjs|js)$";
    };
    typecheck = {
      enable = true;
      name = "astro check";
      entry = "pnpm check";
      pass_filenames = false;
      files = "\\.(astro|ts)$";
    };
  };

  enterShell = ''
    echo "stargazer workshop — node $(node --version), pnpm $(pnpm --version)"
    echo "run 'pnpm install' if node_modules is stale."
  '';

  # `devenv test` sanity check: toolchain present and deps resolvable.
  enterTest = ''
    node --version
    pnpm --version
  '';
}
