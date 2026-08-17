variable "aws_region" {
  description = "AWS region for every resource"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Prefix used to name resources"
  type        = string
  default     = "payment-gateway-product"
}

variable "image_tag" {
  description = "Container image tag deployed to App Runner"
  type        = string
  default     = "latest"
}

variable "db_name" {
  description = "Database name"
  type        = string
  default     = "checkout"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  default     = "checkout_admin"
}

variable "base_fee_in_cents" {
  description = "Base fee always added to a transaction, in cents"
  type        = number
  default     = 200000
}

variable "delivery_fee_in_cents" {
  description = "Delivery fee added to a transaction, in cents"
  type        = number
  default     = 1500000
}

variable "payment_api_url" {
  description = "Base URL of the payment gateway sandbox"
  type        = string
}

variable "payment_public_key" {
  description = "Payment gateway public key"
  type        = string
  sensitive   = true
}

variable "payment_private_key" {
  description = "Payment gateway private key"
  type        = string
  sensitive   = true
}

variable "payment_integrity_secret" {
  description = "Payment gateway integrity secret used to sign transactions"
  type        = string
  sensitive   = true
}

variable "payment_currency" {
  description = "Currency used for charges"
  type        = string
  default     = "COP"
}

variable "payment_tokenize_path" {
  description = "Relative path of the card tokenization endpoint"
  type        = string
  default     = "/tokens/cards"
}
