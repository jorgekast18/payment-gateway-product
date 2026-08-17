resource "random_password" "db" {
  length  = 24
  special = false
}

# App Runner reaches the database over its default (public) egress and its
# egress IPs are not static, so the sandbox database is publicly reachable and
# protected by a strong generated password and enforced TLS (sslmode=require).
# A production deployment would move the database to private subnets behind an
# App Runner VPC connector.
resource "aws_security_group" "db" {
  name_prefix = "${var.project_name}-db-"
  vpc_id      = aws_vpc.main.id

  ingress {
    description = "PostgreSQL"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_db_subnet_group" "db" {
  name_prefix = "${var.project_name}-"
  subnet_ids  = aws_subnet.public[*].id
}

resource "aws_db_instance" "db" {
  identifier_prefix      = "${var.project_name}-"
  engine                 = "postgres"
  engine_version         = "16"
  instance_class         = "db.t4g.micro"
  allocated_storage      = 20
  db_name                = var.db_name
  username               = var.db_username
  password               = random_password.db.result
  db_subnet_group_name   = aws_db_subnet_group.db.name
  vpc_security_group_ids = [aws_security_group.db.id]
  publicly_accessible    = true
  skip_final_snapshot    = true
  deletion_protection    = false
  apply_immediately      = true
}

locals {
  database_url = "postgresql://${var.db_username}:${random_password.db.result}@${aws_db_instance.db.address}:${aws_db_instance.db.port}/${var.db_name}?schema=public&sslmode=require"
}
