#!/bin/bash

# 1. 현재 시간을 '월일-시분' 형태로 생성 (예: 0213-1650)
NOW=$(date +'%m%d-%H%M')

# 2. index.html 업데이트
# macOS 전용 -E (Extended Regex) 옵션을 사용하여 Ver. 뒤의 내용을 무조건 치환합니다.
# 이 방식은 {{BUILD_ID}}가 이미 숫자로 바뀌어 있어도 다시 최신 숫자로 덮어씁니다.
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS용: Ver. 뒤의 숫자와 하이픈 패턴만 찾아 치환
  sed -i '' -E "s/Ver\.[0-9]{4}-[0-9]{4}/Ver\.$NOW/g" index.html
else
  # 리눅스용
  sed -i -r "s/Ver\.[0-9]{4}-[0-9]{4}/Ver\.$NOW/g" index.html
fi

echo "✅ [Build ID Updated] 현재 버전: Ver.$NOW"

# 3. Git 배포 프로세스
git add .
git commit -m "Build: $NOW - Update activities and sound logic"
git push origin main

echo "--------------------------------------------------"
echo "🚀 배포가 완료되었습니다!"
echo "📱 아이폰 사파리에서 확인 시 캐시 방지를 위해 아래 주소를 사용하세요:"
echo "👉 https://joo10lee.github.io/feelflow/index.html?v=$NOW"
echo "--------------------------------------------------"