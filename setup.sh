#!/usr/bin/env bash
set -e

REPO="https://github.com/rawphp/aws-resource-manager.git"
DIR="aws-resource-manager"

echo "==> Cloning repository..."
git clone "$REPO" "$DIR"
cd "$DIR"

echo "==> Installing dependencies..."
npm install

echo "==> Building packages..."
npm run build

echo "==> Launching dashboard at http://localhost:5173"
npm run dev --workspace=packages/web
