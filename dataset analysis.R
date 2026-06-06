library(tidyverse)
library(jsonlite)

setwd("C:/Users/slee7/OneDrive - Imperial College London/SWE-Tech Studying/Really Good Culture Technical Assessment/Dataset/Dataset")

brands <- read.csv("brands.csv")
products <- read.csv("products.csv")
transcripts <- fromJSON("transcripts.json")
users <- fromJSON("users.json")

transcripts_products <- transcripts %>%
  full_join(products, by = "productId")
