#!/bin/bash

# 1. 변경 사항 확인
echo "🔍 변경된 파일을 확인합니다..."
git status -s

# 2. 모든 변경 사항 스테이징
git add .

# 3. 커밋 메시지 입력 (입력하지 않으면 기본 메시지 사용)
echo "📝 커밋 메시지를 입력하세요 (기본: 'Refactor: Architecture and In-app actions preparation'):"
read commit_msg

if [ -z "$commit_msg" ]; then
    commit_msg="Refactor: Architecture and In-app actions preparation"
fi

# 4. 커밋 실행
git commit -m "$commit_msg"

# 5. GitHub로 푸시
echo "🚀 GitHub로 배포 중..."
git push origin main

echo "✅ 배포 완료! 잠시 후 아이폰에서 ?v=$(date +%s)를 붙여 확인하세요."