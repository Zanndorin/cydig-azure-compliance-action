#!/bin/bash
current_version=$(gh release list --limit 1 | grep Latest | awk '{ print $1;}')
            IFS='.' read -r major minor patch <<< "${current_version#v}"
            incremented_major=$((major + 1))
            incremented_minor=$((minor + 1))
            incremented_patch=$((patch + 1))
            echo "${incremented_major}.${incremented_minor}.${incremented_patch}"
            echo "${incremented_major}"
            echo "${incremented_minor}"
            echo "${incremented_patch}"
            major_version="v${incremented_major}.${minor}.${patch}"
            minor_version="v${major}.${incremented_minor}.${patch}"
            patch_version="v${major}.${minor}.${incremented_patch}"
            # echo "major_version=${major_version}" >> $GITHUB_OUTPUT
            # echo "minor_version=${minor_version}" >> $GITHUB_OUTPUT
            # echo "patch_version=${patch_version}" >> $GITHUB_OUTPUT