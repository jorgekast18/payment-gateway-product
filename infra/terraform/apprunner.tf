resource "aws_iam_role" "apprunner_ecr" {
  name_prefix = "pgp-apprunner-"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Principal = { Service = "build.apprunner.amazonaws.com" }
      Action    = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "apprunner_ecr" {
  role       = aws_iam_role.apprunner_ecr.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess"
}

resource "aws_apprunner_service" "api" {
  service_name = "${var.project_name}-api"

  source_configuration {
    auto_deployments_enabled = false

    authentication_configuration {
      access_role_arn = aws_iam_role.apprunner_ecr.arn
    }

    image_repository {
      image_identifier      = "${aws_ecr_repository.api.repository_url}:${var.image_tag}"
      image_repository_type = "ECR"

      image_configuration {
        port = "3000"

        runtime_environment_variables = {
          NODE_ENV                 = "production"
          PORT                     = "3000"
          DATABASE_URL             = local.database_url
          CORS_ORIGIN              = "https://${aws_cloudfront_distribution.frontend.domain_name}"
          BASE_FEE_IN_CENTS        = tostring(var.base_fee_in_cents)
          DELIVERY_FEE_IN_CENTS    = tostring(var.delivery_fee_in_cents)
          PAYMENT_API_URL          = var.payment_api_url
          PAYMENT_PUBLIC_KEY       = var.payment_public_key
          PAYMENT_PRIVATE_KEY      = var.payment_private_key
          PAYMENT_INTEGRITY_SECRET = var.payment_integrity_secret
          PAYMENT_CURRENCY         = var.payment_currency
          PAYMENT_TOKENIZE_PATH    = var.payment_tokenize_path
        }
      }
    }
  }

  instance_configuration {
    cpu    = "1024"
    memory = "2048"
  }

  health_check_configuration {
    protocol            = "HTTP"
    path                = "/api/health"
    interval            = 10
    timeout             = 5
    healthy_threshold   = 1
    unhealthy_threshold = 5
  }

  depends_on = [aws_db_instance.db]
}
