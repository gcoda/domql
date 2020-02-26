#!/usr/bin/env bash 

mkdir -p "./public/icons"

inkscape -f logo-source.svg -w 16 --export-area-page -e "public/icons/16.png"
optipng -o7 "public/icons/16.png"

inkscape -f logo-source.svg -w 19 --export-area-page -e "public/icons/19.png"
optipng -o7 "public/icons/19.png"

inkscape -f logo-source.svg -w 38 --export-area-page -e "public/icons/38.png"
optipng -o7 "public/icons/38.png"

inkscape -f logo-source.svg -w 48 --export-area-page -e "public/icons/48.png"
optipng -o7 "public/icons/48.png"

inkscape -f logo-source.svg -w 128 --export-area-page -e "public/icons/128.png"
optipng -o7 "public/icons/128.png"

inkscape -f logo-source.svg -w 200 --export-area-page -e "logo.png"
optipng -o7 "logo.png"

inkscape -f logo-source.svg -w 32 --export-area-page -e "public/favicon.png"
convert "public/favicon.png" "public/favicon.ico"

optipng -o7 "public/favicon.png"

