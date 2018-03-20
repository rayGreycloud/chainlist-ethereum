robocopy src docs /e
robocopy build\contracts docs
git add .
git commit -m "Auto-commit: Add frontend files to Github pages"
git push
