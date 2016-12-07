ls -1 > 1.txt;
gsed -i  's/\(.*\)\(\.png\)/\U\1\E: require(@.\/\1.png@),/g' 1.txt 
