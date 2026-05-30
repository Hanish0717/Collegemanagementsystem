@echo off
if exist "C:\Program Files\nodejs\node.exe" (
  "C:\Program Files\nodejs\node.exe" %*
) else if exist "C:\Program Files (x86)\nodejs\node.exe" (
  "C:\Program Files (x86)\nodejs\node.exe" %*
) else (
  node %*
)
