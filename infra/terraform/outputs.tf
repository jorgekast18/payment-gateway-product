output "api_url" {
  description = "Public HTTPS URL of the App Runner API"
  value       = "https://${aws_apprunner_service.api.service_url}"
}

output "frontend_url" {
  description = "Public HTTPS URL of the CloudFront frontend"
  value       = "https://${aws_cloudfront_distribution.frontend.domain_name}"
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution id (used for cache invalidation)"
  value       = aws_cloudfront_distribution.frontend.id
}

output "s3_bucket" {
  description = "S3 bucket that hosts the frontend build"
  value       = aws_s3_bucket.frontend.bucket
}

output "ecr_repository_url" {
  description = "ECR repository that stores the API image"
  value       = aws_ecr_repository.api.repository_url
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = aws_db_instance.db.address
}
