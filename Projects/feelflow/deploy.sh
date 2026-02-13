#!/bin/bash

# 1. 현재 시간을 '월일-시분' 형태로 생성 (예: 0213-1530)
NOW=$(date +'%m%d-%H%M')

# 2. index.html의 {{BUILD_ID}}를 현재 시간으로 치환
# (macOS와 Linux의 sed 문법 차이를 고려하여 작성)
if [[ "$OSTYPE" == "darwin"* ]]; then
  sed -i '' "s/{{BUILD_ID}}/$NOW/g" index.html
else
  sed -i "s/{{BUILD_ID}}/$NOW/g" index.html
fi

echo "✅ Build ID Updated: $NOW"

# 3. 이후 기존 배포 명령 실행 (git add, commit, push 등)
git add .
git commit -m "Deploy Build $NOW"
git push origin main

echo "✅ 배포 완료! 잠시 후 아이폰에서 ?v=$(date +%s)를 붙여 확인하세요."