#!/bin/bash

for component in src/components/ui/*; do
  npx shadcn@latest add $(basename $component .tsx) --overwrite
done