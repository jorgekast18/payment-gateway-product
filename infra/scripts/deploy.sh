#!/usr/bin/env bash
set -euo pipefail

# Deploys the full stack: builds and pushes the API image, provisions the
# infrastructure with Terraform, then builds and uploads the frontend.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TF_DIR="$ROOT/infra/terraform"
REGION="${AWS_REGION:-us-east-1}"

cd "$TF_DIR"

terraform init -input=false

# 1. Create the ECR repository first so the image can be pushed before the
#    App Runner service that consumes it is created.
terraform apply -input=false -auto-approve -target=aws_ecr_repository.api

ECR_URL="$(terraform output -raw ecr_repository_url)"
REGISTRY="${ECR_URL%%/*}"

# 2. Build the API image for the App Runner runtime and push it.
aws ecr get-login-password --region "$REGION" | docker login --username AWS --password-stdin "$REGISTRY"
docker buildx build --platform linux/amd64 -f "$ROOT/apps/api/Dockerfile" -t "${ECR_URL}:latest" --push "$ROOT"

# 3. Provision the remaining infrastructure.
terraform apply -input=false -auto-approve

API_URL="$(terraform output -raw api_url)"
BUCKET="$(terraform output -raw s3_bucket)"
DISTRIBUTION="$(terraform output -raw cloudfront_distribution_id)"

# 4. Build the frontend against the deployed API and upload it.
cd "$ROOT/apps/web"
VITE_API_URL="$API_URL/api" npm run build
aws s3 sync dist "s3://$BUCKET" --delete

# 5. Invalidate the CDN cache so the new build is served immediately.
aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION" --paths '/*' >/dev/null

echo "Frontend: $(cd "$TF_DIR" && terraform output -raw frontend_url)"
echo "API:      $API_URL"
