#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat >&2 <<'USAGE'
Usage:
  add_to_simulator_files.sh /absolute/path/to/file [destination-folder]

Copies a local macOS file into the booted iOS Simulator Files app:
  Files > Browse > On My iPhone > <destination-folder>

Default destination-folder: Downloads
USAGE
}

if [[ $# -lt 1 || $# -gt 2 ]]; then
  usage
  exit 64
fi

source_file="$1"
destination_folder="${2:-Downloads}"

if [[ "$source_file" != /* ]]; then
  echo "error: source file must be an absolute path: $source_file" >&2
  exit 64
fi

if [[ ! -f "$source_file" ]]; then
  echo "error: source file does not exist: $source_file" >&2
  exit 66
fi

if [[ "$destination_folder" == *"/"* || "$destination_folder" == "." || "$destination_folder" == ".." ]]; then
  echo "error: destination folder must be a simple folder name, got: $destination_folder" >&2
  exit 64
fi

if ! xcrun simctl list devices booted | grep -q "(Booted)"; then
  echo "error: no booted iOS Simulator found" >&2
  exit 69
fi

groups_output="$(xcrun simctl get_app_container booted com.apple.DocumentsApp groups)"
local_storage_path="$(printf '%s\n' "$groups_output" | awk -F '\t' '$1 == "group.com.apple.FileProvider.LocalStorage" { print $2; exit }')"

if [[ -z "$local_storage_path" ]]; then
  echo "error: could not find group.com.apple.FileProvider.LocalStorage for com.apple.DocumentsApp" >&2
  echo "$groups_output" >&2
  exit 70
fi

target_dir="$local_storage_path/File Provider Storage/$destination_folder"
mkdir -p "$target_dir"
cp -p "$source_file" "$target_dir/"

target_file="$target_dir/$(basename "$source_file")"
echo "Copied to Simulator Files:"
echo "$target_file"
echo
echo "Open in Simulator:"
echo "Files > Browse > On My iPhone > $destination_folder > $(basename "$source_file")"
