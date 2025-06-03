# Terraform Main Configuration for Expense Tracker Infrastructure
terraform {
  required_version = ">= 1.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.20"
    }
  }

  backend "s3" {
    bucket = "expense-tracker-terraform-state"
    key    = "infrastructure/terraform.tfstate"
    region = "us-west-2"
    dynamodb_table = "expense-tracker-terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "expense-tracker"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  cluster_name = "${var.project_name}-${var.environment}"
}

module "vpc" {
  source = "./modules/vpc"
  
  project_name        = var.project_name
  environment         = var.environment
  vpc_cidr           = var.vpc_cidr
  availability_zones = data.aws_availability_zones.available.names
}

module "eks" {
  source = "./modules/eks"
  
  cluster_name    = local.cluster_name
  cluster_version = var.cluster_version
  vpc_id         = module.vpc.vpc_id
  subnet_ids     = module.vpc.private_subnet_ids
  node_groups    = var.node_groups
} 