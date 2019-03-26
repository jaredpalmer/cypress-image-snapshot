workflow "Add PR to release notes" {
  on = "pull_request"
  resolves = ["Chronicler"]
}

action "Chronicler" {
  uses = "crosscompile/chronicler-action@v1.0.0"
  secrets = ["GITHUB_TOKEN"]
}
