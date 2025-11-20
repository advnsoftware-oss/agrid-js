#!/bin/bash
cd "$(dirname "$0")/../packages/browser"
npm publish --access public --no-git-checks --ignore-scripts

